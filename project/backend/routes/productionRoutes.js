const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Overview aggregates
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [[today]] = await connection.query(
      `SELECT
         COALESCE(SUM(morning_liters + evening_liters), 0) AS liters_today
       FROM production_entries
       WHERE entry_date = CURDATE()`
    );

    const [[revenueToday]] = await connection.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS revenue_today
       FROM sales
       WHERE sale_date = CURDATE()`
    );

    connection.release();
    res.json({
      litersToday: Number(today.liters_today || 0),
      revenueToday: Number(revenueToday.revenue_today || 0)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Daily entries list for a date (default today)
router.get('/entries', authenticateToken, async (req, res) => {
  try {
    const date = req.query.date || null;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT p.id, p.animal_id, a.animal_code, a.category, a.breed,
              p.entry_date, p.morning_liters, p.evening_liters,
              (p.morning_liters + p.evening_liters) AS total_liters
       FROM production_entries p
       JOIN animals a ON a.id = p.animal_id
       WHERE p.entry_date = COALESCE(?, CURDATE())
       ORDER BY a.animal_code ASC`,
      [date]
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add production entry
router.post('/entries', authenticateToken, async (req, res) => {
  try {
    const { animalId, entryDate, morningLiters, eveningLiters } = req.body;
    if (!animalId) return res.status(400).json({ error: 'animalId is required' });

    const connection = await pool.getConnection();
    await connection.query(
      `INSERT INTO production_entries (animal_id, entry_date, morning_liters, evening_liters)
       VALUES (?, COALESCE(?, CURDATE()), ?, ?)
       ON DUPLICATE KEY UPDATE
         morning_liters = VALUES(morning_liters),
         evening_liters = VALUES(evening_liters),
         updated_at = CURRENT_TIMESTAMP`,
      [
        animalId,
        entryDate || null,
        Number(morningLiters || 0),
        Number(eveningLiters || 0)
      ]
    );
    const [rows] = await connection.query(
      `SELECT * FROM production_entries WHERE animal_id=? AND entry_date=COALESCE(?, CURDATE()) LIMIT 1`,
      [animalId, entryDate || null]
    );
    connection.release();
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sales list + totals
router.get('/sales', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT id, sale_date, buyer_name, liters_sold, price_per_liter, total_amount
       FROM sales
       ORDER BY sale_date DESC, id DESC
       LIMIT 200`
    );
    const [[week]] = await connection.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS total_sales_week,
              COALESCE(SUM(liters_sold), 0) AS total_liters_week
       FROM sales
       WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)`
    );
    connection.release();
    res.json({
      totals: {
        totalSalesWeek: Number(week.total_sales_week || 0),
        totalLitersWeek: Number(week.total_liters_week || 0)
      },
      sales: rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/sales', authenticateToken, async (req, res) => {
  try {
    const { saleDate, buyerName, litersSold, pricePerLiter } = req.body;
    if (!buyerName || !litersSold || !pricePerLiter) {
      return res.status(400).json({ error: 'buyerName, litersSold, pricePerLiter are required' });
    }
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO sales (sale_date, buyer_name, liters_sold, price_per_liter)
       VALUES (COALESCE(?, CURDATE()), ?, ?, ?)`,
      [saleDate || null, buyerName, Number(litersSold), Number(pricePerLiter)]
    );
    const [rows] = await connection.query('SELECT * FROM sales WHERE id=? LIMIT 1', [result.insertId]);
    connection.release();
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Compare view data (simple: totals per animal by week)
router.get('/compare', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT a.id AS animal_id, a.animal_code,
              COALESCE(AVG(p.morning_liters + p.evening_liters), 0) AS avg_liters_per_day
       FROM animals a
       LEFT JOIN production_entries p
         ON p.animal_id = a.id
        AND p.entry_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
       GROUP BY a.id, a.animal_code
       ORDER BY a.animal_code ASC
       LIMIT 200`
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

