const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');
const router = express.Router();

// Get all items (marketplace)
router.get('/', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [items] = await connection.query(
      `SELECT i.*, u.username, u.profile_picture FROM items i
       JOIN users u ON i.user_id = u.id
       WHERE i.status = 'available'
       ORDER BY i.created_at DESC`
    );
    connection.release();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get item by ID
router.get('/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [items] = await connection.query(
      `SELECT i.*, u.username, u.profile_picture FROM items i
       JOIN users u ON i.user_id = u.id
       WHERE i.id = ? AND i.status = 'available'`,
      [req.params.id]
    );
    connection.release();

    if (items.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.json(items[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create item
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, price, quantity, imageUrl } = req.body;
    const connection = await pool.getConnection();

    const [result] = await connection.query(
      'INSERT INTO items (user_id, title, description, category, price, quantity, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, title, description, category, price, quantity, imageUrl]
    );

    connection.release();
    res.status(201).json({ 
      message: 'Item created successfully',
      itemId: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update item
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, price, quantity } = req.body;
    const connection = await pool.getConnection();

    await connection.query(
      'UPDATE items SET title = ?, description = ?, category = ?, price = ?, quantity = ? WHERE id = ? AND user_id = ?',
      [title, description, category, price, quantity, req.params.id, req.user.id]
    );

    connection.release();
    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete item
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'DELETE FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    connection.release();
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search items
router.get('/search/:query', async (req, res) => {
  try {
    const searchTerm = `%${req.params.query}%`;
    const connection = await pool.getConnection();
    const [items] = await connection.query(
      `SELECT i.*, u.username FROM items i
       JOIN users u ON i.user_id = u.id
       WHERE (i.title LIKE ? OR i.description LIKE ?) AND i.status = 'available'
       ORDER BY i.created_at DESC`,
      [searchTerm, searchTerm]
    );
    connection.release();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
