const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already Exists!!" });
    }
    user = new User({
      name,
      email,
      password: await bcrypt.hash(password, 10),
    });

    await user.save();
    res.status(201).json({ message: "User Created Successfully!!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid Credentials!!" });
    }
    const isMatching = await bcrypt.compare(password, user.password);
    if (!isMatching) {
      return res.status(400).json({ message: "Invalid Credentials!!" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token, { httpOnly: true, maxAge: 3600000 });
    res.status(200).json({ message: "Login Successful", token });
  } catch (error) {
    res.status(500).json({ message: "Server Error!!" });
  }
};

const logoutUser = (req, res) => {
  try {
    res.clearCookie("token");
    res.status(200).json({ message: "Logout Successful" });
  } catch (error) {
    res.status(500).json({ message: "Server Error!!" });
  }
};

const dashboard = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;
    const user = await User.findById(userId).populate("bets");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ userId: user._id, balance: user.balance, bets: user.bets });
  } catch (error) {
    console.error("Error decoding token or fetching user data:", error);
    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { registerUser, loginUser, logoutUser, dashboard };
