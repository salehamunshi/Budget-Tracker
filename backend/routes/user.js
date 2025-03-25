const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const DebitCard = require("../models/DebitCard");
const CreditCard = require("../models/CreditCard");
const Transaction = require("../models/Transaction");
const BudgetCategory = require("../models/BudgetCategories");
const User = require("../models/User");

// Basic user data
router.get("/data", authMiddleware, async (req, res) => {
  try {
    const userData = await User.findById(req.user.id);
    if (!userData) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(userData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Full user summary: cards + transactions
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const debitCards = await DebitCard.find({ userId: req.user.id });
    const creditCards = await CreditCard.find({ userId: req.user.id });
    const transactions = await Transaction.find({ userId: req.user.id });
    const budgets = await BudgetCategory.find({ userId: req.user.id });

    res.json({ debitCards, creditCards, transactions, budgets });
  } catch (error) {
    console.error("Error fetching user summary:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;