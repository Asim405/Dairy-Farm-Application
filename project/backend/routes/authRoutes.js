const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' });
    }

    const connection = await pool.getConnection();
    
    // Check if user exists
    const [existingUser] = await connection.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (existingUser.length > 0) {
      connection.release();
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await connection.query(
      'INSERT INTO users (full_name, email, phone_number, password_hash) VALUES (?, ?, ?, ?)',
      [fullName, email, phoneNumber || null, hashedPassword]
    );

    connection.release();
    res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const connection = await pool.getConnection();
    
    const [users] = await connection.query(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE LIMIT 1',
      [email]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = users[0];
    if (!user.password_hash) {
      connection.release();
      return res.status(401).json({ error: 'Account is missing a password. Please register again.' });
    }
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      connection.release();
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, fullName: user.full_name, isGuest: false },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    connection.release();
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        phoneNumber: user.phone_number,
        role: user.role,
        avatarUrl: user.avatar_url,
        farmName: user.farm_name,
        farmLocation: user.farm_location,
        totalLandAcres: user.total_land_acres
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Continue as guest
router.post('/guest', async (req, res) => {
  try {
    const token = jwt.sign(
      { id: 0, email: null, fullName: 'Guest User', isGuest: true },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      message: 'Guest session started',
      token,
      user: { id: 0, fullName: 'Guest User', role: 'Guest' }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
