# Redmine MCP Server

A Model Context Protocol (MCP) server for integrating with Redmine project management systems. This server provides AI applications with the ability to interact with Redmine instances for project management, issue tracking, and time logging.

## Features

### Tools
- **get_issues** - Retrieve issues with optional filtering by project, status, assignee
- **get_projects** - List available Redmine projects
- **create_issue** - Create new issues in Redmine projects
- **get_time_entries** - Retrieve time entries with filtering options
- **log_time** - Log time spent on issues or projects

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
4. Start the server:
   ```bash
   npm start
   ```

## Usage with MCP Clients

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "redmine": {
      "command": "node",
      "args": ["/path/to/redmine-mcp-server/build/index.js"],
      "env": {
        "REDMINE_URL": "https://your-redmine-instance.com",
        "REDMINE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Via npx (if published)

```json
{
  "mcpServers": {
    "redmine": {
      "command": "npx",
      "args": ["redmine-mcp-server"],
      "env": {
        "REDMINE_URL": "https://your-redmine-instance.com",
        "REDMINE_API_KEY": "your_api_key_here"
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

### Development Mode (watch for changes)
```bash
npm run dev
```

### Testing with MCP Inspector
```bash
npx @modelcontextprotocol/inspector node build/index.js
```

## API Capabilities

This server integrates with the Redmine REST API and supports:

- Reading and filtering issues
- Creating new issues
- Managing project information
- Time tracking and logging
- Generating reports and summaries

## Configuration

The server requires these environment variables:
- `REDMINE_URL`: Your Redmine instance URL
- `REDMINE_API_KEY`: Your Redmine API key (get this from your Redmine user account settings)

## Troubleshooting

1. **API Key Issues**: Ensure your Redmine API key is valid and has the necessary permissions
2. **Network Connectivity**: Verify the Redmine URL is accessible
3. **Permissions**: Make sure the API key has access to the projects you want to interact with

## License

MIT