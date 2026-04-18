
const pool = require('../models/db');

const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all messages involving this user
    const result = await pool.query(
      'SELECT m.id, m.content, m.created_at, m.is_read, m.sender_id, m.receiver_id, u1.name as sender_name, u2.name as receiver_name FROM messages m JOIN users u1 ON u1.id = m.sender_id JOIN users u2 ON u2.id = m.receiver_id WHERE m.sender_id = $1 OR m.receiver_id = $1 ORDER BY m.created_at DESC',
      [userId]
    );

    // Build conversations map
    const convMap = {};
    result.rows.forEach(m => {
      const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id;
      const otherName = m.sender_id === userId ? m.receiver_name : m.sender_name;
      if (!convMap[otherId]) {
        convMap[otherId] = {
          other_user: otherId,
          other_name: otherName,
          content: m.content,
          created_at: m.created_at,
          unread_count: 0
        };
      }
      if (m.receiver_id === userId && !m.is_read) {
        convMap[otherId].unread_count++;
      }
    });

    res.json({ success: true, conversations: Object.values(convMap) });
  } catch(err) {
    console.error('getConversations error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getMessages = async (req, res) => {
  try {
    const otherId = req.params.userId;
    const myId = req.user.id;

    await pool.query(
      'UPDATE messages SET is_read = true WHERE sender_id = $1 AND receiver_id = $2',
      [otherId, myId]
    );

    const result = await pool.query(
      'SELECT m.*, u.name as sender_name FROM messages m JOIN users u ON u.id = m.sender_id WHERE (m.sender_id = $1 AND m.receiver_id = $2) OR (m.sender_id = $2 AND m.receiver_id = $1) ORDER BY m.created_at ASC LIMIT 100',
      [myId, otherId]
    );

    res.json({ success: true, messages: result.rows });
  } catch(err) {
    console.error('getMessages error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content, appointment_id } = req.body;
    const sender_id = req.user.id;

    if (!content || content.trim().length === 0)
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    if (!receiver_id)
      return res.status(400).json({ success: false, message: 'Receiver required' });

    const result = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, content, appointment_id) VALUES ($1,$2,$3,$4) RETURNING *',
      [sender_id, receiver_id, content.trim(), appointment_id || null]
    );

    const sender = await pool.query('SELECT name FROM users WHERE id = $1', [sender_id]);

    res.status(201).json({
      success: true,
      message: { ...result.rows[0], sender_name: sender.rows[0]?.name }
    });
  } catch(err) {
    console.error('sendMessage error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getContacts = async (req, res) => {
  try {
    const { role, id } = req.user;
    let result;

    if (role === 'patient') {
      result = await pool.query(
        'SELECT DISTINCT u.id, u.name, u.role, d.speciality FROM appointments a JOIN doctors d ON d.id = a.doctor_id JOIN users u ON u.id = d.user_id WHERE a.patient_id = $1 AND a.status IN ($2,$3) ORDER BY u.name',
        [id, 'confirmed', 'completed']
      );
    } else if (role === 'doctor') {
      result = await pool.query(
        'SELECT DISTINCT u.id, u.name, u.role FROM appointments a JOIN users u ON u.id = a.patient_id JOIN doctors d ON d.id = a.doctor_id WHERE d.user_id = $1 AND a.status IN ($2,$3) ORDER BY u.name',
        [id, 'confirmed', 'completed']
      );
    } else {
      result = await pool.query(
        'SELECT id, name, role FROM users WHERE is_active = true ORDER BY name LIMIT 50'
      );
    }

    res.json({ success: true, contacts: result.rows });
  } catch(err) {
    console.error('getContacts error:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getConversations, getMessages, sendMessage, getContacts };
