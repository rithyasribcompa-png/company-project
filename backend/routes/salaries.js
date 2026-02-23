const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /salaries
router.get('/', (req, res) => {
  db.all('SELECT * FROM salaries ORDER BY rowid DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /salaries (create)
router.post('/', (req, res) => {
  const { id, workerId, month, daysWorked, bonus, deduction, finalSalary } = req.body;
  const sid = id || Date.now().toString();
  db.run(
    `INSERT INTO salaries(id,workerId,month,daysWorked,bonus,deduction,finalSalary) VALUES (?,?,?,?,?,?,?)`,
    [sid, workerId, month, Number(daysWorked || 0), Number(bonus || 0), Number(deduction || 0), Number(finalSalary || 0)],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: sid });
    }
  );
});

// PUT /salaries/:id
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { workerId, month, daysWorked, bonus, deduction, finalSalary } = req.body;
  db.run(
    `UPDATE salaries SET workerId=?,month=?,daysWorked=?,bonus=?,deduction=?,finalSalary=? WHERE id=?`,
    [workerId, month, Number(daysWorked || 0), Number(bonus || 0), Number(deduction || 0), Number(finalSalary || 0), id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Salary record updated' });
    }
  );
});

// DELETE /salaries/:id
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM salaries WHERE id=?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Salary record deleted' });
  });
});

// POST /salaries/bulk
router.post('/bulk', (req, res) => {
  const data = Array.isArray(req.body) ? req.body : [];
  db.serialize(() => {
    db.run('DELETE FROM salaries', (err) => {
      if (err) return res.status(500).json({ error: err.message });
      const stmt = db.prepare('INSERT OR REPLACE INTO salaries(id,workerId,month,daysWorked,bonus,deduction,finalSalary) VALUES (?,?,?,?,?,?,?)');
      for (const s of data) {
        stmt.run([s.id || Date.now().toString(), s.workerId, s.month, Number(s.daysWorked || 0), Number(s.bonus || 0), Number(s.deduction || 0), Number(s.finalSalary || 0)]);
      }
      stmt.finalize((e) => {
        if (e) return res.status(500).json({ error: e.message });
        res.json({ message: 'Bulk salaries saved' });
      });
    });
  });
});

module.exports = router;
