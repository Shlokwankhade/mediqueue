const express = require('express');
const router = express.Router();
const { updateProfile,  register, login, getMe, forgotPassword, resetPassword  } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;

router.put('/profile', protect, updateProfile);