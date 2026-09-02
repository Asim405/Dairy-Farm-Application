const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT id, full_name, role_position, phone_number, email, joining_date, monthly_salary, shift, photo_url
       FROM staff
       ORDER BY created_at DESC
       LIMIT 500`
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
      fullName,
      rolePosition,
      phoneNumber,
      email,
      address,
      joiningDate,
      monthlySalary,
      shift,
      photoUrl
    } = req.body;
    if (!fullName || !rolePosition) return res.status(400).json({ error: 'fullName and rolePosition are required' });

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      `INSERT INTO staff
        (full_name, role_position, phone_number, email, address, joining_date, monthly_salary, shift, photo_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fullName,
        rolePosition,
        phoneNumber || null,
        email || null,
        address || null,
        joiningDate || null,
        Number(monthlySalary || 0),
        shift || 'Flexible',
        photoUrl || null
      ]
    );
    const [rows] = await connection.query('SELECT * FROM staff WHERE id=? LIMIT 1', [result.insertId]);
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
      fullName,
      rolePosition,
      phoneNumber,
      email,
      address,
      joiningDate,
      monthlySalary,
      shift,
      photoUrl
    } = req.body;

    const connection = await pool.getConnection();
    await connection.query(
      `UPDATE staff
       SET full_name=?, role_position=?, phone_number=?, email=?, address=?,
           joining_date=?, monthly_salary=?, shift=?, photo_url=?
       WHERE id=?`,
      [
        fullName,
        rolePosition,
        phoneNumber || null,
        email || null,
        address || null,
        joiningDate || null,
        Number(monthlySalary || 0),
        shift || 'Flexible',
        photoUrl || null,
        id
      ]
    );
    const [rows] = await connection.query('SELECT * FROM staff WHERE id=? LIMIT 1', [id]);
    connection.release();
    if (!rows.length) return res.status(404).json({ error: 'Staff member not found' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const connection = await pool.getConnection();
    const [result] = await connection.query('DELETE FROM staff WHERE id = ?', [id]);
    connection.release();
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Staff member not found' });
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

