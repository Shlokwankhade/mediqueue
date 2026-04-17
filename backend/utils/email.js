const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: '"MEDIQUEUE" <' + process.env.EMAIL_USER + '>',
      to,
      subject,
      html
    });
    console.log('Email sent to:', to);
    return true;
  } catch (err) {
    console.error('Email error:', err.message);
    return false;
  }
};

const appointmentConfirmEmail = (patient, doctor, time, token) => ({
  subject: 'Appointment Confirmed — MEDIQUEUE',
  html: `
    <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>
      <div style='background:linear-gradient(135deg,#0D9B82,#1DBEA0);padding:32px;text-align:center;border-radius:12px 12px 0 0'>
        <h1 style='color:white;margin:0;font-size:28px'>MEDIQUEUE</h1>
        <p style='color:rgba(255,255,255,.85);margin:8px 0 0'>Appointment Confirmed ✅</p>
      </div>
      <div style='background:#f8fafc;padding:32px;border-radius:0 0 12px 12px'>
        <p style='font-size:16px;color:#0A1628'>Hello <strong>${patient}</strong>,</p>
        <p style='color:#64748B'>Your appointment has been successfully booked!</p>
        <div style='background:white;border:1px solid #E2E8F0;border-radius:10px;padding:20px;margin:20px 0'>
          <div style='display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #E2E8F0'>
            <span style='color:#64748B'>Doctor</span>
            <strong>${doctor}</strong>
          </div>
          <div style='display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #E2E8F0'>
            <span style='color:#64748B'>Date & Time</span>
            <strong>${new Date(time).toLocaleString('en-IN',{dateStyle:'full',timeStyle:'short'})}</strong>
          </div>
          <div style='display:flex;justify-content:space-between;padding:10px 0'>
            <span style='color:#64748B'>Token</span>
            <strong style='color:#0D9B82'>${token}</strong>
          </div>
        </div>
        <div style='background:#E6F7F4;border-radius:8px;padding:16px;margin-top:16px'>
          <p style='color:#0A7A67;margin:0;font-size:14px'>💡 Please arrive 10 minutes early. Carry a valid ID proof.</p>
        </div>
        <p style='color:#94A3B8;font-size:12px;margin-top:24px;text-align:center'>MEDIQUEUE — Smart Healthcare Queue Management</p>
      </div>
    </div>
  `
});

const queueCallEmail = (patient, tokenNumber, doctorName) => ({
  subject: 'Your Turn is Near — MEDIQUEUE',
  html: `
    <div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'>
      <div style='background:linear-gradient(135deg,#0D9B82,#1DBEA0);padding:32px;text-align:center;border-radius:12px 12px 0 0'>
        <h1 style='color:white;margin:0'>🔔 Your Turn is Near!</h1>
      </div>
      <div style='background:#f8fafc;padding:32px;border-radius:0 0 12px 12px'>
        <p style='font-size:16px'>Hello <strong>${patient}</strong>,</p>
        <p style='color:#64748B'>Please proceed to the clinic. Your token <strong style='color:#0D9B82'>${tokenNumber}</strong> will be called soon by <strong>${doctorName}</strong>.</p>
        <div style='background:#FEF3C7;border-radius:8px;padding:16px;margin-top:16px'>
          <p style='color:#92400E;margin:0'>⏰ Please be ready at the clinic within 5 minutes.</p>
        </div>
      </div>
    </div>
  `
});

module.exports = { sendEmail, appointmentConfirmEmail, queueCallEmail };