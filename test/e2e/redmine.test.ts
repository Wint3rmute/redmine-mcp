// Import necessary modules
import { exec } from "child_process";

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
  console.log("Starting Redmine container...");
  await run(`docker run -d --rm --name ${containerName} -p ${port}:3000 ${image}`);
  await waitForRedmine(`http://localhost:${port}`);
  console.log("Redmine container started.");
  return containerName;
}

async function stopRedmineContainer(containerName: string) {
  console.log("Stopping Redmine container...");
  await run(`docker stop ${containerName}`);
  console.log("Redmine container stopped.");
}

async function main() {
  let containerName = "";
  try {
    containerName = await startRedmineContainer();
    // Here you could add HTTP checks, API calls, etc.
    console.log("Test: Redmine container is running.");
  } catch (err) {
    console.error("Error during test:", err);
  } finally {
    if (containerName) {
      await stopRedmineContainer(containerName);
    }
  }
}

main();
