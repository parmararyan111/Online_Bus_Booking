const express = require('express');
const router = express.Router();
const {
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus
} = require('../controllers/busController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

router.get('/', getAllBuses);
router.get('/:id', getBusById);
router.post('/', protect, adminOnly, createBus);
router.put('/:id', protect, adminOnly, updateBus);
router.delete('/:id', protect, adminOnly, deleteBus);

module.exports = router;
