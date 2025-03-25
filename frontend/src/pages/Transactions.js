import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import TransactionFilters from "../components/TransactionFilters";
import TransactionList from "../components/TransactionList";
import "../styles/Transactions.css";

const Transactions = () => {
  const [filters, setFilters] = useState({
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
    merchant: "",
    description: "",
  });

  const [transactions, setTransactions] = useState([]);
  const [popupData, setPopupData] = useState(null); // For pop-up form data (new/edit transaction)
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: 0,
    merchant: "",
  });
  const [editingItem, setEditingItem] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loader = useRef();
  const token = localStorage.getItem("token");

  const fetchTransactions = async (pageNum = 1, filterParams = {}) => {
    setLoading(true);
    try {
      const params = {
        page: pageNum,
        limit: 10,
        ...filterParams,
      };

      const res = await axios.get("http://localhost:5001/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      const fetched = res.data.transactions || [];

      setTransactions((prev) => {
        const existingIds = new Set(prev.map((tx) => tx._id));
        const newUnique = fetched.filter((tx) => !existingIds.has(tx._id));
        return pageNum === 1 ? newUnique : [...prev, ...newUnique];
      });

      setHasMore(fetched.length === 10);
    } catch (error) {
      console.error(
        "Error fetching transactions:",
        error.response ? error.response.data : error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1, filters); // Always fetch transactions when the filters change
  }, [filters]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1); // Fetch next page when bottom is reached
        }
      },
      { threshold: 1 }
    );
    if (loader.current) observer.observe(loader.current);
    return () => loader.current && observer.unobserve(loader.current);
  }, [hasMore, loading]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters); // Update filters directly
    setPage(1); // Reset page to 1 when filters change
    setTransactions([]);
  };

  // Handle opening the "Edit" popup for transactions
  const handlePopupOpen = (item = null) => {
    setPopupData("transaction"); // Open the "transaction" popup
    setEditingItem(item); // Set the item to edit, or `null` if it's a new transaction
  
    if (item) {
      // If an item is passed (for editing), set the fields to the current transaction values
      setNewTransaction({
        description: item.description,
        amount: item.amount,
        merchant: item.merchant,
      });
    } else {
      // If no item is passed (for creating), reset the form fields
      setNewTransaction({ description: "", amount: 0, merchant: "" });
    }
  };
   

  const handlePopupClose = () => {
    setPopupData(null);
    setEditingItem(null);
  };

  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const handleSaveTransaction = async () => {
    try {
      const transactionData = {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
      };

      let response;
      if (editingItem) {
        // Update existing transaction
        response = await axios.put(
          `http://localhost:5001/api/transactions/${editingItem._id}`,
          transactionData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new transaction
        response = await axios.post(
          "http://localhost:5001/api/transactions",
          transactionData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setTransactions((prev) =>
        editingItem
          ? prev.map((tx) => (tx._id === editingItem._id ? response.data : tx))
          : [response.data, ...prev]
      );
      handlePopupClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleDeleteTransaction = async () => {
    try {
      await axios.delete(
        `http://localhost:5001/api/transactions/${editingItem._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTransactions((prev) =>
        prev.filter((tx) => tx._id !== editingItem._id)
      );
      handlePopupClose();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  return (
    <div className="transactions-page">
      <div className="transactions-sidebar">
        <h2>Transaction History</h2>
        <TransactionFilters
          onFilterChange={handleFilterChange}
          handlePopupOpen={handlePopupOpen}
        />
      </div>

      <div className="transaction-list-container">
        {transactions.length === 0 ? (
          <p className="no-results">
            {loading ? "Loading..." : "No transactions found"}
          </p>
        ) : (
          <TransactionList
            transactions={transactions}
            onEditTransaction={handlePopupOpen}
          />
        )}

        {hasMore && (
          <div ref={loader} className="loader">
            {loading ? "Loading..." : ""}
          </div>
        )}
      </div>

      {/* Transaction Popup Form */}
      {popupData === "transaction" && (
        <div className="popup show">
          <button className="close-btn" onClick={handlePopupClose}>
            X
          </button>
          <h3>{editingItem ? "Edit Transaction" : "Create Transaction"}</h3>
          <label>Description</label>
          <input
            type="text"
            name="description"
            value={newTransaction.description}
            onChange={handleTransactionChange}
          />
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            value={newTransaction.amount}
            onChange={handleTransactionChange}
          />
          <label>Merchant</label>
          <input
            type="text"
            name="merchant"
            value={newTransaction.merchant}
            onChange={handleTransactionChange}
          />
          <div className="button-container">
            <button onClick={handleSaveTransaction}>
              {editingItem ? "Update Transaction" : "Save Transaction"}
            </button>
            {editingItem && (
              <button onClick={handleDeleteTransaction}>
                Delete Transaction
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
