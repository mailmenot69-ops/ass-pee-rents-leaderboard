const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const leaderboardRoutes = require("./routes/leaderboard");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

// ---- MongoDB connection (serverless-safe) ----
let cachedConn = null;

async function connectDB() {
  if (cachedConn) {
    return cachedConn;
  }

  cachedConn = await mongoose.connect(process.env.MONGO_URI, {
    bufferCommands: false,
    maxPoolSize: 5,
  });

  return cachedConn;
}

// Middleware: ENSURE DB connected before routes
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    res.status(500).json({ message: "Database connection failed" });
  }
});

// ---- Routes ----
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Leaderboard API running");
});

module.exports = app;
