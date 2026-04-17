const bcrypt = require('bcryptjs');
const pool = require('../models/db');
const { generateToken } = require('../utils/jwt');

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role = 'patient' } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'Name, email and password required' });
    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (exists.rows.length > 0)
      return res.status(400).json({ success: false, message: 'Email already registered' });
    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role',
      [name, email, phone || null, hash, role === 'admin' ? 'patient' : role]
    );
    const user = result.rows[0];
    const token = generateToken(user.id);
    try {
      const { sendEmail } = require('.../utils/email');
      await sendEmail({
        to: email,
        subject: 'Welcome to MEDIQUEUE!',
        html: '<h1>Welcome ' + name + '!</h1><p>Your account has been created successfully.</p>'
      });
    } catch(e) { console.error('Welcome email failed:', e.message); }
    res.status(201).json({ success: true, token, user });
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
      `SELECT u.id, u.name, u.email, u.phone, u.role, 
       d.id as doctor_id, d.speciality, d.consultation_fee, d.rating, d.is_available
       FROM users u 
       LEFT JOIN doctors d ON d.user_id = u.id 
       WHERE u.id = $1`,
      [req.user.id]
    );
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await pool.query('SELECT id, name FROM users WHERE email = $1', [email]);
    if (!user.rows[0])
      return res.status(404).json({ success: false, message: 'No account found with this email' });
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);
    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE email = $3',
      [token, expires, email]
    );
    const resetUrl = (process.env.FRONTEND_URL || 'http://localhost:5173') + '/reset-password?token=' + encodeURIComponent(token);
    const { sendEmail } = require('../utils/email');
    await sendEmail({
      to: email,
      subject: 'Reset Your Password - MEDIQUEUE [' + token.substring(0,8) + '...]',
      html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#0D9B82,#1DBEA0);padding:32px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:white;margin:0">Password Reset</h1></div><div style="background:#f8fafc;padding:32px;border-radius:0 0 12px 12px"><p>Hello <strong>' + user.rows[0].name + '</strong>,</p><p style="color:#64748B">Click below to reset your password. Expires in 1 hour.</p><div style="text-align:center;margin:28px 0"><a href="' + resetUrl + '" style="background:linear-gradient(135deg,#0D9B82,#1DBEA0);color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">Reset Password</a></div><p style="color:#94A3B8;font-size:12px">If you did not request this, ignore this email.</p></div></div>'
    });
    res.json({ success: true, message: 'Password reset email sent!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );
    if (!user.rows[0])
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hash, user.rows[0].id]
    );
    res.json({ success: true, message: 'Password reset successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    await pool.query(
      'UPDATE users SET name=$1, phone=$2 WHERE id=$3',
      [name, phone, req.user.id]
    );
    res.json({ success: true, message: 'Profile updated!' });
  } catch(err) { res.status(500).json({ success:false, message:err.message }); }
};

module.exports = { register, updateProfile, login, getMe, forgotPassword, resetPassword };
