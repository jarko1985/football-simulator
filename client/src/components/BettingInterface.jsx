import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BettingInterface = ({
  match,
  userBalance,
  setUserBalance,
  socket,
  userId,
}) => {
  const [betAmount, setBetAmount] = useState("");
  const [predictedOutcome, setPredictedOutcome] = useState("");
  const navigate = useNavigate();

  const placeBet = (e) => {
    e.preventDefault();

    // Validations
    if (isNaN(betAmount)) {
      toast.error("Please enter a valid number for bet amount");
      return;
    }

    const betAmountNumber = parseFloat(betAmount);

    if (betAmountNumber <= 0) {
      toast.error("Bet amount must be greater than zero");
      return;
    }

    if (betAmountNumber > userBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!predictedOutcome) {
      toast.error("Please select a predicted outcome");
      return;
    }

    // End Of Validations

    socket.emit(
      "placeBet",
      {
        userId: userId,
        matchId: match._id,
        amount: betAmountNumber,
        predictedOutcome,
      },
      (response) => {
        if (response.status === "success") {
          toast.success("Bet Placed Successfully");
          setUserBalance((prev) => prev - betAmountNumber);
        } else {
          toast.error(`Bet placement failed: ${response.message}`);
        }
      }
    );
  };

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:3001/api/auth/logout",
        {},
        { withCredentials: true }
      );
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Error logging out. Please try again.");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto">
      <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
        Bet on the Match
      </h3>
      <p className="text-gray-600 text-center mb-6">
        Your Balance:{" "}
        <span className="text-green-600 font-bold">${userBalance}</span>
      </p>
      <form onSubmit={placeBet} className="space-y-4">
        <div>
          <label
            htmlFor="betAmount"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Bet Amount:
          </label>
          <input
            type="number"
            id="betAmount"
            value={betAmount}
            onChange={(e) => setBetAmount(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount to bet"
            min="1"
            step="0.01"
          />
        </div>
        <div>
          <label
            htmlFor="predictedOutcome"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Predicted Outcome:
          </label>
          <select
            id="predictedOutcome"
            value={predictedOutcome}
            onChange={(e) => setPredictedOutcome(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="" disabled>
              Select an outcome
            </option>
            <option value="win">{match?.teamA} Win</option>
            <option value="draw">Draw</option>
            <option value="loss">{match?.teamB} Win</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Place Bet
        </button>
      </form>
      <button
        onClick={handleLogout}
        className="mt-4 w-full py-2 px-4 bg-red-500 text-white font-semibold rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      >
        Logout
      </button>
    </div>
  );
};

export default BettingInterface;
