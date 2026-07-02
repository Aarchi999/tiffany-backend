const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer(); // needed for FormData
const authController = require("../controllers/auth.controller");


// login route
router.post('/login',upload.none(), authController.login);

// forget password
router.post('/forgot-password',upload.none(), authController.forgotPassword);
// verify otp
router.post('/verify-otp', upload.none(), authController.verifyOtp);

// reset password
router.post('/reset-password', upload.none(), authController.resetPassword);

// logout 
router.get('/logout', authController.logout);

module.exports = router;
 