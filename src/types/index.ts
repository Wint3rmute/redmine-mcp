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

// Request argument types
export type {
  BaseRequestArgs,
  GetIssuesArgs,
  GetProjectsArgs,
  CreateIssueArgs,
  GetTimeEntriesArgs,
  LogTimeArgs,
  GetCurrentUserArgs,
  PromptArgs,
  ToolArgs,
} from "./requests.js";

export {
  isGetIssuesArgs,
  isGetProjectsArgs,
  isCreateIssueArgs,
  isLogTimeArgs,
  isGetTimeEntriesArgs,
  isGetCurrentUserArgs,
  isPromptArgs,
} from "./requests.js";
