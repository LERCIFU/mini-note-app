// config/db.js
const mongoose = require("mongoose");
const { MONGO_URI } = require("./config");

async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // ถ้าเชื่อมไม่ได้ ให้ปิดโปรแกรมเลย
  }
}

module.exports = connectDB;
