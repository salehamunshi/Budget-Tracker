import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

const Navbar = ({ isLoggedIn, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2 className="logo">Budget Tracker</h2>
        {isLoggedIn && (
          <ul className="nav-links">
            <li>
              <Link to="/dashboard">Home</Link>
            </li>
            <li>
              <Link to="/transactions">Transactions</Link>
            </li>
            <li>
              <Link to="/budget">Budget</Link>
            </li>
            <li>
              <Link to="/analytics">Spending Analytics</Link>
            </li>
          </ul>
        )}
      </div>

      {isLoggedIn && (
        <button className="logout-button" onClick={onLogout}>
          Logout
        </button>
      )}
    </nav>
  );
};

export default Navbar;
