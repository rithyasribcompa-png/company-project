const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /attendance
router.get('/', (req, res) => {
  db.all('SELECT * FROM attendance ORDER BY date DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /attendance (create)
router.post('/', (req, res) => {
  const { id, workerId, date, status, projectId } = req.body;
  const aid = id || Date.now().toString();
  db.run(
    `INSERT INTO attendance(id,workerId,date,status,projectId) VALUES (?,?,?,?,?)`,
    [aid, workerId, date, status, projectId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: aid });
    }
  );
});

// PUT /attendance/:id
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { workerId, date, status, projectId } = req.body;
  db.run(
    `UPDATE attendance SET workerId=?,date=?,status=?,projectId=? WHERE id=?`,
    [workerId, date, status, projectId, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Attendance updated' });
    }
  );
});

// DELETE /attendance/:id
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM attendance WHERE id=?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Attendance deleted' });
  });
});

// POST /attendance/bulk -> replace attendance
router.post('/bulk', (req, res) => {
  const data = Array.isArray(req.body) ? req.body : [];
  db.serialize(() => {
    db.run('DELETE FROM attendance', (err) => {
      if (err) return res.status(500).json({ error: err.message });
      const stmt = db.prepare('INSERT OR REPLACE INTO attendance(id,workerId,date,status,projectId) VALUES (?,?,?,?,?)');
      for (const a of data) {
        stmt.run([a.id || Date.now().toString(), a.workerId, a.date, a.status, a.projectId]);
      }
      stmt.finalize((e) => {
        if (e) return res.status(500).json({ error: e.message });
        res.json({ message: 'Bulk attendance saved' });
      });
    });
  });
});

module.exports = router;
