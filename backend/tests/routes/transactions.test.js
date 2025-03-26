const request = require('supertest');
const express = require('express');
const app = express();

// Mock transaction route
app.get('/api/transactions', (req, res) => {
  res.status(200).json({
    transactions: [
      { description: 'Test Transaction', amount: 100, merchant: 'Merchant Test' },
    ],
  });
});

describe('Transaction Routes', () => {
  it('should return a list of transactions with status 200', async () => {
    const response = await request(app).get('/api/transactions');
    
    // Assert the response status is 200
    expect(response.status).toBe(200);
    
    // Assert the body contains a transactions array with length 1
    expect(response.body.transactions).toHaveLength(1);
    
    // Assert the transaction properties
    expect(response.body.transactions[0]).toHaveProperty('description', 'Test Transaction');
    expect(response.body.transactions[0]).toHaveProperty('amount', 100);
    expect(response.body.transactions[0]).toHaveProperty('merchant', 'Merchant Test');
  });
});
