-- Dairy Farm Manager - MySQL schema (v1)
-- Run: mysql -u root -p <schema.sql  (after selecting/creating DB)

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- Users
CREATE TABLE IF NOT EXISTS users (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  full_name       VARCHAR(120) NOT NULL,
  email           VARCHAR(190) NOT NULL UNIQUE,
  phone_number    VARCHAR(40) NULL,
  password_hash   VARCHAR(255) NULL,
  role            VARCHAR(40) NOT NULL DEFAULT 'Farm Owner',
  avatar_url      TEXT NULL,
  farm_name       VARCHAR(160) NULL,
  farm_location   VARCHAR(160) NULL,
  total_land_acres DECIMAL(10,2) NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Animals (livestock)
CREATE TABLE IF NOT EXISTS animals (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  animal_code   VARCHAR(40) NOT NULL UNIQUE,  -- e.g. COW-001
  category      ENUM('Cow','Buffalo','Sheep','Goat','Other') NOT NULL DEFAULT 'Cow',
  breed         VARCHAR(80) NULL,
  age_years     INT NULL,
  gender        ENUM('Male','Female','Unknown') NOT NULL DEFAULT 'Unknown',
  weight_kg     DECIMAL(10,2) NULL,
  purchase_date DATE NULL,
  purchase_price DECIMAL(12,2) NULL,
  health_status ENUM('Healthy','Under Treatment','Sick') NOT NULL DEFAULT 'Healthy',
  photo_url     TEXT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vaccinations
CREATE TABLE IF NOT EXISTS vaccinations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  animal_id        INT NOT NULL,
  vaccine_name     VARCHAR(120) NOT NULL,
  last_vaccination DATE NULL,
  next_due         DATE NULL,
  status           ENUM('Upcoming','Due Now','Done') NOT NULL DEFAULT 'Upcoming',
  notes            TEXT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_vaccinations_animal FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

-- Checkups
CREATE TABLE IF NOT EXISTS checkups (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  animal_id  INT NOT NULL,
  checkup_date DATE NOT NULL,
  title      VARCHAR(120) NOT NULL,
  status     ENUM('Upcoming','Due Now','Done') NOT NULL DEFAULT 'Upcoming',
  notes      TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_checkups_animal FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

-- Production entries (daily milk production per animal)
CREATE TABLE IF NOT EXISTS production_entries (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  animal_id        INT NOT NULL,
  entry_date       DATE NOT NULL,
  morning_liters   DECIMAL(10,2) NOT NULL DEFAULT 0,
  evening_liters   DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_prod_animal_date (animal_id, entry_date),
  CONSTRAINT fk_production_animal FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE
);

-- Sales (milk sales)
CREATE TABLE IF NOT EXISTS sales (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  sale_date   DATE NOT NULL,
  buyer_name  VARCHAR(160) NOT NULL,
  liters_sold DECIMAL(12,2) NOT NULL,
  price_per_liter DECIMAL(12,2) NOT NULL,
  total_amount DECIMAL(12,2) AS (liters_sold * price_per_liter) STORED,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Expenses (finance)
CREATE TABLE IF NOT EXISTS expenses (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  expense_date DATE NOT NULL,
  category     ENUM('Feed','Labor','Medical Bills','Electricity','Other') NOT NULL DEFAULT 'Other',
  amount       DECIMAL(12,2) NOT NULL,
  description  VARCHAR(255) NULL,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Staff
CREATE TABLE IF NOT EXISTS staff (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(120) NOT NULL,
  role_position VARCHAR(80) NOT NULL,
  phone_number  VARCHAR(40) NULL,
  email         VARCHAR(190) NULL,
  address       TEXT NULL,
  joining_date  DATE NULL,
  monthly_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
  shift         ENUM('Morning','Evening','Morning & Evening','Night','Flexible') NOT NULL DEFAULT 'Flexible',
  photo_url     TEXT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Labor payments/attendance (optional summary)
CREATE TABLE IF NOT EXISTS labor_entries (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  staff_id    INT NOT NULL,
  month_year  CHAR(7) NOT NULL, -- YYYY-MM
  attendance_days INT NOT NULL DEFAULT 0,
  total_days  INT NOT NULL DEFAULT 30,
  payment_status ENUM('Paid','Pending') NOT NULL DEFAULT 'Pending',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_labor_staff_month (staff_id, month_year),
  CONSTRAINT fk_labor_staff FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- Inventory
CREATE TABLE IF NOT EXISTS inventory_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  item_name     VARCHAR(160) NOT NULL,
  category      ENUM('Fodder','Medicines','Equipment','Other') NOT NULL DEFAULT 'Other',
  quantity      DECIMAL(12,2) NOT NULL DEFAULT 0,
  unit          VARCHAR(40) NOT NULL DEFAULT 'units', -- kg, liters, bales, doses, etc.
  min_stock_level DECIMAL(12,2) NOT NULL DEFAULT 0,
  last_updated  DATE NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Crops
CREATE TABLE IF NOT EXISTS crops (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  crop_name      VARCHAR(120) NOT NULL,
  land_size      DECIMAL(12,2) NOT NULL,
  land_unit      ENUM('Acre','Marla','Kanal','Hectare','Other') NOT NULL DEFAULT 'Acre',
  planted_date   DATE NOT NULL,
  expected_harvest_date DATE NULL,
  use_duration_instead BOOLEAN NOT NULL DEFAULT FALSE,
  duration_days  INT NULL,
  status         ENUM('Growing','Ready Soon','Harvested') NOT NULL DEFAULT 'Growing',
  created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- App settings (single-row)
CREATE TABLE IF NOT EXISTS app_settings (
  id            INT PRIMARY KEY DEFAULT 1,
  notifications_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  dark_mode     BOOLEAN NOT NULL DEFAULT FALSE,
  language      VARCHAR(24) NOT NULL DEFAULT 'English',
  updated_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO app_settings (id) VALUES (1)
ON DUPLICATE KEY UPDATE id = id;

