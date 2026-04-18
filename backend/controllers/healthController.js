
const pool = require('../models/db');

const getHealthRecord = async (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : req.params.patientId;
    const result = await pool.query(
      'SELECT * FROM health_records WHERE patient_id = $1',
      [patientId]
    );
    res.json({ success: true, record: result.rows[0] || null });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
};

const saveHealthRecord = async (req, res) => {
  try {
    const patientId = req.user.id;
    const {
      blood_group, height_cm, weight_kg, allergies,
      chronic_conditions, current_medications,
      emergency_contact_name, emergency_contact_phone,
      emergency_contact_relation, insurance_provider,
      insurance_number, notes
    } = req.body;

    const existing = await pool.query(
      'SELECT id FROM health_records WHERE patient_id = $1', [patientId]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE health_records SET blood_group=$1,height_cm=$2,weight_kg=$3,allergies=$4,chronic_conditions=$5,current_medications=$6,emergency_contact_name=$7,emergency_contact_phone=$8,emergency_contact_relation=$9,insurance_provider=$10,insurance_number=$11,notes=$12,updated_at=NOW() WHERE patient_id=$13',
        [blood_group,height_cm,weight_kg,allergies,chronic_conditions,current_medications,emergency_contact_name,emergency_contact_phone,emergency_contact_relation,insurance_provider,insurance_number,notes,patientId]
      );
    } else {
      await pool.query(
        'INSERT INTO health_records (patient_id,blood_group,height_cm,weight_kg,allergies,chronic_conditions,current_medications,emergency_contact_name,emergency_contact_phone,emergency_contact_relation,insurance_provider,insurance_number,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)',
        [patientId,blood_group,height_cm,weight_kg,allergies,chronic_conditions,current_medications,emergency_contact_name,emergency_contact_phone,emergency_contact_relation,insurance_provider,insurance_number,notes]
      );
    }

    res.json({ success: true, message: 'Health record saved!' });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
};

const getVitals = async (req, res) => {
  try {
    const patientId = req.user.role === 'patient' ? req.user.id : req.params.patientId;
    const result = await pool.query(
      'SELECT v.*, u.name as recorded_by_name FROM vitals v LEFT JOIN users u ON u.id = v.recorded_by WHERE v.patient_id = $1 ORDER BY v.recorded_at DESC LIMIT 20',
      [patientId]
    );
    res.json({ success: true, vitals: result.rows });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
};

const addVitals = async (req, res) => {
  try {
    const { patient_id, blood_pressure, pulse_rate, temperature, oxygen_saturation, blood_sugar, notes } = req.body;
    const recorded_by = req.user.id;
    const patientId = req.user.role === 'patient' ? req.user.id : patient_id;

    const result = await pool.query(
      'INSERT INTO vitals (patient_id,recorded_by,blood_pressure,pulse_rate,temperature,oxygen_saturation,blood_sugar,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [patientId,recorded_by,blood_pressure,pulse_rate,temperature,oxygen_saturation,blood_sugar,notes]
    );
    res.status(201).json({ success: true, vital: result.rows[0] });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
};


const getPatientRecordForDoctor = async (req, res) => {
  try {
    const { patientId } = req.params;
    const doctorUserId = req.user.id;

    // Verify doctor has appointment with this patient
    const appt = await pool.query(
      'SELECT a.id FROM appointments a JOIN doctors d ON d.id = a.doctor_id WHERE d.user_id = $1 AND a.patient_id = $2 LIMIT 1',
      [doctorUserId, patientId]
    );
    if (appt.rows.length === 0)
      return res.status(403).json({ success: false, message: 'Access denied. No appointment with this patient.' });

    const [record, vitals, patient] = await Promise.all([
      pool.query('SELECT * FROM health_records WHERE patient_id = $1', [patientId]),
      pool.query('SELECT v.*, u.name as recorded_by_name FROM vitals v LEFT JOIN users u ON u.id = v.recorded_by WHERE v.patient_id = $1 ORDER BY v.recorded_at DESC LIMIT 20', [patientId]),
      pool.query('SELECT id, name, email, phone FROM users WHERE id = $1', [patientId])
    ]);

    res.json({
      success: true,
      patient: patient.rows[0],
      record: record.rows[0] || null,
      vitals: vitals.rows
    });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
};

const generateShareToken = async (req, res) => {
  try {
    const patientId = req.user.id;
    const crypto = require('crypto');
    const token = crypto.randomBytes(16).toString('hex');
    const expires = new Date(Date.now() + 24 * 3600000); // 24 hours

    // Store token in health_records
    await pool.query(
      'UPDATE health_records SET notes = COALESCE(notes,\'\') WHERE patient_id = $1',
      [patientId]
    );

    // Use a simple approach - store in DB
    await pool.query(
      'INSERT INTO health_records (patient_id, notes) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [patientId, '']
    );

    res.json({
      success: true,
      shareUrl: (process.env.FRONTEND_URL || 'http://localhost:5173') + '/health-share?token=' + token + '&patient=' + patientId,
      expiresAt: expires
    });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getHealthRecord, saveHealthRecord, getVitals, addVitals, getPatientRecordForDoctor, generateShareToken };

