// Import necessary modules
import { exec } from "child_process";
import { chromium, type Browser, type Page } from "playwright";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

/**
 * End-to-end test for Redmine MCP Server
 * Tests the MCP server against a real Redmine instance running in Docker
 *
 * Note: Dynamic imports are used to allow setting environment variables
 * before the config module is loaded.
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
 * @param page - The Playwright page instance
 * @param baseUrl - The base URL of the Redmine instance
 * @returns Promise resolving to the API key
 */
async function loginAndGetApiKey(page: Page, baseUrl: string): Promise<string> {
  console.log("Logging in as admin using Playwright...");

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

  await createRoleAndProject(page);
  return apiKey;
}

/**
 * Create a test role and project in Redmine using Playwright
 *
 * @param page - The Playwright page instance
 * @returns Promise that resolves when role and project are created
 */
async function createRoleAndProject(page: Page): Promise<void> {
  console.log("Creating a role...");
  await page.goto("http://localhost:3000/roles/new");
  await page.getByRole("textbox", { name: "Name *" }).click();
  await page.getByRole("textbox", { name: "Name *" }).fill("test");
  await page.getByRole("checkbox", { name: "Edit project" }).check();
  await page.getByRole("checkbox", { name: "Add issues" }).check();
  await page.getByRole("checkbox", { name: "Edit own issues" }).check();
  await page.getByRole("checkbox", { name: "Copy issues" }).check();
  await page.getByRole("checkbox", { name: "Edit issues" }).check();
  await page.getByRole("checkbox", { name: "Add notes" }).check();
  await page.getByRole("checkbox", { name: "Manage subtasks" }).check();
  await page.getByRole("checkbox", { name: "Edit time logs" }).check();
  await page.getByRole("checkbox", { name: "Log spent time", exact: true }).check();
  await page.getByRole("checkbox", { name: "Edit own time logs" }).check();
  await page.getByRole("checkbox", { name: "View spent time" }).check();
  await page.getByRole("checkbox", { name: "Manage project activities" }).check();
  await page.getByRole("button", { name: "Create" }).click();
  await page.getByRole("link", { name: "test" }).click();

  console.log("Creating a project...");
  await page.locator("#top-menu").getByRole("link", { name: "Projects" }).click();
  await page.getByRole("link", { name: "New project" }).click();
  await page.getByRole("textbox", { name: "Name *" }).fill("E2E");
  await page.getByRole("textbox", { name: "Identifier *" }).fill("e2e");
  await page.getByRole("button", { name: "Create", exact: true }).click();

  // await page.getByRole("link", { name: "Projects" }).click();
  await page.goto("http://localhost:3000/projects");

  await page.getByRole("link", { name: "E2E" }).click();
  await page.getByRole("link", { name: "Settings" }).click();
  await page.getByRole("link", { name: "Members" }).click();
  await page.getByRole("link", { name: "New member" }).click();
  await page.getByRole("checkbox", { name: "RA Redmine Admin" }).check();
  await page.getByRole("checkbox", { name: "test" }).check();
  await page.getByRole("button", { name: "Add" }).click();
}

/**
 * Vitest test suite for Redmine MCP Server
 */
describe("Redmine MCP Server E2E", () => {
  let containerName = "";
  let apiKey = "";
  let browser: Browser;
  let page: Page;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mcpServer: any; // RedmineMCPServer - imported dynamically
  const baseUrl = "http://localhost:3000";

  beforeAll(async () => {
    // Setup: Start Redmine container
    containerName = await startRedmineContainer();

    // Setup: Launch Playwright browser
    console.log("Launching Playwright browser...");
    browser = await chromium.launch({ headless: true });
    page = await browser.newPage();

    // Setup: Login and get API key
    apiKey = await loginAndGetApiKey(page, baseUrl);

    // Setup: Set environment variables for MCP server
    process.env["REDMINE_URL"] = baseUrl;
    process.env["REDMINE_API_KEY"] = apiKey;

    // Setup: Create MCP server instance
    const { RedmineMCPServer } = await import("../../src/index.js");
    mcpServer = new RedmineMCPServer();
    console.log("MCP server instance created.");
  }, 120000); // 2 minute timeout for container startup

  afterAll(async () => {
    // Cleanup: Close browser
    if (browser) {
      console.log("Closing Playwright browser...");
      await browser.close();
    }

    // Cleanup: Stop Redmine container
    if (containerName) {
      await stopRedmineContainer(containerName);
    }
  });

  it("should create MCP server instance successfully", async () => {
    expect(mcpServer).toBeDefined();
  });

  it("should get current user via MCP server method", async () => {
    // Call the getCurrentUser method directly
    const response = await mcpServer.getCurrentUser({});

    // Verify MCP response structure
    expect(response).toHaveProperty("content");
    expect(Array.isArray(response.content)).toBe(true);
    expect(response.content.length).toBeGreaterThan(0);
    expect(response.content[0]).toHaveProperty("type", "text");
    expect(response.content[0]).toHaveProperty("text");

    // Parse the JSON response
    const userData = JSON.parse(response.content[0]!.text);

    // Assertions on the returned user data
    expect(userData).toHaveProperty("user");
    expect(userData.user).toHaveProperty("login", "admin");
    expect(userData.user).toHaveProperty("id");
    expect(userData.user).toHaveProperty("api_key");
    expect(userData.user.id).toBeGreaterThan(0);
    expect(userData.user.api_key).toEqual(apiKey);
  });
});
