const express = require('express');
const router = express.Router();
const { createProfile, getDoctors, getDoctorById, getAvailability } = require('../controllers/doctorController');
const { protect } = require('../middleware/auth');

router.get('/', protect, getDoctors);
router.get('/:id', protect, getDoctorById);
router.get('/:id/availability', protect, getAvailability);
router.post('/profile', protect, createProfile);

module.exports = router;
