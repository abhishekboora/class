const express = require("express");
const { sendOtp, verifyOtp, loginUser, forgotPassword } = require("../controllers/authController");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);

module.exports = router;