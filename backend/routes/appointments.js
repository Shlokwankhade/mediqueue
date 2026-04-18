const express = require('express');
const router = express.Router();
const { getAppointments, bookAppointment, cancelAppointment } = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { validateAppointment } = require('../middleware/validate');

router.use(protect);
router.get('/', getAppointments);
router.post('/', bookAppointment);
router.patch('/:id/cancel', cancelAppointment);

module.exports = router;
