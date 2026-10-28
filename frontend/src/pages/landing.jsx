import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../App.css";
import Toast from "../Toast.jsx";

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const navigate = useNavigate();
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [meetingCode, setMeetingCode] = useState("");

  const [toast, setToast] = useState("");
  const [toastType, setToastType] = useState("error");

  useEffect(() => {
    const message = sessionStorage.getItem("toastMessage");
    const type = sessionStorage.getItem("toastType");

    if (message) {
      setToast(message);
      setToastType(type || "error");

      sessionStorage.removeItem("toastMessage");
      sessionStorage.removeItem("toastType");

      setTimeout(() => {
        setToast("");
      }, 3000);
    }
  }, []);

  const handleStartMeeting = () => {
    if (localStorage.getItem("token")) {
      navigate("/video-meet");
    } else {
      navigate("/login");
    }
  };

  const handleJoinMeeting = () => {
    setShowJoinForm(true);
  };

  const handleJoinSubmit = (e) => {
    e.preventDefault();

    const code = meetingCode.trim();

    if (!code) return;

    // Accept a meeting URL or a room ID.
    let roomId = code;

    try {
      if (code.startsWith("http://") || code.startsWith("https://")) {
        const url = new URL(code);
        roomId = url.pathname.split("/").filter(Boolean).pop();
      }
    } catch {
      setToast("Please enter a valid meeting link or code");
      return;
    }

    if (!roomId) {
      setToast("Please enter a valid meeting link or code");
      return;
    }

    navigate(`/video-meet/${encodeURIComponent(roomId)}`);
  };

  const handleGuestJoin = () => {
    navigate("/video-meet");
  };

  return (
    <div className="landingPage">
      {toast && (
        <Toast message={toast} type={toastType} onClose={() => setToast("")} />
      )}
      {/* Navbar */}
      <nav>
        <div className="navHeader">
          <h2>CONFERA</h2>
        </div>

        <div className="navlist">
          <button
            type="button"
            onClick={handleGuestJoin}
            className="guestButton"
          >
            Join as Guest
          </button>

          {!isLoggedIn ? (
            <>
              <Link to="/login">Login</Link>

              <Link to="/register">
                <button>Register</button>
              </Link>
            </>
          ) : (
            <button
              onClick={() => {
                localStorage.removeItem("token");
                setIsLoggedIn(false);
                setToast("Logged out successfully!");
                setToastType("success");

                setTimeout(() => {
                  setToast("");
                }, 3000);
              }}
            >
              Logout
            </button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="heroSection">
        <div className="heroText">
          <p className="heroTagline">MEET. CONNECT. COLLABORATE.</p>

          <h1>
            Where conversations
            <br />
            <span>come together.</span>
          </h1>

          <p className="heroDescription">
            Connect with your team, friends, and communities through effortless
            video meetings.
          </p>

          <div className="heroButtons">
            <button onClick={handleStartMeeting}>Start a Meeting</button>

            <button onClick={handleJoinMeeting}>Join a Meeting</button>
          </div>

          {showJoinForm && (
            <form onSubmit={handleJoinSubmit} className="landingJoinForm">
              <input
                type="text"
                value={meetingCode}
                onChange={(e) => setMeetingCode(e.target.value)}
                placeholder="Enter meeting code or link"
                aria-label="Meeting code or link"
                required
              />

              <button type="submit">Join Now</button>

              <button type="button" onClick={() => setShowJoinForm(false)}>
                Cancel
              </button>
            </form>
          )}

          <p className="heroTrust">
            ✓ No downloads &nbsp;&nbsp; ✓ Easy to join &nbsp;&nbsp; ✓ Simple
            meetings
          </p>
        </div>

        <div className="heroImage">
          <img src="/mobile.png" alt="Confera meeting" />
        </div>
      </section>

      {/* Features Section */}
      <section className="featuresSection">
        <p className="sectionTag">POWERFUL & SIMPLE</p>

        <h2>Everything you need to connect</h2>

        <p className="sectionDescription">
          Confera brings together everything you need for simple, productive,
          and engaging online conversations.
        </p>

        <div className="featuresContainer">
          {/* Feature 1 */}
          <div className="featureCard">
            <div className="featureIcon">▣</div>

            <h3>HD Video Meetings</h3>

            <p>Connect with clear video and reliable audio.</p>
          </div>

          {/* Feature 2 */}
          <div className="featureCard">
            <div className="featureIcon">✦</div>

            <h3>Real-Time Chat</h3>

            <p>Stay connected with instant messaging during meetings.</p>
          </div>

          {/* Feature 3 */}
          <div className="featureCard">
            <div className="featureIcon">▣</div>

            <h3>Screen Sharing</h3>

            <p>Share your screen and collaborate with everyone.</p>
          </div>

          {/* Feature 4 */}
          <div className="featureCard">
            <div className="featureIcon">⌁</div>

            <h3>Simple Meeting Rooms</h3>

            <p>Create and join meetings without unnecessary complexity.</p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="howItWorksSection">
        <p className="sectionTag">HOW IT WORKS</p>

        <h2>Connect in three simple steps</h2>

        <p className="sectionDescription">
          Start a conversation without complicated setup or unnecessary steps.
        </p>

        <div className="stepsContainer">
          <div className="stepCard">
            <div className="stepNumber">01</div>

            <h3>Create a Meeting</h3>

            <p>Start a meeting room in just a few seconds.</p>
          </div>

          <div className="stepCard">
            <div className="stepNumber">02</div>

            <h3>Share the Link</h3>

            <p>Invite your friends, teammates, or community members.</p>
          </div>

          <div className="stepCard">
            <div className="stepNumber">03</div>

            <h3>Start Connecting</h3>

            <p>Join the conversation with video, audio, and real-time chat.</p>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="ctaSection">
        <p className="sectionTag">READY TO CONNECT?</p>

        <h2>Start your next conversation with Confera.</h2>

        <p>Create your account and start connecting with your people.</p>

        <Link to="/register">
          <button>Get Started</button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>
          Built with <span>&#9829;</span> by{" "}
          <a
            href="https://linkedin.com/in/itismitasahoo"
            target="_blank"
            rel="noopener noreferrer"
          >
            Itismita
          </a>
        </p>
      </footer>
    </div>
  );
}
