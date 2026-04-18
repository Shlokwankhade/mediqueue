const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later' }
});

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use('/api/', limiter);

// Health check
app.get('/api/test-email', async (req, res) => {
  const { sendEmail } = require('./utils/email');
  const ok = await sendEmail({ to: process.env.EMAIL_USER, subject: 'MEDIQUEUE Test Email', html: '<h1>Email is working! 🎉</h1><p>Your MEDIQUEUE email system is configured correctly.</p>' });
  res.json({ success: ok, message: ok ? 'Test email sent!' : 'Email failed - check config' });
});

// Video call room management
app.post('/api/video/room', async (req, res) => {
  const { appointmentId } = req.body;
  const roomId = 'mq-' + appointmentId;
  res.json({ success: true, roomId });
});

app.get('/api/video/room/:appointmentId', async (req, res) => {
  const roomId = 'mq-' + req.params.appointmentId;
  res.json({ success: true, roomId });
});

app.post('/api/ai/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false });
  
  // Smart contextual replies about MEDIQUEUE
  const m = message.toLowerCase();
  let reply = '';

  if (m.includes('book') || m.includes('appointment')) {
    reply = 'To book an appointment: Click Find Doctors in the sidebar, browse available doctors by speciality, click Book Appointment, select your preferred date and time slot, and confirm. You will receive an email confirmation!';
  } else if (m.includes('queue') || m.includes('wait') || m.includes('token')) {
    reply = 'Go to Queue Status in your dashboard. You will see your token number, current position, and AI-predicted wait time that updates every 30 seconds. You will be notified when your turn is near!';
  } else if (m.includes('prescription') || m.includes('medicine')) {
    reply = 'Your e-prescriptions are in the Prescriptions section. After each consultation, your doctor issues a digital prescription that is emailed to you automatically with medicine details, dosage and frequency.';
  } else if (m.includes('payment') || m.includes('fee') || m.includes('pay')) {
    reply = 'Pay consultation fees easily through the Payments section using Razorpay. We support UPI, credit/debit cards, net banking and wallets. All transactions are secure and you get instant confirmation.';
  } else if (m.includes('health') || m.includes('record') || m.includes('bmi')) {
    reply = 'Your Health Records section stores blood group, height, weight (auto-calculates BMI), allergies, chronic conditions, medications, emergency contacts and insurance details. Download as PDF or share with doctors!';
  } else if (m.includes('doctor') || m.includes('specialist')) {
    reply = 'Browse all doctors in Find Doctors. Filter by speciality - Cardiology, Orthopaedics, Dermatology, Neurology and more. See ratings, consultation fees, experience and real-time availability before booking!';
  } else if (m.includes('review') || m.includes('rating')) {
    reply = 'After a completed appointment, go to Reviews section to rate your doctor from 1-5 stars and write a review. You can post anonymously too! Doctors can see their ratings and patient feedback.';
  } else if (m.includes('message') || m.includes('chat') || m.includes('contact')) {
    reply = 'Use the Messages section to chat directly with your doctor! Real-time messaging with read receipts and typing indicators. Available after booking an appointment with that doctor.';
  } else if (m.includes('cancel')) {
    reply = 'To cancel an appointment: Go to My Appointments, find the appointment you want to cancel, and click the Cancel button. Note: Only confirmed appointments can be cancelled.';
  } else if (m.includes('password') || m.includes('forgot') || m.includes('reset')) {
    reply = 'To reset your password: Click Forgot Password on the login page, enter your email, and we will send a secure reset link valid for 1 hour. Check your inbox and spam folder!';
  } else if (m.includes('register') || m.includes('sign up') || m.includes('account')) {
    reply = 'Creating an account is free! Click Get Started on the landing page. Patients register instantly. Doctors go through a 2-step process to set up their professional profile with speciality and fees.';
  } else if (m.includes('emergency') || m.includes('urgent')) {
    reply = 'For medical emergencies, please call 112 immediately! MEDIQUEUE is for scheduled appointments. For urgent but non-emergency care, look for doctors with same-day availability in Find Doctors.';
  } else if (m.includes('how') && m.includes('work')) {
    reply = 'MEDIQUEUE works in 4 steps: 1) Register as patient/doctor 2) Book appointment with your preferred doctor 3) Join the live queue on appointment day 4) AI tracks your position and notifies you when it is your turn. Simple!';
  } else {
    reply = 'I can help you with: booking appointments, checking queue status, viewing prescriptions, making payments, health records, doctor reviews and direct messaging. What would you like to know more about?';
  }

  res.json({ success: true, reply });
});

app.post('/api/ai/predict', async (req, res) => {
  const { predictWaitTime } = require('./utils/aiPredictor');
  const { position, appointmentType, completedToday, doctorSpeedFactor } = req.body;
  const prediction = predictWaitTime({ position, appointmentType, completedToday, doctorSpeedFactor });
  res.json({ success: true, prediction });
});

app.get('/health', (req, res) => {
  res.json({ status: '✅ MEDIQUEUE Backend Running', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/appointments', require('./routes/appointments'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/doctors', require('./routes/doctors'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/health', require('./routes/health'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/prescriptions', require('./routes/prescriptions'));

// WebSocket
require('./sockets/queueSocket')(io);

// Error Handler (must be last)
app.use(require('./middleware/errorHandler'));

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 MEDIQUEUE Server running on http://localhost:${PORT}`);
  console.log(`🌐 Frontend expected at: ${process.env.FRONTEND_URL}`);
  console.log(`📡 WebSocket ready`);
});