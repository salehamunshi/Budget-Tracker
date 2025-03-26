const request = require("supertest");
const express = require("express");
const app = express();
const router = require("../../routes/user"); // Adjust to your router file path
const User = require("../../models/User"); // Make sure the path to User model is correct

// Mock authMiddleware
jest.mock("../../middleware/authMiddleware", () => {
  return jest.fn((req, res, next) => {
    req.user = { id: "mockedUserId" }; // Mock the user ID
    next();
  });
});

// Mock User model
jest.mock("../../models/User", () => {
  return {
    findById: jest.fn().mockResolvedValue({ id: "mockedUserId", username: "testuser" }), // Mocked user data
  };
});

// Apply the router to the app
app.use("/api", router);

describe("User Data Routes", () => {
  it("should return user data with status 200", async () => {
    const response = await request(app).get("/api/data"); // Make a GET request to the /data route

    // Assert the response status is 200
    expect(response.status).toBe(200);

    // Assert the response body contains the mocked user data
    expect(response.body).toHaveProperty("id", "mockedUserId");
    expect(response.body).toHaveProperty("username", "testuser");
  });

  it("should return 404 if user is not found", async () => {
    // Mock User.findById to return null (user not found)
    User.findById.mockResolvedValue(null);

    const response = await request(app).get("/api/data");

    // Assert the response status is 404
    expect(response.status).toBe(404);

    // Assert the response body contains the error message
    expect(response.body).toHaveProperty("message", "User not found");
  });
});
