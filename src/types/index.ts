/**
 * Main types module - exports all type definitions
 * This provides a single entry point for importing types throughout the application
 */

// Redmine domain types
export type {
  RedmineUser,
  RedmineStatus,
  RedminePriority,
  RedmineProject,
  RedmineIssue,
  RedmineActivity,
  RedmineTimeEntry,
  RedmineApiResponse,
  RedmineIssuesResponse,
  RedmineProjectsResponse,
  RedmineTimeEntriesResponse,
  RedmineUserResponse,
  CreateIssueRequest,
  CreateTimeEntryRequest,
} from "./redmine.js";

// MCP protocol types
export type {
  ToolResponse,
  ResourceContents,
  ToolSchema,
  ToolPropertySchema,
  ResourceSchema,
  PromptSchema,
  PromptResponse,
  ToolExecutionContext,
} from "./mcp.js";

export { createSuccessResponse, createErrorResponse } from "./mcp.js";

// Note: Request argument types are now defined and exported directly from src/index.ts
// as they are derived from Zod schemas for compile-time type safety.
