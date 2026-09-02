const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT id, crop_name, land_size, land_unit, planted_date, expected_harvest_date,
              use_duration_instead, duration_days, status, created_at, updated_at
       FROM crops
       ORDER BY created_at DESC
       LIMIT 200`
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      cropName,
      landSize,
      landUnit,
      plantedDate,
      expectedHarvestDate,
      useDurationInstead,
      durationDays,
      status
    } = req.body;

    if (!cropName || !landSize || !plantedDate) {
      return res.status(400).json({ error: 'cropName, landSize, plantedDate are required' });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO crops
        (crop_name, land_size, land_unit, planted_date, expected_harvest_date, use_duration_instead, duration_days, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        cropName,
        Number(landSize),
        landUnit || 'Acre',
        plantedDate,
        expectedHarvestDate || null,
        Boolean(useDurationInstead),
        useDurationInstead ? Number(durationDays || 0) : null,
        status || 'Growing'
      ]
    );
    const [rows] = await connection.query('SELECT * FROM crops WHERE id=? LIMIT 1', [result.insertId]);
    connection.release();
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      cropName,
      landSize,
      landUnit,
      plantedDate,
      expectedHarvestDate,
      useDurationInstead,
      durationDays,
      status
    } = req.body;

    const connection = await pool.getConnection();
    await connection.query(
      `UPDATE crops
       SET crop_name=?, land_size=?, land_unit=?, planted_date=?, expected_harvest_date=?,
           use_duration_instead=?, duration_days=?, status=?
       WHERE id=?`,
      [
        cropName,
        Number(landSize || 0),
        landUnit || 'Acre',
        plantedDate,
        expectedHarvestDate || null,
        Boolean(useDurationInstead),
        useDurationInstead ? Number(durationDays || 0) : null,
        status || 'Growing',
        id
      ]
    );
    const [rows] = await connection.query('SELECT * FROM crops WHERE id=? LIMIT 1', [id]);
    connection.release();
    if (!rows.length) return res.status(404).json({ error: 'Crop not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM crops WHERE id = ?', [id]);
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Crop not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

