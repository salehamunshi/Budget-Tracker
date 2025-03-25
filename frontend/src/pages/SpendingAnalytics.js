import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import Chart from "chart.js/auto";
import "../styles/SpendingAnalytics.css";

const SpendingAnalytics = () => {
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5001/api/user/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { budgets = [], transactions = [] } = res.data;
      setBudgets(budgets);
      setTransactions(transactions);
    } catch (error) {
      console.error("Error fetching analytics data:", error);
    }
  };

  const getSpentByCategory = () => {
    const spentMap = {};

    for (let tx of transactions) {
      if (tx.budgetCategoryId) {
        const catId = tx.budgetCategoryId.toString();
        if (!spentMap[catId]) {
          spentMap[catId] = 0;
        }
        spentMap[catId] += tx.amount;
      } else {
        if (!spentMap["Uncategorized"]) {
          spentMap["Uncategorized"] = 0;
        }
        spentMap["Uncategorized"] += tx.amount;
      }
    }
    return spentMap;
  };

  const spentByCategory = getSpentByCategory();

  const extendedBudgets = [...budgets];
  const hasUncat = spentByCategory["Uncategorized"] !== undefined;
  if (hasUncat) {
    extendedBudgets.push({
      _id: "UNCAT", // a fake ID
      category: "Uncategorized",
      limit: 0, // or some default
    });
  }

  const labels = extendedBudgets.map((b) => b.category);
  const budgetData = extendedBudgets.map((b) => b.limit || 0);
  const spentData = extendedBudgets.map((b) => {
    if (b._id !== "UNCAT") {
      return spentByCategory[b._id.toString()] || 0;
    }
    return spentByCategory["Uncategorized"] || 0;
  });

  const barData = {
    labels,
    datasets: [
      {
        label: "Budget",
        data: budgetData,
        backgroundColor: "rgba(227, 193, 210, 0.6)",
      },
      {
        label: "Spent",
        data: spentData,
        backgroundColor: "rgba(255, 143, 167, 0.6)",
      },
    ],
  };

  // Chart.js options to customize fonts and colors
  const options = {
    plugins: {
      legend: {
        labels: {
          font: {
            family: "Impact, Haettenschweiler, Arial Narrow Bold, sans-serif",
            size: 28,
            weight: "bold",
          },
          color: "#a96c6d", // Legend text color
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: "Impact, Haettenschweiler, Arial Narrow Bold, sans-serif",
            size: 20,
          },
          color: "#c38b8b", // X-axis label color
        },
      },
      y: {
        ticks: {
          font: {
            family: "Impact, Haettenschweiler, Arial Narrow Bold, sans-serif",
            size: 20,
          },
          color: "#c38b8b", // Y-axis label color
        },
      },
    },
  };

  return (
    <div className="analytics-page">
      <h1>Spending Analytics</h1>
      <div className="chart-container">
        {/* Pass barData and options to the <Bar> component */}
        <Bar data={barData} options={options} />
      </div>
    </div>
  );
};

export default SpendingAnalytics;
