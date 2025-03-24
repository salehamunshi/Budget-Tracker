const mongoose = require("mongoose");

const CreditCardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  balance: { type: Number, required: true, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to the User model
});

const CreditCard = mongoose.model("CreditCard", CreditCardSchema);

module.exports = CreditCard;
