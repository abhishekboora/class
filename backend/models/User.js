const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  registrationId: String,
  password: String,
  otp: String
});

module.exports = mongoose.model("User", userSchema);