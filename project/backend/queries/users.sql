-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  phone VARCHAR(20),
  profile_picture VARCHAR(255),
  bio TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User Queries
-- 1. Create a new user
INSERT INTO users (username, email, password, first_name, last_name, phone)
VALUES (?, ?, ?, ?, ?, ?);

-- 2. Get user by ID
SELECT * FROM users WHERE id = ?;

-- 3. Get user by email
SELECT * FROM users WHERE email = ?;

-- 4. Get all active users
SELECT id, username, email, first_name, last_name, phone, profile_picture, bio FROM users WHERE is_active = TRUE;

-- 5. Update user profile
UPDATE users SET first_name = ?, last_name = ?, phone = ?, bio = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- 6. Update user password
UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- 7. Delete user (soft delete)
UPDATE users SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- 8. Update profile picture
UPDATE users SET profile_picture = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?;

-- 9. Search users by username or email
SELECT * FROM users WHERE (username LIKE ? OR email LIKE ?) AND is_active = TRUE;

-- 10. Get user count
SELECT COUNT(*) as total_users FROM users WHERE is_active = TRUE;
