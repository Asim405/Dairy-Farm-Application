const express = require('express');
const pool = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Complete reporting & analytics summary
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const connection = await pool.getConnection();

    // 1. Livestock breakdown
    const [animalsByCategory] = await connection.query(
      `SELECT category, COUNT(*) AS count
       FROM animals
       GROUP BY category`
    );

    // 2. Health status breakdown
    const [healthStatus] = await connection.query(
      `SELECT health_status, COUNT(*) AS count
       FROM animals
       GROUP BY health_status`
    );

    // 3. 7-Day Production Trend
    const [productionTrend] = await connection.query(
      `SELECT DATE_FORMAT(entry_date, '%Y-%m-%d') AS date,
              DATE_FORMAT(entry_date, '%a') AS day_name,
              COALESCE(SUM(morning_liters + evening_liters), 0) AS total_liters,
              COALESCE(SUM(morning_liters), 0) AS morning_liters,
              COALESCE(SUM(evening_liters), 0) AS evening_liters
       FROM production_entries
       WHERE entry_date >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
       GROUP BY entry_date
       ORDER BY entry_date ASC`
    );

    // 4. Monthly P&L Comparison (Last 6 months)
    const [monthlyRevenue] = await connection.query(
      `SELECT DATE_FORMAT(sale_date, '%b') AS month,
              DATE_FORMAT(sale_date, '%Y-%m') AS sort_month,
              COALESCE(SUM(total_amount), 0) AS revenue
       FROM sales
       WHERE sale_date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
       GROUP BY sort_month, month
       ORDER BY sort_month ASC`
    );

    const [monthlyExpenses] = await connection.query(
      `SELECT DATE_FORMAT(expense_date, '%b') AS month,
              DATE_FORMAT(expense_date, '%Y-%m') AS sort_month,
              COALESCE(SUM(amount), 0) AS expense
       FROM expenses
       WHERE expense_date >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
       GROUP BY sort_month, month
       ORDER BY sort_month ASC`
    );

    // 5. Expense categories breakdown
    const [expenseBreakdown] = await connection.query(
      `SELECT category, COALESCE(SUM(amount), 0) AS total_amount
       FROM expenses
       GROUP BY category
       ORDER BY total_amount DESC`
    );

    // 6. Top producing animals
    const [topAnimals] = await connection.query(
      `SELECT a.animal_code, a.category, a.breed,
              COALESCE(SUM(p.morning_liters + p.evening_liters), 0) AS total_liters,
              COALESCE(AVG(p.morning_liters + p.evening_liters), 0) AS avg_liters
       FROM animals a
       JOIN production_entries p ON p.animal_id = a.id
       GROUP BY a.id, a.animal_code, a.category, a.breed
       ORDER BY total_liters DESC
       LIMIT 5`
    );

    // 7. Inventory stats
    const [[invStats]] = await connection.query(
      `SELECT COUNT(*) AS total_items,
              COALESCE(SUM(CASE WHEN quantity <= min_stock_level THEN 1 ELSE 0 END), 0) AS low_stock_items
       FROM inventory_items`
    );

    // 8. Staff stats
    const [[staffStats]] = await connection.query(
      `SELECT COUNT(*) AS total_staff,
              COALESCE(SUM(monthly_salary), 0) AS total_payroll
       FROM staff`
    );

    // 9. Crops stats
    const [cropsStats] = await connection.query(
      `SELECT status, COUNT(*) AS count, COALESCE(SUM(land_size), 0) AS total_land
       FROM crops
       GROUP BY status`
    );

    connection.release();

    res.json({
      animalsByCategory,
      healthStatus,
      productionTrend,
      monthlyRevenue,
      monthlyExpenses,
      expenseBreakdown,
      topAnimals,
      inventory: invStats || { total_items: 0, low_stock_items: 0 },
      staff: staffStats || { total_staff: 0, total_payroll: 0 },
      crops: cropsStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Universal Search across all modules
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    if (!q) {
      return res.json({ animals: [], staff: [], inventory: [], crops: [], sales: [] });
    }

    const pattern = `%${q}%`;
    const connection = await pool.getConnection();

    const [animals] = await connection.query(
      `SELECT id, animal_code, category, breed, health_status, 'animal' AS entity_type
       FROM animals
       WHERE animal_code LIKE ? OR breed LIKE ? OR category LIKE ?
       LIMIT 10`,
      [pattern, pattern, pattern]
    );

    const [staff] = await connection.query(
      `SELECT id, full_name, role_position, phone_number, shift, 'staff' AS entity_type
       FROM staff
       WHERE full_name LIKE ? OR role_position LIKE ? OR phone_number LIKE ?
       LIMIT 10`,
      [pattern, pattern, pattern]
    );

    const [inventory] = await connection.query(
      `SELECT id, item_name, category, quantity, unit, 'inventory' AS entity_type
       FROM inventory_items
       WHERE item_name LIKE ? OR category LIKE ?
       LIMIT 10`,
      [pattern, pattern]
    );

    const [crops] = await connection.query(
      `SELECT id, crop_name, land_size, land_unit, status, 'crop' AS entity_type
       FROM crops
       WHERE crop_name LIKE ? OR status LIKE ?
       LIMIT 10`,
      [pattern, pattern]
    );

    const [sales] = await connection.query(
      `SELECT id, buyer_name, liters_sold, price_per_liter, total_amount, sale_date, 'sale' AS entity_type
       FROM sales
       WHERE buyer_name LIKE ?
       LIMIT 10`,
      [pattern]
    );

    connection.release();

    res.json({
      animals,
      staff,
      inventory,
      crops,
      sales,
      totalMatches: animals.length + staff.length + inventory.length + crops.length + sales.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
