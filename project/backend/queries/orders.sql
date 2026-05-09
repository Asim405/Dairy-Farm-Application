-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  item_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  shipping_address TEXT,
  delivery_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

-- Order Queries
-- 1. Create a new order
INSERT INTO orders (buyer_id, seller_id, item_id, quantity, total_price, shipping_address)
VALUES (?, ?, ?, ?, ?, ?);

-- 2. Get order by ID
SELECT * FROM orders WHERE id = ?;

-- 3. Get buyer's orders
SELECT o.*, i.title, u.username as seller_name FROM orders o
JOIN items i ON o.item_id = i.id
JOIN users u ON o.seller_id = u.id
WHERE o.buyer_id = ?
ORDER BY o.created_at DESC;

-- 4. Get seller's orders
SELECT o.*, i.title, u.username as buyer_name FROM orders o
JOIN items i ON o.item_id = i.id
JOIN users u ON o.buyer_id = u.id
WHERE o.seller_id = ?
ORDER BY o.created_at DESC;

-- 5. Update order status
UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- 6. Get pending orders
SELECT * FROM orders WHERE status = 'pending' ORDER BY created_at DESC;

-- 7. Get completed orders
SELECT * FROM orders WHERE status = 'completed' ORDER BY created_at DESC;

-- 8. Cancel order
UPDATE orders SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = 'pending';

-- 9. Get order count by status
SELECT status, COUNT(*) as count FROM orders GROUP BY status;

-- 10. Get recent orders (last 30 days)
SELECT * FROM orders WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) ORDER BY created_at DESC;
