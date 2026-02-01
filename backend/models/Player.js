const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  date: String,
  sql: Number,
  coding: Number,
  dsa: Number
});

const PlayerSchema = new mongoose.Schema({
  name: String,
  sessions: [SessionSchema]
});

module.exports = mongoose.model("Player", PlayerSchema);
