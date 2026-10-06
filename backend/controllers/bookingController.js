const pool = require('../config/db');

// Helper to generate unique booking reference
const generateBookingReference = () => {
  const dateStr = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 8);
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `BUS${dateStr}${randomDigits}`;
};

// Helper to generate unique transaction ID
const generateTransactionId = () => {
  const dateStr = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 10);
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `TXN${dateStr}${randomDigits}`;
};

// @desc    Create a new booking (Transactional & Strict Seat Availability Check)
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { schedule_id, passengers, payment_method } = req.body;
    const userId = req.user.id;

    if (!schedule_id || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide schedule_id and at least one passenger.' });
    }

    await connection.beginTransaction();

    // 1. Check schedule exists and is active
    const [schedules] = await connection.query(`
      SELECT s.*, b.total_seats, b.bus_name, b.id AS bus_id
      FROM schedules s
      JOIN buses b ON s.bus_id = b.id
      WHERE s.id = ? AND s.status = 'ACTIVE'
    `, [schedule_id]);

    if (schedules.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'The requested bus schedule is no longer available.' });
    }

    const schedule = schedules[0];
    const requestedSeats = passengers.map(p => p.seat_number.trim());

    // 2. Verify all requested seats exist for this bus
    const [seatsInBus] = await connection.query(
      'SELECT seat_number FROM bus_seats WHERE bus_id = ? AND seat_number IN (?)',
      [schedule.bus_id, requestedSeats]
    );

    if (seatsInBus.length !== requestedSeats.length) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'One or more selected seat numbers are invalid for this bus.' });
    }

    // 3. Double-check seat availability in backend (FOR UPDATE lock)
    const [alreadyBooked] = await connection.query(`
      SELECT bp.seat_number
      FROM booking_passengers bp
      JOIN bookings bk ON bp.booking_id = bk.id
      WHERE bk.schedule_id = ? AND bk.booking_status IN ('CONFIRMED', 'COMPLETED') AND bp.seat_number IN (?)
      FOR UPDATE
    `, [schedule_id, requestedSeats]);

    if (alreadyBooked.length > 0) {
      await connection.rollback();
      const bookedSeatsList = alreadyBooked.map(b => b.seat_number).join(', ');
      return res.status(409).json({
        success: false,
        message: `Seat(s) ${bookedSeatsList} have just been booked by another passenger. Please select alternative seats.`
      });
    }

    // Calculate total amount
    const seatPrice = parseFloat(schedule.price);
    const totalAmount = seatPrice * passengers.length;
    const bookingReference = generateBookingReference();

    // 4. Create Booking record
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (booking_reference, user_id, schedule_id, total_seats, total_amount, booking_status)
       VALUES (?, ?, ?, ?, ?, 'CONFIRMED')`,
      [bookingReference, userId, schedule_id, passengers.length, totalAmount]
    );

    const bookingId = bookingResult.insertId;

    // 5. Insert Passengers
    const passengerValues = passengers.map(p => [
      bookingId,
      p.seat_number.trim(),
      p.passenger_name.trim(),
      parseInt(p.age),
      p.gender || 'Male'
    ]);

    await connection.query(
      `INSERT INTO booking_passengers (booking_id, seat_number, passenger_name, age, gender) VALUES ?`,
      [passengerValues]
    );

    // 6. Create Payment Record (Simulated Payment System)
    const transactionId = generateTransactionId();
    const selectedPaymentMethod = payment_method || 'UPI';

    await connection.query(
      `INSERT INTO payments (booking_id, transaction_id, amount, payment_method, payment_status)
       VALUES (?, ?, ?, ?, 'SUCCESS')`,
      [bookingId, transactionId, totalAmount, selectedPaymentMethod]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      booking: {
        id: bookingId,
        booking_reference: bookingReference,
        schedule_id,
        total_seats: passengers.length,
        total_amount: totalAmount,
        transaction_id: transactionId,
        payment_method: selectedPaymentMethod,
        booking_status: 'CONFIRMED'
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('Create booking error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to process booking transaction.' });
  } finally {
    connection.release();
  }
};

// @desc    Get user bookings list
// @route   GET /api/bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    let query = `
      SELECT 
        bk.*,
        s.travel_date, TIME_FORMAT(s.departure_time, '%H:%i') AS departure_time, TIME_FORMAT(s.arrival_time, '%H:%i') AS arrival_time, s.price,
        b.id AS bus_id, b.bus_name, b.bus_number, b.operator_name, b.bus_type,
        r.source, r.destination,
        p.transaction_id, p.payment_method, p.payment_status,
        u.name AS user_name, u.email AS user_email, u.phone AS user_phone,
        GROUP_CONCAT(bp.seat_number ORDER BY bp.seat_number ASC SEPARATOR ', ') AS seat_numbers
      FROM bookings bk
      JOIN schedules s ON bk.schedule_id = s.id
      JOIN buses b ON s.bus_id = b.id
      JOIN routes r ON s.route_id = r.id
      JOIN users u ON bk.user_id = u.id
      LEFT JOIN payments p ON bk.id = p.booking_id
      LEFT JOIN booking_passengers bp ON bk.id = bp.booking_id
    `;

    const params = [];
    if (!isAdmin) {
      query += ` WHERE bk.user_id = ?`;
      params.push(userId);
    }

    query += ` GROUP BY bk.id ORDER BY bk.id DESC`;

    const [bookings] = await pool.query(query, params);

    res.json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    const [bookings] = await pool.query(`
      SELECT 
        bk.*,
        s.travel_date, TIME_FORMAT(s.departure_time, '%H:%i') AS departure_time, TIME_FORMAT(s.arrival_time, '%H:%i') AS arrival_time, s.price,
        b.id AS bus_id, b.bus_name, b.bus_number, b.operator_name, b.bus_type, b.amenities,
        r.source, r.destination, r.distance_km,
        p.transaction_id, p.payment_method, p.payment_status, p.payment_date,
        u.name AS user_name, u.email AS user_email, u.phone AS user_phone
      FROM bookings bk
      JOIN schedules s ON bk.schedule_id = s.id
      JOIN buses b ON s.bus_id = b.id
      JOIN routes r ON s.route_id = r.id
      JOIN users u ON bk.user_id = u.id
      LEFT JOIN payments p ON bk.id = p.booking_id
      WHERE bk.id = ? ${!isAdmin ? 'AND bk.user_id = ?' : ''}
    `, isAdmin ? [bookingId] : [bookingId, userId]);

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookings[0];

    // Fetch passengers list
    const [passengers] = await pool.query(
      'SELECT * FROM booking_passengers WHERE booking_id = ? ORDER BY id ASC',
      [bookingId]
    );

    // Check if user has reviewed this bus for this booking
    const [reviews] = await pool.query(
      'SELECT * FROM reviews WHERE booking_id = ?',
      [bookingId]
    );

    res.json({
      success: true,
      booking,
      passengers,
      userReview: reviews.length > 0 ? reviews[0] : null
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch booking details.' });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    await connection.beginTransaction();

    const [bookings] = await connection.query(`
      SELECT bk.*, s.travel_date, s.departure_time
      FROM bookings bk
      JOIN schedules s ON bk.schedule_id = s.id
      WHERE bk.id = ? ${!isAdmin ? 'AND bk.user_id = ?' : ''}
      FOR UPDATE
    `, isAdmin ? [bookingId] : [bookingId, userId]);

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookings[0];

    if (booking.booking_status === 'CANCELLED') {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'This booking has already been cancelled.' });
    }

    // Check departure time restriction (cannot cancel after bus departure unless admin)
    const departureDateTime = new Date(`${formatDate(booking.travel_date)}T${booking.departure_time}`);
    if (!isAdmin && new Date() > departureDateTime) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Bookings cannot be cancelled after the scheduled departure time.' });
    }

    // Update booking status
    await connection.query(
      `UPDATE bookings SET booking_status = 'CANCELLED', cancelled_at = NOW() WHERE id = ?`,
      [bookingId]
    );

    // Update payment status to REFUNDED
    await connection.query(
      `UPDATE payments SET payment_status = 'REFUNDED' WHERE booking_id = ?`,
      [bookingId]
    );

    await connection.commit();

    res.json({
      success: true,
      message: 'Booking cancelled successfully! Simulated refund has been issued.'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Cancel booking error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel booking.' });
  } finally {
    connection.release();
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking
};
