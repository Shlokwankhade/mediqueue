const fs = require('fs');

// ── models/db.js
fs.writeFileSync('models/db.js', [
  "const { Pool } = require('pg');",
  "require('dotenv').config();",
  "const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false });",
  "pool.connect((err, client, release) => { if (err) { console.error('DB Error:', err.message); } else { console.log('PostgreSQL connected successfully'); release(); } });",
  "module.exports = pool;"
].join('\n'));

// ── utils/jwt.js
fs.writeFileSync('utils/jwt.js', [
  "const jwt = require('jsonwebtoken');",
  "const generateToken = (userId) => jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });",
  "const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET);",
  "module.exports = { generateToken, verifyToken };"
].join('\n'));

// ── utils/email.js
fs.writeFileSync('utils/email.js', [
  "module.exports = { sendEmail: async (opts) => console.log('Email stub:', opts.subject) };"
].join('\n'));

// ── utils/aiPredictor.js
fs.writeFileSync('utils/aiPredictor.js', [
  "const predictWaitTime = (position, avgMinutes = 8) => position * avgMinutes;",
  "module.exports = { predictWaitTime };"
].join('\n'));

// ── middleware/auth.js
fs.writeFileSync('middleware/auth.js', [
  "const jwt = require('jsonwebtoken');",
  "const pool = require('../models/db');",
  "const protect = async (req, res, next) => {",
  "  try {",
  "    const authHeader = req.headers.authorization;",
  "    if (!authHeader || !authHeader.startsWith('Bearer '))",
  "      return res.status(401).json({ success: false, message: 'No token provided' });",
  "    const token = authHeader.split(' ')[1];",
  "    const decoded = jwt.verify(token, process.env.JWT_SECRET);",
  "    const result = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1 AND is_active = true', [decoded.id]);",
  "    if (result.rows.length === 0)",
  "      return res.status(401).json({ success: false, message: 'User not found' });",
  "    req.user = result.rows[0];",
  "    next();",
  "  } catch (err) {",
  "    return res.status(401).json({ success: false, message: 'Invalid or expired token' });",
  "  }",
  "};",
  "const authorize = (...roles) => (req, res, next) => {",
  "  if (!roles.includes(req.user.role))",
  "    return res.status(403).json({ success: false, message: 'Access denied' });",
  "  next();",
  "};",
  "module.exports = { protect, authorize };"
].join('\n'));

// ── middleware/errorHandler.js
fs.writeFileSync('middleware/errorHandler.js', [
  "const errorHandler = (err, req, res, next) => {",
  "  console.error('Error:', err.message);",
  "  if (err.code === '23505')",
  "    return res.status(400).json({ success: false, message: 'Email already registered' });",
  "  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });",
  "};",
  "module.exports = errorHandler;"
].join('\n'));

// ── middleware/validate.js
fs.writeFileSync('middleware/validate.js', [
  "module.exports = (schema) => (req, res, next) => {",
  "  const { error } = schema.validate(req.body);",
  "  if (error) return res.status(400).json({ success: false, message: error.details[0].message });",
  "  next();",
  "};"
].join('\n'));

// ── middleware/rateLimiter.js
fs.writeFileSync('middleware/rateLimiter.js', [
  "const rateLimit = require('express-rate-limit');",
  "module.exports = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { success: false, message: 'Too many requests' } });"
].join('\n'));

// ── sockets/queueSocket.js
fs.writeFileSync('sockets/queueSocket.js', [
  "module.exports = (io) => {",
  "  io.on('connection', (socket) => {",
  "    console.log('Client connected:', socket.id);",
  "    socket.on('join_queue_room', (doctorId) => socket.join('queue_' + doctorId));",
  "    socket.on('call_next_patient', (data) => {",
  "      io.to('queue_' + data.doctorId).emit('queue_updated', { action: 'next_called', currentToken: data.tokenNumber, patientName: data.patientName, timestamp: new Date().toISOString() });",
  "    });",
  "    socket.on('patient_joined', (data) => {",
  "      io.to('queue_' + data.doctorId).emit('queue_updated', { action: 'patient_joined', tokenNumber: data.tokenNumber, position: data.position, timestamp: new Date().toISOString() });",
  "    });",
  "    socket.on('disconnect', () => console.log('Client disconnected:', socket.id));",
  "  });",
  "};"
].join('\n'));

