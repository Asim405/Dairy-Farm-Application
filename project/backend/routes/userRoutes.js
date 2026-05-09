const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (req.user?.isGuest) {
      return res.json({
        id: 0,
        fullName: 'Guest User',
        role: 'Guest',
        email: null,
        phoneNumber: null
      });
    }

    const connection = await pool.getConnection();
    const [users] = await connection.query(
      'SELECT id, full_name, email, phone_number, role, avatar_url, farm_name, farm_location, total_land_acres, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );
    connection.release();

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const u = users[0];
    res.json({
      id: u.id,
      fullName: u.full_name,
      email: u.email,
      phoneNumber: u.phone_number,
      role: u.role,
      avatarUrl: u.avatar_url,
      farmName: u.farm_name,
      farmLocation: u.farm_location,
      totalLandAcres: u.total_land_acres,
      createdAt: u.created_at
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update current user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    if (req.user?.isGuest) {
      return res.status(403).json({ error: 'Guest user cannot update profile' });
    }

    const { fullName, phoneNumber, avatarUrl, farmName, farmLocation, totalLandAcres } = req.body;
    const connection = await pool.getConnection();

    await connection.query(
      'UPDATE users SET full_name = COALESCE(?, full_name), phone_number = ?, avatar_url = ?, farm_name = ?, farm_location = ?, total_land_acres = ? WHERE id = ?',
      [
        fullName || null,
        phoneNumber || null,
        avatarUrl || null,
        farmName || null,
        farmLocation || null,
        typeof totalLandAcres === 'number' ? totalLandAcres : null,
        req.user.id
      ]
    );

    const [users] = await connection.query(
      'SELECT id, full_name, email, phone_number, role, avatar_url, farm_name, farm_location, total_land_acres, created_at FROM users WHERE id = ? LIMIT 1',
      [req.user.id]
    );
    connection.release();
    const u = users[0];
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        phoneNumber: u.phone_number,
        role: u.role,
        avatarUrl: u.avatar_url,
        farmName: u.farm_name,
        farmLocation: u.farm_location,
        totalLandAcres: u.total_land_acres,
        createdAt: u.created_at
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
