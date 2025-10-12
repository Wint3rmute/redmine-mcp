/**
 * Zod schemas and TypeScript types for MCP tool arguments
 * These define the input validation schemas and derived types for all Redmine MCP tools
 */

import { z } from "zod";

/**
 * Zod schema shape for get_issues tool arguments
 */
export const getIssuesSchemaShape = {
  project_id: z.string().optional(),
  status_id: z.string().optional(),
  assigned_to_id: z.string().optional(),
  limit: z.number().optional(),
  issue_id: z.string().optional(),
  subject: z.string().optional(),
  parent_id: z.string().optional(),
} as const;

/**
 * Type for get_issues tool arguments, derived from Zod schema
 */
export type GetIssuesArgs = z.infer<z.ZodObject<typeof getIssuesSchemaShape>>;

/**
 * Zod schema shape for get_projects tool arguments
 */
export const getProjectsSchemaShape = {
  limit: z.number().optional(),
  name: z.string().optional(),
} as const;

/**
 * Type for get_projects tool arguments, derived from Zod schema
 */
export type GetProjectsArgs = z.infer<z.ZodObject<typeof getProjectsSchemaShape>>;

/**
 * Zod schema shape for get_issue_by_id tool arguments
 */
export const getIssueByIdSchemaShape = {
  issue_id: z.number(),
} as const;

/**
 * Type for get_issue_by_id tool arguments, derived from Zod schema
 */
export type GetIssueByIdArgs = z.infer<z.ZodObject<typeof getIssueByIdSchemaShape>>;

/**
 * Zod schema shape for create_issue tool arguments
 */
export const createIssueSchemaShape = {
  project_id: z.string(),
  subject: z.string(),
  description: z.string().optional(),
  priority_id: z.number().optional(),
  assigned_to_id: z.number().optional(),
  tracker_id: z.number().optional(),
  category_id: z.number().optional(),
  fixed_version_id: z.number().optional(),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().optional(),
  done_ratio: z.number().optional(),
  parent_issue_id: z.number().optional(),
  custom_fields: z
    .array(
      z.object({
        id: z.number(),
        value: z.union([z.string(), z.number(), z.boolean()]),
      }),
    )
    .optional(),
} as const;

/**
 * Type for create_issue tool arguments, derived from Zod schema
 */
export type CreateIssueArgs = z.infer<z.ZodObject<typeof createIssueSchemaShape>>;

/**
 * Zod schema shape for update_issue tool arguments
 */
export const updateIssueSchemaShape = {
  issue_id: z.number(),
  subject: z.string().optional(),
  description: z.string().optional(),
  priority_id: z.number().optional(),
  assigned_to_id: z.number().optional(),
  tracker_id: z.number().optional(),
  category_id: z.number().optional(),
  fixed_version_id: z.number().optional(),
  start_date: z.string().optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().optional(),
  done_ratio: z.number().optional(),
  parent_issue_id: z.number().optional(),
  status_id: z.number().optional(),
  notes: z.string().optional(),
  custom_fields: z
    .array(
      z.object({
        id: z.number(),
        value: z.union([z.string(), z.number(), z.boolean()]),
      }),
    )
    .optional(),
} as const;

/**
 * Type for update_issue tool arguments, derived from Zod schema
 */
export type UpdateIssueArgs = z.infer<z.ZodObject<typeof updateIssueSchemaShape>>;

/**
 * Zod schema shape for get_time_entries tool arguments
 */
export const getTimeEntriesSchemaShape = {
  project_id: z.string().optional(),
  issue_id: z.string().optional(),
  user_id: z.string().optional(),
  activity_id: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  spent_on: z.string().optional(),
  limit: z.number().optional(),
} as const;

/**
 * Type for get_time_entries tool arguments, derived from Zod schema
 */
export type GetTimeEntriesArgs = z.infer<z.ZodObject<typeof getTimeEntriesSchemaShape>>;

/**
 * Zod schema shape for get_time_activities tool arguments
 */
export const getTimeActivitiesSchemaShape = {
  project_id: z.number().optional(),
} as const;

/**
 * Type for get_time_activities tool arguments, derived from Zod schema
 */
export type GetTimeActivitiesArgs = z.infer<z.ZodObject<typeof getTimeActivitiesSchemaShape>>;

/**
 * Zod schema shape for log_time tool arguments
 */
export const logTimeSchemaShape = {
  issue_id: z.number().optional(),
  project_id: z.number().optional(),
  hours: z.number(),
  comments: z.string().optional(),
  spent_on: z.string().optional(),
  activity_id: z.number(),
  custom_fields: z
    .array(
      z.object({
        id: z.number(),
        value: z.union([z.string(), z.number(), z.boolean()]),
      }),
    )
    .optional(),
} as const;

/**
 * Type for log_time tool arguments, derived from Zod schema
 */
export type LogTimeArgs = z.infer<z.ZodObject<typeof logTimeSchemaShape>>;

/**
 * Zod schema shape for get_current_user tool arguments
 */
export const getCurrentUserSchemaShape = {
  include: z.string().optional(),
} as const;

/**
 * Type for get_current_user tool arguments, derived from Zod schema
 */
export type GetCurrentUserArgs = z.infer<z.ZodObject<typeof getCurrentUserSchemaShape>>;