// ── controllers/authController.js
fs.writeFileSync('controllers/authController.js', [
  "const bcrypt = require('bcryptjs');",
  "const pool = require('../models/db');",
  "const { generateToken } = require('../utils/jwt');",
  "",
  "const register = async (req, res) => {",
  "  try {",
  "    const { name, email, phone, password, role = 'patient' } = req.body;",
  "    if (!name || !email || !password)",
  "      return res.status(400).json({ success: false, message: 'Name, email, password required' });",
  "    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);",
  "    if (existing.rows.length > 0)",
  "      return res.status(400).json({ success: false, message: 'Email already registered' });",
  "    const password_hash = await bcrypt.hash(password, 10);",
  "    const result = await pool.query(",
  "      'INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role',",
  "      [name, email, phone, password_hash, role]",
  "    );",
  "    const user = result.rows[0];",
  "    res.status(201).json({ success: true, token: generateToken(user.id), user });",
  "  } catch (err) {",
  "    res.status(500).json({ success: false, message: err.message });",
  "  }",
  "};",
  "",
  "const login = async (req, res) => {",
  "  try {",
  "    const { email, password } = req.body;",
  "    if (!email || !password)",
  "      return res.status(400).json({ success: false, message: 'Email and password required' });",
  "    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);",
  "    if (result.rows.length === 0)",
  "      return res.status(401).json({ success: false, message: 'Invalid credentials' });",
  "    const user = result.rows[0];",
  "    const isMatch = await bcrypt.compare(password, user.password_hash);",
  "    if (!isMatch)",
  "      return res.status(401).json({ success: false, message: 'Invalid credentials' });",
  "    res.json({ success: true, token: generateToken(user.id), user: { id: user.id, name: user.name, email: user.email, role: user.role } });",
  "  } catch (err) {",
  "    res.status(500).json({ success: false, message: err.message });",
  "  }",
  "};",
  "",
  "const getMe = async (req, res) => {",
  "  try {",
  "    const result = await pool.query(",
  "      'SELECT u.id, u.name, u.email, u.phone, u.role, d.id as doctor_id, d.speciality, d.consultation_fee, d.rating FROM users u LEFT JOIN doctors d ON d.user_id = u.id WHERE u.id = $1',",
  "      [req.user.id]",
  "    );",
  "    res.json({ success: true, user: result.rows[0] });",
  "  } catch (err) {",
  "    res.status(500).json({ success: false, message: err.message });",
  "  }",
  "};",
  "",
  "module.exports = { register, login, getMe };"
].join('\n'));

// ── controllers/appointmentController.js
fs.writeFileSync('controllers/appointmentController.js', [
  "const pool = require('../models/db');",
  "",
  "const getAppointments = async (req, res) => {",
  "  try {",
  "    const { role, id } = req.user;",
  "    let result;",
  "    if (role === 'patient') {",
  "      result = await pool.query(",
  "        'SELECT a.*, u.name as doctor_name, d.speciality, d.room_number FROM appointments a JOIN doctors d ON d.id = a.doctor_id JOIN users u ON u.id = d.user_id WHERE a.patient_id = $1 ORDER BY a.appointment_time DESC',",
  "        [id]",
  "      );",
  "    } else if (role === 'doctor') {",
  "      result = await pool.query(",
  "        'SELECT a.*, u.name as patient_name, u.phone FROM appointments a JOIN users u ON u.id = a.patient_id JOIN doctors d ON d.id = a.doctor_id WHERE d.user_id = $1 ORDER BY a.appointment_time ASC',",
  "        [id]",
  "      );",
  "    } else {",
  "      result = await pool.query(",
  "        'SELECT a.*, pu.name as patient_name, du.name as doctor_name FROM appointments a JOIN users pu ON pu.id = a.patient_id JOIN doctors d ON d.id = a.doctor_id JOIN users du ON du.id = d.user_id ORDER BY a.appointment_time DESC LIMIT 100'",
  "      );",
  "    }",
  "    res.json({ success: true, appointments: result.rows });",
  "  } catch (err) {",
  "    res.status(500).json({ success: false, message: err.message });",
  "  }",
  "};",
  "",
  "const bookAppointment = async (req, res) => {",
  "  try {",
  "    const { doctor_id, appointment_time, type = 'in_person', chief_complaint } = req.body;",
  "    const patient_id = req.user.id;",
  "    if (!doctor_id || !appointment_time)",
  "      return res.status(400).json({ success: false, message: 'Doctor and time required' });",
  "    const result = await pool.query(",
  "      'INSERT INTO appointments (patient_id, doctor_id, appointment_time, type, chief_complaint, status) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',",
  "      [patient_id, doctor_id, appointment_time, type, chief_complaint, 'confirmed']",
  "    );",
  "    res.status(201).json({ success: true, appointment: result.rows[0] });",
  "  } catch (err) {",
  "    res.status(500).json({ success: false, message: err.message });",
  "  }",
  "};",
  "",
  "const cancelAppointment = async (req, res) => {",
  "  try {",
  "    const result = await pool.query(",
  "      'UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 AND patient_id = $3 RETURNING *',",
  "      ['cancelled', req.params.id, req.user.id]",
  "    );",
  "    if (result.rows.length === 0)",
  "      return res.status(404).json({ success: false, message: 'Appointment not found' });",
  "    res.json({ success: true, appointment: result.rows[0] });",
  "  } catch (err) {",
  "    res.status(500).json({ success: false, message: err.message });",
  "  }",
  "};",
  "",
  "module.exports = { getAppointments, bookAppointment, cancelAppointment };"
].join('\n'));

