const express = require("express");
const Transaction = require("../models/Transaction");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// GET /api/transactions? page, limit, filters
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

  // Use req.user.id (as set by authMiddleware) for user-based filtering
  const query = { userId: req.user.id };

  // Numeric filters
  if (minAmount && !isNaN(minAmount)) {
    query.amount = { ...query.amount, $gte: parseFloat(minAmount) };
  }
  if (maxAmount && !isNaN(maxAmount)) {
    query.amount = { ...query.amount, $lte: parseFloat(maxAmount) };
  }

  // Date filters (assuming createdAt is your date field)
  if (startDate && !isNaN(new Date(startDate))) {
    query.createdAt = { ...query.createdAt, $gte: new Date(startDate) };
  }
  if (endDate && !isNaN(new Date(endDate))) {
    query.createdAt = { ...query.createdAt, $lte: new Date(endDate) };
  }

  // String filters
  if (merchant && merchant.trim() !== "") {
    query.merchant = { $regex: merchant, $options: "i" };
  }
  if (description && description.trim() !== "") {
    query.description = { $regex: description, $options: "i" };
  }

  try {
    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ transactions });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching transactions",
      error: err.message,
    });
  }
});

// POST /api/transactions (Create a transaction)
router.post("/", authMiddleware, async (req, res) => {
  try {
    // Destructure fields from request body
    const {
      description,
      amount,
      merchant,
      budgetCategoryId, // optional if linking to BudgetCategory
    } = req.body;

    // Safely parse the amount to avoid NaN
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount)) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Create the transaction document
    const transaction = new Transaction({
      userId: req.user.id, // from authMiddleware
      description,
      merchant,
      budgetCategoryId, // store the category ref if present
      amount: numericAmount,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    res.status(500).json({
      message: "Error creating transaction",
      error: err.message,
    });
  }
});

// PUT /api/transactions/:id (Update a transaction)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    // Destructure & parse the amount if present
    const {
      description,
      amount,
      merchant,
      budgetCategoryId,
    } = req.body;

    let numericAmount;
    if (amount !== undefined) {
      numericAmount = parseFloat(amount);
      if (isNaN(numericAmount)) {
        return res.status(400).json({ message: "Invalid amount" });
      }
    }

    // Build an update object only for provided fields
    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (merchant !== undefined) updateData.merchant = merchant;
    if (budgetCategoryId !== undefined) {
      updateData.budgetCategoryId = budgetCategoryId;
    }
    if (numericAmount !== undefined) {
      updateData.amount = numericAmount;
    }

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({
      message: "Error updating transaction",
      error: err.message,
    });
  }
});

// DELETE /api/transactions/:id (Delete a transaction)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Transaction.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Transaction not found" });
    }
    res.json({ message: "Transaction deleted successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Error deleting transaction",
      error: err.message,
    });
  }
});

module.exports = router;
