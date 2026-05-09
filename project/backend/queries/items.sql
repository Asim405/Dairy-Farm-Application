-- Items/Products Table
CREATE TABLE IF NOT EXISTS items (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  price DECIMAL(10, 2),
  quantity INT DEFAULT 1,
  image_url VARCHAR(255),
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Item Queries
-- 1. Create a new item
INSERT INTO items (user_id, title, description, category, price, quantity, image_url)
VALUES (?, ?, ?, ?, ?, ?, ?);

-- 2. Get item by ID
SELECT * FROM items WHERE id = ?;

-- 3. Get all items by user
SELECT * FROM items WHERE user_id = ? AND status = 'available' ORDER BY created_at DESC;

-- 4. Get all items (for marketplace)
SELECT i.*, u.username, u.profile_picture FROM items i
JOIN users u ON i.user_id = u.id
WHERE i.status = 'available'
ORDER BY i.created_at DESC;

-- 5. Get items by category
SELECT * FROM items WHERE category = ? AND status = 'available' ORDER BY created_at DESC;

-- 6. Search items
SELECT i.*, u.username FROM items i
JOIN users u ON i.user_id = u.id
WHERE (i.title LIKE ? OR i.description LIKE ?) AND i.status = 'available'
ORDER BY i.created_at DESC;

-- 7. Update item
UPDATE items SET title = ?, description = ?, category = ?, price = ?, quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?;

-- 8. Update item status
UPDATE items SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?;

-- 9. Delete item
DELETE FROM items WHERE id = ? AND user_id = ?;

-- 10. Get items by price range
SELECT * FROM items WHERE price BETWEEN ? AND ? AND status = 'available' ORDER BY price ASC;

-- 11. Get popular items (most recently added)
SELECT * FROM items WHERE status = 'available' ORDER BY created_at DESC LIMIT 10;

-- 12. Update item image
UPDATE items SET image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?;
