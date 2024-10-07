# Real-Time Football Betting System

## Project Overview

This is a real-time football betting system built using the MERN stack (MongoDB, Express, React, Node.js) and WebSocket technology. It allows users to view live match updates on an HTML canvas and place bets on virtual football matches in real-time.

---

## Setup Process

### Prerequisites
- **Node.js** and **npm** installed on your machine.
- A **MongoDB** instance (local or cloud-based like MongoDB Atlas).

### Backend Setup

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
2. Navigate to the server directory and install dependencies:
   ```bash
   cd server
   npm install
3. Create a .env file in the server directory with the following variables:
   ```bash
   PORT=3001
   MONGODB_URI=mongodb+srv://jarko:1234@cluster1.coar6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1
   JWT_SECRET=*^%5VeryDif$fic87ultSecret
 4. Run the server:
    ```bash
    npm start

  The server will start on http://localhost:3001.  

 ### Frontend Setup

 1. Navigate to the client directory:

    ```bash
    cd client
 2. Install client dependencies:

    ```bash
    npm install
3. Run the React client:

   ```bash
   npm run dev

  The frontend will be available at http://localhost:5173.

 ## API Endpoints

### Authentication Endpoints (`/auth`)

| Method | Endpoint     | Description                   |
|--------|--------------|-------------------------------|
| POST   | `/register`  | Register a new user           |
| POST   | `/login`     | Login with email and password |
| POST   | `/logout`    | Logout the current user       |
| GET    | `/dashboard` | Get user details and balance  |


Register a User:
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```
Login a User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Match Endpoints (/matches)
| Method | Endpoint  | Description                |
|--------|-----------|----------------------------|
| GET    | `/current` | Get the current active match |

Get Current Match:
```bash
GET /api/matches/current
```
### Bet Endpoints (/bets)
| Method | Endpoint | Description                      |
|--------|----------|----------------------------------|
| POST   | `/place` | Place a bet on the current match |

Place a Bet
```bash
POST /api/bets/place
Content-Type: application/json

{
  "userId": "<user_id>",
  "matchId": "<match_id>",
  "amount": 100,
  "predictedOutcome": "win"
}
```
## WebSocket Events
Server to Client Events
| Event Name   | Description                              | Payload                                                                                   |
|--------------|------------------------------------------|-------------------------------------------------------------------------------------------|
| `matchUpdate` | Provides real-time updates about matches | `{ type: "matchCreated" / "goalScored" / "matchResolved", match: <match_data> }`          |
| `betUpdate`   | Sends updates about placed bets          | `{ status: "won" / "lost", matchId: <match_id>, potentialWinnings: <amount> }`            |

Client to Server Events
| Event Name | Description             | Payload                                                                                                      |
|------------|-------------------------|--------------------------------------------------------------------------------------------------------------|
| `placeBet` | Places a bet on a match | `{ userId: <user_id>, matchId: <match_id>, amount: <bet_amount>, predictedOutcome: <"win" / "draw" / "loss"> }` |


WebSocket Sample Usage (Frontend)
Listening for Match Updates:
```bash
socket.on("matchUpdate", (update) => {
  console.log(update);
});
```
Placing a Bet:
```bash
socket.emit("placeBet", {
  userId: "<user_id>",
  matchId: "<match_id>",
  amount: 100,
  predictedOutcome: "win"
}, (response) => {
  if (response.status === "success") {
    console.log("Bet placed successfully!");
  }
});
```
## Frontend Usage

### React Components

- **Dashboard**:  
  Displays the live match, user's balance, and betting interface.
  - **File**: `client/src/pages/Dashboard.jsx`

- **Betting Interface**:  
  Provides a form for users to place bets on the active match.
  - **File**: `client/src/components/BettingInterface.jsx`

### Styling

The frontend uses **Tailwind CSS** for styling. You can customize styles in the `client/tailwind.config.js` file.

### Canvas Visualization

The live match is displayed on a canvas with basic visualization of the match events, such as goals and score updates.

---

## Project Structure

### Backend Structure

- **`controllers/`**: Business logic for authentication, matches, and bets.
- **`models/`**: Mongoose schemas for `User`, `Match`, and `Bet`.
- **`routes/`**: API endpoints for authentication, matches, and bets.
- **`services/`**: Manages the match simulation and event broadcasting using WebSocket.

### Frontend Structure

- **`components/`**: Reusable components like `BettingInterface`.
- **`pages/`**: Full pages like `Dashboard` for routing in the app.
- **`App.jsx`**: Main entry point of the React app.
