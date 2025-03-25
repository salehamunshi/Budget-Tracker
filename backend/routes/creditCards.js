const express = require("express");
const CreditCard = require("../models/CreditCard");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Create a new credit card
router.post("/", authMiddleware, async (req, res) => {
  const { name, balance } = req.body;
  try {
    const creditCard = new CreditCard({ name, balance, userId: req.user.id });
    await creditCard.save();
    res.status(201).json(creditCard);
  } catch (err) {
    res.status(500).json({ message: "Error creating credit card", error: err.message });
  }
});

// Update credit card
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await CreditCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Credit card not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating credit card", error: err.message });
  }
});

// Delete credit card
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await CreditCard.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Credit card not found" });
    res.json({ message: "Credit card deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting credit card", error: err.message });
  }
});

module.exports = router;