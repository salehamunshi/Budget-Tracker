import React, { useState } from "react";

const TransactionFilters = ({ onFilterChange, handlePopupOpen }) => {
  const initialFilterState = {
    minAmount: "",
    maxAmount: "",
    startDate: "",
    endDate: "",
    merchant: "",
    description: "",
  };

  const [localFilters, setLocalFilters] = useState(initialFilterState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedFilters = { ...localFilters, [name]: value };
    setLocalFilters(updatedFilters);
    console.log("Local Filters:", updatedFilters); // Add this line
    onFilterChange(updatedFilters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  const handleClear = () => {
    setLocalFilters(initialFilterState);
    onFilterChange(initialFilterState);
  };

  return (
    <div className="filter-container">
      <form onSubmit={handleSubmit} className="filter-form">
        <input
          type="text"
          name="description"
          placeholder="Search Description"
          value={localFilters.description}
          onChange={handleChange}
        />
        <input
          type="text"
          name="merchant"
          placeholder="Merchant"
          value={localFilters.merchant}
          onChange={handleChange}
        />
        <input
          type="number"
          name="minAmount"
          placeholder="Min Amount"
          value={localFilters.minAmount}
          onChange={handleChange}
        />
        <input
          type="number"
          name="maxAmount"
          placeholder="Max Amount"
          value={localFilters.maxAmount}
          onChange={handleChange}
        />
        <input
          type="date"
          name="startDate"
          value={localFilters.startDate}
          onChange={handleChange}
        />
        <input
          type="date"
          name="endDate"
          value={localFilters.endDate}
          onChange={handleChange}
        />
        <div className="filter-buttons">
          <button type="submit">Apply Filters</button>
          <button
            type="button"
            onClick={handleClear}
            className="clear-filters-btn"
          >
            Clear Filters
          </button>
        </div>
      </form>

      {/* Add Transaction button */}
      <button className="add-transaction-btn" onClick={() => handlePopupOpen()}>
        Add Transaction
      </button>
    </div>
  );
};

export default TransactionFilters;
