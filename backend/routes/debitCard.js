const express = require("express");
const DebitCard = require("../models/DebitCard");
const User = require("../models/User"); // User model
const router = express.Router();

router.post("/", async (req, res) => {
  const { name, balance, userId } = req.body;

  try {
    // Check if the user exists by userId
    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Create a new debit card and link it to the user
    const newDebitCard = new DebitCard({ name, balance, userId });
    await newDebitCard.save();

    user.debitCards.push(newDebitCard._id);
    await user.save();

    res
      .status(201)
      .json({
        message: "DebitCard created successfully",
        debitCard: newDebitCard,
      });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
