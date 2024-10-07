import { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BettingInterface from "../components/BettingInterface";
import toast, { Toaster } from "react-hot-toast";

const socket = io("http://localhost:3001");

const Dashboard = () => {
  const canvasRef = useRef(null);
  const [match, setMatch] = useState({ teamA: "", teamB: "" });
  const [timeLeft, setTimeLeft] = useState(null);
  const [score, setScore] = useState({ teamA: 0, teamB: 0 });
  const [userId, setUserId] = useState("");
  const [userBalance, setUserBalance] = useState(1000);
  const navigate = useNavigate();

  const [players, setPlayers] = useState([]);
  const [ballPosition, setBallPosition] = useState({ x: 400, y: 200 });

  useEffect(() => {
    const initialPlayers = [
      // Team A
      { team: "A", x: 100, y: 100 },
      { team: "A", x: 150, y: 150 },
      { team: "A", x: 100, y: 250 },
      // Team B
      { team: "B", x: 700, y: 100 },
      { team: "B", x: 650, y: 150 },
      { team: "B", x: 700, y: 250 },
    ];
    setPlayers(initialPlayers);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/auth/dashboard",
          {
            withCredentials: true,
          }
        );

        setUserId(response.data.userId);
        setUserBalance(response.data.balance);
      } catch (err) {
        console.error(err);
        navigate("/login");
      }
    };

    fetchDashboard();
  }, [navigate]);

  useEffect(() => {
    let timerInterval;

    if (match.startTime && match.endTime) {
      timerInterval = setInterval(() => {
        const now = new Date();
        const endTime = new Date(match.endTime);
        const timeDiff = endTime - now;

        if (timeDiff > 0) {
          const minutes = Math.floor(timeDiff / (1000 * 60));
          const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
          setTimeLeft(`${minutes}:${seconds < 10 ? "0" : ""}${seconds}`);
        } else {
          setTimeLeft("Match Ended");
          clearInterval(timerInterval);
        }
      }, 1000);
    }

    return () => clearInterval(timerInterval);
  }, [match.startTime, match.endTime]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const animationInterval = setInterval(() => {
      movePlayers();
      moveBall();
      drawPlayersAndBall(ctx);
    }, 100);

    socket.on("matchUpdate", (update) => {
      handleMatchUpdate(update);
    });

    socket.on("betUpdate", (betResult) => {
      if (betResult.status === "won") {
        toast.success(
          `You won a bet on ${betResult.matchId}! Your winnings: $${betResult.potentialWinnings}`
        );
      } else if (betResult.status === "lost") {
        toast.error(
          `You lost a bet on ${betResult.matchId}. Better luck next time!`
        );
      }
    });

    return () => {
      clearInterval(animationInterval);
      socket.off("matchUpdate");
      socket.off("betUpdate");
    };
  }, [players, ballPosition]);

  useEffect(() => {
    drawPlayersAndBall(canvasRef.current.getContext("2d"));
  }, [score, match]);

  const drawPlayersAndBall = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "green";
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(ctx.canvas.width / 2, 0);
    ctx.lineTo(ctx.canvas.width / 2, ctx.canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(ctx.canvas.width / 2, ctx.canvas.height / 2, 50, 0, 2 * Math.PI);
    ctx.stroke();

    players.forEach((player) => {
      ctx.beginPath();
      ctx.arc(player.x, player.y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = player.team === "A" ? "blue" : "red";
      ctx.fill();
    });

    ctx.beginPath();
    ctx.arc(ballPosition.x, ballPosition.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "white";
    ctx.fill();
  };

  const movePlayers = () => {
    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => ({
        ...player,
        x: Math.max(
          10,
          Math.min(
            canvasRef.current.width - 10,
            player.x + (Math.random() - 0.5) * 10
          )
        ),
        y: Math.max(
          10,
          Math.min(
            canvasRef.current.height - 10,
            player.y + (Math.random() - 0.5) * 10
          )
        ),
      }))
    );
  };

  const moveBall = () => {
    setBallPosition((prevPosition) => ({
      x: Math.max(
        10,
        Math.min(
          canvasRef.current.width - 10,
          prevPosition.x + (Math.random() - 0.5) * 15
        )
      ),
      y: Math.max(
        10,
        Math.min(
          canvasRef.current.height - 10,
          prevPosition.y + (Math.random() - 0.5) * 15
        )
      ),
    }));
  };

  const handleMatchUpdate = (update) => {
    switch (update.type) {
      case "matchCreated":
        setMatch(update.match);
        setScore({ teamA: 0, teamB: 0 });
        break;
      case "goalScored":
        if (update.team === match.teamA) {
          setScore((prev) => ({ ...prev, teamA: prev.teamA + 1 }));
        } else {
          setScore((prev) => ({ ...prev, teamB: prev.teamB + 1 }));
        }
        toast.success(`Goal scored by ${update.team}`);
        break;
      case "matchResolved":
        toast(`Match ${update.match._id} has ended.`);
        setTimeLeft("Match Ended");
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-[1200px] mx-auto text-center">
      <Toaster position="top-right" reverseOrder={false} />
      <h2 className="text-2xl font-bold mb-4">Live Match Visualization</h2>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        className="border-4 border-gray-700 rounded-lg mb-4 w-full max-w-screen-md mx-auto"
      ></canvas>
      <p className="text-xl font-semibold mb-2">Time Left: {timeLeft}</p>
      <p className="text-xl mb-4">
        Score: {match?.teamA} {score.teamA} - {score.teamB} {match?.teamB}
      </p>
      {match && (
        <BettingInterface
          match={match}
          userBalance={userBalance}
          setUserBalance={setUserBalance}
          socket={socket}
          userId={userId}
        />
      )}
    </div>
  );
};

export default Dashboard;
