// server.js
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const noteRoutes = require("./routes/notes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// เชื่อม DB
connectDB();

// ใช้ routes (ไม่ต้องมีวงเล็บตามหลัง)
app.use("/auth", authRoutes);
app.use("/notes", noteRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
