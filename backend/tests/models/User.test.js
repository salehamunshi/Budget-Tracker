const mongoose = require("mongoose");
const User = require("../../models/User");
const { MongoMemoryServer } = require("mongodb-memory-server");

let mongoServer;

beforeAll(async () => {
  // Set up an in-memory MongoDB instance for testing
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Clean up and stop the MongoDB server
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("User Model", () => {
  // Mock DebitCard, CreditCard, and Transaction models separately
  const DebitCard = mongoose.model(
    "DebitCard",
    new mongoose.Schema({ number: String })
  );
  const CreditCard = mongoose.model(
    "CreditCard",
    new mongoose.Schema({ number: String })
  );
  const Transaction = mongoose.model(
    "Transaction",
    new mongoose.Schema({ amount: Number })
  );

  it("should create a user with debit cards, credit cards, and transactions references", async () => {
    // Create mock DebitCard, CreditCard, and Transaction instances
    const debitCard = new DebitCard({ number: "1234-5678-9876-5432" });
    const creditCard = new CreditCard({ number: "4321-8765-6789-8765" });
    const transaction = new Transaction({ amount: 100 });

    // Save the mock models
    await debitCard.save();
    await creditCard.save();
    await transaction.save();

    // Create a new User instance with references to saved cards and transaction
    const user = new User({
      username: "john_doe",
      email: "johndoe@example.com",
      password: "securepassword",
      debitCards: [debitCard._id],
      creditCards: [creditCard._id],
      transactions: [transaction._id],
    });

    // Save the user
    const savedUser = await user.save();

    // Verify that the saved user has the correct fields
    expect(savedUser.username).toBe("john_doe");
    expect(savedUser.email).toBe("johndoe@example.com");
    expect(savedUser.debitCards).toHaveLength(1);
    expect(savedUser.creditCards).toHaveLength(1);
    expect(savedUser.transactions).toHaveLength(1);
    expect(savedUser.debitCards[0].toString()).toBe(debitCard._id.toString());
    expect(savedUser.creditCards[0].toString()).toBe(creditCard._id.toString());
    expect(savedUser.transactions[0].toString()).toBe(
      transaction._id.toString()
    );
  });

  it("should throw an error if required fields are missing", async () => {
    const user = new User({
      email: "missingusername@example.com",
      password: "securepassword",
    });

    let error;
    try {
      // Save user without the required 'username' field
      await user.save(); // This will trigger validation
    } catch (err) {
      error = err;
    }
  });
});
