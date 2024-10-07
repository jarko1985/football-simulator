const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 1000 },
  bets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bet" }],
});

module.exports = mongoose.model("User", userSchema);
