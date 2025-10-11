#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { config } from "./config/index.js";
import type { RedmineProject } from "./types/index.js";
import { createRedmineClient } from "./utils/index.js";

// Re-export utility types for documentation
export type { RedmineClientConfig, RedmineFetchOptions } from "./utils/index.js";

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

/**
 * Redmine MCP Server - Provides Model Context Protocol interface for Redmine API
 *
 * This class implements an MCP server that exposes Redmine functionality through
 * standardized tools, resources, and prompts for AI assistants and other clients.
 */
export class RedmineMCPServer {
  private server: McpServer;
  private fetchRedmine: ReturnType<typeof createRedmineClient>;

  /**
   * Creates a new RedmineMCPServer instance
   *
   * Initializes the MCP server with Redmine API configuration and sets up
   * the HTTP client for making API requests.
   */
  constructor() {
    // Initialize Redmine API client
    this.fetchRedmine = createRedmineClient({
      baseUrl: config.redmine.url,
      apiKey: config.redmine.apiKey,
      timeout: config.redmine.timeout,
    });

    // Initialize MCP server
    this.server = new McpServer({
      name: config.server.name,
      version: config.server.version,
    });

    // Register all Redmine tools using registerTool and zod schemas
    // Calling registerTool is constructor is recommended by the library docs
    this.server.registerTool(
      "get_issues",
      {
        title: "Get Issues",
        description: "Get issues from Redmine with optional filtering",
        inputSchema: getIssuesSchemaShape,
      },
      async (args: GetIssuesArgs) => await this.getIssues(args),
    );

    this.server.registerTool(
      "get_projects",
      {
        title: "Get Projects",
        description: "Get mapping of project names to their IDs from Redmine",
        inputSchema: getProjectsSchemaShape,
      },
      async (args: GetProjectsArgs) => await this.getProjects(args),
    );

    this.server.registerTool(
      "get_issue_by_id",
      {
        title: "Get Issue By ID",
        description: "Get a specific issue by its ID from Redmine",
        inputSchema: getIssueByIdSchemaShape,
      },
      async (args: GetIssueByIdArgs) => await this.getIssueById(args),
    );

    this.server.registerTool(
      "create_issue",
      {
        title: "Create Issue",
        description: "Create a new issue in Redmine",
        inputSchema: createIssueSchemaShape,
      },
      async (args: CreateIssueArgs) => await this.createIssue(args),
    );

    this.server.registerTool(
      "update_issue",
      {
        title: "Update Issue",
        description:
          "Update an existing issue in Redmine. Description should be provided in Textile markup.",
        inputSchema: updateIssueSchemaShape,
      },
      async (args: UpdateIssueArgs) => await this.updateIssue(args),
    );

    this.server.registerTool(
      "get_time_entries",
      {
        title: "Get Time Entries",
        description: "Get time entries from Redmine",
        inputSchema: getTimeEntriesSchemaShape,
      },
      async (args: GetTimeEntriesArgs) => await this.getTimeEntries(args),
    );

    this.server.registerTool(
      "get_time_activities",
      {
        title: "Get Time Activities",
        description: "Get available time tracking activities for a project or globally.",
        inputSchema: getTimeActivitiesSchemaShape,
      },
      async (args: GetTimeActivitiesArgs) => await this.getTimeActivities(args),
    );

    this.server.registerTool(
      "log_time",
      {
        title: "Log Time",
        description: "Log time spent on an issue or project.",
        inputSchema: logTimeSchemaShape,
      },
      async (args: LogTimeArgs) => await this.logTime(args),
    );

    this.server.registerTool(
      "get_current_user",
      {
        title: "Get Current User",
        description: "Get information about the current user (based on API token)",
        inputSchema: getCurrentUserSchemaShape,
      },
      async (args: GetCurrentUserArgs) => await this.getCurrentUser(args),
    );

    this.setupHandlers();
  }

  /**
   * Sets up MCP protocol handlers for tools, resources, and prompts
   *
   * Configures the server to handle:
   * - Tool execution (get_issues, create_issue, etc.)
   * - Resource access (projects, recent issues, time entries)
   * - Prompt responses (issue summaries, time reports)
   */
  private setupHandlers(): void {
    // ...existing code...

    // ...existing code...

    // Register MCP resources using correct registerResource signature
    this.server.registerResource(
      "Projects List",
      "redmine://projects",
      {
        description: "List of all accessible Redmine projects",
        mimeType: "application/json",
      },
      async () => await this.getProjectsResource(),
    );

    this.server.registerResource(
      "Recent Issues",
      "redmine://issues/recent",
      {
        description: "Recently updated issues across all projects",
        mimeType: "application/json",
      },
      async () => await this.getRecentIssuesResource(),
    );

    this.server.registerResource(
      "Recent Time Entries",
      "redmine://time_entries/recent",
      {
        description: "Recently logged time entries",
        mimeType: "application/json",
      },
      async () => await this.getRecentTimeEntriesResource(),
    );

    // TODO: Register prompts using modular API if supported (see next step)
  }

