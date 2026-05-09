const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM app_settings WHERE id=1 LIMIT 1');
    connection.release();
    res.json(rows[0] || { notifications_enabled: true, dark_mode: false, language: 'English' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/', authenticateToken, async (req, res) => {
  try {
    const { notificationsEnabled, darkMode, language } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      `UPDATE app_settings
       SET notifications_enabled = COALESCE(?, notifications_enabled),
           dark_mode = COALESCE(?, dark_mode),
           language = COALESCE(?, language)
       WHERE id=1`,
      [
        typeof notificationsEnabled === 'boolean' ? notificationsEnabled : null,
        typeof darkMode === 'boolean' ? darkMode : null,
        language || null
      ]
    );
    const [rows] = await connection.query('SELECT * FROM app_settings WHERE id=1 LIMIT 1');
    connection.release();
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

