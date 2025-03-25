const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const {
    page = 1,
    limit = 10,
    minAmount,
    maxAmount,
    startDate,
    endDate,
    merchant,
    description,
  } = req.query;

  const query = { userId: req.user.id };

  if (minAmount && !isNaN(minAmount)) {
    query.amount = { ...query.amount, $gte: parseFloat(minAmount) };
  }

  if (maxAmount && !isNaN(maxAmount)) {
    query.amount = { ...query.amount, $lte: parseFloat(maxAmount) };
  }

  if (startDate && !isNaN(new Date(startDate))) {
    query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
  }

  if (endDate && !isNaN(new Date(endDate))) {
    query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
  }

  if (merchant && merchant.trim() !== "") {
    query.merchant = { $regex: merchant, $options: "i" };
  }

  if (description) query.description = { $regex: description, $options: "i" };

  try {
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ transactions });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching transactions", error: err.message });
  }
});

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
    res
      .status(500)
      .json({ message: "Error creating transaction", error: err.message });
  }
});

// Update a transaction
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Transaction not found" });
    res.json(updated);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating transaction", error: err.message });
  }
});

// Delete a transaction
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Transaction not found" });
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error deleting transaction", error: err.message });
  }
});

module.exports = router;