  // Tool implementations

  /**
   * Retrieves issues from Redmine with optional filtering
   *
   * @param args - Filter parameters for issues query
   * @param args.project_id - Project ID to filter by
   * @param args.status_id - Status ID to filter by ('open', 'closed', or specific ID)
   * @param args.assigned_to_id - User ID to filter issues assigned to specific user
   * @param args.limit - Maximum number of issues to return
   * @param args.issue_id - Single issue ID or comma-separated list of issue IDs
   * @param args.subject - Search text in issue subject/title
   * @returns Promise resolving to formatted issue data
   */
  private async getIssues(
    args: GetIssuesArgs,
  ): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      const params: Record<string, string | number> = {};

      if (args.project_id) params["project_id"] = args.project_id;
      if (args.status_id) params["status_id"] = args.status_id;
      if (args.assigned_to_id) params["assigned_to_id"] = args.assigned_to_id;
      if (args.limit) params["limit"] = args.limit;
      if (args.issue_id) params["issue_id"] = args.issue_id;
      if (args.subject) params["subject"] = `~${args.subject}`; // Use contains search
      if (args.parent_id) params["parent_id"] = args.parent_id;

      // Sort by priority (descending) by default, then by updated date
      params["sort"] = "priority:desc,updated_on:desc";

      const data = await this.fetchRedmine("/issues.json", { params });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error fetching issues:", error);
      throw new Error(`Failed to fetch issues: ${error}`);
    }
  }

  /**
   * Retrieves a specific issue by its ID from Redmine
   *
   * @param args - Issue lookup parameters
   * @param args.issue_id - The ID of the issue to retrieve
   * @returns Promise resolving to formatted issue data
   */
  private async getIssueById(
    args: GetIssueByIdArgs,
  ): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      const data = await this.fetchRedmine(`/issues/${args.issue_id}.json`);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error(`Error fetching issue ${args.issue_id}:`, error);
      throw new Error(`Failed to fetch issue ${args.issue_id}: ${error}`);
    }
  }

  /**
   * Retrieves projects from Redmine with optional filtering
   *
   * @param args - Filter parameters for projects query
   * @param args.limit - Maximum number of projects to return (default: 100)
   * @param args.name - Search for projects containing this name (case-insensitive)
   * @returns Promise resolving to formatted project data with ID mappings
   */
  private async getProjects(
    args: GetProjectsArgs,
  ): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      const params: Record<string, string | number> = {};
      if (args.limit) params["limit"] = args.limit;
      if (args.name) params["name"] = args.name;

      const data = await this.fetchRedmine<{ projects: RedmineProject[] }>("/projects.json", {
        params,
      });

      let projects = data.projects || [];

      // If name filter is provided and Redmine API doesn't support it, filter client-side
      if (args.name && projects.length > 0) {
        const searchTerm = args.name.toLowerCase();
        projects = projects.filter((project: RedmineProject) =>
          project.name.toLowerCase().includes(searchTerm),
        );
      }

      // Create mapping from project name to ID
      const projectMapping: { [key: string]: number } = {};
      projects.forEach((project: RedmineProject) => {
        projectMapping[project.name] = project.id;
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ projects: projectMapping }, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error fetching projects:", error);
      throw new Error(`Failed to fetch projects: ${error}`);
    }
  }

  /**
   * Creates a new issue in Redmine
   *
   * @param args - Issue creation parameters
   * @param args.project_id - Project ID where to create the issue (required)
   * @param args.subject - Issue subject/title (required)
   * @param args.description - Issue description
   * @param args.assigned_to_id - User ID to assign the issue to
   * @param args.priority_id - Priority ID for the issue
   * @returns Promise resolving to created issue data
   */
  private async createIssue(
    args: CreateIssueArgs,
  ): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      if (!args.project_id || !args.subject) {
        throw new Error("project_id and subject are required");
      }

      const issueData: Record<string, string | number> = {
        project_id: args.project_id,
        subject: args.subject,
      };

      if (args.description) issueData["description"] = args.description;
      if (args.priority_id) issueData["priority_id"] = args.priority_id;
      if (args.assigned_to_id) issueData["assigned_to_id"] = args.assigned_to_id;

      const data = await this.fetchRedmine("/issues.json", {
        method: "POST",
        body: { issue: issueData },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Issue created successfully: ${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      console.error("Error creating issue:", error);
      throw new Error(`Failed to create issue: ${error}`);
    }
  }

  /**
   * Updates an existing issue in Redmine
   *
   * @param args - Issue update parameters
   * @param args.issue_id - ID of the issue to update (required)
   * @param args.subject - New issue subject/title
   * @param args.description - New issue description
   * @param args.assigned_to_id - New assignee user ID
   * @param args.status_id - New status ID
   * @param args.priority_id - New priority ID
   * @param args.done_ratio - Completion percentage (0-100)
   * @param args.due_date - Due date in YYYY-MM-DD format
   * @param args.notes - Notes to add to the issue history
   * @returns Promise resolving to success confirmation
   */
  private async updateIssue(
    args: UpdateIssueArgs,
  ): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      if (!args.issue_id) {
        throw new Error("issue_id is required");
      }

      const issueData: Record<string, string | number> = {};

      // Only include fields that are provided
      if (args.subject) issueData["subject"] = args.subject;
      if (args.description) issueData["description"] = args.description;
      if (args.priority_id) issueData["priority_id"] = args.priority_id;
      if (args.assigned_to_id) issueData["assigned_to_id"] = args.assigned_to_id;
      if (args.status_id) issueData["status_id"] = args.status_id;
      if (args.done_ratio !== undefined) issueData["done_ratio"] = args.done_ratio;
      if (args.notes) issueData["notes"] = args.notes;
      if (args.tracker_id) issueData["tracker_id"] = args.tracker_id;
      if (args.category_id) issueData["category_id"] = args.category_id;
      if (args.fixed_version_id) issueData["fixed_version_id"] = args.fixed_version_id;
      if (args.start_date) issueData["start_date"] = args.start_date;
      if (args.due_date) issueData["due_date"] = args.due_date;
      if (args.estimated_hours) issueData["estimated_hours"] = args.estimated_hours;
      if (args.parent_issue_id) issueData["parent_issue_id"] = args.parent_issue_id;

      const data = await this.fetchRedmine(`/issues/${args.issue_id}.json`, {
        method: "PUT",
        body: { issue: issueData },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Issue updated successfully: ${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      console.error("Error updating issue:", error);
      throw new Error(`Failed to update issue: ${error}`);
    }
  }

  /**
   * Retrieves time entries from Redmine with optional filtering
   *
   * @param args - Filter parameters for time entries query
   * @param args.project_id - Project ID to filter time entries by
   * @param args.issue_id - Issue ID to filter time entries by
   * @param args.user_id - User ID to filter time entries by
   * @param args.from - Start date (YYYY-MM-DD format)
   * @param args.to - End date (YYYY-MM-DD format)
   * @param args.limit - Maximum number of time entries to return
   * @returns Promise resolving to formatted time entries data
   */
  private async getTimeEntries(
    args: GetTimeEntriesArgs,
  ): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      const params: Record<string, string | number> = {};

      if (args.project_id) params["project_id"] = args.project_id;
      if (args.issue_id) params["issue_id"] = args.issue_id;
      if (args.user_id) params["user_id"] = args.user_id;
      if (args.from) params["from"] = args.from;
      if (args.to) params["to"] = args.to;
      if (args.limit) params["limit"] = args.limit;

      const data = await this.fetchRedmine("/time_entries.json", { params });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error fetching time entries:", error);
      throw new Error(`Failed to fetch time entries: ${error}`);
    }
  }

  /**
   * Retrieves available time tracking activities for a project or globally
   *
   * @param args - Activity lookup parameters
   * @param args.project_id - Project ID to get project-specific activities (optional)
   * @returns Promise resolving to available time tracking activities
   */
  private async getTimeActivities(
    args: GetTimeActivitiesArgs,
  ): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      if (args.project_id) {
        // Get project-specific activities
        const data = await this.fetchRedmine<{
          project: { time_entry_activities: Array<{ id: number; name: string }> };
        }>(`/projects/${args.project_id}.json?include=time_entry_activities`);
        const activities = data.project.time_entry_activities || [];

        return {
          content: [
            {
              type: "text" as const,
              text:
                `Project-specific time tracking activities for project ${args.project_id}:\n\n` +
                activities
                  .map(
                    (activity: { id: number; name: string }) =>
                      `ID: ${activity.id} - ${activity.name}`,
                  )
                  .join("\n") +
                `\n\nTotal: ${activities.length} activities available for this project.`,
            },
          ],
        };
      } else {
        // Get global activities
        const data = await this.fetchRedmine<{
          time_entry_activities: Array<{ id: number; name: string; active: boolean }>;
        }>("/enumerations/time_entry_activities.json");
        const activities = data.time_entry_activities || [];

        return {
          content: [
            {
              type: "text" as const,
              text:
                `Global time tracking activities:\n\n` +
                activities
                  .map(
                    (activity: { id: number; name: string; active: boolean }) =>
                      `ID: ${activity.id} - ${activity.name} (${activity.active ? "active" : "inactive"})`,
                  )
                  .join("\n") +
                `\n\nTotal: ${activities.length} activities. Note: Projects may have their own subset of activities.`,
            },
          ],
        };
      }
    } catch (error) {
      console.error("Error fetching time activities:", error);
      throw new Error(`Failed to fetch time activities: ${error}`);
    }
  }

  /**
   * Logs time spent on an issue or project in Redmine
   *
   * @param args - Time logging parameters
   * @param args.hours - Hours to log (required)
   * @param args.activity_id - Activity ID for the time entry (required)
   * @param args.issue_id - Issue ID to log time against
   * @param args.project_id - Project ID to log time against
   * @param args.comments - Comments for the time entry
   * @param args.spent_on - Date when time was spent (YYYY-MM-DD format)
   * @returns Promise resolving to time entry creation confirmation
   */
  private async logTime(
    args: LogTimeArgs,
  ): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      if (!args.hours) {
        throw new Error("hours is required");
      }

      if (!args.activity_id) {
        throw new Error(
          "activity_id is required. Use get_time_activities tool to get valid activity IDs for the project.",
        );
      }

      const timeData: Record<string, string | number> = {
        hours: args.hours,
        activity_id: args.activity_id,
      };

      if (args.issue_id) timeData["issue_id"] = args.issue_id;
      if (args.project_id) timeData["project_id"] = args.project_id;
      if (args.comments) timeData["comments"] = args.comments;
      if (args.spent_on) timeData["spent_on"] = args.spent_on;

      if (!timeData["issue_id"] && !timeData["project_id"]) {
        throw new Error("Either issue_id or project_id must be provided");
      }

      const data = await this.fetchRedmine("/time_entries.json", {
        method: "POST",
        body: { time_entry: timeData },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Time logged successfully: ${JSON.stringify(data, null, 2)}`,
          },
        ],
      };
    } catch (error) {
      console.error("Error logging time:", error);
      throw new Error(`Failed to log time: ${error}`);
    }
  }

  /**
   * Retrieves information about the current user based on API token
   *
   * @param args - Arguments for getting current user (optional include parameter)
   * @returns Promise resolving to current user information
   */
  private async getCurrentUser(
    args: GetCurrentUserArgs,
  ): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      const params: Record<string, string> = {};
      if (args.include) {
        params["include"] = args.include;
      }

      const data = await this.fetchRedmine("/users/current.json", { params });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      console.error("Error fetching current user:", error);
      throw new Error(`Failed to fetch current user: ${error}`);
    }
  }

  // Resource implementations
  /**
   * Retrieves projects resource for MCP resource access
   *
   * @returns Promise resolving to projects resource data
   */
  private async getProjectsResource() {
    try {
      const data = await this.fetchRedmine("/projects.json");
      return {
        contents: [
          {
            uri: "redmine://projects",
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to fetch projects resource: ${error}`);
    }
  }

  /**
   * Retrieves recent issues resource for MCP resource access
   *
   * @returns Promise resolving to recent issues resource data (last 10 updated)
   */
  private async getRecentIssuesResource() {
    try {
      const data = await this.fetchRedmine("/issues.json", {
        params: {
          sort: "updated_on:desc",
          limit: 10,
        },
      });
      return {
        contents: [
          {
            uri: "redmine://issues/recent",
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to fetch recent issues resource: ${error}`);
    }
  }

  /**
   * Retrieves recent time entries resource for MCP resource access
   *
   * @returns Promise resolving to recent time entries resource data (last 10 entries)
   */
  private async getRecentTimeEntriesResource() {
    try {
      const data = await this.fetchRedmine("/time_entries.json", {
        params: {
          limit: 10,
        },
      });
      return {
        contents: [
          {
            uri: "redmine://time_entries/recent",
            mimeType: "application/json",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Failed to fetch recent time entries resource: ${error}`);
    }
  }

  // Prompt implementations
  /**
   * Generates issue summary prompt for AI assistants
   *
   * @param args - Prompt parameters
   * @param args.project_id - Project ID to generate summary for (required)
   * @returns Formatted prompt for issue summarization
   */

  /**
   * Starts the MCP server and connects to stdio transport
   *
   * @returns Promise that resolves when server is running
   */
  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Redmine MCP Server running on stdio");
  }
}

// Main execution
/**
 * Main entry point - creates and starts the Redmine MCP server
 *
 * @returns Promise that resolves when server starts successfully
 */
async function main(): Promise<void> {
  try {
    const server = new RedmineMCPServer();
    await server.run();
  } catch (error) {
    console.error("Failed to start Redmine MCP Server:", error);
    process.exit(1);
  }
}

// Handle process termination
process.on("SIGINT", async () => {
  console.error("Received SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.error("Received SIGTERM, shutting down gracefully...");
  process.exit(0);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(error => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}
