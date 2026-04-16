const bcrypt = require('bcryptjs');
const pool = require('../models/db');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role = 'patient' } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email, password required' });
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ success: false, message: 'Email already registered' });
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role',
      [name, email, phone, password_hash, role]
    );
    const user = result.rows[0];
    res.status(201).json({ success: true, token: generateToken(user.id), user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_active = true', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    res.json({ success: true, token: generateToken(user.id), user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT u.id, u.name, u.email, u.phone, u.role, d.id as doctor_id, d.speciality, d.consultation_fee, d.rating FROM users u LEFT JOIN doctors d ON d.user_id = u.id WHERE u.id = $1',
      [req.user.id]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe };