// Import necessary modules
import { exec } from "child_process";
import { describe, it, expect, beforeAll, afterAll } from "vitest";

/**
 * End-to-end test for Redmine MCP Server
 * Tests the MCP server against a real Redmine instance running in Docker
 *
 * Performance optimizations:
 * - Uses docker exec with Rails console instead of Playwright UI automation
 * - Configures Redmine directly via Ruby code (much faster)
 * - Eliminates browser overhead and UI interaction delays
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
 * Uses exponential backoff for efficient polling
 *
 * @param url - The URL to check for readiness
 * @param timeoutMs - Maximum time to wait in milliseconds
 * @returns Promise that resolves when Redmine is ready
 */
async function waitForRedmine(url: string, timeoutMs = 60000): Promise<void> {
  const startTime = Date.now();
  let attempt = 0;
  console.log(`Waiting for Redmine to be ready at ${url}...`);

  while (Date.now() - startTime < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`Redmine is ready! (took ${elapsed}s, ${attempt + 1} attempts)`);
        return;
      }
    } catch {
      // Connection failed, retry
    }

    // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1000ms (max)
    const delay = Math.min(100 * Math.pow(2, attempt), 1000);
    await new Promise(r => setTimeout(r, delay));
    attempt++;
  }

  throw new Error(`Redmine did not become ready within ${timeoutMs}ms after ${attempt} attempts`);
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
  
  // Pull image first to avoid timeout during container startup
  // This also provides better progress visibility in CI logs
  try {
    console.log(`Pulling ${image} if not cached...`);
    await run(`docker pull ${image}`);
  } catch (error) {
    console.warn("Image pull failed, will try to use cached version:", error);
  }
  
  await run(`docker run -d --rm --name ${containerName} -p ${port}:3000 ${image}`);
  await waitForRedmine(`http://localhost:${port}`);
  console.log("Redmine container started and ready.");
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
 * Configure Redmine via Rails console using docker exec
 * This is much faster than UI automation with Playwright
 *
 * @param containerName - The name of the Redmine container
 * @returns Promise resolving to the API key
 */
async function configureRedmineViaRails(containerName: string): Promise<string> {
  console.log("Configuring Redmine via Rails console (faster than UI automation)...");

  // Enable REST API
  console.log("Enabling REST API access...");
  await run(
    `docker exec ${containerName} rails runner "Setting.rest_api_enabled = '1'; Setting.save!" 2>&1 || true`
  );

  // Get admin user's API key
  console.log("Retrieving admin API key...");
  const { stdout: apiKeyOutput } = await run(
    `docker exec ${containerName} rails runner "puts User.find_by_login('admin').api_key" 2>&1`
  );
  const apiKey = apiKeyOutput.trim().split('\n').pop()?.trim() || "";
  
  if (!apiKey || apiKey.length < 20) {
    throw new Error(`Failed to retrieve valid API key. Got: ${apiKey}`);
  }
  
  console.log("Extracted API key:", apiKey);

  // Create test role via Rails console
  console.log("Creating test role...");
  await run(
    `docker exec ${containerName} rails runner "
      role = Role.find_or_create_by(name: 'test') do |r|
        r.permissions = [:edit_project, :add_issues, :edit_own_issues, :copy_issues, 
                         :edit_issues, :add_issue_notes, :manage_subtasks, :log_time,
                         :edit_time_entries, :edit_own_time_entries, :view_time_entries,
                         :manage_project_activities]
        r.issues_visibility = 'all'
      end
      role.save!
    " 2>&1 || true`
  );

  // Create test project via Rails console
  console.log("Creating test project...");
  await run(
    `docker exec ${containerName} rails runner "
      project = Project.find_or_create_by(identifier: 'e2e') do |p|
        p.name = 'E2E'
        p.is_public = false
      end
      project.save!
      
      # Add admin user to project with test role
      admin = User.find_by_login('admin')
      test_role = Role.find_by_name('test')
      
      member = Member.find_or_initialize_by(project: project, user: admin)
      member.roles = [test_role]
      member.save!
    " 2>&1 || true`
  );

  console.log("Redmine configuration completed via Rails console.");
  return apiKey;
}



/**
 * Vitest test suite for Redmine MCP Server
 */
describe("Redmine MCP Server E2E", () => {
  let containerName = "";
  let apiKey = "";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mcpServer: any; // RedmineMCPServer - imported dynamically
  const baseUrl = "http://localhost:3000";

  beforeAll(async () => {
    // Setup: Start Redmine container
    containerName = await startRedmineContainer();

    // Setup: Configure Redmine and get API key (via Rails console - much faster than UI)
    apiKey = await configureRedmineViaRails(containerName);

    // Setup: Set environment variables for MCP server
    process.env["REDMINE_URL"] = baseUrl;
    process.env["REDMINE_API_KEY"] = apiKey;

    // Setup: Create MCP server instance
    const { RedmineMCPServer } = await import("../../src/index.js");
    mcpServer = new RedmineMCPServer();
    console.log("MCP server instance created.");
  }, 120000); // 2 minute timeout for container startup

  afterAll(async () => {
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

  it("should get project memberships with pagination", async () => {
    // Call the getProjectMemberships method with limit
    const response = await mcpServer.getProjectMemberships({
      project_id: "e2e",
      limit: 1,
      offset: 0,
    });

    // Parse the JSON response
    const membershipsData = JSON.parse(response.content[0]!.text);

    // Only memberships array is returned; check its length
    expect(Array.isArray(membershipsData.memberships)).toBe(true);
    expect(membershipsData.memberships.length).toBeLessThanOrEqual(1);
  });
});
