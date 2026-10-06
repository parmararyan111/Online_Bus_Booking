const express = require('express');
const router = express.Router();
const {
  searchSchedules,
  getScheduleSeats,
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateSchedule,
  deleteSchedule
} = require('../controllers/scheduleController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

// Note: /search route is mounted under /api/search in app.js, but also accessible here if called
router.get('/', getAllSchedules);
router.get('/:id', getScheduleById);
router.get('/:id/seats', getScheduleSeats);
router.post('/', protect, adminOnly, createSchedule);
router.put('/:id', protect, adminOnly, updateSchedule);
router.delete('/:id', protect, adminOnly, deleteSchedule);

module.exports = router;
