const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment, getPayments } = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');
router.use(protect);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/', getPayments);
module.exports = router;