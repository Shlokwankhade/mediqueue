
const express = require('express');
const router = express.Router();
const { getConversations, getMessages, sendMessage, getContacts } = require('../controllers/messageController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/conversations', getConversations);
router.get('/contacts', getContacts);
router.get('/:userId', getMessages);
router.post('/', sendMessage);

module.exports = router;
