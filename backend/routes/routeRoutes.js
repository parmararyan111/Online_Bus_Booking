const express = require('express');
const router = express.Router();
const {
  getAllRoutes,
  getRouteById,
  createRoute,
  updateRoute,
  deleteRoute
} = require('../controllers/routeController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/', getAllRoutes);
router.get('/:id', getRouteById);
router.post('/', protect, adminOnly, createRoute);
router.put('/:id', protect, adminOnly, updateRoute);
router.delete('/:id', protect, adminOnly, deleteRoute);

module.exports = router;
