const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Vaccinations
router.get('/vaccinations', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT v.*, a.animal_code, a.breed
       FROM vaccinations v
       JOIN animals a ON a.id = v.animal_id
       ORDER BY (v.next_due IS NULL), v.next_due ASC, v.created_at DESC
       LIMIT 500`
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/vaccinations', authenticateToken, async (req, res) => {
  try {
    const { animalId, vaccineName, lastVaccination, nextDue, status, notes } = req.body;
    if (!animalId || !vaccineName) return res.status(400).json({ error: 'animalId and vaccineName are required' });

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO vaccinations (animal_id, vaccine_name, last_vaccination, next_due, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [animalId, vaccineName, lastVaccination || null, nextDue || null, status || 'Upcoming', notes || null]
    );
    const [rows] = await connection.query('SELECT * FROM vaccinations WHERE id = ? LIMIT 1', [result.insertId]);
    connection.release();
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/vaccinations/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { animalId, vaccineName, lastVaccination, nextDue, status, notes } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      `UPDATE vaccinations
       SET animal_id=?, vaccine_name=?, last_vaccination=?, next_due=?, status=?, notes=?
       WHERE id=?`,
      [animalId, vaccineName, lastVaccination || null, nextDue || null, status || 'Upcoming', notes || null, id]
    );
    const [rows] = await connection.query('SELECT * FROM vaccinations WHERE id = ? LIMIT 1', [id]);
    connection.release();
    if (!rows.length) return res.status(404).json({ error: 'Vaccination not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/vaccinations/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM vaccinations WHERE id = ?', [id]);
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Vaccination not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Checkups
router.get('/checkups', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT c.*, a.animal_code, a.breed
       FROM checkups c
       JOIN animals a ON a.id = c.animal_id
       ORDER BY c.checkup_date ASC, c.created_at DESC
       LIMIT 500`
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/checkups', authenticateToken, async (req, res) => {
  try {
    const { animalId, checkupDate, title, status, notes } = req.body;
    if (!animalId || !checkupDate || !title) {
      return res.status(400).json({ error: 'animalId, checkupDate, title are required' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO checkups (animal_id, checkup_date, title, status, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [animalId, checkupDate, title, status || 'Upcoming', notes || null]
    );
    const [rows] = await connection.query('SELECT * FROM checkups WHERE id = ? LIMIT 1', [result.insertId]);
    connection.release();
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/checkups/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { animalId, checkupDate, title, status, notes } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      `UPDATE checkups
       SET animal_id=?, checkup_date=?, title=?, status=?, notes=?
       WHERE id=?`,
      [animalId, checkupDate, title, status || 'Upcoming', notes || null, id]
    );
    const [rows] = await connection.query('SELECT * FROM checkups WHERE id = ? LIMIT 1', [id]);
    connection.release();
    if (!rows.length) return res.status(404).json({ error: 'Checkup not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/checkups/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM checkups WHERE id = ?', [id]);
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Checkup not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

