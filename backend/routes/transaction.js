const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/transaction", authMiddleware, async (req, res) => {
  const { description, amount, merchant } = req.body;

  console.log("Incoming transaction request:", {
    description,
    amount,
    merchant,
  });

  try {
    const newTransaction = new Transaction({
      description,
      amount,
      merchant,
    });

    await newTransaction.save();
    res.status(201).json({
      message: "Transaction created successfully",
      transaction: newTransaction,
    });
  } catch (error) {
    console.error(
      "Error creating transaction:",
      error.message,
      error.errors || error
    );
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update transaction by ID
router.put("/transaction/:id", authMiddleware, async (req, res) => {
  try {
    const transactionId = req.params.id;
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      transactionId,
      req.body,
      { new: true }
    );
    res.json(updatedTransaction);
  } catch (err) {
    res.status(500).json({ message: "Error updating transaction" });
  }
});

module.exports = router;
