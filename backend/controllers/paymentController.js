const Razorpay = require('razorpay');
const crypto = require('crypto');
const pool = require('../models/db');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});
const createOrder = async (req, res) => {
  try {
    const { appointment_id, amount } = req.body;
    if (!appointment_id || !amount)
      return res.status(400).json({ success: false, message: 'Appointment ID and amount required' });
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      receipt: 'mq_' + appointment_id.slice(0,8),
      notes: { appointment_id, patient_id: req.user.id }
    });
    await pool.query(
      'INSERT INTO payments (appointment_id, patient_id, amount, status, razorpay_order_id) VALUES ($1,$2,$3,$4,$5)',
      [appointment_id, req.user.id, amount, 'pending', order.id]
    );
    res.json({ success: true, order, key_id: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    if (expectedSignature !== razorpay_signature)
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    await pool.query(
      'UPDATE payments SET status = $1, transaction_id = $2, paid_at = NOW() WHERE razorpay_order_id = $3',
      ['paid', razorpay_payment_id, razorpay_order_id]
    );
    res.json({ success: true, message: 'Payment verified successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const getPayments = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT p.*, a.appointment_time FROM payments p JOIN appointments a ON a.id = p.appointment_id WHERE p.patient_id = $1 ORDER BY p.created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, payments: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
module.exports = { createOrder, verifyPayment, getPayments };