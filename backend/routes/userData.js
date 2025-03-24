const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const DebitCard = require("../models/DebitCard");
const CreditCard = require("../models/CreditCard");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

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

router.get("/dataWithDebitCards", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const debitCards = await DebitCard.find({ userId: user._id });
    const creditCards = await CreditCard.find({ userId: user._id });
    const transactions = await Transaction.find({ userId: user._id });

    res.json({ debitCards, creditCards, transactions });
  } catch (error) {
    console.error("Error fetching user data with debit card:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
