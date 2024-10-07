const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authMiddleware");

const {
  placeBet,
  getAvailableMatches,
  getUserBets,
} = require("../controllers/betController");

router.post("/place-bet", authToken, placeBet);
router.get("/user-bets", authToken, getUserBets);
router.get("/available-matches", authToken, getAvailableMatches);

module.exports = router;
