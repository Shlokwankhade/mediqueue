
const express = require('express');
const router = express.Router();
const { createPrescription, getPrescriptions } = require('../controllers/prescriptionController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.post('/', createPrescription);
router.get('/', getPrescriptions);
module.exports = router;
