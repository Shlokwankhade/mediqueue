
const express = require('express');
const router = express.Router();
const { getReviews, addReview, getMyReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/doctor/:doctorId', getReviews);
router.get('/my', getMyReviews);
router.post('/', addReview);
router.delete('/:id', deleteReview);

module.exports = router;
