import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/Login.css";

const Login = ({ setIsLoggedIn }) => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset the error state on form submit

    try {
      // Send the login data to the backend API
      const res = await axios.post(
        "http://localhost:5001/api/auth/login", // Make sure this endpoint is correct
        formData
      );

      // Check if the response contains a token (successful login)
      if (res.data.token) {
        // Store the token in localStorage for future requests
        localStorage.setItem("token", res.data.token);
        setIsLoggedIn(true); // Update the isLoggedIn state
        // Navigate the user to the dashboard after successful login
        navigate("/dashboard");
      }
    } catch (err) {
      // Set the error message based on the response from the backend
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <Layout>
      <div className="login-container">
        <h2>Welcome Back</h2>

        {/* Display any error message */}
        {error && <p className="error">{error}</p>}

        {/* Login form */}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            onChange={handleChange}
          />
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"} // Toggle between password and text input
              name="password"
              placeholder="Password"
              required
              onChange={handleChange}
            />
            <span
              onClick={() => setShowPassword(!showPassword)} // Toggle password visibility
              className="eye-icon"
            >
              {showPassword ? (
                <i className="fas fa-eye"></i> // Eye icon for visible password
              ) : (
                <i className="fas fa-eye-slash"></i> // Eye-slash icon for hidden password
              )}
            </span>
          </div>

          <button type="submit">Log in</button>
        </form>

        <p>
          Don't have an account? <br />
          <a href="/signup">Sign up</a>
        </p>
      </div>
    </Layout>
  );
};

export default Login;
