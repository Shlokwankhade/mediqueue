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