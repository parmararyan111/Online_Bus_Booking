const pool = require('../config/db');

// Helper to format date string to YYYY-MM-DD
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toISOString().split('T')[0];
};

// @desc    Search schedules based on Source, Destination, Date, Filters, Sorting
// @route   GET /api/search
// @access  Public
const searchSchedules = async (req, res) => {
  try {
    const { from, to, date, bus_type, operator, min_price, max_price, sort_by } = req.query;

    if (!from || !to) {
      return res.status(400).json({ success: false, message: 'Source (from) and Destination (to) are required parameters.' });
    }

    let query = `
      SELECT 
        s.id AS schedule_id,
        s.travel_date,
        TIME_FORMAT(s.departure_time, '%H:%i') AS departure_time,
        TIME_FORMAT(s.arrival_time, '%H:%i') AS arrival_time,
        s.price,
        s.status AS schedule_status,
        b.id AS bus_id,
        b.bus_number,
        b.bus_name,
        b.operator_name,
        b.bus_type,
        b.total_seats,
        b.amenities,
        r.source,
        r.destination,
        r.distance_km,
        COALESCE(ROUND(AVG(rev.rating), 1), 0) AS average_rating,
        COUNT(DISTINCT rev.id) AS review_count,
        COALESCE(booked_seats.booked_count, 0) AS booked_seats_count,
        (b.total_seats - COALESCE(booked_seats.booked_count, 0)) AS available_seats
      FROM schedules s
      JOIN buses b ON s.bus_id = b.id
      JOIN routes r ON s.route_id = r.id
      LEFT JOIN reviews rev ON b.id = rev.bus_id
      LEFT JOIN (
        SELECT bk.schedule_id, COUNT(bp.id) AS booked_count
        FROM bookings bk
        JOIN booking_passengers bp ON bk.id = bp.booking_id
        WHERE bk.booking_status IN ('CONFIRMED', 'COMPLETED')
        GROUP BY bk.schedule_id
      ) booked_seats ON s.id = booked_seats.schedule_id
      WHERE r.source LIKE ? AND r.destination LIKE ? AND s.status = 'ACTIVE' AND b.status = 'ACTIVE'
    `;

    const params = [`%${from.trim()}%`, `%${to.trim()}%`];

    if (date) {
      const searchDate = formatDate(date);
      query += ` AND s.travel_date = ?`;
      params.push(searchDate);
    }

    if (bus_type && bus_type !== 'ALL') {
      query += ` AND b.bus_type = ?`;
      params.push(bus_type);
    }

    if (operator && operator !== 'ALL') {
      query += ` AND b.operator_name LIKE ?`;
      params.push(`%${operator}%`);
    }

    if (min_price) {
      query += ` AND s.price >= ?`;
      params.push(parseFloat(min_price));
    }

    if (max_price) {
      query += ` AND s.price <= ?`;
      params.push(parseFloat(max_price));
    }

    query += ` GROUP BY s.id`;

    // Sorting
    if (sort_by === 'price_low') {
      query += ` ORDER BY s.price ASC`;
    } else if (sort_by === 'price_high') {
      query += ` ORDER BY s.price DESC`;
    } else if (sort_by === 'departure') {
      query += ` ORDER BY s.departure_time ASC`;
    } else if (sort_by === 'rating') {
      query += ` ORDER BY average_rating DESC`;
    } else {
      query += ` ORDER BY s.departure_time ASC`;
    }

    const [schedules] = await pool.query(query, params);

    res.json({
      success: true,
      count: schedules.length,
      searchQuery: { from, to, date },
      schedules
    });
  } catch (error) {
    console.error('Search schedules error:', error);
    res.status(500).json({ success: false, message: 'Failed to search schedules.' });
  }
};

