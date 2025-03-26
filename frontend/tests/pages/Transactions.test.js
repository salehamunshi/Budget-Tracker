import React from "react";
import { render, screen } from "@testing-library/react";
import Budget from "../../src/pages/Budget";

describe("Budget Component", () => {
  it("renders without crashing", () => {
    render(<Budget />);
    // Check if a specific element is present in the document (e.g., the "Budgets" heading)
    expect(screen.getByText(/Budgets/i)).toBeInTheDocument();
  });
});
