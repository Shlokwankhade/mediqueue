const express = require('express');
const router = express.Router();
const { getDoctors, getDoctorById, getAvailability } = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDoctors);
router.get('/:id', protect, getDoctorById);
router.get('/:id/availability', protect, getAvailability);

module.exports = router;
