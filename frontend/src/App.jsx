import { useState } from "react";
import "./App.css";
import Signup from "./Signup";

function Login({ onSignup }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    console.log({
      email,
      password,
    });
  }

  return (
    <div className="login-page">
      <div className="login-card">
        

        <h1>Welcome back</h1>

        <p className="subtitle">
          Log in to your household energy account.
        </p>

        <form onSubmit={handleSubmit}>
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
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <button type="submit">
            Log in
          </button>
        </form>

        <p className="signup-text">
          Don't have an account?{" "}
          <a
            href="#"
            onClick={(event) => {
              event.preventDefault();
              onSignup();
            }}
          >
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

function App() {
  const [page, setPage] = useState("login");

  if (page === "signup") {
    return <Signup onLogin={() => setPage("login")} />;
  }

  return <Login onSignup={() => setPage("signup")} />;
}

export default App;