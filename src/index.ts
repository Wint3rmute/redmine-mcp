#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import axios, { AxiosInstance } from "axios";

// Types for Redmine API responses
interface RedmineIssue {
  id: number;
  subject: string;
  description?: string;
  status: {
    id: number;
    name: string;
  };
  priority: {
    id: number;
    name: string;
  };
  project: {
    id: number;
    name: string;
  };
  assigned_to?: {
    id: number;
    name: string;
  };
  created_on: string;
  updated_on: string;
}

interface RedmineProject {
  id: number;
  name: string;
  identifier: string;
  description?: string;
  status: number;
  created_on: string;
  updated_on: string;
}

interface RedmineTimeEntry {
  id: number;
  hours: number;
  comments: string;
  spent_on: string;
  issue?: {
    id: number;
    subject: string;
  };
  project: {
    id: number;
    name: string;
  };
  user: {
    id: number;
    name: string;
  };
  activity: {
    id: number;
    name: string;
  };
}

class RedmineMCPServer {
  private server: Server;
  private apiClient: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    // Get configuration from environment variables
    this.baseUrl = process.env.REDMINE_URL || "";
    this.apiKey = process.env.REDMINE_API_KEY || "";
    
    if (!this.baseUrl || !this.apiKey) {
      throw new Error("REDMINE_URL and REDMINE_API_KEY environment variables are required");
    }

    // Initialize API client
    this.apiClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "X-Redmine-API-Key": this.apiKey,
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });

    // Initialize MCP server
    this.server = new Server(
      {
        name: "redmine-mcp-server",
        version: "0.1.0",
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // Handle list tools request
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
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
              },
            },
          },
          {
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
          {
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
          {
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
          {
            name: "log_time",
            description: "Log time spent on an issue or project",
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
                  description: "Activity ID",
                },
              },
              required: ["hours"],
            },
          },
          {
            name: "get_current_user",
            description: "Get information about the current user (based on API token)",
            inputSchema: {
              type: "object",
              properties: {},
            },
          },
        ],
      };
    });

    // Handle call tool request
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "get_issues":
          return await this.getIssues(args || {});
        case "get_projects":
          return await this.getProjects(args || {});
        case "create_issue":
          return await this.createIssue(args || {});
        case "get_time_entries":
          return await this.getTimeEntries(args || {});
        case "log_time":
          return await this.logTime(args || {});
        case "get_current_user":
          return await this.getCurrentUser(args || {});
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

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
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
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
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "issue_summary":
          return this.getIssueSummaryPrompt(args || {});
        case "time_report":
          return this.getTimeReportPrompt(args || {});
        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    });
  }

  // Tool implementations
  private async getIssues(args: any) {
    try {
      const params: any = {};
      
      if (args?.project_id) params.project_id = args.project_id;
      if (args?.status_id) params.status_id = args.status_id;
      if (args?.assigned_to_id) params.assigned_to_id = args.assigned_to_id;
      if (args?.limit) params.limit = args.limit;
      
      // Sort by priority (descending) by default, then by updated date
      params.sort = "priority:desc,updated_on:desc";

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

  private async getProjects(args: any) {
    try {
      const params: any = {};
      if (args?.limit) params.limit = args.limit;
      if (args?.name) params.name = args.name;

      const response = await this.apiClient.get("/projects.json", { params });
      
      let projects = response.data.projects || [];
      
      // If name filter is provided and Redmine API doesn't support it, filter client-side
      if (args?.name && projects.length > 0) {
        const searchTerm = args.name.toLowerCase();
        projects = projects.filter((project: any) => 
          project.name.toLowerCase().includes(searchTerm)
        );
      }
      
      // Create mapping from project name to ID
      const projectMapping: { [key: string]: number } = {};
      projects.forEach((project: any) => {
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

  private async createIssue(args: any) {
    try {
      if (!args?.project_id || !args?.subject) {
        throw new Error("project_id and subject are required");
      }

      const issueData: any = {
        project_id: args.project_id,
        subject: args.subject,
      };

      if (args.description) issueData.description = args.description;
      if (args.priority_id) issueData.priority_id = args.priority_id;
      if (args.assigned_to_id) issueData.assigned_to_id = args.assigned_to_id;

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

  private async getTimeEntries(args: any) {
    try {
      const params: any = {};
      
      if (args?.project_id) params.project_id = args.project_id;
      if (args?.issue_id) params.issue_id = args.issue_id;
      if (args?.user_id) params.user_id = args.user_id;
      if (args?.from) params.from = args.from;
      if (args?.to) params.to = args.to;
      if (args?.limit) params.limit = args.limit;

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

  private async logTime(args: any) {
    try {
      if (!args?.hours) {
        throw new Error("hours is required");
      }

      const timeData: any = {
        hours: args.hours,
      };

      if (args.issue_id) timeData.issue_id = args.issue_id;
      if (args.project_id) timeData.project_id = args.project_id;
      if (args.comments) timeData.comments = args.comments;
      if (args.spent_on) timeData.spent_on = args.spent_on;
      if (args.activity_id) timeData.activity_id = args.activity_id;

      if (!timeData.issue_id && !timeData.project_id) {
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

  private async getCurrentUser(args: any) {
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
  private getIssueSummaryPrompt(args: any) {
    const projectId = args?.project_id;
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

  private getTimeReportPrompt(args: any) {
    const projectId = args?.project_id;
    const userId = args?.user_id;
    const fromDate = args?.from_date;
    const toDate = args?.to_date;

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

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Redmine MCP Server running on stdio");
  }
}

// Main execution
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
  main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });
}