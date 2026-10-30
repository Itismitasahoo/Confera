import React, { useContext, useState } from "react";
import withAuth from "../utils/withAuth";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Button, IconButton, TextField } from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import { AuthContext } from "./contexts/AuthContext";

function HomeComponent() {
  const navigate = useNavigate();
  const [meetingCode, setMeetingCode] = useState("");

  const { addToUserHistory } = useContext(AuthContext);

  let handleJoinVideoCall = async () => {
    const code = meetingCode.trim();

    if (!code) {
      return;
    }

    try {
      await addToUserHistory(code);
    } catch (e) {
      console.log("Could not save meeting history:", e);
    }

    navigate(`/video-meet/${encodeURIComponent(code)}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="homePage">
      <nav className="homeNav">
        <h2 className="homeLogo">CONFERA</h2>

        <div className="homeNavActions">
          <Button
            className="historyButton"
            onClick={() => navigate("/history")}
            startIcon={<RestoreIcon />}
          >
            History
          </Button>

          <Button className="logoutButton" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </nav>

      <main className="homeContent">
        <div className="joinMeetingSection">
          <h1>Join a Meeting</h1>

          <p>Enter your meeting code below to connect with others.</p>

          <div className="meetingForm">
            <TextField
              fullWidth
              value={meetingCode}
              onChange={(e) => setMeetingCode(e.target.value)}
              label="Meeting Code"
              variant="outlined"
              className="meetingCodeInput"
            />

            <Button
              variant="contained"
              onClick={handleJoinVideoCall}
              disabled={!meetingCode.trim()}
              className="joinButton"
            >
              Join Meeting
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default withAuth(HomeComponent);
