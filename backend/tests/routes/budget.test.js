const request = require('supertest');
const express = require('express');
const app = express();
const BudgetCategory = require('../../models/BudgetCategories');
app.use(express.json()); // To parse JSON requests

// Mock BudgetCategory model
jest.mock('../../models/BudgetCategories');
const mockSave = jest.fn().mockResolvedValue({
  userId: 'mockedUserId',
  category: 'Food',
  limit: 500,
  month: 'January',
});

BudgetCategory.mockImplementation(() => {
  return {
    save: mockSave,
  };
});

// Mock authMiddleware
const authMiddleware = (req, res, next) => {
  req.user = { id: 'mockedUserId' }; // Mock user ID
  next();
};

// Set up the route to add a budget category
app.post('/api/budgetcategories/add', authMiddleware, async (req, res) => {
  const { category, limit, month } = req.body;
  try {
    const newBudget = new BudgetCategory({
      userId: req.user.id,
      category,
      limit,
      month,
    });
    const savedBudget = await newBudget.save();
    res.status(201).json(savedBudget); // Make sure to send the saved object
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

describe('Budget Category Routes', () => {
  let server;

  beforeAll(() => {
    // Start the server
    server = app.listen(5002, () => {
      console.log('Test server running on port 5002');
    });
  });

  it('should add a new budget category with status 201', async () => {
    const response = await request(app)
      .post('/api/budgetcategories/add')
      .send({ category: 'Food', limit: 500, month: 'January' });

    // Assert the response status is 201
    expect(response.status).toBe(201);

    // Assert the body contains the correct properties
    expect(response.body).toHaveProperty('category', 'Food');
    expect(response.body).toHaveProperty('limit', 500);
    expect(response.body).toHaveProperty('month', 'January');
    expect(response.body).toHaveProperty('userId', 'mockedUserId');
  });

  afterAll((done) => {
    // Ensure proper cleanup after tests
    server.close(done);
  });
});
