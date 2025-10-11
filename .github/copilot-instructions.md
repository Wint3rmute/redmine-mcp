# Copilot Instructions for Redmine MCP Server

## Project Overview

This is a **Model Context Protocol (MCP) server** that provides AI assistants
like Claude with access to Redmine project management systems. The server is
built with TypeScript and exposes Redmine's REST API through MCP tools,
resources, and prompts.

## Tech Stack

- **Language**: TypeScript with strict mode enabled
- **Runtime**: Node.js 22+
- **Protocol**: Model Context Protocol (MCP) via `@modelcontextprotocol/sdk`
- **HTTP Client**: Axios for Redmine REST API communication
- **Validation**: Zod for runtime type checking at API boundaries
- **Build**: TypeScript compiler with ES2022 target

## Project Structure

```
src/
├── index.ts              # Main server implementation with tool registration
├── config/
│   ├── index.ts         # Configuration exports
│   └── server-config.ts # Environment variable validation
└── types/
    ├── index.ts         # Type exports
    ├── mcp.ts           # MCP protocol types
    ├── redmine.ts       # Redmine domain models
    └── requests.ts      # Tool argument types
```

## Key Conventions

### TypeScript

1. **Strict mode enabled**: All strict TypeScript checks are active, including
   `exactOptionalPropertyTypes`
2. **Explicit `| undefined`**: Optional properties must explicitly include
   `| undefined` type
3. **No implicit any**: All types must be explicitly declared
4. **ESM modules**: Use `.js` extensions in imports (e.g.,
   `from "./config/index.js"`)

### Code Style

1. **Idiomatic patterns**: Follow modern TypeScript idioms
2. **Error handling**: All async operations wrapped in try-catch
3. **JSDoc comments**: Comprehensive documentation for all public methods
4. **No side effects in constructors**: EXCEPT tool registration (this is MCP
   SDK pattern)

### MCP Patterns

1. **Tool registration in constructor**: Tools, resources, and prompts are
   registered in the constructor (MCP SDK recommendation)
2. **Zod schemas**: All tool inputs use Zod schemas for validation
3. **Consistent responses**: All tools return
   `{ content: [{ type: "text", text: string }] }`
4. **Private methods**: Tool implementations are private class methods

### Redmine Integration

1. **Textile format**: Issue descriptions and notes use Redmine's Textile markup
   (pass through as-is)
2. **API key auth**: Authentication via `X-Redmine-API-Key` header
3. **Environment config**: All credentials loaded from env vars, never hardcoded
4. **Error wrapping**: Axios errors wrapped with contextual messages

## Development Workflow

### Building

```bash
npm run build          # Compile TypeScript
```

### Code Quality

```bash
npm run lint          # ESLint check
npm run lint:fix      # Auto-fix issues
npm run format        # Prettier format
```

### Testing

```bash
npx @modelcontextprotocol/inspector node build/src/index.js
```

## Common Tasks

### Adding a Redmine Type

Add to `src/types/redmine.ts` following existing patterns. Include all relevant
fields from Redmine API docs.

### Modifying Configuration

Update `src/config/server-config.ts` with new validation logic. Never access
`process.env` directly from main code.

## Security Guidelines

1. **Never commit** `.env` files or API keys
2. **Use environment variables** for all sensitive configuration
3. **Validate inputs** using Zod schemas at API boundaries
4. **Sanitize errors** before returning to avoid leaking internals
5. **Check .gitignore** before committing to ensure secrets excluded

## MCP Server Specifics

This server follows MCP SDK conventions:

- Tools are registered in constructor (not a side effect anti-pattern for MCP)
- Server is immutable after connection
- All capabilities declared upfront before `connect()` is called
- stdio transport for communication with AI clients

## Current Implementation Status

### Tools (9 implemented)

- get_issues, get_issue_by_id, get_projects, create_issue, update_issue
- get_time_entries, get_time_activities, log_time, get_current_user

### Resources (3 implemented)

- redmine://projects
- redmine://issues/recent
- redmine://time_entries/recent

### Features

- ✅ Full TypeScript strict mode
- ✅ Zod validation at boundaries
- ✅ Comprehensive error handling
- ✅ Environment-based configuration
- ✅ ESLint + Prettier configured
- ✅ Clean architecture with separated concerns

## References

- [MCP Documentation](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Redmine REST API](https://www.redmine.org/projects/redmine/wiki/Rest_api)
- [Redmine Textile Formatting](https://www.redmine.org/projects/redmine/wiki/RedmineTextFormattingTextile)

## Notes for AI Assistants

When working on this codebase:

1. Maintain strict TypeScript compliance
2. Follow existing patterns for consistency
3. Add JSDoc comments for new public methods
4. Update types when adding new Redmine API features
5. Test with MCP Inspector after changes
6. Keep error messages informative but secure
7. Remember: tool registration in constructor is correct for MCP servers
