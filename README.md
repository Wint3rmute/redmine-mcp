# Redmine MCP Server

A Model Context Protocol (MCP) server for integrating with Redmine project
management systems. This server provides AI applications with the ability to
interact with Redmine instances for project management, issue tracking, and time
logging.

## Features

### Tools

- `get_issues` - Retrieve issues with optional filtering by project, status,
  assignee
- `get_projects` - List available Redmine projects
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

- Node.js 16+
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
      "args": ["build/index.js"],
      "env": {
        "REDMINE_URL": "your URL here",
        "REDMINE_API_KEY": "your API key here"
      }
    }
  }
}
```

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
