
const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;
  const errors = [];
  
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email required');
  if (!password || password.length < 6) errors.push('Password must be at least 6 characters');
  if (password && password.length > 100) errors.push('Password too long');
  
  // Sanitize inputs
  if (name) req.body.name = name.trim().substring(0, 100);
  if (email) req.body.email = email.toLowerCase().trim();
  
  if (errors.length > 0) {
    return res.status(400).json({ success: false, message: errors[0], errors });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }
  req.body.email = email.toLowerCase().trim();
  next();
};

const validateAppointment = (req, res, next) => {
  const { doctor_id, appointment_time } = req.body;
  if (!doctor_id) return res.status(400).json({ success: false, message: 'Doctor ID required' });
  if (!appointment_time) return res.status(400).json({ success: false, message: 'Appointment time required' });
  
  const apptDate = new Date(appointment_time);
  if (isNaN(apptDate.getTime())) return res.status(400).json({ success: false, message: 'Invalid appointment time' });
  if (apptDate < new Date()) return res.status(400).json({ success: false, message: 'Appointment time must be in the future' });
  
  next();
};

module.exports = { validateRegister, validateLogin, validateAppointment };
