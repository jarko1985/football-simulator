require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const cors = require("cors");
const { handleBetPlacement } = require("./controllers/betController");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Connect to database
connectDB();
require("./services/matchSimulator")(io);

// Socket.io connection logic
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("placeBet", async (betData, callback) => {
    try {
      const betResult = await handleBetPlacement(betData);
      io.emit("betUpdate", betResult);
      callback({
        status: "success",
        message: "Bet placed successfully",
        bet: betResult,
      });
    } catch (error) {
      callback({ status: "error", message: error.message });
    }
  });

  // Disconnect handling
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

module.exports.io = io;

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/matches", require("./routes/matchRoutes"));
app.use("/api/bets", require("./routes/betRoutes"));

// Catch All Routes
app.use((req, res) => {
  res.status(404).json({ msg: "Route not found" });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
