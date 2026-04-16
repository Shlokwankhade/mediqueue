const pool = require('../models/db');

const getDoctors = async (req, res) => {
  try {
    const result = await pool.query('SELECT d.*, u.name, u.email, u.phone FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.is_active = true ORDER BY d.rating DESC');
    res.json({ success: true, doctors: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const result = await pool.query('SELECT d.*, u.name, u.email, u.phone FROM doctors d JOIN users u ON u.id = d.user_id WHERE d.id = $1', [req.params.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    res.json({ success: true, doctor: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    const booked = await pool.query(
      "SELECT appointment_time FROM appointments WHERE doctor_id = $1 AND DATE(appointment_time) = $2 AND status NOT IN ('cancelled')",
      [id, date]
    );
    const bookedTimes = booked.rows.map(r => new Date(r.appointment_time).toTimeString().slice(0, 5));
    const slots = [];
    for (let h = 9; h < 17; h++) {
      for (let m = 0; m < 60; m += 15) {
        const time = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');
        slots.push({ time, available: !bookedTimes.includes(time) });
      }
    }
    res.json({ success: true, date, slots });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDoctors, getDoctorById, getAvailability };