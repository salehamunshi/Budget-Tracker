import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";

import "../styles/Budget.css"; // Your dedicated Budget page CSS

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [popupData, setPopupData] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Form state
  const [newBudget, setNewBudget] = useState({
    category: "",
    limit: 0,
    month: new Date().toISOString().substring(0, 7), // e.g. "2025-03"
  });

  // Month toggle state
  const [selectedMonth, setSelectedMonth] = useState("All");

  const token = localStorage.getItem("token");

  // Fetch budgets on mount
  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      // /api/user/summary returns { budgets, ... }
      const res = await axios.get("http://localhost:5001/api/user/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { budgets = [] } = res.data;
      setBudgets(budgets);
    } catch (error) {
      console.error("Error fetching budgets from summary:", error);
    }
  };

  // Open popup (create/edit)
  const handlePopupOpen = (item = null) => {
    setPopupData("budget");
    setEditingItem(item);

    if (item) {
      // Editing existing
      setNewBudget({
        category: item.category,
        limit: item.limit,
        month: item.month,
      });
    } else {
      // Creating new
      setNewBudget({
        category: "",
        limit: 0,
        month: new Date().toISOString().substring(0, 7),
      });
    }
  };

  // Close popup
  const handlePopupClose = () => {
    setPopupData(null);
    setEditingItem(null);
  };

  // Handle form changes
  const handleBudgetChange = (e) => {
    const { name, value } = e.target;
    setNewBudget((prev) => ({
      ...prev,
      [name]: name === "limit" ? parseFloat(value) : value,
    }));
  };

  // Save budget (create/update)
  const handleSaveBudget = async () => {
    try {
      if (editingItem) {
        // Update existing
        const res = await axios.put(
          `http://localhost:5001/api/budget/${editingItem._id}`,
          newBudget,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Update local state
        setBudgets((prev) =>
          prev.map((b) => (b._id === editingItem._id ? res.data : b))
        );
      } else {
        // Create new
        const res = await axios.post(
          "http://localhost:5001/api/budget/add",
          newBudget,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Append to local state
        setBudgets((prev) => [...prev, res.data]);
      }
      handlePopupClose();
    } catch (error) {
      console.error("Error saving budget:", error);
    }
  };

  // Delete budget
  const handleDeleteBudget = async () => {
    if (!editingItem) return;
    try {
      await axios.delete(
        `http://localhost:5001/api/budget/${editingItem._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setBudgets((prev) => prev.filter((b) => b._id !== editingItem._id));
      handlePopupClose();
    } catch (error) {
      console.error("Error deleting budget:", error);
    }
  };

  // Unique months from all budgets
  const uniqueMonths = [...new Set(budgets.map((b) => b.month))].sort();

  // Filter budgets by selectedMonth
  const filteredBudgets =
    selectedMonth === "All"
      ? budgets
      : budgets.filter((b) => b.month === selectedMonth);

  // Prepare Pie chart data from filtered budgets
  const pieData = {
    labels: filteredBudgets.map((b) => b.category),
    datasets: [
      {
        data: filteredBudgets.map((b) => b.limit),
        backgroundColor: [
          "#FFB3C1",
          "#FFCCD5",
          "#800F2F",
          "#FF8FA3",
          "#A4133C",
          "#590D22",
          "#FF4D6D",
          "#FF758F",
          "#C9184A",
        ],
      },
    ],
  };

  // Calculate total budget from filtered budgets
  const totalBudget = filteredBudgets.reduce((sum, b) => sum + b.limit, 0);

  return (
    <div className="budget-page">
      {/* Left sidebar */}
      <div className="budget-sidebar">
        <h2>Budgets</h2>
        <button className="add-budget-btn" onClick={() => handlePopupOpen()}>
          Add Budget
        </button>

        {/* Month Toggle */}
        <div className="month-toggle-container">
          <label>View Month:</label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          >
            <option value="All">All</option>
            {uniqueMonths.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: "1rem" }}>
          <strong>
            Total Budget ({selectedMonth}): £{totalBudget}
          </strong>
        </div>
      </div>

      {/* Right side: filtered budget list + chart */}
      <div className="budget-list-container">
        {filteredBudgets.length === 0 ? (
          <p className="no-results">No budgets found for {selectedMonth}</p>
        ) : (
          filteredBudgets.map((b) => (
            <div className="budget-item" key={b._id}>
              <div>
                <strong>{b.category}</strong> - £{b.limit} |{" "}
                <span>{b.month}</span>
              </div>
              <button onClick={() => handlePopupOpen(b)}>Edit</button>
            </div>
          ))
        )}

        {/* Pie chart */}
        <div style={{ marginTop: "2rem", width: "300px", height: "300px" }}>
          <Pie data={pieData} />
        </div>
      </div>

      {/* Popup form */}
      {popupData === "budget" && (
        <div className="budget-popup show">
          <button className="close-btn" onClick={handlePopupClose}>
            X
          </button>
          <h3>{editingItem ? "Edit Budget" : "Create Budget"}</h3>

          <label>Category</label>
          <input
            type="text"
            name="category"
            value={newBudget.category}
            onChange={handleBudgetChange}
          />

          <label>Limit</label>
          <input
            type="number"
            name="limit"
            value={newBudget.limit}
            onChange={handleBudgetChange}
          />

          <label>Month</label>
          <input
            type="month"
            name="month"
            value={newBudget.month}
            onChange={handleBudgetChange}
            className="month-input"
          />

          <div className="button-container">
            <button onClick={handleSaveBudget}>
              {editingItem ? "Update Budget" : "Save Budget"}
            </button>
            {editingItem && (
              <button onClick={handleDeleteBudget}>Delete Budget</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Budget;
