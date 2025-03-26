const request = require("supertest");
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const app = express();
app.use(express.json());

// Import the signup route
const signupRoute = require("../../routes/auth");
app.use("/api", signupRoute);

// Mock bcrypt and User model
jest.mock("bcryptjs");
jest.mock("../../models/User");

describe("Signup Route", () => {
  beforeAll(() => {
    // Clear the mocks before each test
    jest.clearAllMocks();
  });

  it("should return error if password is too short", async () => {
    const response = await request(app)
      .post("/api/signup")
      .send({ username: "testuser", email: "test@test.com", password: "short" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Password must include: at least 8 characters, one uppercase letter, one number, one special character (!@#$%^&)"
    );
  });

  it("should return error if password does not contain an uppercase letter", async () => {
    const response = await request(app)
      .post("/api/signup")
      .send({ username: "testuser", email: "test@test.com", password: "password1!" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "Password must include: one uppercase letter"
    );
  });

  it("should return error if user already exists with email", async () => {
    User.findOne.mockResolvedValueOnce({ email: "test@test.com" });

    const response = await request(app)
      .post("/api/signup")
      .send({ username: "testuser", email: "test@test.com", password: "Valid123!" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("User already exists with this email");
  });

  it("should return error if username already taken", async () => {
    User.findOne.mockResolvedValueOnce(null); // No email match
    User.findOne.mockResolvedValueOnce({ username: "testuser" }); // Username match

    const response = await request(app)
      .post("/api/signup")
      .send({ username: "testuser", email: "unique@test.com", password: "Valid123!" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Username already taken");
  });

  it("should successfully create a new user", async () => {
    // Mock the user creation and password hashing
    bcrypt.genSalt.mockResolvedValue("mockSalt");
    bcrypt.hash.mockResolvedValue("mockHashedPassword");
    User.findOne.mockResolvedValueOnce(null); // No email match
    User.findOne.mockResolvedValueOnce(null); // No username match
    User.prototype.save.mockResolvedValueOnce({
      username: "testuser",
      email: "unique@test.com",
      password: "mockHashedPassword",
    });

    const response = await request(app)
      .post("/api/signup")
      .send({ username: "testuser", email: "unique@test.com", password: "Valid123!" });

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("User registered successfully");
  });
});
