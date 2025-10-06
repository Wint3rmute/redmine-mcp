# E2E Testing Documentation

This directory contains end-to-end tests for the Redmine MCP server using a
Dockerized Redmine instance with SQLite.

## Overview

The e2e tests verify that the MCP server can successfully interact with a real
Redmine instance through its REST API. The tests use:

- **Node.js built-in test runner** (`node:test`) - No external test libraries
  required
- **Docker** - Runs Redmine 5.1 with SQLite database
- **Pre-seeded database** - Test user and API token are automatically created

## Directory Structure

```
test/
├── README.md                    # This file
├── e2e/
│   └── redmine-api.test.js     # E2E test suite
└── fixtures/
    ├── Dockerfile               # Redmine Docker image with SQLite
    └── seed-database.sh         # Database seeding script
```

## Prerequisites

- **Node.js 22+** - Required for the test runner
- **Docker** - For running Redmine container
- **npm** - For installing dependencies

## Running Tests Locally

### Quick Start

1. **Build the Redmine Docker image:**

   ```bash
   cd test/fixtures
   docker build -t redmine-test:latest .
   cd ../..
   ```

2. **Start the Redmine container:**

   ```bash
   docker run -d \
     --name redmine-test \
     -p 3000:3000 \
     -e REDMINE_TEST_API_TOKEN=test_api_token_12345678901234567890 \
     redmine-test:latest
   ```

3. **Wait for Redmine to initialize (about 60-90 seconds):**

   ```bash
   # Watch the logs for "Database seeding completed successfully!"
   docker logs -f redmine-test
   ```

4. **Run the tests:**

   ```bash
   npm test
   # or
   npm run test:e2e
   ```

5. **Clean up:**
   ```bash
   docker stop redmine-test
   docker rm redmine-test
   ```

### Complete Test Script

Here's a complete script that runs all steps:

```bash
#!/bin/bash
set -e

# Build Docker image
echo "Building Redmine Docker image..."
cd test/fixtures
docker build -t redmine-test:latest .
cd ../..

# Start container
echo "Starting Redmine container..."
docker run -d \
  --name redmine-test \
  -p 3000:3000 \
  -e REDMINE_TEST_API_TOKEN=test_api_token_12345678901234567890 \
  redmine-test:latest

# Wait for initialization
echo "Waiting for Redmine to initialize..."
timeout=120
elapsed=0
interval=5

while [ $elapsed -lt $timeout ]; do
  if docker logs redmine-test 2>&1 | grep -q "Database seeding completed"; then
    echo "Redmine is ready!"
    break
  fi

  echo "Waiting... ($elapsed/$timeout seconds)"
  sleep $interval
  elapsed=$((elapsed + interval))
done

if [ $elapsed -ge $timeout ]; then
  echo "Timeout waiting for Redmine"
  docker logs redmine-test
  exit 1
fi

# Give it a few more seconds
sleep 10

# Run tests
echo "Running tests..."
npm test

# Cleanup
echo "Cleaning up..."
docker stop redmine-test
docker rm redmine-test

echo "Done!"
```

## Test Database Configuration

The Redmine Docker container is pre-seeded with:

- **Database:** SQLite (simple, no external database required)
- **Test User:**
  - Login: `testadmin`
  - Password: `password`
  - Email: `testadmin@example.com`
  - Role: Admin
- **API Token:** `test_api_token_12345678901234567890`

## Environment Variables

The tests use the following environment variables:

- `REDMINE_URL` - URL of the Redmine instance (default: `http://localhost:3000`)
- `REDMINE_API_KEY` - API token for authentication (default:
  `test_api_token_12345678901234567890`)
- `REDMINE_TEST_API_TOKEN` - Token to seed in the database (used by Docker
  container)

## Test Cases

The test suite includes:

1. **API Token Authentication** - Verifies the seeded API token works
2. **Current User Retrieval** - Tests `/users/current.json` endpoint
3. **Invalid Token Rejection** - Ensures 401 response for invalid tokens
4. **Projects Listing** - Tests `/projects.json` endpoint
5. **Issues Listing** - Tests `/issues.json` endpoint

## Troubleshooting

### Container won't start

Check Docker logs:

```bash
docker logs redmine-test
```

### Database seeding failed

The seed script logs are visible in Docker logs. Common issues:

- Database file not created yet (increase wait time)
- SQLite not installed in container
- Permission issues with database file

### Tests timeout

Increase the wait time in the test file or ensure Redmine container is fully
started:

```bash
# Check if Redmine is responding
curl -v http://localhost:3000/users/current.json \
  -H "X-Redmine-API-Key: test_api_token_12345678901234567890"
```

### Port already in use

Change the port mapping:

```bash
docker run -d \
  --name redmine-test \
  -p 3001:3000 \
  ...
```

And update `REDMINE_URL`:

```bash
export REDMINE_URL=http://localhost:3001
npm test
```

## CI/CD Integration

Tests run automatically in GitHub Actions on:

- Push to `master` or `main` branches
- Pull requests to `master` or `main` branches

See `.github/workflows/e2e-tests.yml` for the complete CI configuration.

## Contributing

When adding new tests:

1. Follow the existing test structure using `node:test`
2. Use descriptive test names with `it('should ...')`
3. Add appropriate assertions using `node:assert`
4. Include console.log for test progress visibility
5. Ensure tests are independent and can run in any order

## Additional Resources

- [Redmine REST API Documentation](https://www.redmine.org/projects/redmine/wiki/Rest_api)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Docker Documentation](https://docs.docker.com/)
