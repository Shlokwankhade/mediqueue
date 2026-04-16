const express = require('express');
const router = express.Router();
const { joinQueue, getQueueStatus, callNext } = require('../controllers/queueController');
const { protect, authorize } = require('../middleware/auth');

router.post('/join', protect, joinQueue);
router.get('/:doctorId/status', protect, getQueueStatus);
router.post('/:doctorId/next', protect, authorize('doctor'), callNext);

module.exports = router;
