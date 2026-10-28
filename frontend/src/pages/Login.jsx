import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../Auth.css";
import Toast from "../Toast.jsx";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setToast("Please enter username and password");

      setTimeout(() => {
        setToast("");
      }, 3000);

      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        sessionStorage.setItem("toastMessage", "Login successful!");
        sessionStorage.setItem("toastType", "success");

        navigate("/");
      } else {
        setToast(data.message || "Login failed");

        setTimeout(() => {
          setToast("");
        }, 3000);
      }
    } catch (error) {
      setToast("Username or Password is invalid");

      setTimeout(() => {
        setToast("");
      }, 3000);
    }
  };

  return (
    <div className="authPage">
      {toast && <Toast message={toast} onClose={() => setToast("")} />}

      <div className="authLogo">CONFERA</div>

      <div className="authCard">
        <div className="authHeader">
          <p className="authTag">WELCOME BACK</p>

          <h1>Sign in to Confera</h1>

          <p>Connect with your people and continue your conversations.</p>
        </div>

        <form onSubmit={handleLogin} className="authForm">
          <div className="inputGroup">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <label>Password</label>

            <div className="passwordInput">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                className="passwordToggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button type="submit" className="authButton">
            Sign In
          </button>
        </form>

        <p className="authSwitch">
          Don't have an account?
          <Link to="/register"> Create one</Link>
        </p>
      </div>

      <p className="authFooter">Simple meetings. Meaningful connections.</p>
    </div>
  );
}
