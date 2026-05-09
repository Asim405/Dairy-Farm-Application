-- Dairy Farm Manager - sample data (optional)

INSERT INTO animals (animal_code, category, breed, age_years, gender, weight_kg, health_status)
VALUES
('COW-001','Cow','Holstein',3,'Female',450,'Healthy'),
('COW-002','Cow','Jersey',2,'Female',420,'Healthy'),
('BUF-001','Buffalo','Murrah',4,'Female',520,'Under Treatment'),
('SHP-001','Sheep','Merino',1,'Male',60,'Healthy'),
('GOAT-001','Goat','Beetal',2,'Female',55,'Sick')
ON DUPLICATE KEY UPDATE animal_code = animal_code;

INSERT INTO vaccinations (animal_id, vaccine_name, last_vaccination, next_due, status)
SELECT a.id, 'FMD (Foot & Mouth Disease)', '2026-02-15', '2026-05-15', 'Upcoming'
FROM animals a WHERE a.animal_code='COW-001'
ON DUPLICATE KEY UPDATE vaccine_name = vaccine_name;

INSERT INTO sales (sale_date, buyer_name, liters_sold, price_per_liter)
VALUES
(CURDATE(), 'Local Dairy', 284.0, 65.0)
ON DUPLICATE KEY UPDATE buyer_name = buyer_name;

INSERT INTO expenses (expense_date, category, amount, description)
VALUES
(CURDATE(), 'Feed', 15000, 'Cattle feed'),
(CURDATE(), 'Electricity', 10500, 'Monthly bill');

INSERT INTO staff (full_name, role_position, phone_number, email, monthly_salary, shift)
VALUES
('Rajesh Kumar', 'Farm Manager', '+91 98765 43210', 'rajesh@farm.com', 15000, 'Morning'),
('Suresh Patel', 'Milker', '+91 98765 43211', 'suresh@farm.com', 12000, 'Morning & Evening')
ON DUPLICATE KEY UPDATE full_name = full_name;

INSERT INTO inventory_items (item_name, category, quantity, unit, min_stock_level, last_updated)
VALUES
('Cattle Feed (Premium)', 'Fodder', 450, 'kg', 200, CURDATE()),
('FMD Vaccine', 'Medicines', 12, 'doses', 20, CURDATE())
ON DUPLICATE KEY UPDATE item_name = item_name;

INSERT INTO crops (crop_name, land_size, land_unit, planted_date, expected_harvest_date, status)
VALUES
('Wheat', 5, 'Acre', '2026-01-15', '2026-05-20', 'Growing'),
('Corn', 3, 'Acre', '2026-02-10', '2026-06-15', 'Growing')
ON DUPLICATE KEY UPDATE crop_name = crop_name;

