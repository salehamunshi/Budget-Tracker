const jwt = require("jsonwebtoken");
const authMiddleware = require("../../middleware/authMiddleware");
const httpMocks = require("node-mocks-http");  // To mock Express req, res, and next

jest.mock("jsonwebtoken");  // Mock the jwt module

describe("Auth Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    // Create fresh mock objects before each test
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
    next = jest.fn();  // Mock the next function
  });

  it("should call next() if token is valid", () => {
    const token = "valid_token";
    const decoded = { userId: "123" };
    
    // Mock jwt.verify to simulate a valid token
    jwt.verify.mockImplementation(() => decoded);

    // Set Authorization header in the request
    req.header = jest.fn().mockReturnValue(`Bearer ${token}`);

    // Call the middleware
    authMiddleware(req, res, next);

    // Check that next() was called
    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(decoded);  // Check that the user info was attached to the request
  });

  it("should return 401 if no token is provided", () => {
    // No token in the request header
    req.header = jest.fn().mockReturnValue(undefined);

    // Call the middleware
    authMiddleware(req, res, next);

    // Check that the response status is 401 and correct message is sent
    expect(res.statusCode).toBe(401);
    expect(res._getData()).toEqual(JSON.stringify({ message: "No token, authorization denied" }));
  });

  it("should return 401 if the token is invalid", () => {
    const token = "invalid_token";
    
    // Mock jwt.verify to simulate an error with invalid token
    jwt.verify.mockImplementation(() => { throw new Error("Invalid token"); });

    // Set Authorization header in the request
    req.header = jest.fn().mockReturnValue(`Bearer ${token}`);

    // Call the middleware
    authMiddleware(req, res, next);

    // Check that the response status is 401 and correct message is sent
    expect(res.statusCode).toBe(401);
    expect(res._getData()).toEqual(JSON.stringify({ message: "Token is not valid" }));
  });
});
