import { useState } from "react";
import "./App.css";

function Signup({ onLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    console.log({
      username,
      email,
      password,
    });
  }

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>Create account</h1>

        <p className="subtitle">
          Create your household energy account.
        </p>

        <form onSubmit={handleSubmit}>
          <label>Username</label>

          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <label>Email</label>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label>Password</label>

          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <label>Confirm password</label>

          <input
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          <button type="submit">
            Create account
          </button>
        </form>

        <p className="signup-text">
          Already have an account?{" "}
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onLogin();
            }}
          >
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}

export default Signup;