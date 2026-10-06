const express = require('express');
const router = express.Router();
const {
  createReview,
  getBusReviews
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createReview);
router.get('/bus/:id', getBusReviews);

module.exports = router;
