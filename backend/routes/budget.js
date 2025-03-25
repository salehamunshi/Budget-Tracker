const express = require("express");
const router = express.Router();
const BudgetCategory = require("../models/BudgetCategories");
const authMiddleware = require("../middleware/authMiddleware");

// Get all budget categories for a user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const categories = await BudgetCategory.find({ userId: req.user._id });
    res.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Error fetching categories", error });
  }
});

// Add a new budget category
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { category, limit, month } = req.body;

    const newBudget = new BudgetCategory({
      userId: req.user.id,
      category,
      limit,
      month,
    });
    await newBudget.save();

    res.status(201).json(newBudget);
  } catch (err) {
    console.error("Error saving budget category:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update an existing budget category
router.put("/:id", authMiddleware, async (req, res) => {
  const { category, limit } = req.body;
  try {
    const updatedCategory = await BudgetCategory.findByIdAndUpdate(
      req.params.id,
      { category, limit },
      { new: true }
    );
    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Error updating category", error });
  }
});

// Delete a budget category
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deletedCategory = await BudgetCategory.findByIdAndDelete(
      req.params.id
    );
    if (!deletedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json({ message: "Category deleted" });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Error deleting category", error });
  }
});

module.exports = router;
