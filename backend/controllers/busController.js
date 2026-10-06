const pool = require('../config/db');

// Helper function to auto-generate seat layout for a bus
const generateBusSeats = async (busId, totalSeats, busType) => {
  const isSleeper = busType.includes('Sleeper');
  const seats = [];

  if (isSleeper) {
    const seatsPerDeck = Math.ceil(totalSeats / 2);
    for (let i = 1; i <= seatsPerDeck; i++) {
      seats.push([busId, `L${i}`, 'SLEEPER']);
      if (seats.length < totalSeats) {
        seats.push([busId, `U${i}`, 'SLEEPER']);
      }
    }
  } else {
    const rows = Math.ceil(totalSeats / 4);
    const seatPrefixes = ['A', 'B', 'C', 'D'];
    let count = 0;
    for (let r = 1; r <= rows; r++) {
      for (let p of seatPrefixes) {
        if (count < totalSeats) {
          seats.push([busId, `${p}${r}`, 'SEATER']);
          count++;
        }
      }
    }
  }

  if (seats.length > 0) {
    await pool.query(
      'INSERT IGNORE INTO bus_seats (bus_id, seat_number, seat_type) VALUES ?',
      [seats]
    );
  }
};

// @desc    Get all buses
// @route   GET /api/buses
// @access  Public
const getAllBuses = async (req, res) => {
  try {
    const [buses] = await pool.query(`
      SELECT b.*, 
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
        COUNT(r.id) AS total_reviews
      FROM buses b
      LEFT JOIN reviews r ON b.id = r.bus_id
      GROUP BY b.id
      ORDER BY b.id DESC
    `);
    res.json({ success: true, count: buses.length, buses });
  } catch (error) {
    console.error('Get buses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch buses.' });
  }
};

// @desc    Get single bus details
// @route   GET /api/buses/:id
// @access  Public
const getBusById = async (req, res) => {
  try {
    const busId = req.params.id;
    const [buses] = await pool.query(`
      SELECT b.*, 
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS average_rating,
        COUNT(r.id) AS total_reviews
      FROM buses b
      LEFT JOIN reviews r ON b.id = r.bus_id
      WHERE b.id = ?
      GROUP BY b.id
    `, [busId]);

    if (buses.length === 0) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }

    const [seats] = await pool.query('SELECT * FROM bus_seats WHERE bus_id = ? ORDER BY id ASC', [busId]);

    res.json({
      success: true,
      bus: buses[0],
      seats
    });
  } catch (error) {
    console.error('Get bus error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bus details.' });
  }
};

// @desc    Create a new bus
// @route   POST /api/buses
// @access  Private/Admin
const createBus = async (req, res) => {
  try {
    const { bus_number, bus_name, operator_name, bus_type, total_seats, amenities, status } = req.body;

    if (!bus_number || !bus_name || !operator_name || !bus_type) {
      return res.status(400).json({ success: false, message: 'Please provide all required bus fields.' });
    }

    const seatsCount = parseInt(total_seats) || 30;

    const [result] = await pool.query(
      `INSERT INTO buses (bus_number, bus_name, operator_name, bus_type, total_seats, amenities, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [bus_number, bus_name, operator_name, bus_type, seatsCount, amenities || '', status || 'ACTIVE']
    );

    const newBusId = result.insertId;

    // Generate seats for bus
    await generateBusSeats(newBusId, seatsCount, bus_type);

    res.status(201).json({
      success: true,
      message: 'Bus created successfully with seat layout!',
      busId: newBusId
    });
  } catch (error) {
    console.error('Create bus error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'A bus with this bus number already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to create bus.' });
  }
};

// @desc    Update bus
// @route   PUT /api/buses/:id
// @access  Private/Admin
const updateBus = async (req, res) => {
  try {
    const busId = req.params.id;
    const { bus_number, bus_name, operator_name, bus_type, total_seats, amenities, status } = req.body;

    const [existing] = await pool.query('SELECT * FROM buses WHERE id = ?', [busId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }

    const seatsCount = parseInt(total_seats) || existing[0].total_seats;

    await pool.query(
      `UPDATE buses 
       SET bus_number = ?, bus_name = ?, operator_name = ?, bus_type = ?, total_seats = ?, amenities = ?, status = ?
       WHERE id = ?`,
      [
        bus_number || existing[0].bus_number,
        bus_name || existing[0].bus_name,
        operator_name || existing[0].operator_name,
        bus_type || existing[0].bus_type,
        seatsCount,
        amenities !== undefined ? amenities : existing[0].amenities,
        status || existing[0].status,
        busId
      ]
    );

    if (seatsCount !== existing[0].total_seats || bus_type !== existing[0].bus_type) {
      // Regenerate seats if count or type changed
      await pool.query('DELETE FROM bus_seats WHERE bus_id = ?', [busId]);
      await generateBusSeats(busId, seatsCount, bus_type || existing[0].bus_type);
    }

    res.json({ success: true, message: 'Bus updated successfully!' });
  } catch (error) {
    console.error('Update bus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update bus.' });
  }
};

// @desc    Delete bus
// @route   DELETE /api/buses/:id
// @access  Private/Admin
const deleteBus = async (req, res) => {
  try {
    const busId = req.params.id;

    const [result] = await pool.query('DELETE FROM buses WHERE id = ?', [busId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Bus not found.' });
    }

    res.json({ success: true, message: 'Bus deleted successfully!' });
  } catch (error) {
    console.error('Delete bus error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete bus. Bus may have active schedules/bookings.' });
  }
};

module.exports = {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus
};
