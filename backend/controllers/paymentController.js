const pool = require('../config/db');

// @desc    Process simulated payment for a pending/existing booking
// @route   POST /api/payments
// @access  Private
const processPayment = async (req, res) => {
  try {
    const { booking_id, payment_method, card_details, upi_id } = req.body;

    if (!booking_id || !payment_method) {
      return res.status(400).json({ success: false, message: 'Booking ID and payment method are required.' });
    }

    const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ?', [booking_id]);

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookings[0];

    // Check existing payment
    const [existingPayments] = await pool.query('SELECT * FROM payments WHERE booking_id = ?', [booking_id]);

    if (existingPayments.length > 0 && existingPayments[0].payment_status === 'SUCCESS') {
      return res.json({
        success: true,
        message: 'Payment has already been processed successfully.',
        payment: existingPayments[0]
      });
    }

    const transactionId = `TXN${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

    if (existingPayments.length > 0) {
      await pool.query(
        `UPDATE payments SET transaction_id = ?, payment_method = ?, payment_status = 'SUCCESS', payment_date = NOW() WHERE booking_id = ?`,
        [transactionId, payment_method, booking_id]
      );
    } else {
      await pool.query(
        `INSERT INTO payments (booking_id, transaction_id, amount, payment_method, payment_status) VALUES (?, ?, ?, ?, 'SUCCESS')`,
        [booking_id, transactionId, booking.total_amount, payment_method]
      );
    }

    await pool.query(`UPDATE bookings SET booking_status = 'CONFIRMED' WHERE id = ?`, [booking_id]);

    res.json({
      success: true,
      message: 'Simulated payment completed successfully!',
      transactionId,
      amount: booking.total_amount,
      paymentStatus: 'SUCCESS'
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ success: false, message: 'Payment processing failed.' });
  }
};

// @desc    Get payment details by booking ID
// @route   GET /api/payments/:id
// @access  Private
const getPaymentById = async (req, res) => {
  try {
    const [payments] = await pool.query('SELECT * FROM payments WHERE booking_id = ?', [req.params.id]);

    if (payments.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment details not found.' });
    }

    res.json({ success: true, payment: payments[0] });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch payment details.' });
  }
};

module.exports = {
  processPayment,
  getPaymentById
};
