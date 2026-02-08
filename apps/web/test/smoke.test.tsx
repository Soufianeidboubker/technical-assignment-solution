import { describe, it, expect } from "vitest";

describe("App", () => {
  it("should pass basic smoke test", () => {
    // Simple test to verify test setup works
    const appName = "Team Boards";
    expect(appName).toBe("Team Boards");
    expect(typeof appName).toBe("string");
  });

  it("localStorage API exists", () => {
    // Verify browser APIs available
    expect(localStorage).toBeDefined();
    expect(typeof localStorage.getItem).toBe("function");
    expect(typeof localStorage.setItem).toBe("function");
  });
});