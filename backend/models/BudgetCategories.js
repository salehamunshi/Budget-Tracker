const mongoose = require("mongoose");

const budgetCategorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  month: { type: String, required: true },
});

const BudgetCategory = mongoose.model("BudgetCategory", budgetCategorySchema);
module.exports = BudgetCategory;
