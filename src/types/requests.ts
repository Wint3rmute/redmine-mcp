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
export interface GetIssuesArgs {
  project_id?: string;
  assigned_to_id?: string;
  status_id?: string;
  limit?: number;
  issue_id?: string; // Single issue ID or comma-separated list
  subject?: string; // Search in issue subject/title
}

export interface GetIssueByIdArgs {
  issue_id: number;
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
 * Arguments for updating an existing issue in Redmine
 */
export interface UpdateIssueArgs {
  issue_id: number;
  subject?: string;
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
  status_id?: number;
  notes?: string;
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
 *
 * @param args - Arguments to validate as GetIssuesArgs
 * @returns True if args match GetIssuesArgs interface
 */
export function isGetIssuesArgs(args: unknown): args is GetIssuesArgs {
  return typeof args === "object" && args !== null;
}

/**
 * Validates arguments for getting projects
 *
 * @param args - Arguments to validate as GetProjectsArgs
 * @returns True if args match GetProjectsArgs interface
 */
export function isGetProjectsArgs(args: unknown): args is GetProjectsArgs {
  return typeof args === "object" && args !== null;
}

/**
 * Validates arguments for creating issues
 *
 * @param args - Arguments to validate as CreateIssueArgs
 * @returns True if args match CreateIssueArgs interface
 */
export function isCreateIssueArgs(args: unknown): args is CreateIssueArgs {
  if (typeof args !== "object" || args === null) {
    return false;
  }

  const typed = args as Record<string, unknown>;
  return typeof typed["project_id"] === "string" && typeof typed["subject"] === "string";
}

/**
 * Validates arguments for updating issues
 *
 * @param args - Arguments to validate as UpdateIssueArgs
 * @returns True if args match UpdateIssueArgs interface
 */
export function isUpdateIssueArgs(args: unknown): args is UpdateIssueArgs {
  if (typeof args !== "object" || args === null) {
    return false;
  }

  const typed = args as Record<string, unknown>;
  return typeof typed["issue_id"] === "number" && typed["issue_id"] > 0;
}

/**
 * Validates arguments for logging time entries
 *
 * @param args - Arguments to validate as LogTimeArgs
 * @returns True if args match LogTimeArgs interface
 */
export function isLogTimeArgs(args: unknown): args is LogTimeArgs {
  if (typeof args !== "object" || args === null) {
    return false;
  }

  const typed = args as Record<string, unknown>;
  return typeof typed["hours"] === "number" && typed["hours"] > 0;
}

/**
 * Validates arguments for getting time entries
 *
 * @param args - Arguments to validate as GetTimeEntriesArgs
 * @returns True if args match GetTimeEntriesArgs interface
 */
export function isGetTimeEntriesArgs(args: unknown): args is GetTimeEntriesArgs {
  return typeof args === "object" && args !== null;
}

/**
 * Validates arguments for getting current user
 *
 * @param args - Arguments to validate as GetCurrentUserArgs
 * @returns True if args match GetCurrentUserArgs interface
 */
export function isGetCurrentUserArgs(args: unknown): args is GetCurrentUserArgs {
  return typeof args === "object" && args !== null;
}

/**
 * Validates arguments for prompt generation
 *
 * @param args - Arguments to validate as PromptArgs
 * @returns True if args match PromptArgs interface
 */
export function isPromptArgs(args: unknown): args is PromptArgs {
  return typeof args === "object" && args !== null;
}

/**
 * Validates arguments for getting issue by ID
 *
 * @param args - Arguments to validate as GetIssueByIdArgs
 * @returns True if args match GetIssueByIdArgs interface
 */
export function isGetIssueByIdArgs(args: unknown): args is GetIssueByIdArgs {
  if (typeof args !== "object" || args === null) {
    return false;
  }
  const typed = args as Record<string, unknown>;
  return typeof typed["issue_id"] === "number" && typed["issue_id"] > 0;
}
