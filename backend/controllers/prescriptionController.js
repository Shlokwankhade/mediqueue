
const pool = require('../models/db');
const { sendEmail } = require('../utils/email');

const createPrescription = async (req, res) => {
  try {
    const { appointment_id, patient_id, medicines, notes } = req.body;
    const doctor_id_row = await pool.query('SELECT id FROM doctors WHERE user_id = $1', [req.user.id]);
    if (!doctor_id_row.rows[0]) return res.status(403).json({ success: false, message: 'Not a doctor' });
    const doctor_id = doctor_id_row.rows[0].id;

    const result = await pool.query(
      'INSERT INTO prescriptions (appointment_id, doctor_id, patient_id, medicines, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [appointment_id, doctor_id, patient_id, JSON.stringify(medicines), notes]
    );

    // Send email to patient
    try {
      const patientInfo = await pool.query('SELECT name, email FROM users WHERE id = $1', [patient_id]);
      const doctorInfo = await pool.query('SELECT u.name FROM users u JOIN doctors d ON d.user_id = u.id WHERE d.id = $1', [doctor_id]);
      const p = patientInfo.rows[0];
      const dname = doctorInfo.rows[0]?.name || 'Doctor';

      if (p?.email) {
        const medList = medicines.map(m => 
          '<tr><td style="padding:8px 12px;border-bottom:1px solid #E2E8F0">' + m.name + '</td>' +
          '<td style="padding:8px 12px;border-bottom:1px solid #E2E8F0">' + m.dosage + '</td>' +
          '<td style="padding:8px 12px;border-bottom:1px solid #E2E8F0">' + m.frequency + '</td>' +
          '<td style="padding:8px 12px;border-bottom:1px solid #E2E8F0">' + m.duration + '</td></tr>'
        ).join('');

        await sendEmail({
          to: p.email,
          subject: 'Your E-Prescription � MEDIQUEUE',
          html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
            <div style="background:linear-gradient(135deg,#0D9B82,#1DBEA0);padding:32px;text-align:center;border-radius:12px 12px 0 0">
              <h1 style="color:white;margin:0;font-size:26px">MEDIQUEUE</h1>
              <p style="color:rgba(255,255,255,.85);margin:8px 0 0">E-Prescription ??</p>
            </div>
            <div style="background:#f8fafc;padding:32px;border-radius:0 0 12px 12px">
              <p style="font-size:16px">Hello <strong>${p.name}</strong>,</p>
              <p style="color:#64748B">Dr. ${dname} has issued you a prescription.</p>
              <table style="width:100%;border-collapse:collapse;background:white;border-radius:10px;overflow:hidden;margin:20px 0">
                <thead>
                  <tr style="background:#0D9B82;color:white">
                    <th style="padding:10px 12px;text-align:left">Medicine</th>
                    <th style="padding:10px 12px;text-align:left">Dosage</th>
                    <th style="padding:10px 12px;text-align:left">Frequency</th>
                    <th style="padding:10px 12px;text-align:left">Duration</th>
                  </tr>
                </thead>
                <tbody>${medList}</tbody>
              </table>
              ${notes ? '<div style="background:#E6F7F4;border-radius:8px;padding:16px;margin-top:16px"><p style="color:#0A7A67;margin:0"><strong>Doctor Notes:</strong> ' + notes + '</p></div>' : ''}
              <p style="color:#94A3B8;font-size:12px;margin-top:24px;text-align:center">MEDIQUEUE � Smart Healthcare</p>
            </div>
          </div>`
        });
      }
    } catch(emailErr) { console.error('Prescription email failed:', emailErr.message); }

    res.status(201).json({ success: true, prescription: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getPrescriptions = async (req, res) => {
  try {
    const { role, id } = req.user;
    let result;
    if (role === 'patient') {
      result = await pool.query(
        `SELECT p.*, u.name as doctor_name, d.speciality
         FROM prescriptions p
         JOIN doctors d ON d.id = p.doctor_id
         JOIN users u ON u.id = d.user_id
         WHERE p.patient_id = $1
         ORDER BY p.created_at DESC`,
        [id]
      );
    } else if (role === 'doctor') {
      const doc = await pool.query('SELECT id FROM doctors WHERE user_id = $1', [id]);
      result = await pool.query(
        `SELECT p.*, u.name as patient_name
         FROM prescriptions p
         JOIN users u ON u.id = p.patient_id
         WHERE p.doctor_id = $1
         ORDER BY p.created_at DESC`,
        [doc.rows[0]?.id]
      );
    } else {
      result = await pool.query('SELECT p.*, pu.name as patient_name, du.name as doctor_name FROM prescriptions p JOIN users pu ON pu.id = p.patient_id JOIN doctors d ON d.id = p.doctor_id JOIN users du ON du.id = d.user_id ORDER BY p.created_at DESC LIMIT 100');
    }
    res.json({ success: true, prescriptions: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { createPrescription, getPrescriptions };
