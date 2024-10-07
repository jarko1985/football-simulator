const Match = require("../models/Match");
const Bet = require("../models/Bet");
const User = require("../models/User");
const EventEmitter = require("events");
const { updateUserBalance } = require("../controllers/betController");

const matchEventEmitter = new EventEmitter();

module.exports = (io) => {
  const teams = [
    "Barcelona",
    "Real Madrid",
    "InterMilan",
    "Roma",
    "Bayern Munich",
    "Arsenal",
    "ManchesterCity",
    "Chelsea",
    "Manchester United",
    "Prussia Dortmund",
    "Liverpool",
  ];

  const createMatch = async () => {
    try {
      let teamA = teams[Math.floor(Math.random() * teams.length)];
      let teamB;
      do {
        teamB = teams[Math.floor(Math.random() * teams.length)];
      } while (teamA === teamB);

      const odds = {
        teamAWin: parseFloat((Math.random() * 3 + 1).toFixed(2)),
        draw: parseFloat((Math.random() * 2 + 1).toFixed(2)),
        teamBWin: parseFloat((Math.random() * 3 + 1).toFixed(2)),
      };

      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 10 * 60 * 1000);
      const match = new Match({
        teamA,
        teamB,
        odds,
        startTime,
        endTime,
        result: "pending",
      });

      await match.save();
      matchEventEmitter.emit("matchCreated", match);
      simulateMatchEvents(match._id);
      setTimeout(() => resolveMatch(match._id), 10 * 60 * 1000);
    } catch (err) {
      console.error("Error generating match:", err);
    }
  };

  const simulateMatchEvents = (matchId) => {
    const eventInterval = setInterval(async () => {
      const match = await Match.findById(matchId);
      if (!match || match.result !== "pending") {
        clearInterval(eventInterval);
        return;
      }

      const randomEvent = Math.random();
      if (randomEvent < 0.3) {
        const goalScoredBy = Math.random() > 0.5 ? match.teamA : match.teamB;
        matchEventEmitter.emit("goalScored", { matchId, team: goalScoredBy });
      } else {
        match.odds.teamAWin = parseFloat((Math.random() * 3 + 1).toFixed(2));
        match.odds.draw = parseFloat((Math.random() * 2 + 1).toFixed(2));
        match.odds.teamBWin = parseFloat((Math.random() * 3 + 1).toFixed(2));
        await match.save();
        matchEventEmitter.emit("oddsChange", match);
      }
    }, 60 * 1000);
  };

  const resolveMatch = async (matchId) => {
    try {
      const match = await Match.findById(matchId);
      if (!match) return;

      const outcomes = ["teamA", "draw", "teamB"];
      match.result = outcomes[Math.floor(Math.random() * outcomes.length)];
      await match.save();

      matchEventEmitter.emit("matchResolved", match);

      createMatch();
    } catch (err) {
      console.error("Error resolving match:", err);
    }
  };

  matchEventEmitter.on("matchCreated", (match) => {
    console.log(`Match Created: ${match._id}`);
    io.emit("matchUpdate", { type: "matchCreated", match });
  });

  matchEventEmitter.on("goalScored", (data) => {
    console.log(`Goal Scored by: ${data.team} in match ${data.matchId}`);
    io.emit("matchUpdate", {
      type: "goalScored",
      matchId: data.matchId,
      team: data.team,
    });
  });

  matchEventEmitter.on("oddsChange", (match) => {
    console.log(`Odds changed for match ${match._id}`);
    io.emit("matchUpdate", { type: "oddsChange", match });
  });

  matchEventEmitter.on("matchResolved", async (match) => {
    console.log(`Match Resolved: ${match._id} with result: ${match.result}`);
    io.emit("matchUpdate", { type: "matchResolved", match });

    const bets = await Bet.find({ matchId: match._id, status: "pending" });

    for (const bet of bets) {
      let isWon = false;
      if (
        (match.result === "teamA" && bet.predictedOutcome === "win") ||
        (match.result === "draw" && bet.predictedOutcome === "draw") ||
        (match.result === "teamB" && bet.predictedOutcome === "loss")
      ) {
        isWon = true;
        bet.status = "won";
        console.log(bet.userId);
        await updateUserBalance(bet.userId, bet.potentialWinnings, "add");
      } else {
        bet.status = "lost";
      }

      await bet.save();
    }
  });
  createMatch();
};
