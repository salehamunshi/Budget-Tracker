const request = require("supertest");
const app = require("../../server");
const mongoose = require("mongoose");
const User = require("../../models/User");
const DebitCard = require("../../models/DebitCard");
const CreditCard = require("../../models/CreditCard");
const Transaction = require("../../models/Transaction");
const BudgetCategory = require("../../models/BudgetCategories");

jest.mock("../../middleware/authMiddleware", () => {
  return jest.fn((req, res, next) => {
    req.user = { id: 'mockedUserId' }; // Mock user ID
    next();
  });
});

describe("User Routes", () => {
  let userId;
  let debitCardId;
  let creditCardId;
  let transactionId;
  let budgetCategoryId;

  beforeAll(async () => {
    // Create mock user
    const user = new User({
      username: "john_doe",
      email: "johndoe@example.com",
      password: "password123",
    });
    await user.save();
    userId = user._id;

    // Create mock debit card
    const debitCard = new DebitCard({
      name: "John's Debit Card",
      balance: 0,
      userId: userId,
    });
    await debitCard.save();
    debitCardId = debitCard._id;

    // Create mock credit card
    const creditCard = new CreditCard({
      name: "John's Credit Card",
      balance: 0,
      userId: userId,
    });
    await creditCard.save();
    creditCardId = creditCard._id;

    // Create mock transaction
    const transaction = new Transaction({
      userId: userId,
      budgetCategoryId: new mongoose.Types.ObjectId(),
      description: "Transaction description",
      amount: 100,
      merchant: "Merchant Name",
    });
    await transaction.save();
    transactionId = transaction._id;

    // Create mock budget category
    const budgetCategory = new BudgetCategory({
      userId: userId,
      category: "Groceries",
      limit: 500,
      month: "March",
    });
    await budgetCategory.save();
    budgetCategoryId = budgetCategory._id;
  });

  afterAll(async () => {
    // Clean up the database
    await User.deleteMany({});
    await DebitCard.deleteMany({});
    await CreditCard.deleteMany({});
    await Transaction.deleteMany({});
    await BudgetCategory.deleteMany({});
    mongoose.connection.close();
  });

  it("should return 500 on server error", async () => {
    // Mocking a server error by throwing inside the route
    jest.spyOn(DebitCard, "find").mockImplementationOnce(() => {
      throw new Error("Server error");
    });

    const response = await request(app) // Using the `app` from server.js
      .get("/api/user/summary")
      .set("Authorization", "Bearer mocktoken");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Server error");
  });
});
