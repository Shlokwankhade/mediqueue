
const express = require('express');
const router = express.Router();
const { getHealthRecord, saveHealthRecord, getVitals, addVitals, getPatientRecordForDoctor, generateShareToken } = require('../controllers/healthController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/record', getHealthRecord);
router.post('/record', saveHealthRecord);
router.get('/vitals', getVitals);
router.post('/vitals', addVitals);
router.get('/patient/:patientId', getPatientRecordForDoctor);
router.get('/vitals/:patientId', getVitals);
router.post('/share', generateShareToken);

module.exports = router;
