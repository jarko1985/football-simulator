// models/Match.js
const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema({
  teamA: { type: String, required: true },
  teamB: { type: String, required: true },
  odds: {
    teamAWin: { type: Number, required: true },
    draw: { type: Number, required: true },
    teamBWin: { type: Number, required: true },
  },
  result: {
    type: String,
    enum: ["teamA", "draw", "teamB", "pending"],
    default: "pending",
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
});

module.exports = mongoose.model("Match", matchSchema);
