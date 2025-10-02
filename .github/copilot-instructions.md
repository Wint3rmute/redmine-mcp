<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

- [x] Verify that the copilot-instructions.md file in the .github directory is
      created.

- [x] Clarify Project Requirements
<!-- Project type: MCP Server for Redmine integration using TypeScript -->

- [x] Scaffold the Project
<!--
Created complete MCP server project structure with:
- package.json with proper dependencies (@modelcontextprotocol/sdk, axios,
  TypeScript)
- TypeScript configuration (tsconfig.json)
- Main server implementation (src/index.ts) with comprehensive Redmine
  integration
- Configuration files (.env.example, .gitignore, README.md)
- VS Code MCP configuration (.vscode/mcp.json) -->

- [x] Customize the Project
<!--
✅ Complete MCP server implementation with proper SDK integration
✅ All 5 tools implemented: get_issues, get_projects, create_issue, get_time_entries, log_time
✅ All 3 resources implemented: projects, recent_issues, recent_time_entries
✅ All 2 prompts implemented: issue_summary, time_report
✅ Server compiles successfully and starts correctly
-->

- [x] Install Required Extensions
<!-- For TypeScript MCP server, no specific extensions required beyond standard VS Code TypeScript support -->

- [x] Compile the Project
<!--
✅ All dependencies installed successfully
✅ TypeScript compilation successful with npm run build
✅ Server starts correctly and detects missing environment variables as expected
✅ Build output generated in build/ directory
-->

- [x] Create and Run Task
<!--
MCP servers don't require VS Code tasks as they run via stdio transport.
The server is started with npm start or npm run dev commands.
-->

- [ ] Launch the Project
<!--
Verify that all previous steps have been completed.
Prompt user for debug mode, launch only if confirmed.
 -->

- [ ] Ensure Documentation is Complete
<!--
Verify that all previous steps have been completed.
Verify that README.md and the copilot-instructions.md file in the .github directory exists and contains current project information.
Clean up the copilot-instructions.md file in the .github directory by removing all HTML comments.
 -->
