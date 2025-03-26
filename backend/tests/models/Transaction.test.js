const mongoose = require("mongoose");
const Transaction = require("../../models/Transaction");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  // Create an in-memory MongoDB instance for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Disconnect and stop the in-memory MongoDB server
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Transaction Model", () => {
  it("should create a transaction successfully with required fields", async () => {
    const userId = new mongoose.Types.ObjectId(); // Mock user ID
    const budgetCategoryId = new mongoose.Types.ObjectId(); // Mock category ID

    const transaction = new Transaction({
      userId,
      budgetCategoryId,
      description: "Groceries",
      amount: 100,
      merchant: "SuperMart",
    });

    const savedTransaction = await transaction.save();

    // Verify the transaction was saved correctly
    expect(savedTransaction._id).toBeDefined();
    expect(savedTransaction.userId).toEqual(userId);
    expect(savedTransaction.budgetCategoryId).toEqual(budgetCategoryId);
    expect(savedTransaction.description).toBe("Groceries");
    expect(savedTransaction.amount).toBe(100);
    expect(savedTransaction.merchant).toBe("SuperMart");
    expect(savedTransaction.createdAt).toBeDefined();
    expect(savedTransaction.updatedAt).toBeDefined();
  });

  it("should throw an error if required fields are missing", async () => {
    const transaction = new Transaction({
      description: "Groceries",  // Missing required fields
      amount: 100,
      merchant: "SuperMart",
    });

    let error;
    try {
      await transaction.save(); // This will trigger validation errors for missing fields
    } catch (err) {
      error = err;
    }

    // Check that validation error exists
    expect(error).toBeDefined();
    expect(error.errors.userId).toBeDefined();  // 'userId' is missing
    expect(error.errors.budgetCategoryId).toBeDefined();  // 'budgetCategoryId' is missing
  });

  it("should correctly handle timestamps", async () => {
    const userId = new mongoose.Types.ObjectId();
    const budgetCategoryId = new mongoose.Types.ObjectId();

    const transaction = new Transaction({
      userId,
      budgetCategoryId,
      description: "Dining",
      amount: 50,
      merchant: "FoodPlace",
    });

    const savedTransaction = await transaction.save();

    // Check if timestamps are present
    expect(savedTransaction.createdAt).toBeDefined();
    expect(savedTransaction.updatedAt).toBeDefined();
    expect(new Date(savedTransaction.createdAt)).toBeInstanceOf(Date);
    expect(new Date(savedTransaction.updatedAt)).toBeInstanceOf(Date);
  });
});