// ── controllers/queueController.js
fs.writeFileSync('controllers/queueController.js', [
  "const pool = require('../models/db');",
  "",
  "const generateQueueToken = async (doctorId) => {",
  "  const count = await pool.query('SELECT COUNT(*) FROM queue_entries WHERE doctor_id = $1 AND DATE(joined_at) = CURRENT_DATE', [doctorId]);",
  "  const num = parseInt(count.rows[0].count) + 1;",
  "  return 'MQ-' + String(num).padStart(4, '0');",
  "};",
  "",
  "const joinQueue = async (req, res) => {",
  "  try {",
  "    const { appointment_id } = req.body;",
  "    const patient_id = req.user.id;",
  "    const appt = await pool.query('SELECT * FROM appointments WHERE id = $1 AND patient_id = $2', [appointment_id, patient_id]);",
  "    if (appt.rows.length === 0)",
  "      return res.status(404).json({ success: false, message: 'Appointment not found' });",
  "    const doctor_id = appt.rows[0].doctor_id;",
  "    const posResult = await pool.query(",
  "      \"SELECT COUNT(*) FROM queue_entries WHERE doctor_id = $1 AND DATE(joined_at) = CURRENT_DATE AND status IN ('waiting','called','in_progress')\",",
  "      [doctor_id]",
  "    );",
  "    const position = parseInt(posResult.rows[0].count) + 1;",
  "    const token_number = await generateQueueToken(doctor_id);",
  "    const result = await pool.query(",
  "      'INSERT INTO queue_entries (appointment_id, doctor_id, patient_id, token_number, position, estimated_wait_minutes) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',",
  "      [appointment_id, doctor_id, patient_id, token_number, position, position * 8]",
  "    );",
  "    res.status(201).json({ success: true, queueEntry: result.rows[0] });",
  "  } catch (err) {",
  "    res.status(500).json({ success: false, message: err.message });",
  "  }",
  "};",
  "",
  "const getQueueStatus = async (req, res) => {",
  "  try {",
  "    const { doctorId } = req.params;",
  "    const result = await pool.query(",
  "      'SELECT q.*, u.name as patient_name FROM queue_entries q JOIN users u ON u.id = q.patient_id WHERE q.doctor_id = $1 AND DATE(q.joined_at) = CURRENT_DATE ORDER BY q.position ASC',",
  "      [doctorId]",
  "    );",
  "    const current = result.rows.find(r => r.status === 'in_progress') || null;",
  "    const waiting = result.rows.filter(r => r.status === 'waiting');",
  "    res.json({ success: true, queue: result.rows, current, waitingCount: waiting.length, completedCount: result.rows.filter(r => r.status === 'completed').length });",
  "  } catch (err) {",
  "    res.status(500).json({ success: false, message: err.message });",
  "  }",
  "};",
  "",
  "const callNext = async (req, res) => {",
  "  try {",
  "    const { doctorId } = req.params;",
  "    await pool.query(\"UPDATE queue_entries SET status = 'completed', completed_at = NOW() WHERE doctor_id = $1 AND status = 'in_progress'\", [doctorId]);",
  "    const next = await pool.query(",
  "      \"UPDATE queue_entries SET status = 'in_progress', called_at = NOW() WHERE id = (SELECT id FROM queue_entries WHERE doctor_id = $1 AND status = 'waiting' ORDER BY position ASC LIMIT 1) RETURNING *\",",
  "      [doctorId]",
  "    );",
  "    res.json({ success: true, next: next.rows[0] || null });",
  "  } catch (err) {",
  "    res.status(500).json({ success: false, message: err.message });",
  "  }",
  "};",
  "",
  "module.exports = { joinQueue, getQueueStatus, callNext };"
].join('\n'));

