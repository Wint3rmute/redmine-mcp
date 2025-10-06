/**
 * Request argument types for MCP tools
 * These define the expected structure for tool arguments with proper validation
 */

/**
 * Base interface for all request arguments
 */
export interface BaseRequestArgs {
  limit?: number | undefined;
}

/**
 * Arguments for getting time tracking activities
 */
export interface GetTimeActivitiesArgs {
  project_id?: number | undefined;
}

/**
 * Arguments for getting time entries from Redmine
 */
export interface GetTimeEntriesArgs extends BaseRequestArgs {
  project_id?: string | undefined;
  issue_id?: string | undefined;
  user_id?: string | undefined;
  activity_id?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
  spent_on?: string | undefined;
}

/**
 * Arguments for logging time in Redmine
 */
export interface LogTimeArgs {
  issue_id?: number | undefined;
  project_id?: number | undefined;
  hours: number;
  comments?: string | undefined;
  spent_on?: string | undefined;
  activity_id: number;
  custom_fields?:
    | Array<{
        id: number;
        value: string | number | boolean;
      }>
    | undefined;
}

/**
 * Arguments for getting current user information
 */
export interface GetCurrentUserArgs {
  include?: string | undefined;
}

/**
 * Arguments for prompt generation
 */
export interface PromptArgs {
  project_id?: string | undefined;
  user_id?: string | undefined;
  from_date?: string | undefined;
  to_date?: string | undefined;
  issue_id?: string | undefined;
  activity_id?: string | undefined;
}

/**
 * Union type of all possible tool arguments
 */
export type ToolArgs = GetTimeEntriesArgs | LogTimeArgs | GetCurrentUserArgs | PromptArgs;

/**
 * Type guard functions for runtime type checking
 *
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
