const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Overview
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [[rev]] = await connection.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS revenue_month
       FROM sales
       WHERE DATE_FORMAT(sale_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`
    );
    const [[exp]] = await connection.query(
      `SELECT COALESCE(SUM(amount), 0) AS expense_month
       FROM expenses
       WHERE DATE_FORMAT(expense_date, '%Y-%m') = DATE_FORMAT(CURDATE(), '%Y-%m')`
    );
    connection.release();

    const revenue = Number(rev.revenue_month || 0);
    const expense = Number(exp.expense_month || 0);
    res.json({ revenueMonth: revenue, expenseMonth: expense, netMonth: revenue - expense });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Expenses list
router.get('/expenses', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT id, expense_date, category, amount, description
       FROM expenses
       ORDER BY expense_date DESC, id DESC
       LIMIT 200`
    );
    connection.release();
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/expenses', authenticateToken, async (req, res) => {
  try {
    const { expenseDate, category, amount, description } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount is required' });
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO expenses (expense_date, category, amount, description)
       VALUES (COALESCE(?, CURDATE()), ?, ?, ?)`,
      [expenseDate || null, category || 'Other', Number(amount), description || null]
    );
    const [rows] = await connection.query('SELECT * FROM expenses WHERE id=? LIMIT 1', [result.insertId]);
    connection.release();
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// P&L analytics data (monthly)
router.get('/pl', authenticateToken, async (req, res) => {
  try {
    const months = Number(req.query.months || 6);
    const connection = await pool.getConnection();

    const [revRows] = await connection.query(
      `SELECT DATE_FORMAT(sale_date, '%Y-%m') AS month, COALESCE(SUM(total_amount), 0) AS revenue
       FROM sales
       WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
       GROUP BY month
       ORDER BY month ASC`,
      [months]
    );

    const [expRows] = await connection.query(
      `SELECT DATE_FORMAT(expense_date, '%Y-%m') AS month, COALESCE(SUM(amount), 0) AS expense
       FROM expenses
       WHERE expense_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
       GROUP BY month
       ORDER BY month ASC`,
      [months]
    );

    connection.release();
    res.json({ revenue: revRows, expense: expRows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

