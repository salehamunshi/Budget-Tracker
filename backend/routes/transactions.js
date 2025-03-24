// routes/transactions.js
const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Create a transaction
router.post("/", authMiddleware, async (req, res) => {
  const { description, amount, merchant } = req.body;
  try {
    const transaction = new Transaction({
      description,
      amount,
      merchant,
      userId: req.user.id,
    });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({ message: "Error creating transaction", error: err.message });
  }
});

// Update a transaction
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Transaction not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating transaction", error: err.message });
  }
});

// Delete a transaction
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting transaction", error: err.message });
  }
});

module.exports = router;