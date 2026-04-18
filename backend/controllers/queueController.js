const { predictWaitTime, predictQueueWaitTimes } = require('../utils/aiPredictor');
const pool = require('../models/db');

const generateQueueToken = async (doctorId) => {
  const count = await pool.query('SELECT COUNT(*) FROM queue_entries WHERE doctor_id = $1 AND DATE(joined_at) = CURRENT_DATE', [doctorId]);
  const num = parseInt(count.rows[0].count) + 1;
  return 'MQ-' + String(num).padStart(4, '0');
};

const joinQueue = async (req, res) => {
  try {
    const { appointment_id } = req.body;
    const patient_id = req.user.id;
    const appt = await pool.query('SELECT * FROM appointments WHERE id = $1 AND patient_id = $2', [appointment_id, patient_id]);
    if (appt.rows.length === 0)
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    const doctor_id = appt.rows[0].doctor_id;
    const posResult = await pool.query(
      "SELECT COUNT(*) FROM queue_entries WHERE doctor_id = $1 AND DATE(joined_at) = CURRENT_DATE AND status IN ('waiting','called','in_progress')",
      [doctor_id]
    );
    const position = parseInt(posResult.rows[0].count) + 1;
    const token_number = await generateQueueToken(doctor_id);
    const result = await pool.query(
      'INSERT INTO queue_entries (appointment_id, doctor_id, patient_id, token_number, position, estimated_wait_minutes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [appointment_id, doctor_id, patient_id, token_number, position, position * 8]
    );
    res.status(201).json({ success: true, queueEntry: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getQueueStatus = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const result = await pool.query(
      'SELECT q.*, u.name as patient_name FROM queue_entries q JOIN users u ON u.id = q.patient_id WHERE q.doctor_id = $1 AND DATE(q.joined_at) = CURRENT_DATE ORDER BY q.position ASC',
      [doctorId]
    );
    const current = result.rows.find(r => r.status === 'in_progress') || null;
    const waiting = result.rows.filter(r => r.status === 'waiting');
    res.json({ success: true, queue: result.rows, current, waitingCount: waiting.length, completedCount: result.rows.filter(r => r.status === 'completed').length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const callNext = async (req, res) => {
  try {
    const { doctorId } = req.params;
    await pool.query("UPDATE queue_entries SET status = 'completed', completed_at = NOW() WHERE doctor_id = $1 AND status = 'in_progress'", [doctorId]);
    const next = await pool.query(
      "UPDATE queue_entries SET status = 'in_progress', called_at = NOW() WHERE id = (SELECT id FROM queue_entries WHERE doctor_id = $1 AND status = 'waiting' ORDER BY position ASC LIMIT 1) RETURNING *",
      [doctorId]
    );
    res.json({ success: true, next: next.rows[0] || null });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { joinQueue, getQueueStatus, callNext };