import { useState } from "react";
import axios from "axios";
import "./Auth.css";

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "/api/v1/auth/login",
        { email, password }
      );

      if (response.data.success) {
        // Save token to localStorage
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("uid", response.data.uid);

        // Call parent callback
        onLoginSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1>AI-DMOS Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-link">
          Don&rsquo;t have an account?{" "}
          <a
            href="#register"
            onClick={(e) => {
              e.preventDefault();
              onSwitchToRegister();
            }}
          >
            Register here
          </a>
        </p>
      </div>
    </div>
  );
}
