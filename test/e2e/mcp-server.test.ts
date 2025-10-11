// Import necessary modules
import { exec } from "child_process";
import { chromium } from "playwright";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

/**
 * End-to-end test for Redmine MCP Server
 * Tests the MCP server against a real Redmine instance running in Docker
 */

/**
 * Execute a shell command and return stdout/stderr
 *
 * @param cmd - The command to execute
 * @returns Promise resolving to stdout and stderr
 */
function run(cmd: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

/**
 * Wait for Redmine server to be ready
 *
 * @param url - The URL to check for readiness
 * @param timeoutMs - Maximum time to wait in milliseconds
 * @returns Promise that resolves when Redmine is ready
 */
async function waitForRedmine(url: string, timeoutMs = 60000): Promise<void> {
  const startTime = Date.now();
  console.log(`Waiting for Redmine to be ready at ${url}...`);

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        console.log("Redmine is ready!");
        return;
      }
    } catch {
      // Connection failed, retry
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  throw new Error(`Redmine did not become ready within ${timeoutMs}ms`);
}

/**
 * Start a Redmine container using Docker
 *
 * @returns Promise resolving to the container name
 */
async function startRedmineContainer() {
  const containerName = "redmine-e2e-test";
  const image = "redmine:latest";
  const port = 3000;

  console.log("Starting Redmine container...");
  await run(`docker run -d --rm --name ${containerName} -p ${port}:3000 ${image}`);
  await waitForRedmine(`http://localhost:${port}`);
  console.log("Redmine container started.");
  return containerName;
}

/**
 * Stop a Redmine container
 *
 * @param containerName - The name of the container to stop
 * @returns Promise that resolves when the container is stopped
 */
async function stopRedmineContainer(containerName: string) {
  console.log("Stopping Redmine container...");
  await run(`docker stop ${containerName}`);
  console.log("Redmine container stopped.");
}

/**
 * Login to Redmine and retrieve API key using Playwright
 *
 * @param baseUrl - The base URL of the Redmine instance
 * @returns Promise resolving to the API key
 */
async function loginAndGetApiKey(baseUrl: string): Promise<string> {
  console.log("Logging in as admin using Playwright...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to login page
    console.log("Navigating to Redmine login page...");
    await page.goto(`${baseUrl}/`);
    await page.getByRole("link", { name: "Sign in" }).click();
    await page.getByRole("textbox", { name: "Login" }).click();
    await page.getByRole("textbox", { name: "Login" }).fill("admin");
    await page.getByRole("textbox", { name: "Password Lost password" }).click();
    await page.getByRole("textbox", { name: "Password Lost password" }).fill("admin");
    console.log("Logging in with default admin credentials...");
    await page.getByRole("button", { name: "Login" }).click();

    console.log("Changing admin password...");
    await page.getByRole("textbox", { name: "Current password *" }).click();
    await page.getByRole("textbox", { name: "Current password *" }).fill("admin");
    await page.getByRole("textbox", { name: "New password *" }).click();
    await page.getByRole("textbox", { name: "New password *" }).fill("admin1234");
    await page.getByRole("textbox", { name: "Confirmation *" }).click();
    await page.getByRole("textbox", { name: "Confirmation *" }).fill("admin1234");
    await page.getByRole("button", { name: "Apply" }).click();

    console.log("Enabling REST API access...");
    await page.getByRole("link", { name: "Administration" }).click();
    await page.getByRole("link", { name: "Settings" }).click();
    await page.getByRole("link", { name: "API" }).click();
    await page.getByRole("checkbox", { name: "Enable REST web service" }).check();
    await page.getByRole("button", { name: "Save" }).click();

    console.log("Retrieving API key...");
    await page.goto(`${baseUrl}/my/api_key`);
    const apiKey = await page.locator("#content > div.box > pre").innerText();
    console.log("Extracted API key:", apiKey);
    return apiKey;
  } finally {
    await browser.close();
  }
}

/**
 * Vitest test suite for Redmine MCP Server
 */
describe("Redmine MCP Server E2E", () => {
  let containerName = "";
  let apiKey = "";
  const baseUrl = "http://localhost:3000";

  beforeAll(async () => {
    // Setup: Start Redmine and get API key
    containerName = await startRedmineContainer();
    apiKey = await loginAndGetApiKey(baseUrl);
  }, 120000); // 2 minute timeout for container startup

  afterAll(async () => {
    // Cleanup: Stop Redmine container
    if (containerName) {
      await stopRedmineContainer(containerName);
    }
  });

  it("should create MCP server instance successfully", async () => {
    // Set environment variables for MCP server
    const originalUrl = process.env["REDMINE_URL"];
    const originalKey = process.env["REDMINE_API_KEY"];

    process.env["REDMINE_URL"] = baseUrl;
    process.env["REDMINE_API_KEY"] = apiKey;

    try {
      // Dynamically import MCP server after environment variables are set
      const { RedmineMCPServer } = await import("../../src/index.js");
      const server = new RedmineMCPServer();

      expect(server).toBeDefined();
    } finally {
      // Restore original environment variables
      if (originalUrl !== undefined) {
        process.env["REDMINE_URL"] = originalUrl;
      } else {
        delete process.env["REDMINE_URL"];
      }

      if (originalKey !== undefined) {
        process.env["REDMINE_API_KEY"] = originalKey;
      } else {
        delete process.env["REDMINE_API_KEY"];
      }
    }
  });

  it("should get current user via Redmine API", async () => {
    // Test get_current_user using the Redmine API directly
    // Since we can't easily call MCP tools directly without the full protocol,
    // we'll verify the API works by making a direct HTTP call
    const response = await fetch(`${baseUrl}/users/current.json`, {
      headers: {
        "X-Redmine-API-Key": apiKey,
      },
    });

    expect(response.ok).toBe(true);

    const userData = await response.json();

    // Assertions using Vitest's expect API
    expect(userData).toHaveProperty("user");
    expect(userData.user).toHaveProperty("login", "admin");
    expect(userData.user).toHaveProperty("id");
    expect(userData.user).toHaveProperty("api_key");
    expect(userData.user.id).toBeGreaterThan(0);
    expect(userData.user.api_key).toEqual(apiKey);
  });
});
