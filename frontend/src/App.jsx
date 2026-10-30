import { useState } from "react";
import "./App.css";
import LandingPage from "./pages/landing.jsx";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Register from "./pages/Register.jsx";
import Login from "./pages/Login.jsx";
import VideoMeetComponent from "./pages/videoMeet.jsx";
import History from "./pages/history.jsx";
import { AuthProvider } from "./pages/contexts/AuthContext.jsx";
import HomeComponent from "./pages/home.jsx";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          <Route path="/video-meet" element={<VideoMeetComponent />} />
          <Route
            path="/video-meet/:meetingCode"
            element={<VideoMeetComponent />}
          />

          <Route path="/history" element={<History />} />
          <Route path="/home" element={<HomeComponent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
