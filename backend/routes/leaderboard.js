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

// DELETE all records of a specific date (admin only)
router.delete("/delete-date", auth, async (req, res) => {
  const { date } = req.body;

  if (!date) {
    return res.status(400).json({ message: "Date is required" });
  }

  try {
    await Player.updateMany(
      {},
      { $pull: { sessions: { date } } }
    );

    res.json({ message: `All records for ${date} deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Delete failed" });
  }
});

// DELETE single player's record for a date
router.delete("/delete-player-date", auth, async (req, res) => {
  const { name, date } = req.body;

  if (!name || !date) {
    return res.status(400).json({ message: "Name and date required" });
  }

  try {
    await Player.updateOne(
      { name },
      { $pull: { sessions: { date } } }
    );

    res.json({ message: `${name}'s record for ${date} deleted` });
  } catch (err) {
    res.status(500).json({ message: "Delete failed" });
  }
});

// MODIFY existing records for a date (admin only)
router.put("/modify-date", auth, async (req, res) => {
  const { date, scores } = req.body;

  if (!date || !scores) {
    return res.status(400).json({ message: "Date and scores are required" });
  }

  try {
    for (const entry of scores) {
      const result = await Player.updateOne(
        { name: entry.name, "sessions.date": date },
        {
          $set: {
            "sessions.$.sql": entry.sql,
            "sessions.$.coding": entry.coding,
            "sessions.$.dsa": entry.dsa
          }
        }
      );

      // Optional: detect missing record
      if (result.matchedCount === 0) {
        console.warn(`No existing record for ${entry.name} on ${date}`);
      }
    }

    res.json({ message: `Records for ${date} updated successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Update failed" });
  }
});


module.exports = router;

