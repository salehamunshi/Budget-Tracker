# Budget Tracker App

## Introduction

The Budget Tracker App helps users organize their finances by allowing them to track how much money they have, where it is going, and compare their budgeted amount to actual spending. The app aims to provide a user-friendly interface for budgeting and financial management, ensuring users can make informed decisions about their finances.

## Project Aim & Objectives

**Aim**: To create an easy-to-use, secure, and scalable web application that helps users manage and track their budgets and expenses.

**Objectives**:
1. Implement secure user authentication using JWT and password hashing.
2. Enable users to input and categorize their transactions.
3. Provide users with the ability to set monthly budgets and compare their actual spending against the budget.
4. Allow users to view transaction history and filter data by date, category, and amount.

## Enterprise Considerations

### Performance
- The app is optimized for speed and efficiency, with data being loaded asynchronously to improve response times.

### Scalability
- Designed to handle a growing number of users, with a modular backend and frontend structure. It can scale to support more users and transactions.

### Robustness
- The app has built-in error handling and fault tolerance to handle unexpected issues gracefully, ensuring users have a smooth experience.

### Security
- **JWT Authentication**: Secure user authentication with JSON Web Tokens.
- **Password Hashing**: User passwords are securely hashed using bcrypt.
- **Input Validation**: All user inputs are validated to prevent SQL injection and other malicious attacks.
- **CSRF Protection**: Measures have been implemented to prevent Cross-Site Request Forgery attacks.

### Deployment
- The app is deployed using [Render](https://render.com), with both the frontend and backend hosted on their platform, ensuring smooth and reliable access for users.

## Installation & Usage Instructions

### Prerequisites
- Node.js
- MongoDB (for the backend database)

### Setup Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repository-url
   cd your-repository
2. Install Dependencies:
   ```bash
   npm install
3.Configure environment variables:
Set up a .env file in the root directory with necessary configurations (e.g., database URL, JWT secret key).

### Running the Application
1. Start the backend (Node.js server):
   ```bash
   npm run backend
2. Start the frontend (React app):
   ```bash
   npm run frontend
The app should now be running at http://localhost:3000.

## Feature Overview
1. User Authentication
Purpose: Secure user login and registration.

Code Location: [auth.js](/backend/routes/auth.js)

Relevant Endpoint: POST /auth/signup and POST /auth/login

2. Transaction Management
Purpose: Users can add, edit, and delete transactions, categorized by type and amount.

Code Location: [transaction.js](/backend/routes/transaction.js)

Relevant Endpoints: GET /transactions, POST /transactions, DELETE /transactions/:id

3. Budget Management
Purpose: Users can set budgets for specific categories and compare them against actual spending.

Code Location: [budget.js](/backend/routes/budget.js)

Relevant Endpoint: POST /budget, GET /budget

## Known Issues & Future Enhancements
### Known Issues:

Pagination for transaction history could be optimized.

Some filters (e.g., date range) may not function as smoothly as expected.

### Future Enhancements:

Implement email notifications for overspending alerts.

## References
[React Documentation](https://react.dev/)

[Node.js Documentation](https://nodejs.org/en)

[JWT Authentication Guide](https://auth0.com/learn/json-web-tokens)
