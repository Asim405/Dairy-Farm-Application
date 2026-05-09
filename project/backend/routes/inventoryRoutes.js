const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category } = req.query;
    const connection = await pool.getConnection();
    const params = [];
    let where = '';
    if (category && category !== 'All') {
      where = 'WHERE category = ?';
      params.push(category);
    }
    const [rows] = await connection.query(
      `SELECT id, item_name, category, quantity, unit, min_stock_level, last_updated,
              CASE WHEN quantity <= min_stock_level THEN TRUE ELSE FALSE END AS low_stock
       FROM inventory_items
       ${where}
       ORDER BY low_stock DESC, item_name ASC
       LIMIT 500`,
      params
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { itemName, category, quantity, unit, minStockLevel } = req.body;
    if (!itemName) return res.status(400).json({ error: 'itemName is required' });

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO inventory_items (item_name, category, quantity, unit, min_stock_level, last_updated)
       VALUES (?, ?, ?, ?, ?, CURDATE())`,
      [itemName, category || 'Other', Number(quantity || 0), unit || 'units', Number(minStockLevel || 0)]
    );
    const [rows] = await connection.query('SELECT * FROM inventory_items WHERE id=? LIMIT 1', [result.insertId]);
    connection.release();
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

