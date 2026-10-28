import { useState } from "react";
import { Link } from "react-router-dom";
import "../Auth.css";
import Toast from "../Toast.jsx";

export default function Register() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [toast, setToast] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name || !username || !password) {
      setToast({
        message: "Please fill all fields",
        type: "error",
      });

      setTimeout(() => {
        setToast(null);
      }, 3000);

      return;
    }

    try {
      const response = await fetch(
        "http://localhost:8000/api/v1/users/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            username,
            password,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setToast({
          message: "Registration successful!",
          type: "success",
        });

        setName("");
        setUsername("");
        setPassword("");
      } else {
        setToast({
          message: data.message || "Registration failed",
          type: "error",
        });
      }

      setTimeout(() => {
        setToast(null);
      }, 3000);
    } catch (error) {
      setToast({
        message: "Unable to connect to server",
        type: "error",
      });

      setTimeout(() => {
        setToast(null);
      }, 3000);
    }
  };
  return (
    <div className="authPage">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="authLogo">CONFERA</div>

      <div className="authCard">
        <div className="authHeader">
          <p className="authTag">GET STARTED</p>

          <h1>Create your account</h1>

          <p>Join Confera and start connecting with your people.</p>
        </div>

        <form onSubmit={handleRegister} className="authForm">
          <div className="inputGroup">
            <label>Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <label>Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <label>Password</label>
            <div className="passwordInput">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
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
            Create Account
          </button>
        </form>

        <p className="authSwitch">
          Already have an account?
          <Link to="/login"> Sign in</Link>
        </p>
      </div>

      <p className="authFooter">Simple meetings. Meaningful connections.</p>
    </div>
  );
}
