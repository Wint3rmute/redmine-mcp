/**
 * E2E tests for Redmine API integration
 * Uses Node.js built-in test runner (node:test)
 */

import { describe, it, before } from "node:test";
import assert from "node:assert";

// Configuration from environment variables
const REDMINE_URL = process.env.REDMINE_URL || "http://localhost:3000";
const REDMINE_API_KEY = process.env.REDMINE_API_KEY || "test_api_token_12345678901234567890";

// Helper to wait for Redmine to be ready
async function waitForRedmine(maxAttempts = 30, delayMs = 2000) {
  console.log(`Waiting for Redmine at ${REDMINE_URL}...`);

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const response = await fetch(`${REDMINE_URL}/users/current.json`, {
        headers: {
          "X-Redmine-API-Key": REDMINE_API_KEY,
        },
      });

      if (response.ok) {
        console.log("Redmine is ready!");
        return true;
      }

      console.log(`Attempt ${i + 1}/${maxAttempts}: Status ${response.status}`);
    } catch (error) {
      console.log(`Attempt ${i + 1}/${maxAttempts}: ${error.message}`);
    }

    await new Promise(resolve => setTimeout(resolve, delayMs));
  }

  throw new Error("Redmine did not become ready in time");
}

describe("Redmine API E2E Tests", () => {
  before(async () => {
    // Wait for Redmine to be ready before running tests
    await waitForRedmine();
  });

  it("should authenticate with API token and get current user", async () => {
    const response = await fetch(`${REDMINE_URL}/users/current.json`, {
      headers: {
        "X-Redmine-API-Key": REDMINE_API_KEY,
        "Content-Type": "application/json",
      },
    });

    assert.strictEqual(response.ok, true, "API request should succeed");
    assert.strictEqual(response.status, 200, "Status should be 200 OK");

    const data = await response.json();

    assert.ok(data.user, "Response should contain user object");
    assert.strictEqual(data.user.login, "testadmin", "User login should be testadmin");
    assert.strictEqual(data.user.admin, true, "User should be admin");

    console.log("✓ Successfully authenticated and retrieved user:", data.user.login);
  });

  it("should reject request with invalid API token", async () => {
    const response = await fetch(`${REDMINE_URL}/users/current.json`, {
      headers: {
        "X-Redmine-API-Key": "invalid_token",
        "Content-Type": "application/json",
      },
    });

    assert.strictEqual(response.status, 401, "Invalid token should return 401 Unauthorized");

    console.log("✓ Invalid token correctly rejected");
  });

  it("should list projects", async () => {
    const response = await fetch(`${REDMINE_URL}/projects.json`, {
      headers: {
        "X-Redmine-API-Key": REDMINE_API_KEY,
        "Content-Type": "application/json",
      },
    });

    assert.strictEqual(response.ok, true, "API request should succeed");
    const data = await response.json();

    assert.ok(data.projects, "Response should contain projects array");
    assert.ok(Array.isArray(data.projects), "Projects should be an array");

    console.log(`✓ Successfully retrieved ${data.projects.length} projects`);
  });

  it("should list issues", async () => {
    const response = await fetch(`${REDMINE_URL}/issues.json`, {
      headers: {
        "X-Redmine-API-Key": REDMINE_API_KEY,
        "Content-Type": "application/json",
      },
    });

    assert.strictEqual(response.ok, true, "API request should succeed");
    const data = await response.json();

    assert.ok(data.issues, "Response should contain issues array");
    assert.ok(Array.isArray(data.issues), "Issues should be an array");

    console.log(`✓ Successfully retrieved ${data.issues.length} issues`);
  });
});
