require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/auth"); // Import the auth routes (login, register)
const userRoutes = require("./routes/userData"); // Import the user data routes (protected)
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Use the authRoutes to handle login and register routes
app.use("/api/auth", authRoutes); // This will handle /api/auth/login and /api/auth/register

// Use the userRoutes to handle user data fetching (protected)
app.use("/api/user", userRoutes); // This will handle /api/user/data route

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Simple test route
app.get("/", (req, res) => {
  res.send("Budget Tracker API is running...");
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
