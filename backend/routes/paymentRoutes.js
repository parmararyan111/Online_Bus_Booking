const express = require('express');
const router = express.Router();
const {
  processPayment,
  getPaymentById
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, processPayment);
router.get('/:id', protect, getPaymentById);

module.exports = router;
