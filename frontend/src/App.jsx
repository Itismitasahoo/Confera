import { useState } from "react";
import "./App.css";
import LandingPage from "./pages/landing.jsx";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import VideoMeetComponent from "./pages/videoMeet.jsx";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route path="/video-meet" element={<VideoMeetComponent />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
