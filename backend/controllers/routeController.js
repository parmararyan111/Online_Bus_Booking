const pool = require('../config/db');

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
const getAllRoutes = async (req, res) => {
  try {
    const [routes] = await pool.query('SELECT * FROM routes ORDER BY source ASC, destination ASC');
    res.json({ success: true, count: routes.length, routes });
  } catch (error) {
    console.error('Get routes error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch routes.' });
  }
};

// @desc    Get route by ID
// @route   GET /api/routes/:id
// @access  Public
const getRouteById = async (req, res) => {
  try {
    const [routes] = await pool.query('SELECT * FROM routes WHERE id = ?', [req.params.id]);
    if (routes.length === 0) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }
    res.json({ success: true, route: routes[0] });
  } catch (error) {
    console.error('Get route error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch route.' });
  }
};

// @desc    Create new route
// @route   POST /api/routes
// @access  Private/Admin
const createRoute = async (req, res) => {
  try {
    const { source, destination, distance_km } = req.body;

    if (!source || !destination || !distance_km) {
      return res.status(400).json({ success: false, message: 'Please provide source, destination, and distance.' });
    }

    if (source.trim().toLowerCase() === destination.trim().toLowerCase()) {
      return res.status(400).json({ success: false, message: 'Source and destination cannot be identical.' });
    }

    const [result] = await pool.query(
      'INSERT INTO routes (source, destination, distance_km) VALUES (?, ?, ?)',
      [source.trim(), destination.trim(), parseInt(distance_km)]
    );

    res.status(201).json({
      success: true,
      message: 'Route created successfully!',
      routeId: result.insertId
    });
  } catch (error) {
    console.error('Create route error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ success: false, message: 'This route (Source → Destination) already exists.' });
    }
    res.status(500).json({ success: false, message: 'Failed to create route.' });
  }
};

// @desc    Update route
// @route   PUT /api/routes/:id
// @access  Private/Admin
const updateRoute = async (req, res) => {
  try {
    const routeId = req.params.id;
    const { source, destination, distance_km } = req.body;

    const [existing] = await pool.query('SELECT * FROM routes WHERE id = ?', [routeId]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }

    const newSource = source ? source.trim() : existing[0].source;
    const newDest = destination ? destination.trim() : existing[0].destination;

    if (newSource.toLowerCase() === newDest.toLowerCase()) {
      return res.status(400).json({ success: false, message: 'Source and destination cannot be identical.' });
    }

    await pool.query(
      'UPDATE routes SET source = ?, destination = ?, distance_km = ? WHERE id = ?',
      [newSource, newDest, parseInt(distance_km) || existing[0].distance_km, routeId]
    );

    res.json({ success: true, message: 'Route updated successfully!' });
  } catch (error) {
    console.error('Update route error:', error);
    res.status(500).json({ success: false, message: 'Failed to update route.' });
  }
};

// @desc    Delete route
// @route   DELETE /api/routes/:id
// @access  Private/Admin
const deleteRoute = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM routes WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }
    res.json({ success: true, message: 'Route deleted successfully!' });
  } catch (error) {
    console.error('Delete route error:', error);
    res.status(500).json({ success: false, message: 'Cannot delete route attached to active schedules or bookings.' });
  }
};

module.exports = {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
};
