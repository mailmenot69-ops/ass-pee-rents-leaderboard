const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const leaderboardRoutes = require("./routes/leaderboard");
const authRoutes = require("./routes/auth");


const app = express();

app.use(cors());
app.use(express.json());

// MongoDB connection
require("dotenv").config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));


// Routes
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
  res.send("Leaderboard API running");
});

module.exports = app;
