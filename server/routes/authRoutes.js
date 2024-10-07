const express = require("express");
const router = express.Router();
const authToken = require("../middlewares/authMiddleware");

const {
  registerUser,
  loginUser,
  dashboard,
  logoutUser,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/dashboard", authToken, dashboard);

module.exports = router;
