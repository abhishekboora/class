

require("dotenv").config();
const express = require("express");

const mongoose = require("mongoose");
const cors = require("cors");
// const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");

// dotenv.config();
console.log("Loaded MONGO_URI:", process.env.MONGODB_URI); // Debug line

const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(5000, () => console.log("🚀 Server running on port 5000"));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });

app.use("/api/auth", authRoutes);
