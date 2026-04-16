const pool = require('../models/db');

const getAppointments = async (req, res) => {
  try {
    const { role, id } = req.user;
    let result;
    if (role === 'patient') {
      result = await pool.query(
        'SELECT a.*, u.name as doctor_name, d.speciality, d.room_number FROM appointments a JOIN doctors d ON d.id = a.doctor_id JOIN users u ON u.id = d.user_id WHERE a.patient_id = $1 ORDER BY a.appointment_time DESC',
        [id]
      );
    } else if (role === 'doctor') {
      result = await pool.query(
        'SELECT a.*, u.name as patient_name, u.phone FROM appointments a JOIN users u ON u.id = a.patient_id JOIN doctors d ON d.id = a.doctor_id WHERE d.user_id = $1 ORDER BY a.appointment_time ASC',
        [id]
      );
    } else {
      result = await pool.query(
        'SELECT a.*, pu.name as patient_name, du.name as doctor_name FROM appointments a JOIN users pu ON pu.id = a.patient_id JOIN doctors d ON d.id = a.doctor_id JOIN users du ON du.id = d.user_id ORDER BY a.appointment_time DESC LIMIT 100'
      );
    }
    res.json({ success: true, appointments: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const bookAppointment = async (req, res) => {
  try {
    const { doctor_id, appointment_time, type = 'in_person', chief_complaint } = req.body;
    const patient_id = req.user.id;
    if (!doctor_id || !appointment_time)
      return res.status(400).json({ success: false, message: 'Doctor and time required' });
    const result = await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, appointment_time, type, chief_complaint, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [patient_id, doctor_id, appointment_time, type, chief_complaint, 'confirmed']
    );
    res.status(201).json({ success: true, appointment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const cancelAppointment = async (req, res) => {
  try {
    const result = await pool.query(
      'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 AND patient_id = $3 RETURNING *',
      ['cancelled', req.params.id, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    res.json({ success: true, appointment: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getAppointments, bookAppointment, cancelAppointment };