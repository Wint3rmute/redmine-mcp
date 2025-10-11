// Import necessary modules
import { exec } from "child_process";
import { chromium } from "playwright";

/**
 * End-to-end test: Start and stop a Redmine container using Docker
 * Run with: npx ts-node src/e2e.test.ts or node build/e2e.test.js
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
    } catch (error) {
      // Connection failed, retry
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  throw new Error(`Redmine did not become ready within ${timeoutMs}ms`);
}

async function startRedmineContainer() {
  const containerName = "redmine-e2e-test";
  const image = "redmine:latest";
  const port = 3000;

  console.log("Starting Redmine container with API enabled...");
  await run(`docker run -d --rm --name ${containerName} ` + `-p ${port}:3000 ` + `${image}`);
  await waitForRedmine(`http://localhost:${port}`);
  console.log("Redmine container started.");
  return containerName;
}

async function stopRedmineContainer(containerName: string) {
  console.log("Stopping Redmine container...");
  await run(`docker stop ${containerName}`);
  console.log("Redmine container stopped.");
}

async function loginAndGetApiKey(_baseUrl: string): Promise<string> {
  console.log("Logging in as admin using Playwright...");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to login page
    console.log("Navigating to Redmine login page...");
    await page.goto("http://localhost:3000/");
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
    await page.goto("http://localhost:3000/my/api_key");
    const apiKey = await page.locator("#content > div.box > pre").innerText();
    //#content > div.box > pre
    console.log("Extracted API key:", apiKey);
    return apiKey;
  } finally {
    await browser.close();
  }
}

async function main() {
  let containerName = "";
  try {
    containerName = await startRedmineContainer();
    console.log("Test: Redmine container is running.");

    // Extract admin API key
    const apiKey = await loginAndGetApiKey("http://localhost:3000");
    console.log("Successfully extracted API key:", apiKey);
  } catch (err) {
    console.error("Error during test:", err);
  } finally {
    if (containerName) {
      await stopRedmineContainer(containerName);
    }
  }
}

main();