// ── controllers/doctorController.js
fs.writeFileSync('controllers/doctorController.js', [
  "const pool = require('../models/db');",
  "",
  "const getDoctors = async (req, res) => {",
  "  try {",
  "    const result = await pool.query('SELECT d.*, u.name, u.email, u.phone FROM doctors d JOIN users u ON u.id = d.user_id WHERE u.is_active = true ORDER BY d.rating DESC');",
  "    res.json({ success: true, doctors: result.rows });",
  "  } catch (err) {",
  "    res.status(500).json({ success: false, message: err.message });",
  "  }",
  "};",
  "",
  "const getDoctorById = async (req, res) => {",
  "  try {",
  "    const result = await pool.query('SELECT d.*, u.name, u.email, u.phone FROM doctors d JOIN users u ON u.id = d.user_id WHERE d.id = $1', [req.params.id]);",
  "    if (result.rows.length === 0)",
  "      return res.status(404).json({ success: false, message: 'Doctor not found' });",
  "    res.json({ success: true, doctor: result.rows[0] });",
  "  } catch (err) {",
  "    res.status(500).json({ success: false, message: err.message });",
  "  }",
  "};",
  "",
  "const getAvailability = async (req, res) => {",
  "  try {",
  "    const { id } = req.params;",
  "    const { date } = req.query;",
  "    const booked = await pool.query(",
  "      \"SELECT appointment_time FROM appointments WHERE doctor_id = $1 AND DATE(appointment_time) = $2 AND status NOT IN ('cancelled')\",",
  "      [id, date]",
  "    );",
  "    const bookedTimes = booked.rows.map(r => new Date(r.appointment_time).toTimeString().slice(0, 5));",
  "    const slots = [];",
  "    for (let h = 9; h < 17; h++) {",
  "      for (let m = 0; m < 60; m += 15) {",
  "        const time = String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0');",
  "        slots.push({ time, available: !bookedTimes.includes(time) });",
  "      }",
  "    }",
  "    res.json({ success: true, date, slots });",
  "  } catch (err) {",
  "    res.status(500).json({ success: false, message: err.message });",
  "  }",
  "};",
  "",
  "module.exports = { getDoctors, getDoctorById, getAvailability };"
].join('\n'));

// ── controllers/adminController.js
fs.writeFileSync('controllers/adminController.js', [
  "const pool = require('../models/db');",
  "",
  "const getStats = async (req, res) => {",
  "  try {",
  "    const [patients, doctors, appointments, queue] = await Promise.all([",
  "      pool.query(\"SELECT COUNT(*) FROM users WHERE role = 'patient'\"),",
  "      pool.query(\"SELECT COUNT(*) FROM users WHERE role = 'doctor' AND is_active = true\"),",
  "      pool.query('SELECT COUNT(*) FROM appointments WHERE DATE(created_at) = CURRENT_DATE'),",
  "      pool.query(\"SELECT COUNT(*) FROM queue_entries WHERE status = 'waiting' AND DATE(joined_at) = CURRENT_DATE\")",
  "    ]);",
  "    res.json({ success: true, stats: {",
  "      totalPatients: parseInt(patients.rows[0].count),",
  "      activeDoctors: parseInt(doctors.rows[0].count),",
  "      todayAppointments: parseInt(appointments.rows[0].count),",
  "      currentQueueSize: parseInt(queue.rows[0].count)",
  "    }});",
  "  } catch (err) {",
  "    res.status(500).json({ success: false, message: err.message });",
  "  }",
  "};",
  "",
  "const getAllUsers = async (req, res) => {",
  "  try {",
  "    const result = await pool.query('SELECT id, name, email, phone, role, is_active, created_at FROM users ORDER BY created_at DESC LIMIT 100');",
  "    res.json({ success: true, users: result.rows });",
  "  } catch (err) {",
  "    res.status(500).json({ success: false, message: err.message });",
  "  }",
  "};",
  "",
  "module.exports = { getStats, getAllUsers };"
].join('\n'));

// ── controllers/prescriptionController.js
fs.writeFileSync('controllers/prescriptionController.js', [
  "const pool = require('../models/db');",
  "const getPrescriptions = async (req, res) => {",
  "  try {",
  "    const result = await pool.query(",
  "      'SELECT p.*, u.name as doctor_name FROM prescriptions p JOIN users u ON u.id = p.doctor_id WHERE p.patient_id = $1 ORDER BY p.issued_at DESC',",
  "      [req.user.id]",
  "    );",
  "    res.json({ success: true, prescriptions: result.rows });",
  "  } catch (err) {",
  "    res.status(500).json({ success: false, message: err.message });",
  "  }",
  "};",
  "module.exports = { getPrescriptions };"
].join('\n'));

console.log('');
console.log('✅ ALL FILES WRITTEN SUCCESSFULLY!');
console.log('');