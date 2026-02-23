require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/users");
const labourRoutes = require("./routes/labour");
const projectsRoutes = require("./routes/projects");
const materialsRoutes = require("./routes/materials");
const attendanceRoutes = require("./routes/attendance");
const salariesRoutes = require("./routes/salaries");
require("./database");
const verifyToken = require("./middleware/auth");
const allowRoles = require("./middleware/role");
const db = require("./database");

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "*";
app.use(
	cors({
		origin: FRONTEND_URL,
		credentials: true,
	})
);

app.use(express.json());

// ROUTES (mounted under /api/v1)
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/labour", labourRoutes);
app.use("/api/v1/projects", projectsRoutes);
app.use("/api/v1/materials", materialsRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/salaries", salariesRoutes);

app.get("/", (req, res) => {
	res.json({ message: "Backend Running Successfully" });
});

// Add a direct bulk endpoint for labour in case route file isn't picked up
app.post("/api/v1/labour/bulk", verifyToken, allowRoles("Admin", "Supervisor"), (req, res) => {
	const items = Array.isArray(req.body) ? req.body : req.body.items;
	if (!Array.isArray(items)) return res.status(400).json({ message: "Expected array payload" });

	db.serialize(() => {
		db.run("BEGIN TRANSACTION");
		db.run("DELETE FROM labour", (delErr) => {
			if (delErr) {
				db.run("ROLLBACK");
				return res.status(500).json({ message: delErr.message });
			}

			const stmt = db.prepare(`INSERT INTO labour (name,contact,role,dailyWage,assignedProject) VALUES (?,?,?,?,?)`);
			for (const it of items) {
				const name = it.name || "";
				const contact = it.contact || "";
				const role = it.role || it.work || "";
				const dailyWage = Number(it.dailyWage || it.salary || 0);
				const assignedProject = it.assignedProject || "";
				stmt.run([name, contact, role, dailyWage, assignedProject]);
			}
			stmt.finalize((finalizeErr) => {
				if (finalizeErr) {
					db.run("ROLLBACK");
					return res.status(500).json({ message: finalizeErr.message });
				}
				db.run("COMMIT", (commitErr) => {
					if (commitErr) return res.status(500).json({ message: commitErr.message });
					db.all(`SELECT * FROM labour ORDER BY id DESC`, [], (err, rows) => {
						if (err) return res.status(500).json({ message: err.message });
						res.json({ success: true, data: rows || [] });
					});
				});
			});
		});
	});
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`Server Running Port ${PORT}`);
});