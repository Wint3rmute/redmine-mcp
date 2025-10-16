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

  it("should get project memberships by identifier", async () => {
    // Call the getProjectMemberships method with project identifier
    const response = await mcpServer.getProjectMemberships({
      project_id: "e2e",
    });

    // Verify MCP response structure
    expect(response).toHaveProperty("content");
    expect(Array.isArray(response.content)).toBe(true);
    expect(response.content.length).toBeGreaterThan(0);
    expect(response.content[0]).toHaveProperty("type", "text");
    expect(response.content[0]).toHaveProperty("text");

    // Parse the JSON response
    const membershipsData = JSON.parse(response.content[0]!.text);

    // Assertions on the returned memberships data
    expect(membershipsData).toHaveProperty("memberships");
    expect(Array.isArray(membershipsData.memberships)).toBe(true);
    expect(membershipsData.memberships.length).toBeGreaterThan(0);

    // No pagination metadata expected in current implementation

    // Verify membership structure
    const firstMembership = membershipsData.memberships[0];
    expect(firstMembership).toHaveProperty("id");
    expect(firstMembership).toHaveProperty("project");
    expect(firstMembership.project).toHaveProperty("id");
    expect(firstMembership.project).toHaveProperty("name", "E2E");

    // Verify user or group exists (at least one should be present)
    expect(firstMembership.user || firstMembership.group).toBeDefined();

    // Verify roles
    expect(firstMembership).toHaveProperty("roles");
    expect(Array.isArray(firstMembership.roles)).toBe(true);
    expect(firstMembership.roles.length).toBeGreaterThan(0);

    // Verify role structure
    const firstRole = firstMembership.roles[0];
    expect(firstRole).toHaveProperty("id");
    expect(firstRole).toHaveProperty("name");

    // Verify admin user is in the members (added during setup)
    const adminMembership = membershipsData.memberships.find(
      (m: { user?: { name: string } }) => m.user?.name === "Redmine Admin",
    );
    expect(adminMembership).toBeDefined();
    expect(adminMembership.user.name).toBe("Redmine Admin");
  });

  it("should create child issues and link them to parent", async () => {
    // Create a parent issue
    const parentRes = await mcpServer.createIssue({
      project_id: "884",
      subject: "Parent E2E Issue",
      description: "Parent issue for child linkage test",
      tracker_id: 1, // Bug
      priority_id: 2, // Normal
      status_id: 1 // New
    });
    expect(parentRes).toHaveProperty("content");
    const parentData = JSON.parse(parentRes.content[0].text);
    const parentId = parentData.issue.id;
    expect(parentId).toBeGreaterThan(0);

    // Create child issues
    const childTitles = ["Test ABC-1", "Test ABC-2", "Test ABC-3", "Test ABC-4"];
    const childDescriptions = [
      "Perform test ABC-1 and write the report",
      "Perform test ABC-2 and write the report",
      "Perform test ABC-3 and write the report",
      "Perform test ABC-4 and write the report"
    ];
    const childIds: number[] = [];
    for (let i = 0; i < childTitles.length; i++) {
      const childRes = await mcpServer.createIssue({
        project_id: "884",
        subject: childTitles[i],
        description: childDescriptions[i],
        parent_issue_id: parentId,
        tracker_id: 1, // Bug
        priority_id: 2, // Normal
        status_id: 1 // New
      });
      expect(childRes).toHaveProperty("content");
      const childData = JSON.parse(childRes.content[0].text);
      expect(childData.issue.parent.id).toBe(parentId);
      childIds.push(childData.issue.id);
    }

    // Fetch child issues by parent
  const issuesRes = await mcpServer.getIssues({ parent_id: String(parentId), project_id: "884" });
    expect(issuesRes).toHaveProperty("content");
    const issuesData = JSON.parse(issuesRes.content[0].text);
    expect(Array.isArray(issuesData.issues)).toBe(true);
    // All created child issues should be present and have correct parent
    const foundIds = issuesData.issues.map((iss: any) => iss.id);
    for (const id of childIds) {
      expect(foundIds).toContain(id);
    }
    for (const iss of issuesData.issues) {
      expect(iss.parent.id).toBe(parentId);
    }
  });
});
