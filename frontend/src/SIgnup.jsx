import { useState } from "react";
import "./App.css";
import API from "./api/api";

function Signup({ onLogin }) {
  const [mode, setMode] = useState("signup");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function switchMode(newMode) {
    setMode(newMode);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  }

  function getErrorMessage(data) {
    const messages = [];

    if (data && typeof data === "object") {
      Object.entries(data).forEach(([field, errors]) => {
        if (Array.isArray(errors)) {
          errors.forEach((message) => {
            messages.push(
              typeof message === "string"
                ? message
                : JSON.stringify(message)
            );
          });
        } else if (typeof errors === "string") {
          messages.push(errors);
        }
      });
    }

    return messages.length > 0
      ? messages.join(" ")
      : "Something went wrong. Please try again.";
  }

  async function handleSignup() {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await API.post("/register/", {
        username,
        email,
        password,
      });

      console.log(
        "Registration successful:",
        response.data
      );

      setSuccess(
        response.data?.message ||
          "Account created successfully!"
      );

      setTimeout(() => {
        setMode("login");
        setSuccess("");
        setConfirmPassword("");
        setPassword("");
      }, 800);
    } catch (error) {
      console.error(
        "Registration request failed:",
        error.response?.data || error
      );

      if (error.response?.data) {
        setError(
          getErrorMessage(error.response.data)
        );
      } else {
        setError(
          "Could not connect to the server."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin() {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await API.post("/login/", {
        username,
        password,
      });

      const data = response.data;

      console.log("Login successful:", data);

      if (data.access) {
        localStorage.setItem(
          "access_token",
          data.access
        );
      }

      if (data.refresh) {
        localStorage.setItem(
          "refresh_token",
          data.refresh
        );
      }

      if (!data.access) {
        setError(
          "Login succeeded, but no access token was returned."
        );
        return;
      }

      onLogin();
    } catch (error) {
      console.error(
        "Login request failed:",
        error.response?.data || error
      );

      if (error.response?.data) {
        setError(
          getErrorMessage(error.response.data)
        );
      } else {
        setError(
          "Could not connect to the server."
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (mode === "signup") {
      await handleSignup();
    } else {
      await handleLogin();
    }
  }

  const isSignup = mode === "signup";

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>
          {isSignup
            ? "Create account"
            : "Welcome back"}
        </h1>

        <p className="subtitle">
          {isSignup
            ? "Create your household energy account."
            : "Log in to your household energy account."}
        </p>

        <form onSubmit={handleSubmit}>

          {isSignup && (
            <>
              <label htmlFor="signup-username">
                Username
              </label>

              <input
                id="signup-username"
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                required
              />

              <label htmlFor="email">
                Email
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </>
          )}

          {!isSignup && (
            <>
              <label htmlFor="login-username">
                Username
              </label>

              <input
                id="login-username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(event) =>
                  setUsername(event.target.value)
                }
                required
              />
            </>
          )}

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder={
              isSignup
                ? "Create a password"
                : "Enter your password"
            }
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            required
          />

          {isSignup && (
            <>
              <label htmlFor="confirm-password">
                Confirm password
              </label>

              <input
                id="confirm-password"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(
                    event.target.value
                  )
                }
                required
              />
            </>
          )}

          {error && (
            <p className="form-error">
              {error}
            </p>
          )}

          {success && (
            <p className="form-success">
              {success}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? isSignup
                ? "Creating account..."
                : "Logging in..."
              : isSignup
                ? "Create account"
                : "Log in"}
          </button>

        </form>

        <p className="signup-text">
          {isSignup ? (
            <>
              Already have an account?{" "}

              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  switchMode("login");
                }}
              >
                Log in
              </a>
            </>
          ) : (
            <>
              Don't have an account?{" "}

              <a
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  switchMode("signup");
                }}
              >
                Create account
              </a>
            </>
          )}
        </p>

      </div>
    </div>
  );
}

export default Signup;