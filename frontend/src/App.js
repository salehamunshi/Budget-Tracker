import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from './pages/Transactions';
// import Budget from './pages/Budget';
// import Analytics from './pages/Analytics';
import "./App.css";

const App = () => {
  return (
    <Router>
      <AppWithRouting />
    </Router>
  );
};

const AppWithRouting = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  const ProtectedRoute = ({ element }) => {
    return isLoggedIn ? element : <Login />;
  };

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<Dashboard />} />}
        />
        <Route path="/transactions" element={<ProtectedRoute element={<Transactions />} />} />
        {/* <Route path="/budget" element={<ProtectedRoute element={<Budget />} />} />
        <Route path="/analytics" element={<ProtectedRoute element={<Analytics />} />} /> */}
      </Routes>
    </>
  );
};

export default App;
