const express = require('express');
const router = express.Router();
const db = require('../database');
const { v4: uuidv4 } = require('uuid');

// GET /projects
router.get('/', (req, res) => {
  db.all('SELECT * FROM projects ORDER BY rowid DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    // parse assignedWorkers JSON
    const parsed = rows.map((r) => ({ ...r, assignedWorkers: r.assignedWorkers ? JSON.parse(r.assignedWorkers) : [] }));
    res.json(parsed);
  });
});

// POST /projects (create)
router.post('/', (req, res) => {
  const { id, name, location, startDate, endDate, budget, status, assignedWorkers } = req.body;
  const pid = id || Date.now().toString();
  db.run(
    `INSERT INTO projects(id,name,location,startDate,endDate,budget,status,assignedWorkers) VALUES (?,?,?,?,?,?,?,?)`,
    [pid, name, location, startDate, endDate, Number(budget || 0), status || 'pending', JSON.stringify(assignedWorkers || [])],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: pid });
    }
  );
});

// PUT /projects/:id
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { name, location, startDate, endDate, budget, status, assignedWorkers } = req.body;
  db.run(
    `UPDATE projects SET name=?,location=?,startDate=?,endDate=?,budget=?,status=?,assignedWorkers=? WHERE id=?`,
    [name, location, startDate, endDate, Number(budget || 0), status, JSON.stringify(assignedWorkers || []), id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Project updated' });
    }
  );
});

// DELETE /projects/:id
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM projects WHERE id=?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Project deleted' });
  });
});

// POST /projects/bulk -> replace projects table content
router.post('/bulk', (req, res) => {
  const data = Array.isArray(req.body) ? req.body : [];
  db.serialize(() => {
    db.run('DELETE FROM projects', (err) => {
      if (err) return res.status(500).json({ error: err.message });
      const stmt = db.prepare('INSERT OR REPLACE INTO projects(id,name,location,startDate,endDate,budget,status,assignedWorkers) VALUES (?,?,?,?,?,?,?,?)');
      for (const p of data) {
        stmt.run([p.id || Date.now().toString(), p.name, p.location, p.startDate, p.endDate, Number(p.budget || 0), p.status || 'pending', JSON.stringify(p.assignedWorkers || [])]);
      }
      stmt.finalize((e) => {
        if (e) return res.status(500).json({ error: e.message });
        res.json({ message: 'Bulk projects saved' });
      });
    });
  });
});

module.exports = router;
