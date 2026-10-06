const pool = require('../config/db');

// @desc    Get Admin Dashboard Stats & Chart Data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    const [[usersCount]] = await pool.query("SELECT COUNT(id) AS total_users FROM users WHERE role = 'USER'");
    const [[busesCount]] = await pool.query("SELECT COUNT(id) AS total_buses FROM buses");
    const [[routesCount]] = await pool.query("SELECT COUNT(id) AS total_routes FROM routes");
    const [[bookingsCount]] = await pool.query("SELECT COUNT(id) AS total_bookings FROM bookings");
    const [[confirmedCount]] = await pool.query("SELECT COUNT(id) AS confirmed_bookings FROM bookings WHERE booking_status = 'CONFIRMED'");
    const [[completedCount]] = await pool.query("SELECT COUNT(id) AS completed_bookings FROM bookings WHERE booking_status = 'COMPLETED'");
    const [[cancelledCount]] = await pool.query("SELECT COUNT(id) AS cancelled_bookings FROM bookings WHERE booking_status = 'CANCELLED'");
    const [[revenueResult]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM bookings WHERE booking_status IN ('CONFIRMED', 'COMPLETED')"
    );

    // Monthly bookings & revenue breakdown
    const [monthlyStats] = await pool.query(`
      SELECT 
        DATE_FORMAT(booking_date, '%b %Y') AS month_name,
        COUNT(id) AS booking_count,
        SUM(CASE WHEN booking_status IN ('CONFIRMED', 'COMPLETED') THEN total_amount ELSE 0 END) AS revenue
      FROM bookings
      GROUP BY DATE_FORMAT(booking_date, '%Y-%m'), DATE_FORMAT(booking_date, '%b %Y')
      ORDER BY DATE_FORMAT(booking_date, '%Y-%m') ASC
      LIMIT 12
    `);

    // Popular routes breakdown
    const [popularRoutes] = await pool.query(`
      SELECT 
        CONCAT(r.source, ' → ', r.destination) AS route_name,
        COUNT(bk.id) AS total_bookings,
        SUM(CASE WHEN bk.booking_status IN ('CONFIRMED', 'COMPLETED') THEN bk.total_amount ELSE 0 END) AS total_revenue
      FROM bookings bk
      JOIN schedules s ON bk.schedule_id = s.id
      JOIN routes r ON s.route_id = r.id
      GROUP BY r.id, r.source, r.destination
      ORDER BY total_bookings DESC
      LIMIT 5
    `);

    // Recent Bookings
    const [recentBookings] = await pool.query(`
      SELECT 
        bk.id, bk.booking_reference, bk.total_seats, bk.total_amount, bk.booking_status, bk.created_at,
        u.name AS user_name, u.email AS user_email,
        b.bus_name, r.source, r.destination, s.travel_date
      FROM bookings bk
      JOIN users u ON bk.user_id = u.id
      JOIN schedules s ON bk.schedule_id = s.id
      JOIN buses b ON s.bus_id = b.id
      JOIN routes r ON s.route_id = r.id
      ORDER BY bk.id DESC
      LIMIT 6
    `);

    res.json({
      success: true,
      stats: {
        totalUsers: usersCount.total_users || 0,
        totalBuses: busesCount.total_buses || 0,
        totalRoutes: routesCount.total_routes || 0,
        totalBookings: bookingsCount.total_bookings || 0,
        confirmedBookings: confirmedCount.confirmed_bookings || 0,
        completedBookings: completedCount.completed_bookings || 0,
        cancelledBookings: cancelledCount.cancelled_bookings || 0,
        totalRevenue: parseFloat(revenueResult.total_revenue || 0)
      },
      monthlyStats,
      popularRoutes,
      recentBookings
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics.' });
  }
};

// @desc    Get all registered users for Admin Management
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.id, u.name, u.email, u.phone, u.role, u.status, u.created_at,
        COUNT(bk.id) AS total_bookings
      FROM users u
      LEFT JOIN bookings bk ON u.id = bk.user_id
      GROUP BY u.id
      ORDER BY u.id DESC
    `);

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error('Admin users fetch error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch users list.' });
  }
};

// @desc    Update user status (ACTIVE / INACTIVE)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
const toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    // Prevent admin from deactivating themselves
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own admin account.' });
    }

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value. Must be ACTIVE or INACTIVE.' });
    }

    const [result] = await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: `User status updated to ${status}.` });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update user status.' });
  }
};

// @desc    Get revenue report details
// @route   GET /api/admin/revenue
// @access  Private/Admin
const getRevenueReport = async (req, res) => {
  try {
    const [revenueByBus] = await pool.query(`
      SELECT 
        b.id AS bus_id, b.bus_name, b.bus_number, b.operator_name,
        COUNT(bk.id) AS total_bookings,
        COALESCE(SUM(bk.total_amount), 0) AS total_revenue
      FROM buses b
      LEFT JOIN schedules s ON b.id = s.bus_id
      LEFT JOIN bookings bk ON s.id = bk.schedule_id AND bk.booking_status IN ('CONFIRMED', 'COMPLETED')
      GROUP BY b.id
      ORDER BY total_revenue DESC
    `);

    res.json({ success: true, revenueByBus });
  } catch (error) {
    console.error('Revenue report error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch revenue breakdown.' });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getRevenueReport
};
