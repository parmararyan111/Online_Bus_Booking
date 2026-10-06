const pool = require('../config/db');

// @desc    Submit review for a bus
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { bus_id, booking_id, rating, comment } = req.body;
    const userId = req.user.id;

    if (!bus_id || !booking_id || !rating) {
      return res.status(400).json({ success: false, message: 'Bus ID, Booking ID, and rating are required.' });
    }

    const ratingVal = parseInt(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be an integer between 1 and 5.' });
    }

    // Check if user actually booked this bus with this booking ID
    const [bookings] = await pool.query(`
      SELECT bk.*, s.bus_id
      FROM bookings bk
      JOIN schedules s ON bk.schedule_id = s.id
      WHERE bk.id = ? AND bk.user_id = ? AND s.bus_id = ? AND bk.booking_status IN ('CONFIRMED', 'COMPLETED')
    `, [booking_id, userId, bus_id]);

    if (bookings.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Only passengers who have completed a booking for this bus can leave a review.'
      });
    }

    // Check if user already reviewed for this booking
    const [existing] = await pool.query('SELECT id FROM reviews WHERE booking_id = ?', [booking_id]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: 'You have already submitted a review for this trip.' });
    }

    const [result] = await pool.query(
      `INSERT INTO reviews (user_id, bus_id, booking_id, rating, comment) VALUES (?, ?, ?, ?, ?)`,
      [userId, bus_id, booking_id, ratingVal, comment || '']
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for your feedback! Review submitted successfully.',
      reviewId: result.insertId
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

// @desc    Get reviews for a specific bus
// @route   GET /api/buses/:id/reviews
// @access  Public
const getBusReviews = async (req, res) => {
  try {
    const busId = req.params.id;

    const [reviews] = await pool.query(`
      SELECT r.*, u.name AS user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.bus_id = ?
      ORDER BY r.created_at DESC
    `, [busId]);

    const [summary] = await pool.query(`
      SELECT 
        COALESCE(ROUND(AVG(rating), 1), 0) AS average_rating,
        COUNT(id) AS total_reviews
      FROM reviews
      WHERE bus_id = ?
    `, [busId]);

    res.json({
      success: true,
      summary: summary[0],
      reviews
    });
  } catch (error) {
    console.error('Get bus reviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};

module.exports = {
  createReview,
  getBusReviews
};
