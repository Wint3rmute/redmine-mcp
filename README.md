# Redmine MCP Server

[![Tests](https://github.com/Wint3rmute/redmine-mcp/actions/workflows/tests.yml/badge.svg)](https://github.com/Wint3rmute/redmine-mcp/actions/workflows/tests.yml)
[![CI](https://github.com/Wint3rmute/redmine-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/Wint3rmute/redmine-mcp/actions/workflows/ci.yml)

A Model Context Protocol (MCP) server for integrating with Redmine project
management systems. This server provides AI applications with the ability to
interact with Redmine instances for project management, issue tracking, and time
logging.

## Features

### Tools

- `get_issues` - Retrieve issues with optional filtering by project, status,
  assignee
- `get_projects` - List available Redmine projects
- `get_project_memberships` - Get users and groups assigned to a project with
  their roles
- `create_issue` - Create new issues in Redmine projects
- `get_time_entries` - Retrieve time entries with filtering options
- `log_time` - Log time spent on issues or projects

### Resources

- **redmine://projects** - List of all accessible projects
- **redmine://issues/recent** - Recently updated issues
- **redmine://time_entries/recent** - Recently logged time entries

### Prompts

- **issue_summary** - Generate comprehensive project issue summaries
- **time_report** - Create detailed time tracking reports

## Setup

### Prerequisites

- Node.js 22+
- Access to a Redmine instance with API key
- Redmine REST API enabled

### Environment Variables

Set the following environment variables:

```bash
export REDMINE_URL="https://your-redmine-instance.com"
export REDMINE_API_KEY="your_api_key_here"
```

### Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the server:
   ```bash
   npm run build
   ```

## Usage with MCP Clients

### VsCode

Clone this repository and create the file `.vscode/mcp.json` with following
contents:

```json
{
  "servers": {
    "redmine-mcp-server": {
      "type": "stdio",
      "command": "node",
      "args": ["build/src/index.js"],
      "env": {
        "REDMINE_URL": "your URL here",
        "REDMINE_API_KEY": "your API key here"
      }
    }
  }
}
```

## Documentation

API documentation is automatically generated from JSDoc comments and deployed to
GitHub Pages:

📚 **[View API Documentation](https://wint3rmute.github.io/redmine-mcp/)**

To generate documentation locally:

```bash
npm run docs
```

The generated documentation will be available in the `docs/` directory.

## Development

### Building

```bash
npm run build
```

### Linting

```bash
npm run lint
npm run format
```

### Testing

This project uses [Vitest](https://vitest.dev/) as its testing framework,
providing fast test execution, watch mode, and comprehensive coverage reports.

#### Running Tests

```bash
# Run all tests
npm test

# Run tests once and exit
npm run test:run

# Run only e2e tests
npm run test:e2e

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

#### Coverage Reporting

Code coverage is automatically collected and reported in the CI pipeline using
Vitest's built-in coverage support with the V8 provider. Coverage reports are:

- Generated for every test run in CI
- Uploaded as workflow artifacts (available for 30 days)
- Displayed in the GitHub Actions workflow summary
- Stored in the `coverage/` directory locally

To generate coverage locally:

```bash
npm run test:coverage
```

Coverage reports include:

- **HTML report**: Open `coverage/index.html` in your browser for detailed
  line-by-line coverage
- **JSON summary**: `coverage/coverage-summary.json` contains overall metrics
- **Text output**: Coverage percentages displayed in the terminal

The coverage configuration excludes test files, configuration files, and build
artifacts to focus on source code coverage.

#### Test Structure

- `test/e2e/` - End-to-end tests using Docker and Playwright

#### Writing Tests

Tests use Vitest's `describe`, `it`, and `expect` API:

```typescript
import { describe, it, expect } from "vitest";

describe("My Feature", () => {
  it("should work correctly", () => {
    expect(1 + 1).toBe(2);
  });
});
```

### Testing with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node build/src/index.js
```
