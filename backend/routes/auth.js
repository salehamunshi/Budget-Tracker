const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const DebitCard = require("../models/DebitCard");
const CreditCard = require("../models/CreditCard");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Signup Route with Password Validation
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Password validation
    const passwordErrors = [];
    if (password.length < 8) passwordErrors.push("at least 8 characters");
    if (!/[A-Z]/.test(password)) passwordErrors.push("one uppercase letter");
    if (!/[a-z]/.test(password)) passwordErrors.push("one lowercase letter");
    if (!/\d/.test(password)) passwordErrors.push("one number");
    if (!/[!@#$%^&]/.test(password))
      passwordErrors.push("one special character (!@#$%^&)");

    if (passwordErrors.length > 0) {
      return res.status(400).json({
        message: `Password must include: ${passwordErrors.join(", ")}`,
      });
    }

    // Check if email or username already exists
    let user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ message: "User already exists with this email" });

    // Check if username already exists
    user = await User.findOne({ username });
    if (user)
      return res.status(400).json({ message: "Username already taken" });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "2h",
    });

    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/debitCards", authMiddleware, async (req, res) => {
  const { name, balance } = req.body; // Get DebitCard details from the request body
  const userId = req.user.id; // Get user ID from the JWT token (set by authMiddleware)

  try {
    // Create a new DebitCard linked to the userId
    const newDebitCard = new DebitCard({
      name,
      balance,
      userId, // Link the DebitCard to the authenticated user
    });

    await newDebitCard.save(); // Save the DebitCard to the database
    res.status(201).json({
      message: "Debit Card created successfully",
      debitCard: newDebitCard,
    });
  } catch (error) {
    console.error("Error creating Debit Card:", error);
    res.status(500).json({ message: "Error creating Debit Card" }); // Return error if something goes wrong
  }
});

router.post("/creditCard", authMiddleware, async (req, res) => {
  const { name, balance } = req.body;
  try {
    const creditCard = new CreditCard({
      name,
      balance,
      userId: req.user.id,
    });
    await creditCard.save();
    res.status(201).json(creditCard);
  } catch (error) {
    console.error("Error creating credit card:", error);
    res.status(500).json({ message: "Error creating credit card" });
  }
});

router.post("/transaction", authMiddleware, async (req, res) => {
  const { description, amount, merchant } = req.body;

  try {
    // Create the transaction
    const newTransaction = new Transaction({
      description,
      amount,
      merchant,
      userId: req.user.id, // User is from the token payload
    });

    await newTransaction.save();
    res
      .status(201)
      .json({ message: "Transaction created", transaction: newTransaction });
  } catch (error) {
    console.error(
      "Error creating transaction:",
      error.message,
      error.errors || error
    );
    res.status(500).json({ message: "Server error" });
  }
});

// Example backend route for updating a DebitCard
router.put("/debitCards/:debitCardId", authMiddleware, async (req, res) => {
  try {
    const { debitCardId } = req.params;
    const { name, balance } = req.body;

    const debitCard = await DebitCard.findById(debitCardId);

    if (!debitCard) {
      return res.status(404).json({ message: "Debit Card not found" });
    }

    debitCard.name = name;
    debitCard.balance = balance;

    await debitCard.save();

    res
      .status(200)
      .json({ message: "debit Card updated successfully", debitCard });
  } catch (error) {
    console.error("Error updating debit Card:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.delete("/debitCards/:debitCardId", authMiddleware, async (req, res) => {
  try {
    const { debitCardId } = req.params;

    const debitCard = await DebitCard.findByIdAndDelete(debitCardId);

    if (!debitCard) {
      return res.status(404).json({ message: "Debit Card not found" });
    }

    res.status(200).json({ message: "Debit Card deleted successfully" });
  } catch (error) {
    console.error("Error deleting debit Card:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
