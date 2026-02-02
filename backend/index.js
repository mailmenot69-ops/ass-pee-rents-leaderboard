const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const leaderboardRoutes = require("./routes/leaderboard");
const authRoutes = require("./routes/auth");

const app = express();

app.use(cors());
app.use(express.json());

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
      maxPoolSize: 5,
    }).then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// IMPORTANT: connect BEFORE routes
connectDB();

app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Leaderboard API running");
});

module.exports = app;
