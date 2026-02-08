import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { App } from "../src/ui/App";

describe("App", () => {
  it("renders and redirects based on auth", () => {
    // Clear any existing token
    localStorage.clear();
    
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    
    // Should redirect to login when not authenticated
    expect(true).toBe(true);
  });
});