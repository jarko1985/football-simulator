const User = require("../models/User");
const Bet = require("../models/Bet");
const Match = require("../models/Match");
const { default: mongoose } = require("mongoose");

const placeBet = async (req, res) => {
  const { matchId, amount, predictedOutcome } = req.body;
  const userId = req.user;

  try {
    const match = await Match.findById(matchId);

    if (!match) return res.status(404).json({ msg: "Match not found" });

    const potentialWinnings = calculatePotentialWinnings(
      amount,
      match.odds,
      predictedOutcome
    );

    const bet = new Bet({
      userId,
      matchId,
      amount,
      predictedOutcome,
      potentialWinnings,
    });

    await bet.save();

    const user = await User.findById(userId);
    user.balance -= amount;
    user.bets.push(bet._id);
    await user.save();

    res.json({ msg: "Bet placed successfully", bet });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

const getUserBets = async (req, res) => {
  try {
    const bets = await Bet.find({ userId: req.user }).populate("matchId");
    res.json({ bets });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

const getAvailableMatches = async (req, res) => {
  try {
    const matches = await Match.find({ result: "pending" });
    res.json({ matches });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

const calculatePotentialWinnings = (amount, odds, predictedOutcome) => {
  let multiplier = 1;
  if (predictedOutcome === "win") multiplier = odds.teamAWin;
  if (predictedOutcome === "draw") multiplier = odds.draw;
  if (predictedOutcome === "loss") multiplier = odds.teamBWin;

  return amount * multiplier;
};

const handleBetPlacement = async (betData) => {
  const { userId, matchId, amount, predictedOutcome } = betData;
  const match = await Match.findById(matchId);

  if (!match || match.result !== "pending")
    throw new Error("Invalid match for betting");

  let odds =
    match.odds[
      predictedOutcome === "win"
        ? "teamAWin"
        : predictedOutcome === "draw"
        ? "draw"
        : "teamBWin"
    ];
  const potentialWinnings = amount * odds;

  await updateUserBalance(userId, amount, "subtract");

  const bet = new Bet({
    userId,
    matchId,
    amount,
    predictedOutcome,
    status: "pending",
    potentialWinnings,
  });

  await bet.save();

  await User.findByIdAndUpdate(
    userId,
    { $push: { bets: bet._id } },
    { new: true }
  );

  return bet;
};

const updateUserBalance = async (userId, amount, operation) => {
  try {
    console.log(userId);

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format");
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const user = await User.findById(userObjectId);

    if (!user) {
      throw new Error("User not found");
    }
    if (operation === "add") {
      user.balance += amount;
    } else if (operation === "subtract") {
      if (user.balance < amount) {
        throw new Error("Insufficient balance");
      }
      user.balance -= amount;
    }
    await user.save();

    return user.balance;
  } catch (error) {
    console.error("Error updating user balance:", error.message);
    throw new Error(error.message);
  }
};
module.exports = {
  placeBet,
  getUserBets,
  getAvailableMatches,
  handleBetPlacement,
  updateUserBalance,
};
