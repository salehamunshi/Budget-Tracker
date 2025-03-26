const mongoose = require("mongoose");
const DebitCard = require("../../models/DebitCard");
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

describe("DebitCard Model", () => {
  it("should create a debit card successfully with required fields", async () => {
    const userId = new mongoose.Types.ObjectId(); // Mock User ID

    const debitCard = new DebitCard({
      name: "John's Debit Card",
      balance: 100,
      userId,
    });

    const savedDebitCard = await debitCard.save();

    // Verify that the debit card was saved correctly
    expect(savedDebitCard._id).toBeDefined();
    expect(savedDebitCard.name).toBe("John's Debit Card");
    expect(savedDebitCard.balance).toBe(100);
    expect(savedDebitCard.userId).toEqual(userId);
  });

  it("should set default balance to 0 if not provided", async () => {
    const userId = new mongoose.Types.ObjectId(); // Mock User ID

    const debitCard = new DebitCard({
      name: "John's Debit Card",
      userId,
    });

    const savedDebitCard = await debitCard.save();

    // Verify that the balance is set to the default value of 0
    expect(savedDebitCard.balance).toBe(0);
  });

  it("should throw an error if required fields are missing", async () => {
    const debitCard = new DebitCard({
      // Missing required fields 'name' and 'userId'
      balance: 100,
    });

    let error;
    try {
      await debitCard.save(); // This will trigger validation errors for missing required fields
    } catch (err) {
      error = err;
    }

    // Check that validation error exists for 'name' and 'userId' fields
    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();  // 'name' field is required
    expect(error.errors.userId).toBeDefined();  // 'userId' field is required
  });
});
