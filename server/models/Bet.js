const mongoose = require("mongoose");

const betSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Match",
    required: true,
  },
  amount: { type: Number, required: true },
  predictedOutcome: {
    type: String,
    enum: ["win", "loss", "draw"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "won", "lost"],
    default: "pending",
  },
  potentialWinnings: { type: Number, required: true },
});

module.exports = mongoose.model("Bet", betSchema);
