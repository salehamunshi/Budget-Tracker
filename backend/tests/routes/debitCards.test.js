const request = require('supertest');
const express = require('express');
const app = express();
app.use(express.json()); // To parse JSON requests

// Mock DebitCard model
const DebitCard = {
  create: jest.fn().mockResolvedValue({
    name: 'Test Debit Card',
    balance: 100,
    userId: 'mockedUserId',
  }),
};

// Mock authMiddleware
const authMiddleware = (req, res, next) => {
  req.user = { id: 'mockedUserId' }; // Mock user ID
  next();
};

// Set up the route to create a debit card
app.post('/api/debitcards', authMiddleware, async (req, res) => {
  const { name, balance } = req.body;
  try {
    const debitCard = await DebitCard.create({ name, balance, userId: req.user.id });
    res.status(201).json(debitCard);
  } catch (err) {
    res.status(500).json({ message: 'Error creating debit card', error: err.message });
  }
});

describe('Debit Card Routes', () => {
  it('should create a new debit card with status 201', async () => {
    const response = await request(app)
      .post('/api/debitcards')
      .send({ name: 'Test Debit Card', balance: 100 });

    // Assert the response status is 201
    expect(response.status).toBe(201);

    // Assert the body contains the correct properties
    expect(response.body).toHaveProperty('name', 'Test Debit Card');
    expect(response.body).toHaveProperty('balance', 100);
    expect(response.body).toHaveProperty('userId', 'mockedUserId');
  });
});
