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
export type ToolArgs = GetCurrentUserArgs | PromptArgs;

/**
 * Type guard functions for runtime type checking
 *
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
