const mongoose = require("mongoose");
const BudgetCategory = require("../../models/BudgetCategories");
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

describe("BudgetCategory Model", () => {
  it("should create a budget category successfully with required fields", async () => {
    const userId = new mongoose.Types.ObjectId(); // Mock User ID

    const budgetCategory = new BudgetCategory({
      userId,
      category: "Groceries",
      limit: 500,
      month: "January",
    });

    const savedBudgetCategory = await budgetCategory.save();

    // Verify that the budget category was saved correctly
    expect(savedBudgetCategory._id).toBeDefined();
    expect(savedBudgetCategory.userId).toEqual(userId);
    expect(savedBudgetCategory.category).toBe("Groceries");
    expect(savedBudgetCategory.limit).toBe(500);
    expect(savedBudgetCategory.month).toBe("January");
  });

  it("should throw an error if required fields are missing", async () => {
    const budgetCategory = new BudgetCategory({
      category: "Groceries",
      limit: 500,
      // Missing 'userId' and 'month' fields
    });

    let error;
    try {
      await budgetCategory.save(); // This will trigger validation errors for missing required fields
    } catch (err) {
      error = err;
    }

    // Check that validation error exists for 'userId' and 'month' fields
    expect(error).toBeDefined();
    expect(error.errors.userId).toBeDefined();  // 'userId' field is required
    expect(error.errors.month).toBeDefined();  // 'month' field is required
  });

  it("should validate that 'limit' is a number", async () => {
    const userId = new mongoose.Types.ObjectId(); // Mock User ID

    const invalidBudgetCategory = new BudgetCategory({
      userId,
      category: "Groceries",
      limit: "invalidNumber", // Invalid limit type (should be a number)
      month: "January",
    });

    let error;
    try {
      await invalidBudgetCategory.save(); // This will trigger validation errors for 'limit'
    } catch (err) {
      error = err;
    }

    // Check that validation error exists for 'limit' field
    expect(error).toBeDefined();
    expect(error.errors.limit).toBeDefined();  // 'limit' must be a number
  });
});
