const User = require("../models/User");
const nodemailer = require("nodemailer");

// Step 1: Send OTP
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Save OTP with email (do not create registrationId/password yet)
    let user = await User.findOneAndUpdate(
      { email },
      { email, otp },
      { upsert: true, new: true }
    );
    // Send OTP via email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    await transporter.sendMail({
      to: email,
      subject: "Boora Classes - OTP Verification",
      text: `Your OTP is ${otp}`,
    });
    res.json({ message: "OTP sent to your email." });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

// Step 2: Verify OTP and complete registration
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, otp });
    if (!user) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    // Generate registrationId and password
    const registrationId = "REG" + Math.floor(100000 + Math.random() * 900000).toString();
    const password = Math.random().toString(36).substring(2, 10).toUpperCase();
    user.registrationId = registrationId;
    user.password = password;
    user.otp = undefined; // clear OTP
    await user.save();
    // Send registrationId and password via email
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    await transporter.sendMail({
      to: email,
      subject: "Boora Classes - Registration Successful",
      text: `Your registration is successful!\n\nRegistration ID: ${registrationId}\nPassword: ${password}\n\nPlease use these credentials to login to your account.\n\nBest regards,\nBoora Classes Team`,
    });
    res.json({ message: "Registration successful! Check your email for Registration ID and Password." });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

exports.loginUser = async (req, res) => {
  const { email, otp, registrationId, password } = req.body;
  const user = await User.findOne({
    $or: [
      { email, otp },
      { registrationId, password }
    ]
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid login credentials" });
  }

  res.json({ message: "Login successful", user });
};

exports.forgotPassword = async (req, res) => {
  try {
    const { registrationId, email } = req.body;
    const user = await User.findOne({ registrationId, email });
    if (!user) {
      return res.status(400).json({ message: "No user found with provided Registration ID and Email." });
    }
    const newPassword = Math.random().toString(36).substring(2, 10).toUpperCase();
    user.password = newPassword;
    await user.save();
    let transporter = require("nodemailer").createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    await transporter.sendMail({
      to: email,
      subject: "Boora Classes - Password Reset",
      text: `Your password has been reset.\n\nRegistration ID: ${registrationId}\nNew Password: ${newPassword}\n\nPlease use these credentials to login.`,
    });
    res.json({ message: "Password reset successful! Check your email for the new password." });
  } catch (error) {
    console.error("Forgot Password error:", error);
    res.status(500).json({ message: "Failed to reset password. Please try again." });
  }
};
