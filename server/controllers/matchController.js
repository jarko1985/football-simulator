const Match = require("../models/Match");

const getMatchResults = async (req, res) => {
  try {
    const matches = await Match.find({ result: { $ne: "pending" } });
    res.json({ matches });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

module.exports = { getMatchResults };
