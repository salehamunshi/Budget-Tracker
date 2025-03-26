const request = require('supertest');
const express = require('express');
const app = express();
app.use(express.json()); // To parse JSON requests

// Mock CreditCard model
const CreditCard = {
  create: jest.fn().mockResolvedValue({
    name: 'Test Credit Card',
    balance: 500,
    userId: 'mockedUserId',
  }),
};

// Mock authMiddleware
const authMiddleware = (req, res, next) => {
  req.user = { id: 'mockedUserId' }; // Mock user ID
  next();
};

// Set up the route to create a credit card
app.post('/api/creditcards', authMiddleware, async (req, res) => {
  const { name, balance } = req.body;
  try {
    const creditCard = await CreditCard.create({ name, balance, userId: req.user.id });
    res.status(201).json(creditCard);
  } catch (err) {
    res.status(500).json({ message: 'Error creating credit card', error: err.message });
  }
});

describe('Credit Card Routes', () => {
  it('should create a new credit card with status 201', async () => {
    const response = await request(app)
      .post('/api/creditcards')
      .send({ name: 'Test Credit Card', balance: 500 });

    // Assert the response status is 201
    expect(response.status).toBe(201);

    // Assert the body contains the correct properties
    expect(response.body).toHaveProperty('name', 'Test Credit Card');
    expect(response.body).toHaveProperty('balance', 500);
    expect(response.body).toHaveProperty('userId', 'mockedUserId');
  });
});
