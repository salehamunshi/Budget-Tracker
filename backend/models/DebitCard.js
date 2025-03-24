const mongoose = require("mongoose");

const DebitCardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  balance: { type: Number, required: true, default: 0 },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Link to the User model
});

const DebitCard = mongoose.model("DebitCard", DebitCardSchema);

module.exports = DebitCard;
