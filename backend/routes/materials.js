const express = require('express');
const router = express.Router();
const db = require('../database');

// GET /materials
router.get('/', (req, res) => {
  db.all('SELECT * FROM materials ORDER BY rowid DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST /materials (create)
router.post('/', (req, res) => {
  const { id, name, quantity, unit, costPerUnit, projectUsed } = req.body;
  const mid = id || Date.now().toString();
  db.run(
    `INSERT INTO materials(id,name,quantity,unit,costPerUnit,projectUsed) VALUES (?,?,?,?,?,?)`,
    [mid, name, Number(quantity || 0), unit, Number(costPerUnit || 0), projectUsed],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: mid });
    }
  );
});

// PUT /materials/:id
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { name, quantity, unit, costPerUnit, projectUsed } = req.body;
  db.run(
    `UPDATE materials SET name=?,quantity=?,unit=?,costPerUnit=?,projectUsed=? WHERE id=?`,
    [name, Number(quantity || 0), unit, Number(costPerUnit || 0), projectUsed, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Material updated' });
    }
  );
});

// DELETE /materials/:id
router.delete('/:id', (req, res) => {
  db.run('DELETE FROM materials WHERE id=?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Material deleted' });
  });
});

// POST /materials/bulk
router.post('/bulk', (req, res) => {
  const data = Array.isArray(req.body) ? req.body : [];
  db.serialize(() => {
    db.run('DELETE FROM materials', (err) => {
      if (err) return res.status(500).json({ error: err.message });
      const stmt = db.prepare('INSERT OR REPLACE INTO materials(id,name,quantity,unit,costPerUnit,projectUsed) VALUES (?,?,?,?,?,?)');
      for (const m of data) {
        stmt.run([m.id || Date.now().toString(), m.name, Number(m.quantity || 0), m.unit, Number(m.costPerUnit || 0), m.projectUsed]);
      }
      stmt.finalize((e) => {
        if (e) return res.status(500).json({ error: e.message });
        res.json({ message: 'Bulk materials saved' });
      });
    });
  });
});

module.exports = router;
