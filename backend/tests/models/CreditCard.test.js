const mongoose = require("mongoose");
const CreditCard = require("../../models/CreditCard");
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

describe("CreditCard Model", () => {
  it("should create a credit card successfully with required fields", async () => {
    const userId = new mongoose.Types.ObjectId(); // Mock User ID

    const creditCard = new CreditCard({
      name: "John's Credit Card",
      balance: 500,
      userId,
    });

    const savedCreditCard = await creditCard.save();

    // Verify that the credit card was saved correctly
    expect(savedCreditCard._id).toBeDefined();
    expect(savedCreditCard.name).toBe("John's Credit Card");
    expect(savedCreditCard.balance).toBe(500);
    expect(savedCreditCard.userId).toEqual(userId);
  });

  it("should set default balance to 0 if not provided", async () => {
    const userId = new mongoose.Types.ObjectId(); // Mock User ID

    const creditCard = new CreditCard({
      name: "John's Credit Card",
      userId,
    });

    const savedCreditCard = await creditCard.save();

    // Verify that the balance is set to the default value of 0
    expect(savedCreditCard.balance).toBe(0);
  });

  it("should throw an error if required fields are missing", async () => {
    const creditCard = new CreditCard({
      balance: 500,
      // Missing 'name' and 'userId' fields
    });

    let error;
    try {
      await creditCard.save(); // This will trigger validation errors for missing required fields
    } catch (err) {
      error = err;
    }

    // Check that validation error exists for 'name' and 'userId' fields
    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();  // 'name' field is required
    expect(error.errors.userId).toBeDefined();  // 'userId' field is required
  });
});
