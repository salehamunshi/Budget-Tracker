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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loader = useRef();
  const token = localStorage.getItem("token");

  // Function to fetch transactions
  const fetchTransactions = async (pageNum = 1, filterParams = {}) => {
    setLoading(true);
    try {
      const params = {
        page: pageNum,
        limit: 10,
        ...filterParams, // directly use the filters state
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
      console.error("Error fetching transactions:", error.response ? error.response.data : error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions on initial load and whenever filters/page change
  useEffect(() => {
    fetchTransactions(1, filters); // Fetch transactions when filters change
  }, [filters]); // When filters change, reset page and fetch data

  // Pagination (Infinite Scroll)
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

  // Handle filter change and trigger data fetch
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters); // Update filters directly
    setPage(1); // Reset page to 1 when filters change
    setTransactions([]); // Clear current transactions on filter change
  };

  // Handle transaction popup
  const handlePopupOpen = () => {
    setPopupData("transaction"); // Open "Create Transaction" popup
    setNewTransaction({
      description: "",
      amount: 0,
      merchant: "",
    });
  };

  const handlePopupClose = () => {
    setPopupData(null);
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
      response = await axios.post(
        "http://localhost:5001/api/transactions",
        transactionData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTransactions((prev) => [response.data, ...prev]);
      handlePopupClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
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
          <TransactionList transactions={transactions} />
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
          <h3>Create Transaction</h3>
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
            <button onClick={handleSaveTransaction}>Save Transaction</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
