import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Simulator from "./pages/Simulator";
import Optimization from "./pages/Optimization";
import Household from "./pages/Household";
import Signup from "./SIgnup";

import "./App.css";

function App() {
  const [authenticated, setAuthenticated] = useState(
    Boolean(localStorage.getItem("access_token"))
  );

  function handleLogin() {
    setAuthenticated(true);
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setAuthenticated(false);
  }

  if (!authenticated) {
    return <Signup onLogin={handleLogin} />;
  }

  return (
    <BrowserRouter>
      <div className="app">

        {/* Sidebar */}
        <aside className="sidebar">

          <div className="logo">
            <div className="logo-mark">H</div>

            <div>
              <h2>EnergyResilience</h2>
              <span>Household Energy</span>
            </div>
          </div>

          <nav className="navigation">

            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span>⌂</span>
              Dashboard
            </NavLink>

            <NavLink
              to="/simulator"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span>▣</span>
              Simulator
            </NavLink>

            <NavLink
              to="/optimization"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span>⚡</span>
              Optimization
            </NavLink>

            <NavLink
              to="/household"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              <span>⚙</span>
              Household
            </NavLink>

          </nav>

          <div className="sidebar-bottom">
            <div className="user-card">

              <div className="user-avatar">
                U
              </div>

              <div>
                <strong>User</strong>
                <span>Household</span>
              </div>

            </div>

            <button
              className="secondary-button"
              onClick={handleLogout}
              style={{
                width: "100%",
                marginTop: "14px",
              }}
            >
              Log out
            </button>
          </div>

        </aside>

        {/* Main content */}
        <main className="main-content">

          <Routes>

            <Route
              path="/"
              element={<Dashboard />}
            />

            <Route
              path="/simulator"
              element={<Simulator />}
            />

            <Route
              path="/optimization"
              element={<Optimization />}
            />

            <Route
              path="/household"
              element={<Household />}
            />

          </Routes>

        </main>

      </div>
    </BrowserRouter>
  );
}

export default App;