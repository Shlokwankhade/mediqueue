
const jwt = require('jsonwebtoken');
const pool = require('../models/db');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle both old nested token {id: {id:..}} and new flat token {id: uuid}
    const userId = typeof decoded.id === 'object' ? decoded.id.id : decoded.id;

    const result = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0)
      return res.status(401).json({ success: false, message: 'User not found' });

    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error('Auth error:', err.message);
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ success: false, message: 'Access denied' });
  next();
};

module.exports = { protect, authorize };
