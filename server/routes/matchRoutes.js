const express = require("express");
const router = express.Router();
const { getMatchResults } = require("../controllers/matchController");

router.get("/results", getMatchResults);

module.exports = router;
