/**
 * Request argument types for MCP tools
 * These define the expected structure for tool arguments with proper validation
 */

/**
 * Base interface for all request arguments
 */
export interface BaseRequestArgs {
  limit?: number;
}

/**
 * Arguments for getting issues from Redmine
 */
export interface GetIssuesArgs extends BaseRequestArgs {
  project_id?: string;
  status_id?: string;
  assigned_to_id?: string;
  tracker_id?: string;
  category_id?: string;
  fixed_version_id?: string;
  sort?: string;
  include?: string;
}

/**
 * Arguments for getting projects from Redmine
 */
export interface GetProjectsArgs extends BaseRequestArgs {
  name?: string;
  include?: string;
}

/**
 * Arguments for creating a new issue in Redmine
 */
export interface CreateIssueArgs {
  project_id: string;
  subject: string;
  description?: string;
  priority_id?: number;
  assigned_to_id?: number;
  tracker_id?: number;
  category_id?: number;
  fixed_version_id?: number;
  start_date?: string;
  due_date?: string;
  estimated_hours?: number;
  done_ratio?: number;
  parent_issue_id?: number;
  custom_fields?: Array<{
    id: number;
    value: string | number | boolean;
  }>;
}

/**
 * Arguments for getting time entries from Redmine
 */
export interface GetTimeEntriesArgs extends BaseRequestArgs {
  project_id?: string;
  issue_id?: string;
  user_id?: string;
  activity_id?: string;
  from?: string;
  to?: string;
  spent_on?: string;
}

/**
 * Arguments for logging time in Redmine
 */
export interface LogTimeArgs {
  issue_id?: number;
  project_id?: number;
  hours: number;
  comments?: string;
  spent_on?: string;
  activity_id?: number;
  custom_fields?: Array<{
    id: number;
    value: string | number | boolean;
  }>;
}

/**
 * Arguments for getting current user information
 */
export interface GetCurrentUserArgs {
  include?: string;
}

/**
 * Arguments for prompt generation
 */
export interface PromptArgs {
  project_id?: string;
  user_id?: string;
  from_date?: string;
  to_date?: string;
  issue_id?: string;
  activity_id?: string;
}

/**
 * Union type of all possible tool arguments
 */
export type ToolArgs =
  | GetIssuesArgs
  | GetProjectsArgs
  | CreateIssueArgs
  | GetTimeEntriesArgs
  | LogTimeArgs
  | GetCurrentUserArgs
  | PromptArgs;

/**
 * Type guard functions for runtime type checking
 */
export function isGetIssuesArgs(args: unknown): args is GetIssuesArgs {
  return typeof args === "object" && args !== null;
}

export function isGetProjectsArgs(args: unknown): args is GetProjectsArgs {
  return typeof args === "object" && args !== null;
}

export function isCreateIssueArgs(args: unknown): args is CreateIssueArgs {
  if (typeof args !== "object" || args === null) {
    return false;
  }

  const typed = args as Record<string, unknown>;
  return typeof typed["project_id"] === "string" && typeof typed["subject"] === "string";
}

export function isLogTimeArgs(args: unknown): args is LogTimeArgs {
  if (typeof args !== "object" || args === null) {
    return false;
  }

  const typed = args as Record<string, unknown>;
  return typeof typed["hours"] === "number" && typed["hours"] > 0;
}

export function isGetTimeEntriesArgs(args: unknown): args is GetTimeEntriesArgs {
  return typeof args === "object" && args !== null;
}

export function isGetCurrentUserArgs(args: unknown): args is GetCurrentUserArgs {
  return typeof args === "object" && args !== null;
}

export function isPromptArgs(args: unknown): args is PromptArgs {
  return typeof args === "object" && args !== null;
}
