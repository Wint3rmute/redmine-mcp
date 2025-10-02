/**
 * MCP (Model Context Protocol) related types
 * These types define the structure for MCP responses and resources
 */

/**
 * Standard MCP tool response format
 */
export interface ToolResponse<T = unknown> {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
  metadata?: T;
}

/**
 * MCP Resource content structure
 */
export interface ResourceContents {
  contents: Array<{
    uri: string;
    mimeType: string;
    text: string;
  }>;
}

/**
 * MCP Tool schema definition
 */
export interface ToolSchema {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, ToolPropertySchema>;
    required?: string[];
  };
}

/**
 * Tool property schema for input validation
 */
export interface ToolPropertySchema {
  type: "string" | "number" | "boolean" | "array" | "object";
  description: string;
  default?: unknown;
  enum?: unknown[];
  items?: ToolPropertySchema;
  properties?: Record<string, ToolPropertySchema>;
}

/**
 * MCP Resource definition
 */
export interface ResourceSchema {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

/**
 * MCP Prompt definition
 */
export interface PromptSchema {
  name: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}

/**
 * MCP Prompt response
 */
export interface PromptResponse {
  description: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: {
      type: "text";
      text: string;
    };
  }>;
}

/**
 * Tool execution context for error handling and logging
 */
export interface ToolExecutionContext {
  toolName: string;
  startTime: number;
  requestId?: string;
  userId?: string;
}

/**
 * Helper function for creating successful tool responses
 *
 * @param data - The response data to return
 * @param metadata - Optional metadata to include with the response
 * @returns Formatted successful tool response
 */
export function createSuccessResponse<T = unknown>(
  data: T,
  metadata?: unknown,
): ToolResponse<typeof metadata> {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2),
      },
    ],
    isError: false,
    metadata,
  };
}

/**
 * Helper function for creating error tool responses
 *
 * @param error - The error message or Error object
 * @param metadata - Optional metadata to include with the error response
 * @returns Formatted error tool response
 */
export function createErrorResponse(
  error: string | Error,
  metadata?: unknown,
): ToolResponse<typeof metadata> {
  const errorMessage = error instanceof Error ? error.message : error;

  return {
    content: [
      {
        type: "text",
        text: JSON.stringify({ error: errorMessage }, null, 2),
      },
    ],
    isError: true,
    metadata,
  };
}
