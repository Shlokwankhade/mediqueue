
const bcrypt = require('bcryptjs');
const pool = require('../models/db');
const { generateToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email');

const register = async (req, res) => {
  try {
    const { name, email, phone, password, role = 'patient',
            speciality, experience_years, consultation_fee,
            bio, room_number, qualification } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
    if (existing.rows[0]) {
      return res.status(400).json({ success: false, message: 'Email already registered. Please login.' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash, role) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role',
      [name.trim(), cleanEmail, phone || null, hash, role]
    );
    const user = result.rows[0];
    const token = generateToken(user);

    // Create doctor profile if doctor
    if (role === 'doctor') {
      await pool.query(
        `INSERT INTO doctors (user_id, speciality, experience_years, consultation_fee, bio, room_number, qualification, is_available)
         VALUES ($1,$2,$3,$4,$5,$6,$7,true)
         ON CONFLICT (user_id) DO UPDATE SET
           speciality=EXCLUDED.speciality,
           experience_years=EXCLUDED.experience_years,
           consultation_fee=EXCLUDED.consultation_fee,
           bio=EXCLUDED.bio,
           room_number=EXCLUDED.room_number,
           qualification=EXCLUDED.qualification`,
        [user.id, speciality || 'General Medicine',
         parseInt(experience_years) || 0,
         parseFloat(consultation_fee) || 500,
         bio || '', room_number || '', qualification || '']
      ).catch(e => console.log('Doctor profile error:', e.message));
    }

    // Welcome email (non-blocking)
    sendEmail({
      to: cleanEmail,
      subject: 'Welcome to MEDIQUEUE!',
      html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#0D9B82,#1DBEA0);padding:28px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:white;margin:0;font-size:24px">Welcome to MEDIQUEUE!</h1></div><div style="background:#f8fafc;padding:28px;border-radius:0 0 12px 12px"><p style="font-size:15px">Hello <strong>' + name + '</strong>,</p><p style="color:#64748B">Your <strong>' + role + '</strong> account has been created successfully!</p><p><a href="https://mediqueue-nine.vercel.app/login" style="background:linear-gradient(135deg,#0D9B82,#1DBEA0);color:white;padding:10px 24px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">Login to MEDIQUEUE</a></p><p style="color:#94A3B8;font-size:12px;margin-top:20px">MEDIQUEUE - Smart Healthcare</p></div></div>'
    }).catch(e => console.log('Welcome email error:', e.message));

    res.status(201).json({ success: true, token, user });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.password_hash, u.is_active,
              d.id as doctor_id
       FROM users u
       LEFT JOIN doctors d ON d.user_id = u.id
       WHERE u.email = $1`,
      [cleanEmail]
    );

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ success: false, message: 'No account found with this email. Please register first.' });
    }

    if (user.is_active === false) {
      return res.status(401).json({ success: false, message: 'Account deactivated. Contact support.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    const userObj = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      doctor_id: user.doctor_id || null
    };

    const token = generateToken(userObj);
    res.json({ success: true, token, user: userObj });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.phone,
              d.id as doctor_id, d.speciality, d.consultation_fee, d.rating
       FROM users u
       LEFT JOIN doctors d ON d.user_id = u.id
       WHERE u.id = $1`,
      [req.user.id]
    );
    if (!result.rows[0]) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const result = await pool.query('SELECT id, name FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (!result.rows[0]) {
      return res.json({ success: true, message: 'If this email exists, a reset link has been sent.' });
    }

    const token = require('crypto').randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      'UPDATE users SET reset_token=$1, reset_token_expires=$2 WHERE email=$3',
      [token, expires, email.toLowerCase().trim()]
    );

    const resetUrl = (process.env.FRONTEND_URL || 'https://mediqueue-nine.vercel.app') + '/reset-password?token=' + token;

    await sendEmail({
      to: email,
      subject: 'Reset Your MEDIQUEUE Password',
      html: '<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto"><div style="background:linear-gradient(135deg,#0D9B82,#1DBEA0);padding:28px;text-align:center;border-radius:12px 12px 0 0"><h1 style="color:white;margin:0">Reset Password</h1></div><div style="background:#f8fafc;padding:28px;border-radius:0 0 12px 12px"><p>Hello <strong>' + result.rows[0].name + '</strong>,</p><p>Click below to reset your password. Link expires in 1 hour.</p><p><a href="' + resetUrl + '" style="background:linear-gradient(135deg,#0D9B82,#1DBEA0);color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:700;display:inline-block">Reset Password</a></p></div></div>'
    });

    res.json({ success: true, message: 'Password reset link sent to your email.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ success: false, message: 'Token and password required' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });

    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token=$1 AND reset_token_expires > NOW()',
      [token]
    );
    if (!result.rows[0]) return res.status(400).json({ success: false, message: 'Invalid or expired reset link' });

    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE users SET password_hash=$1, reset_token=NULL, reset_token_expires=NULL WHERE id=$2',
      [hash, result.rows[0].id]
    );

    res.json({ success: true, message: 'Password reset successfully! You can now login.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
