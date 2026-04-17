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


const createProfile = async (req, res) => {
  try {
    const { speciality, experience_years, consultation_fee, bio, room_number, qualification } = req.body;
    const user_id = req.user.id;

    // Check if doctor profile already exists
    const existing = await pool.query('SELECT id FROM doctors WHERE user_id = $1', [user_id]);
    if (existing.rows.length > 0) {
      // Update existing
      const result = await pool.query(
        'UPDATE doctors SET speciality=$1, experience_years=$2, consultation_fee=$3, bio=$4, room_number=$5, updated_at=NOW() WHERE user_id=$6 RETURNING *',
        [speciality, experience_years||0, consultation_fee||500, bio||'', room_number||'', user_id]
      );
      return res.json({ success: true, doctor: result.rows[0] });
    }

    // Create new doctor profile
    const result = await pool.query(
      'INSERT INTO doctors (user_id, speciality, experience_years, consultation_fee, bio, room_number, is_available) VALUES ($1,$2,$3,$4,$5,$6,true) RETURNING *',
      [user_id, speciality||'General', experience_years||0, consultation_fee||500, bio||'', room_number||'']
    );

    // Update user role to doctor
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['doctor', user_id]);

    res.status(201).json({ success: true, doctor: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getDoctors, getDoctorById, getAvailability, createProfile };