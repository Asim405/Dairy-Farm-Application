const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// List animals (filter by category, search by animal_code/breed)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { q, category } = req.query;
    const connection = await pool.getConnection();

    const where = [];
    const params = [];

    if (category && category !== 'All') {
      where.push('category = ?');
      params.push(category);
    }
    if (q) {
      where.push('(animal_code LIKE ? OR breed LIKE ?)');
      params.push(`%${q}%`, `%${q}%`);
    }

    const sql = `
      SELECT id, animal_code, category, breed, age_years, gender, weight_kg, health_status, photo_url,
             purchase_date, purchase_price, created_at, updated_at
      FROM animals
      ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
      ORDER BY created_at DESC
      LIMIT 500
    `;

    const [rows] = await connection.query(sql, params);
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create animal
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      animalCode,
      category,
      breed,
      ageYears,
      gender,
      weightKg,
      purchaseDate,
      purchasePrice,
      healthStatus,
      photoUrl
    } = req.body;

    if (!animalCode) return res.status(400).json({ error: 'animalCode is required' });

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO animals
        (animal_code, category, breed, age_years, gender, weight_kg, purchase_date, purchase_price, health_status, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        animalCode,
        category || 'Cow',
        breed || null,
        typeof ageYears === 'number' ? ageYears : null,
        gender || 'Unknown',
        typeof weightKg === 'number' ? weightKg : null,
        purchaseDate || null,
        typeof purchasePrice === 'number' ? purchasePrice : null,
        healthStatus || 'Healthy',
        photoUrl || null
      ]
    );
    const [rows] = await connection.query('SELECT * FROM animals WHERE id = ? LIMIT 1', [result.insertId]);
    connection.release();
    res.status(201).json(rows[0]);
  } catch (error) {
    if (String(error?.message || '').includes('Duplicate')) {
      return res.status(409).json({ error: 'animalCode already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update animal
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const {
      category,
      breed,
      ageYears,
      gender,
      weightKg,
      purchaseDate,
      purchasePrice,
      healthStatus,
      photoUrl
    } = req.body;

    const connection = await pool.getConnection();
    await connection.query(
      `UPDATE animals
       SET category=?, breed=?, age_years=?, gender=?, weight_kg=?, purchase_date=?, purchase_price=?, health_status=?, photo_url=?
       WHERE id=?`,
      [
        category || 'Cow',
        breed || null,
        typeof ageYears === 'number' ? ageYears : null,
        gender || 'Unknown',
        typeof weightKg === 'number' ? weightKg : null,
        purchaseDate || null,
        typeof purchasePrice === 'number' ? purchasePrice : null,
        healthStatus || 'Healthy',
        photoUrl || null,
        id
      ]
    );
    const [rows] = await connection.query('SELECT * FROM animals WHERE id = ? LIMIT 1', [id]);
    connection.release();
    if (!rows.length) return res.status(404).json({ error: 'Animal not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete animal
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM animals WHERE id = ?', [id]);
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Animal not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

