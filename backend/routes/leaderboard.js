const express = require("express");
const Player = require("../models/Player");
const auth = require("../middleware/auth");

const router = express.Router();

// GET leaderboard (public)
router.get("/", async (req, res) => {
  const players = await Player.find();
  res.json(players);
});

// UPDATE score (admin only)
router.post("/update", auth, async (req, res) => {
  const { name, session } = req.body;

  try {
    const player = await Player.findOne({ name });
    if (!player) return res.status(404).json({ message: "Player not found" });

    player.sessions.push(session);
    await player.save();

    res.json({ message: "Score updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// BULK UPDATE (admin only)
router.post("/bulk-update", auth, async (req, res) => {
  const { date, scores } = req.body;

  try {
    for (const entry of scores) {
      const player = await Player.findOne({ name: entry.name });
      if (!player) continue;

      player.sessions.push({
        date,
        sql: entry.sql,
        coding: entry.coding,
        dsa: entry.dsa
      });

      await player.save();
    }

    res.json({ message: "Bulk scores updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Bulk update failed" });
  }
});


module.exports = router;

