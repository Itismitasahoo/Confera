import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "./contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  Button,
  Typography,
  IconButton,
} from "@mui/material";

import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VideoCallIcon from "@mui/icons-material/VideoCall";
import HistoryIcon from "@mui/icons-material/History";

import "../styles/history.css";

export default function History() {
  const { getHistoryOfUser } = useContext(AuthContext);

  const [meetings, setMeetings] = useState([]);
  const [copiedCode, setCopiedCode] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getHistoryOfUser();
        setMeetings(history);
      } catch (error) {
        console.error("Error fetching meeting history:", error);
      }
    };

    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const copyMeetingCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);

      setTimeout(() => {
        setCopiedCode("");
      }, 2000);
    } catch (error) {
      console.error("Could not copy meeting code:", error);
    }
  };

  const joinMeeting = (code) => {
    navigate(`/video-meet/${encodeURIComponent(code)}`);
  };

  return (
    <div className="historyPage">
      <header className="historyHeader">
        <div className="historyHeading">
          <HistoryIcon className="historyHeadingIcon" />
          <Typography variant="h4" className="historyTitle">
            Meeting History
          </Typography>
          <Typography className="historySubtitle">
            Revisit your previous meetings whenever you want.
          </Typography>
        </div>
      </header>

      <main className="historyContent">
        <div className="historyCount">
          <Typography>Your Previous Meetings</Typography>
          <span>{meetings.length} Meetings</span>
        </div>

        {meetings.length > 0 ? (
          <div className="historyGrid">
            {meetings.map((meeting, index) => (
              <Card
                className="historyCard"
                key={meeting._id || `${meeting.meetingCode}-${index}`}
              >
                <CardContent className="historyCardContent">
                  <div className="historyCardTop">
                    <div className="historyVideoIcon">
                      <VideoCallIcon />
                    </div>

                    <span className="historyMeetingNumber">
                      Meeting {index + 1}
                    </span>
                  </div>

                  <Typography className="historyCodeLabel">
                    MEETING CODE
                  </Typography>

                  <div className="historyCodeRow">
                    <Typography className="historyMeetingCode">
                      {meeting.meetingCode}
                    </Typography>

                    <IconButton
                      className="historyCopyButton"
                      onClick={() => copyMeetingCode(meeting.meetingCode)}
                      aria-label="Copy meeting code"
                      title="Copy meeting code"
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </div>

                  <div className="historyDate">
                    <Typography>Date: {formatDate(meeting.date)}</Typography>
                  </div>

                  <CardContent className="historyActions">
                    <Button
                      className="historyJoinButton"
                      variant="contained"
                      onClick={() => joinMeeting(meeting.meetingCode)}
                      startIcon={<VideoCallIcon />}
                    >
                      Join Again
                    </Button>

                    {copiedCode === meeting.meetingCode && (
                      <span className="historyCopiedText">Copied!</span>
                    )}
                  </CardContent>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="historyEmpty">
            <HistoryIcon />
            <Typography variant="h6">No meeting history found</Typography>
            <Typography>Your previous meetings will appear here.</Typography>

            <Button
              className="historyJoinButton"
              variant="contained"
              onClick={() => navigate("/home")}
            >
              Start a Meeting
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
