import React from "react";

const TransactionList = ({ transactions, onEditTransaction }) => {
  return (
    <div className="transaction-list">
      {transactions.length > 0 ? (
        transactions.map((transaction) => (
          <div key={transaction._id} className="transaction-item">
            <p>
              {transaction.description} - £{transaction.amount} - {transaction.merchant}
            </p>
            <button onClick={() => onEditTransaction(transaction)}>Edit</button>
          </div>
        ))
      ) : (
        <p>No transactions available</p>
      )}
    </div>
  );
};

export default TransactionList;
