# Redmine MCP Server

A Model Context Protocol (MCP) server for integrating with Redmine project
management systems. This server provides AI applications with the ability to
interact with Redmine instances for project management, issue tracking, and time
logging.

## Features

### Tools

- `get_issues` - Retrieve issues with optional filtering
- `get_issue_by_id` - Get a specific issue by its ID
- `get_projects` - List available Redmine projects
- `create_issue` - Create new issues in Redmine projects
- `update_issue` - Update existing issues in Redmine
- `get_time_entries` - Retrieve time entries with filtering options
- `get_time_activities` - Get available time tracking activities for a project or globally
- `log_time` - Log time spent on issues or projects
- `get_current_user` - Get information about the current user (based on API token)

### Resources

- **redmine://projects** - List of all accessible projects
- **redmine://issues/recent** - Recently updated issues
- **redmine://time_entries/recent** - Recently logged time entries

## Setup

### Prerequisites

- Node.js 22+
- Access to a Redmine instance with API key
- Redmine REST API enabled

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
      "args": ["build/index.js"],
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

### Testing with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node build/index.js
```
