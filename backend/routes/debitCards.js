const express = require("express");
const DebitCard = require("../models/DebitCard");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Create a new debit card
router.post("/", authMiddleware, async (req, res) => {
  const { name, balance } = req.body;
  try {
    const debitCard = new DebitCard({ name, balance, userId: req.user.id });
    await debitCard.save();
    res.status(201).json(debitCard);
  } catch (err) {
    res.status(500).json({ message: "Error creating debit card", error: err.message });
  }
});

// Update debit card
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await DebitCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: "Debit card not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Error updating debit card", error: err.message });
  }
});

// Delete debit card
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await DebitCard.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Debit card not found" });
    res.json({ message: "Debit card deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting debit card", error: err.message });
  }
});

module.exports = router;