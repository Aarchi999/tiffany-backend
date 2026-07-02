// const express = require('express');
// const router = express.Router();
// const {
//   login,
//   verifyOTP,
//   forgotPassword,
//   resetPassword,
//   refreshToken,
//   resendOTP,
//   adminResetPassword,
//   logout,
//   logoutAllDevices,
//   oauthAdminLogin
// } = require('../../../controllers/Admin/authControllers/auth.controller');
// const authGuard = require('../../../middlewares/Admin/authMiddlewares/authGuard');
// const checkPermission = require('../../../middlewares/Admin/authMiddlewares/checkPermission');
// const { passport } = require('../../../config/passport');
// const handleFileUpload = require('../../../services/handleFileUpload.service');


// router.post('/login', handleFileUpload(), login);
// router.post('/resend-otp', resendOTP);
// router.post('/verify-otp', verifyOTP);
// router.post('/refresh-token', refreshToken);
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password', resetPassword);
// router.post('/reset-password-direct', authGuard('admin'), checkPermission(['admin-reset-owner-password'], 'admin'), adminResetPassword);
// router.post('/logout', authGuard('admin'), logout);
// router.post('/logout/all-device', authGuard('admin'), logoutAllDevices);


// // 🔐 Google Login
// router.get('/oauth/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// // 🔁 Google Callback
// router.get('/oauth/google/callback', passport.authenticate('google', { session: false }), oauthAdminLogin);

// // 🔐 Apple Login
// router.get('/oauth/apple', passport.authenticate('apple', { session: false }));

// // 🔁 Apple Callback
// router.post('/oauth/apple/callback', passport.authenticate('apple', { session: false }), oauthAdminLogin);

// module.exports = router;

const express = require('express');
const router = express.Router();
const { login } = require('../../../controllers/Admin/authControllers/auth.controller.js');

// POST /admin/login
router.post('/login', login);

module.exports = router;
