const pool = require('../models/db');

const getStats = async (req, res) => {
  try {
    const [patients, doctors, appointments, queue] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'patient'"),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'doctor' AND is_active = true"),
      pool.query('SELECT COUNT(*) FROM appointments WHERE DATE(created_at) = CURRENT_DATE'),
      pool.query("SELECT COUNT(*) FROM queue_entries WHERE status = 'waiting' AND DATE(joined_at) = CURRENT_DATE")
    ]);
    res.json({ success: true, stats: {
      totalPatients: parseInt(patients.rows[0].count),
      activeDoctors: parseInt(doctors.rows[0].count),
      todayAppointments: parseInt(appointments.rows[0].count),
      currentQueueSize: parseInt(queue.rows[0].count)
    }});
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 100');
    res.json({ success: true, users: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getStats, getAllUsers };