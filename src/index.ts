#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import axios, { type AxiosInstance } from "axios";
import { config } from "./config/index.js";
import type {
  GetIssuesArgs,
  GetProjectsArgs,
  CreateIssueArgs,
  UpdateIssueArgs,
  GetIssueByIdArgs,
  GetTimeEntriesArgs,
  LogTimeArgs,
  PromptArgs,
  RedmineProject,
} from "./types/index.js";

/**
 * Redmine MCP Server - Provides Model Context Protocol interface for Redmine API
 *
 * This class implements an MCP server that exposes Redmine functionality through
 * standardized tools, resources, and prompts for AI assistants and other clients.
 */
class RedmineMCPServer {
  private server: Server;
  private apiClient: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;

  /**
   * Creates a new RedmineMCPServer instance
   *
   * Initializes the MCP server with Redmine API configuration and sets up
   * the HTTP client for making API requests.
   */
  constructor() {
    // Get configuration from validated config
    this.baseUrl = config.redmine.url;
    this.apiKey = config.redmine.apiKey;

    // Initialize API client
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "X-Redmine-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      timeout: config.redmine.timeout,
    });

    // Define tools statically as an object keyed by tool name
    const tools = {
      get_issues: {
        name: "get_issues",
        description: "Get issues from Redmine with optional filtering",
        inputSchema: {
          type: "object",
          properties: {
            project_id: {
              type: "string",
              description: "Project ID or identifier to filter issues",
            },
            status_id: {
              type: "string",
              description: "Status ID to filter issues (e.g., 'open', 'closed', or specific ID)",
            },
            assigned_to_id: {
              type: "string",
              description: "User ID to filter issues assigned to specific user",
            },
            limit: {
              type: "number",
              description: "Maximum number of issues to return",
              default: 25,
            },
            issue_id: {
              type: "string",
              description: "Single issue ID or comma-separated list of issue IDs",
            },
            subject: {
              type: "string",
              description: "Search for issues containing this text in the subject/title",
            },
          },
        },
      },
      get_projects: {
        name: "get_projects",
        description: "Get mapping of project names to their IDs from Redmine",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Maximum number of projects to return",
              default: 100,
            },
            name: {
              type: "string",
              description: "Search for projects containing this name (case-insensitive)",
            },
          },
        },
      },
      get_issue_by_id: {
        name: "get_issue_by_id",
        description: "Get a specific issue by its ID from Redmine",
        inputSchema: {
          type: "object",
          properties: {
            issue_id: {
              type: "number",
              description: "The ID of the issue to retrieve",
            },
          },
          required: ["issue_id"],
        },
      },
      create_issue: {
        name: "create_issue",
        description: "Create a new issue in Redmine",
        inputSchema: {
          type: "object",
          properties: {
            project_id: {
              type: "string",
              description: "Project ID or identifier where to create the issue",
            },
            subject: {
              type: "string",
              description: "Issue subject/title",
            },
            description: {
              type: "string",
              description: "Issue description",
            },
            priority_id: {
              type: "number",
              description: "Priority ID",
            },
            assigned_to_id: {
              type: "number",
              description: "User ID to assign the issue to",
            },
          },
          required: ["project_id", "subject"],
        },
      },
      update_issue: {
        name: "update_issue",
        description: "Update an existing issue in Redmine",
        inputSchema: {
          type: "object",
          properties: {
            issue_id: {
              type: "number",
              description: "Issue ID to update",
            },
            subject: {
              type: "string",
              description: "Issue subject/title",
            },
            description: {
              type: "string",
              description: "Issue description",
            },
            priority_id: {
              type: "number",
              description: "Priority ID",
            },
            assigned_to_id: {
              type: "number",
              description: "User ID to assign the issue to",
            },
            status_id: {
              type: "number",
              description: "Status ID",
            },
            done_ratio: {
              type: "number",
              description: "Completion percentage (0-100)",
            },
            notes: {
              type: "string",
              description: "Notes to add to the issue (visible in issue history)",
            },
          },
          required: ["issue_id"],
        },
      },
      get_time_entries: {
        name: "get_time_entries",
        description: "Get time entries from Redmine",
        inputSchema: {
          type: "object",
          properties: {
            project_id: {
              type: "string",
              description: "Project ID to filter time entries",
            },
            issue_id: {
              type: "string",
              description: "Issue ID to filter time entries",
            },
            user_id: {
              type: "string",
              description: "User ID to filter time entries",
            },
            from: {
              type: "string",
              description: "Start date (YYYY-MM-DD format)",
            },
            to: {
              type: "string",
              description: "End date (YYYY-MM-DD format)",
            },
            limit: {
              type: "number",
              description: "Maximum number of time entries to return",
              default: 25,
            },
          },
        },
      },
      get_time_activities: {
        name: "get_time_activities",
        description:
          "Get available time tracking activities for a project or globally. Use this before logging time to get valid activity IDs.",
        inputSchema: {
          type: "object",
          properties: {
            project_id: {
              type: "number",
              description:
                "Project ID to get project-specific activities. If omitted, returns global activities.",
            },
          },
        },
      },
      log_time: {
        name: "log_time",
        description:
          "Log time spent on an issue or project. Activity ID is required - use get_time_activities first to see available options.",
        inputSchema: {
          type: "object",
          properties: {
            issue_id: {
              type: "number",
              description: "Issue ID to log time against",
            },
            project_id: {
              type: "number",
              description: "Project ID to log time against",
            },
            hours: {
              type: "number",
              description: "Hours to log",
            },
            comments: {
              type: "string",
              description: "Comments for the time entry",
            },
            spent_on: {
              type: "string",
              description: "Date when time was spent (YYYY-MM-DD format, defaults to today)",
            },
            activity_id: {
              type: "number",
              description:
                "Activity ID (required). Use get_time_activities tool to get valid IDs for the project.",
            },
          },
          required: ["hours", "activity_id"],
        },
      },
      get_current_user: {
        name: "get_current_user",
        description: "Get information about the current user (based on API token)",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    };

    // Initialize MCP server with static tools as an object
    this.server = new Server(
      {
        name: config.server.name,
        version: config.server.version,
      },
      {
        capabilities: {
          tools,
          resources: {},
          prompts: {},
        },
      },
    );

    // Register tool call handler directly in constructor
    this.server.setRequestHandler(CallToolRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "get_issues":
          return await this.getIssues((args || {}) as GetIssuesArgs);
        case "get_projects":
          return await this.getProjects((args || {}) as GetProjectsArgs);
        case "get_issue_by_id":
          return await this.getIssueById((args || {}) as unknown as GetIssueByIdArgs);
        case "create_issue":
          return await this.createIssue((args || {}) as unknown as CreateIssueArgs);
        case "update_issue":
          return await this.updateIssue((args || {}) as unknown as UpdateIssueArgs);
        case "get_time_entries":
          return await this.getTimeEntries((args || {}) as GetTimeEntriesArgs);
        case "get_time_activities":
          return await this.getTimeActivities((args || {}) as { project_id?: number });
        case "log_time":
          return await this.logTime((args || {}) as unknown as LogTimeArgs);
        case "get_current_user":
          return await this.getCurrentUser();
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

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

    // Handle list resources request
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "redmine://projects",
            name: "Projects List",
            description: "List of all accessible Redmine projects",
            mimeType: "application/json",
          },
          {
            uri: "redmine://issues/recent",
            name: "Recent Issues",
            description: "Recently updated issues across all projects",
            mimeType: "application/json",
          },
          {
            uri: "redmine://time_entries/recent",
            name: "Recent Time Entries",
            description: "Recently logged time entries",
            mimeType: "application/json",
          },
        ],
      };
    });

    // Handle read resource request
    this.server.setRequestHandler(ReadResourceRequestSchema, async request => {
      const { uri } = request.params;

      switch (uri) {
        case "redmine://projects":
          return await this.getProjectsResource();
        case "redmine://issues/recent":
          return await this.getRecentIssuesResource();
        case "redmine://time_entries/recent":
          return await this.getRecentTimeEntriesResource();
        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });

    // Handle list prompts request
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "issue_summary",
            description: "Generate a summary of project issues and their status",
            arguments: [
              {
                name: "project_id",
                description: "Project ID to summarize",
                required: true,
              },
            ],
          },
          {
            name: "time_report",
            description: "Generate a time tracking report",
            arguments: [
              {
                name: "project_id",
                description: "Project ID for the report",
                required: false,
              },
              {
                name: "user_id",
                description: "User ID for the report",
                required: false,
              },
              {
                name: "from_date",
                description: "Start date for the report (YYYY-MM-DD)",
                required: false,
              },
              {
                name: "to_date",
                description: "End date for the report (YYYY-MM-DD)",
                required: false,
              },
            ],
          },
        ],
      };
    });

    // Handle get prompt request
    this.server.setRequestHandler(GetPromptRequestSchema, async request => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "issue_summary":
          return this.getIssueSummaryPrompt((args || {}) as PromptArgs);
        case "time_report":
          return this.getTimeReportPrompt((args || {}) as PromptArgs);
        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    });
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

      // Sort by priority (descending) by default, then by updated date
      params["sort"] = "priority:desc,updated_on:desc";

      const response = await this.apiClient.get("/issues.json", { params });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2),
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
      const response = await this.apiClient.get(`/issues/${args.issue_id}.json`);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2),
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

      const response = await this.apiClient.get("/projects.json", { params });

      let projects = response.data.projects || [];

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

      const response = await this.apiClient.post("/issues.json", {
        issue: issueData,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Issue created successfully: ${JSON.stringify(response.data, null, 2)}`,
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

      const response = await this.apiClient.put(`/issues/${args.issue_id}.json`, {
        issue: issueData,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Issue updated successfully: ${JSON.stringify(response.data, null, 2)}`,
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

      const response = await this.apiClient.get("/time_entries.json", { params });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2),
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
  private async getTimeActivities(args: {
    project_id?: number;
  }): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      let response;

      if (args.project_id) {
        // Get project-specific activities
        response = await this.apiClient.get(
          `/projects/${args.project_id}.json?include=time_entry_activities`,
        );
        const activities = response.data.project.time_entry_activities || [];

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
        response = await this.apiClient.get("/enumerations/time_entry_activities.json");
        const activities = response.data.time_entry_activities || [];

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

      const response = await this.apiClient.post("/time_entries.json", {
        time_entry: timeData,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: `Time logged successfully: ${JSON.stringify(response.data, null, 2)}`,
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
   * @returns Promise resolving to current user information
   */
  private async getCurrentUser(): Promise<{ content: Array<{ type: "text"; text: string }> }> {
    try {
      const response = await this.apiClient.get("/users/current.json");

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(response.data, null, 2),
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
      const response = await this.apiClient.get("/projects.json");
      return {
        contents: [
          {
            uri: "redmine://projects",
            mimeType: "application/json",
            text: JSON.stringify(response.data, null, 2),
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
      const response = await this.apiClient.get("/issues.json", {
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
            text: JSON.stringify(response.data, null, 2),
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
      const response = await this.apiClient.get("/time_entries.json", {
        params: {
          limit: 10,
        },
      });
      return {
        contents: [
          {
            uri: "redmine://time_entries/recent",
            mimeType: "application/json",
            text: JSON.stringify(response.data, null, 2),
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
  private getIssueSummaryPrompt(args: PromptArgs): {
    description: string;
    messages: Array<{ role: "user"; content: { type: "text"; text: string } }>;
  } {
    const projectId = args.project_id;
    if (!projectId) {
      throw new Error("project_id is required for issue summary");
    }

    return {
      description: `Generate a comprehensive summary of issues for Redmine project ID ${projectId}`,
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please generate a comprehensive summary of issues for Redmine project ID ${projectId}. Use the get_issues tool to fetch the issues data and then provide:

1. **Project Overview**: Brief description of the project
2. **Issue Statistics**: Total count, breakdown by status, priority distribution
3. **Recent Activity**: Most recently updated issues
4. **Assignment Overview**: Who is assigned to what
5. **Key Issues**: Highlight any high-priority or overdue items
6. **Recommendations**: Suggest any actions that might be needed

Format the response in a clear, organized manner that would be useful for a project manager or team lead.`,
          },
        },
      ],
    };
  }

  /**
   * Generates time report prompt for AI assistants
   *
   * @param args - Prompt parameters
   * @param args.project_id - Project ID to generate report for
   * @param args.user_id - User ID to filter time entries by
   * @param args.from_date - Start date for time report
   * @param args.to_date - End date for time report
   * @returns Formatted prompt for time reporting
   */
  private getTimeReportPrompt(args: PromptArgs): {
    description: string;
    messages: Array<{ role: "user"; content: { type: "text"; text: string } }>;
  } {
    const projectId = args.project_id;
    const userId = args.user_id;
    const fromDate = args.from_date;
    const toDate = args.to_date;

    let timeFilter = "";
    if (projectId) timeFilter += ` for project ID ${projectId}`;
    if (userId) timeFilter += ` for user ID ${userId}`;
    if (fromDate) timeFilter += ` from ${fromDate}`;
    if (toDate) timeFilter += ` to ${toDate}`;

    return {
      description: `Generate a time tracking report${timeFilter}`,
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: `Please generate a time tracking report${timeFilter}. Use the get_time_entries tool to fetch the time entry data and then provide:

1. **Summary Statistics**: 
   - Total hours logged
   - Average hours per day/week
   - Number of entries

2. **Breakdown by Project**: Hours spent on each project (if multiple projects)

3. **Breakdown by Activity**: Hours spent on different activity types

4. **Daily/Weekly Patterns**: When most time is being logged

5. **Issue Analysis**: Time spent on specific issues (if applicable)

6. **Utilization Insights**: Analysis of time allocation and productivity patterns

Format the report in a professional manner suitable for time tracking review or billing purposes.`,
          },
        },
      ],
    };
  }

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
