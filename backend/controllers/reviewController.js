
const pool = require('../models/db');

const getReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const result = await pool.query(`
      SELECT r.*, 
        CASE WHEN r.is_anonymous THEN 'Anonymous Patient' ELSE u.name END as patient_name
      FROM reviews r
      JOIN users u ON u.id = r.patient_id
      WHERE r.doctor_id = $1
      ORDER BY r.created_at DESC
    `, [doctorId]);

    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total,
        ROUND(AVG(rating)::numeric,1) as avg_rating,
        COUNT(CASE WHEN rating=5 THEN 1 END) as five_star,
        COUNT(CASE WHEN rating=4 THEN 1 END) as four_star,
        COUNT(CASE WHEN rating=3 THEN 1 END) as three_star,
        COUNT(CASE WHEN rating=2 THEN 1 END) as two_star,
        COUNT(CASE WHEN rating=1 THEN 1 END) as one_star
      FROM reviews WHERE doctor_id = $1
    `, [doctorId]);

    res.json({ success: true, reviews: result.rows, stats: stats.rows[0] });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
};

const addReview = async (req, res) => {
  try {
    const { doctor_id, appointment_id, rating, review_text, is_anonymous } = req.body;
    const patient_id = req.user.id;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ success: false, message: 'Rating must be 1-5' });

    // Check patient had appointment with this doctor
    const appt = await pool.query(
      'SELECT id FROM appointments WHERE patient_id=$1 AND doctor_id=$2 AND status=$3 LIMIT 1',
      [patient_id, doctor_id, 'completed']
    );
    if (appt.rows.length === 0)
      return res.status(403).json({ success: false, message: 'You can only review doctors after a completed appointment' });

    // Upsert review
    const result = await pool.query(`
      INSERT INTO reviews (patient_id, doctor_id, appointment_id, rating, review_text, is_anonymous)
      VALUES ($1,$2,$3,$4,$5,$6)
      ON CONFLICT (patient_id, doctor_id) 
      DO UPDATE SET rating=$4, review_text=$5, is_anonymous=$6, created_at=NOW()
      RETURNING *
    `, [patient_id, doctor_id, appointment_id||null, rating, review_text||'', is_anonymous||false]);

    res.status(201).json({ success: true, review: result.rows[0] });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
};

const getMyReviews = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, d.speciality, u.name as doctor_name
      FROM reviews r
      JOIN doctors d ON d.id = r.doctor_id
      JOIN users u ON u.id = d.user_id
      WHERE r.patient_id = $1
      ORDER BY r.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, reviews: result.rows });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
};

const deleteReview = async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM reviews WHERE id=$1 AND patient_id=$2',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Review deleted' });
  } catch(err) { res.status(500).json({ success: false, message: err.message }); }
};

module.exports = { getReviews, addReview, getMyReviews, deleteReview };
