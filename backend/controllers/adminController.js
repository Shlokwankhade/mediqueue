const pool = require('../models/db');

const getStats = async (req, res) => {
  try {
    const [patients, doctors, appointments, queue, revenue, speciality, volume, payments] = await Promise.all([
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'patient'"),
      pool.query("SELECT COUNT(*) FROM doctors WHERE is_available = true"),
      pool.query("SELECT COUNT(*) FROM appointments WHERE DATE(appointment_time) = CURRENT_DATE"),
      pool.query("SELECT COUNT(*) FROM queue_entries WHERE status = 'waiting' AND DATE(joined_at) = CURRENT_DATE"),
      pool.query("SELECT COALESCE(SUM(amount),0) as total FROM payments WHERE status = 'paid'"),
      pool.query(`SELECT u.name as speciality, COUNT(*) as count 
                  FROM appointments a 
                  JOIN doctors d ON d.id = a.doctor_id 
                  JOIN users u ON u.id = d.user_id
                  GROUP BY u.name 
                  ORDER BY count DESC LIMIT 6`),
      pool.query(`SELECT TO_CHAR(appointment_time, 'Dy') as day, COUNT(*) as count 
                  FROM appointments 
                  WHERE appointment_time >= NOW() - INTERVAL '7 days'
                  GROUP BY TO_CHAR(appointment_time, 'Dy'), DATE(appointment_time)
                  ORDER BY DATE(appointment_time)`),
      pool.query(`SELECT TO_CHAR(paid_at, 'Mon') as month, SUM(amount) as total 
                  FROM payments 
                  WHERE status = 'paid' AND paid_at >= NOW() - INTERVAL '12 months'
                  GROUP BY TO_CHAR(paid_at, 'Mon'), DATE_TRUNC('month', paid_at)
                  ORDER BY DATE_TRUNC('month', paid_at)`)
    ]);

    res.json({ 
      success: true, 
      totalPatients: parseInt(patients.rows[0].count),
      activeDoctors: parseInt(doctors.rows[0].count),
      todayAppointments: parseInt(appointments.rows[0].count),
      currentQueueSize: parseInt(queue.rows[0].count),
      totalRevenue: parseFloat(revenue.rows[0].total),
      specialityData: speciality.rows,
      volumeData: volume.rows,
      revenueData: payments.rows
    });
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
