import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const backendURL = process.env.REACT_APP_BACKEND_URL;
  const [userData, setUserData] = useState({ debitCards: [], creditCards: [] });
  const [transactions, setTransactions] = useState([]);
  const [popupData, setPopupData] = useState(null); // To control which popup to show (create or edit)
  const [newDebitCard, setNewDebitCard] = useState({ name: "", balance: 0 });
  const [newCreditCard, setNewCreditCard] = useState({ name: "", balance: 0 });
  const [newTransaction, setNewTransaction] = useState({
    description: "",
    amount: 0,
    merchant: "",
  });
  const [selectedDebitCardId, setSelectedDebitCardId] = useState("");
  const [selectedCreditCardId, setSelectedCreditCardId] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get(`${backendURL}/api/user/summary`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        setUserData({
          debitCards: response.data.debitCards || [],
          creditCards: response.data.creditCards || [],
        });
        setTransactions(response.data.transactions || []);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        navigate("/login");
      });
  }, [navigate]);

  // Net Worth Calculation
  const calculateNetWorth = () => {
    let netWorth = 0;

    userData.debitCards.forEach((debitCard) => {
      netWorth += debitCard.balance || 0;
    });

    // Subtract credit cards balance from net worth
    userData.creditCards.forEach((card) => {
      netWorth -= card.balance || 0;
    });

    return netWorth;
  };

  const handlePopupOpen = (type, item = null) => {
    setPopupData(type);
    setEditingItem(item);

    if (type === "debitCard") {
      setNewDebitCard(
        item
          ? { name: item.name, balance: item.balance }
          : { name: "", balance: 0 }
      );
    } else if (type === "creditCard") {
      setNewCreditCard(
        item
          ? { name: item.name, balance: item.balance }
          : { name: "", balance: 0 }
      );
    } else if (type === "transaction") {
      setNewTransaction(
        item
          ? {
              description: item.description,
              amount: item.amount,
              merchant: item.merchant,
            }
          : { description: "", amount: 0, merchant: "" }
      );
      setSelectedDebitCardId(item ? item.debitCardId : "");
      setSelectedCreditCardId(item ? item.creditCardId : "");
    }
  };

  // Handle closing the popup
  const handlePopupClose = () => {
    setPopupData(null); // Close the popup by clearing popupData
    setEditingItem(null);
  };

  const handleDebitCardChange = (e) => {
    setNewDebitCard({ ...newDebitCard, [e.target.name]: e.target.value });
  };

  // Handle credit card form change
  const handleCreditCardChange = (e) => {
    setNewCreditCard({ ...newCreditCard, [e.target.name]: e.target.value });
  };

  // Handle transaction form change
  const handleTransactionChange = (e) => {
    const { name, value } = e.target;

    setNewTransaction((prev) => ({
      ...prev,
      [name]: name === "amount" ? parseFloat(value) : value,
    }));
  };

  const handleSaveDebitCard = async () => {
    try {
      const token = localStorage.getItem("token");

      let response;
      if (editingItem) {
        response = await axios.put(
          `${backendURL}/api/debitCards/${editingItem._id}`,
          newDebitCard,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        response = await axios.post(
          `${backendURL}/api/debitCards`,
          newDebitCard,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      await fetchData();
      handlePopupClose();
    } catch (error) {
      console.error("Error saving debit card:", error);
    }
  };

  // Create or Update Credit Card
  const handleSaveCreditCard = async () => {
    try {
      const token = localStorage.getItem("token");

      let response;
      if (editingItem) {
        // Update existing credit card
        response = await axios.put(
          `${backendURL}/api/creditCard/${editingItem._id}`,
          newCreditCard,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Create new credit card
        response = await axios.post(
          `${backendURL}/api/creditCard`,
          newCreditCard,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
      await fetchData();
      handlePopupClose();
    } catch (error) {
      console.error("Error saving credit card:", error);
    }
  };

  // Create or Update Transaction
  const handleSaveTransaction = async () => {
    try {
      const token = localStorage.getItem("token");

      const transactionData = {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
      };

      let response;
      if (editingItem) {
        // Update existing transaction
        response = await axios.put(
          `${backendURL}/api/transactions/${editingItem._id}`,
          transactionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // Create new transaction
        response = await axios.post(
          `${backendURL}/api/transactions`,
          transactionData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      await fetchData();
      handlePopupClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleDeleteDebitCard = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${backendURL}/api/debitCards/${editingItem._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await fetchData();
      handlePopupClose();
    } catch (error) {
      console.error("Error deleting debit card:", error);
    }
  };

  // Delete Credit Card
  const handleDeleteCreditCard = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${backendURL}/api/creditCard/${editingItem._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchData();
      handlePopupClose();
    } catch (error) {
      console.error("Error deleting credit card:", error);
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `${backendURL}/api/transactions/${editingItem._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await fetchData();
      handlePopupClose();
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  // Fetch the latest user data after adding
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${backendURL}/api/user/summary`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUserData(response.data);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error("Error fetching data after adding:", error);
    }
  };

  return (
    <div>
      <div className="dashboard-content">
        {/* Net Worth */}
        <div className="card net-worth">
          <h3>Net Worth: £{calculateNetWorth()}</h3>
        </div>

        {/* Debit Card */}
        <div className="card debit-cards">
          <h3>Debit Card</h3>
          {userData.debitCards.map((debitCard) => (
            <div key={debitCard._id} className="debit-card">
              <h4>{debitCard.name}</h4>
              <p>£{debitCard.balance}</p>
              <button onClick={() => handlePopupOpen("debitCard", debitCard)}>
                Edit
              </button>
            </div>
          ))}
          <button
            className="add-btn"
            onClick={() => handlePopupOpen("debitCard")}
          >
            Add Debit Card
          </button>
        </div>

        {/* Credit Cards */}
        <div className="card credit-cards">
          <h3>Credit Cards</h3>
          {userData.creditCards.map((card) => (
            <div key={card._id} className="credit-card">
              <h4>{card.name}</h4>
              <p>£{card.balance}</p>
              <button onClick={() => handlePopupOpen("creditCard", card)}>
                Edit
              </button>
            </div>
          ))}
          <button
            className="add-btn"
            onClick={() => handlePopupOpen("creditCard")}
          >
            Add Credit Card
          </button>
        </div>

        {/* Transactions */}
        <div className="card transactions">
          <h3>Transactions</h3>
          {transactions.map((transaction) => (
            <div key={transaction._id} className="transaction">
              <p>
                {transaction.description} - £{transaction.amount}
              </p>
              <button
                onClick={() => handlePopupOpen("transaction", transaction)}
              >
                Edit
              </button>
            </div>
          ))}
          <button
            className="add-btn"
            onClick={() => handlePopupOpen("transaction")}
          >
            Add Transaction
          </button>
        </div>
      </div>

      {/* Editing Form Popup */}
      {popupData && (
        <div className="popup show">
          <button className="close-btn" onClick={handlePopupClose}>
            X
          </button>
          <h3>{editingItem ? `Edit ${popupData}` : `Create ${popupData}`}</h3>

          {popupData === "debitCard" && (
            <>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={newDebitCard.name}
                onChange={handleDebitCardChange}
              />
              <label>Balance</label>
              <input
                type="number"
                name="balance"
                value={newDebitCard.balance}
                onChange={handleDebitCardChange}
              />
              <div className="button-container">
                <button onClick={handleSaveDebitCard}>
                  {editingItem ? "Update Debit Card" : "Save Debit Card"}
                </button>
                {editingItem && (
                  <button onClick={handleDeleteDebitCard}>
                    Delete Debit Card
                  </button>
                )}
              </div>
            </>
          )}

          {popupData === "creditCard" && (
            <>
              <label>Name</label>
              <input
                type="text"
                name="name"
                value={newCreditCard.name}
                onChange={handleCreditCardChange}
              />
              <label>Balance</label>
              <input
                type="number"
                name="balance"
                value={newCreditCard.balance}
                onChange={handleCreditCardChange}
              />
              <div className="button-container">
                <button onClick={handleSaveCreditCard}>
                  {editingItem ? "Update Credit Card" : "Save Credit Card"}
                </button>
                {editingItem && (
                  <button onClick={handleDeleteCreditCard}>
                    Delete Credit Card
                  </button>
                )}
              </div>
            </>
          )}

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
      )}
    </div>
  );
};

export default Dashboard;
