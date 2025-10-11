import { describe, it, expect } from "vitest";

/**
 * Example unit tests demonstrating Vitest functionality
 * These tests serve as a template for future unit tests
 */
describe("Vitest Examples", () => {
  it("should perform basic arithmetic", () => {
    expect(2 + 2).toBe(4);
  });

  it("should handle string operations", () => {
    const greeting = "Hello, Vitest!";
    expect(greeting).toContain("Vitest");
    expect(greeting).toHaveLength(14);
  });

  it("should work with async operations", async () => {
    const promise = Promise.resolve("success");
    await expect(promise).resolves.toBe("success");
  });

  it("should validate object properties", () => {
    const user = {
      id: 1,
      name: "Test User",
      email: "test@example.com",
    };

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name", "Test User");
    expect(user.email).toMatch(/@example\.com$/);
  });
});
