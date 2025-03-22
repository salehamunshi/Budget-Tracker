import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../styles/Home.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="home-content">
        <h1>Budget Tracker</h1>
        <div className="button-container">
          <button onClick={() => navigate("/login")}>Log In</button>
          <button onClick={() => navigate("/signup")}>Sign Up</button>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
