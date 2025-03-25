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
  const [categories, setCategories] = useState([]); // We'll store the budgets from /summary here

  const [popupData, setPopupData] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: 0,
    merchant: "",
    budgetCategoryId: "", // references the ID of a budget
  });

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const loader = useRef();
  const token = localStorage.getItem("token");

  // 1) Fetch Transactions (paginated) from /api/transactions
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
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2) Fetch budgets from /api/user/summary
  //    We'll parse out "budgets" from the returned object.
  const fetchBudgetsFromSummary = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/user/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { budgets = [] } = res.data; // e.g. { transactions, budgets, ... }
      setCategories(budgets); // categories now contain the same items as your Budgets page
    } catch (error) {
      console.error("Error fetching budgets from summary:", error);
    }
  };

  // 3) On mount, fetch transactions + budgets
  useEffect(() => {
    fetchTransactions(1, filters);
    fetchBudgetsFromSummary();
  }, []); // runs once on mount

  // 4) When filters change, refetch from page=1
  useEffect(() => {
    fetchTransactions(1, filters);
    setPage(1);
  }, [filters]);

  // 5) Infinite scrolling observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );
    if (loader.current) observer.observe(loader.current);
    return () => loader.current && observer.unobserve(loader.current);
  }, [hasMore, loading]);

  // 6) If page changes beyond 1, fetch next batch
  useEffect(() => {
    if (page > 1) {
      fetchTransactions(page, filters);
    }
  }, [page]);

  // 7) Filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setTransactions([]);
  };

  // 8) Popup logic
  const handlePopupOpen = (item = null) => {
    setPopupData("transaction");
    setEditingItem(item);

    if (item) {
      // Editing existing transaction
      setNewTransaction({
        description: item.description,
        amount: item.amount,
        merchant: item.merchant,
        budgetCategoryId: item.budgetCategoryId || "",
      });
    } else {
      // Creating new
      setNewTransaction({
        description: "",
        amount: 0,
        merchant: "",
        budgetCategoryId: "",
      });
    }
  };

  const handlePopupClose = () => {
    setPopupData(null);
    setEditingItem(null);
  };

  // 9) Handle input changes
  const handleTransactionChange = (e) => {
    const { name, value } = e.target;
    setNewTransaction((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  // 10) Save transaction (create/update)
  const handleSaveTransaction = async () => {
    try {
      const transactionData = {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
      };

      if (editingItem) {
        // Update existing
        await axios.put(
          `http://localhost:5001/api/transactions/${editingItem._id}`,
          transactionData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // Create new
        await axios.post("http://localhost:5001/api/transactions", transactionData, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      // After saving, refetch from page=1
      await fetchTransactions(1, filters);
      handlePopupClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  // 11) Delete transaction
  const handleDeleteTransaction = async () => {
    if (!editingItem) return;
    try {
      await axios.delete(
        `http://localhost:5001/api/transactions/${editingItem._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // remove from local or just refetch
      setTransactions((prev) => prev.filter((tx) => tx._id !== editingItem._id));
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

          {/* Budget Category Dropdown - from /api/user/summary */}
          <label>Budget Category</label>
          <select
            name="budgetCategoryId"
            value={newTransaction.budgetCategoryId}
            onChange={handleTransactionChange}
            required
          >
            <option value="">-- Select Category --</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.category}
              </option>
            ))}
          </select>

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