// @desc    Get seats availability layout for a specific schedule
// @route   GET /api/schedules/:id/seats
// @access  Public
const getScheduleSeats = async (req, res) => {
  try {
    const scheduleId = req.params.id;

    // Get schedule details with bus and route
    const [schedules] = await pool.query(`
      SELECT s.*, b.bus_name, b.bus_number, b.bus_type, b.total_seats, b.amenities, b.operator_name, r.source, r.destination
      FROM schedules s
      JOIN buses b ON s.bus_id = b.id
      JOIN routes r ON s.route_id = r.id
      WHERE s.id = ?
    `, [scheduleId]);

    if (schedules.length === 0) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }

    const schedule = schedules[0];

    // Get all seats registered for this bus
    let [allSeats] = await pool.query(
      'SELECT * FROM bus_seats WHERE bus_id = ? ORDER BY id ASC',
      [schedule.bus_id]
    );

    // If bus seats were not generated yet, auto-generate standard seats
    if (allSeats.length === 0) {
      const isSleeper = schedule.bus_type.includes('Sleeper');
      const seatsToInsert = [];
      if (isSleeper) {
        for (let i = 1; i <= Math.ceil(schedule.total_seats / 2); i++) {
          seatsToInsert.push([schedule.bus_id, `L${i}`, 'SLEEPER']);
          if (seatsToInsert.length < schedule.total_seats) {
            seatsToInsert.push([schedule.bus_id, `U${i}`, 'SLEEPER']);
          }
        }
      } else {
        const seatPrefixes = ['A', 'B', 'C', 'D'];
        let count = 0;
        const rows = Math.ceil(schedule.total_seats / 4);
        for (let r = 1; r <= rows; r++) {
          for (let p of seatPrefixes) {
            if (count < schedule.total_seats) {
              seatsToInsert.push([schedule.bus_id, `${p}${r}`, 'SEATER']);
              count++;
            }
          }
        }
      }

      if (seatsToInsert.length > 0) {
        await pool.query('INSERT IGNORE INTO bus_seats (bus_id, seat_number, seat_type) VALUES ?', [seatsToInsert]);
        [allSeats] = await pool.query('SELECT * FROM bus_seats WHERE bus_id = ? ORDER BY id ASC', [schedule.bus_id]);
      }
    }

    // Get already booked seats for this schedule
    const [bookedPassengers] = await pool.query(`
      SELECT bp.seat_number
      FROM booking_passengers bp
      JOIN bookings bk ON bp.booking_id = bk.id
      WHERE bk.schedule_id = ? AND bk.booking_status IN ('CONFIRMED', 'COMPLETED')
    `, [scheduleId]);

    const bookedSeatNumbers = new Set(bookedPassengers.map(p => p.seat_number));

    // Mark seat status: BOOKED or AVAILABLE
    const seatLayout = allSeats.map(seat => ({
      id: seat.id,
      seat_number: seat.seat_number,
      seat_type: seat.seat_type,
      status: bookedSeatNumbers.has(seat.seat_number) ? 'BOOKED' : 'AVAILABLE'
    }));

    res.json({
      success: true,
      schedule,
      seatLayout,
      availableCount: seatLayout.filter(s => s.status === 'AVAILABLE').length,
      bookedCount: bookedSeatNumbers.size
    });
  } catch (error) {
    console.error('Get schedule seats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedule seat layout.' });
  }
};

// @desc    Get all schedules (Admin / General list)
// @route   GET /api/schedules
// @access  Public
const getAllSchedules = async (req, res) => {
  try {
    const [schedules] = await pool.query(`
      SELECT s.*, 
        b.bus_name, b.bus_number, b.operator_name, b.bus_type, b.total_seats,
        r.source, r.destination, r.distance_km
      FROM schedules s
      JOIN buses b ON s.bus_id = b.id
      JOIN routes r ON s.route_id = r.id
      ORDER BY s.travel_date DESC, s.departure_time ASC
    `);

    res.json({ success: true, count: schedules.length, schedules });
  } catch (error) {
    console.error('Get all schedules error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedules.' });
  }
};

// @desc    Get schedule by ID
// @route   GET /api/schedules/:id
// @access  Public
const getScheduleById = async (req, res) => {
  try {
    const [schedules] = await pool.query(`
      SELECT s.*, 
        b.bus_name, b.bus_number, b.operator_name, b.bus_type, b.total_seats, b.amenities,
        r.source, r.destination, r.distance_km
      FROM schedules s
      JOIN buses b ON s.bus_id = b.id
      JOIN routes r ON s.route_id = r.id
      WHERE s.id = ?
    `, [req.params.id]);

    if (schedules.length === 0) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }

    res.json({ success: true, schedule: schedules[0] });
  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch schedule.' });
  }
};

// @desc    Create new schedule
// @route   POST /api/schedules
// @access  Private/Admin
const createSchedule = async (req, res) => {
  try {
    const { bus_id, route_id, travel_date, departure_time, arrival_time, price, status } = req.body;

    if (!bus_id || !route_id || !travel_date || !departure_time || !arrival_time || !price) {
      return res.status(400).json({ success: false, message: 'Please provide all required schedule details.' });
    }

    const [result] = await pool.query(
      `INSERT INTO schedules (bus_id, route_id, travel_date, departure_time, arrival_time, price, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [bus_id, route_id, formatDate(travel_date), departure_time, arrival_time, parseFloat(price), status || 'ACTIVE']
    );

    res.status(201).json({
      success: true,
      message: 'Schedule created successfully!',
      scheduleId: result.insertId
    });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to create schedule.' });
  }
};

// @desc    Update schedule
// @route   PUT /api/schedules/:id
// @access  Private/Admin
const updateSchedule = async (req, res) => {
  try {
    const scheduleId = req.params.id;
    const { bus_id, route_id, travel_date, departure_time, arrival_time, price, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM schedules WHERE id = ?', [scheduleId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }

    await pool.query(
      `UPDATE schedules 
       SET bus_id = ?, route_id = ?, travel_date = ?, departure_time = ?, arrival_time = ?, price = ?, status = ?
       WHERE id = ?`,
      [
        bus_id || existing[0].bus_id,
        route_id || existing[0].route_id,
        travel_date ? formatDate(travel_date) : existing[0].travel_date,
        departure_time || existing[0].departure_time,
        arrival_time || existing[0].arrival_time,
        price ? parseFloat(price) : existing[0].price,
        status || existing[0].status,
        scheduleId
      ]
    );

    res.json({ success: true, message: 'Schedule updated successfully!' });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ success: false, message: 'Failed to update schedule.' });
  }
};

// @desc    Delete schedule
// @route   DELETE /api/schedules/:id
// @access  Private/Admin
const deleteSchedule = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM schedules WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Schedule not found.' });
    }

    res.json({ success: true, message: 'Schedule deleted successfully!' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ success: false, message: 'Cannot delete schedule with active user bookings.' });
  }
};

module.exports = {
  searchSchedules,
  getScheduleSeats,
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
};
