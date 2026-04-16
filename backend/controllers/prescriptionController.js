const pool = require('../models/db');
const getPrescriptions = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT p.*, u.name as doctor_name FROM prescriptions p JOIN users u ON u.id = p.doctor_id WHERE p.patient_id = $1 ORDER BY p.issued_at DESC',
      [req.user.id]
    );
    res.json({ success: true, prescriptions: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
module.exports = { getPrescriptions };