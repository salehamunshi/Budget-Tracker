const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  debitCards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DebitCard", // Reference to DebitCard model
    },
  ],
  creditCards: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CreditCard", // Reference to CreditCard model
    },
  ],
  transactions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction", // Reference to Transaction model
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
