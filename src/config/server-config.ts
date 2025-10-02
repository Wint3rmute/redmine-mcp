/**
 * Server configuration interfaces and types
 */

export interface RedmineConfig {
  url: string;
  apiKey: string;
  timeout: number;
}

export interface ServerConfig {
  redmine: RedmineConfig;
  server: {
    name: string;
    version: string;
  };
}

export interface ConfigValidationError {
  field: string;
  message: string;
}

/**
 * Configuration validator with proper error handling
 */
export class ConfigValidator {
  private static errors: ConfigValidationError[] = [];

  /**
   * Validates environment variables and returns server configuration
   *
   * @param envVars - Environment variables object to validate
   * @returns Validated server configuration object
   * @throws {Error} When required environment variables are missing or invalid
   */
  static validate(envVars: Record<string, string | undefined>): ServerConfig {
    this.errors = [];

    const redmineUrl = this.validateRequired(envVars["REDMINE_URL"], "REDMINE_URL");
    const redmineApiKey = this.validateRequired(envVars["REDMINE_API_KEY"], "REDMINE_API_KEY");
    const timeout = this.parseTimeout(envVars["REDMINE_TIMEOUT"]);

    if (this.errors.length > 0) {
      const errorMessages = this.errors.map(err => `${err.field}: ${err.message}`).join("\n");
      throw new Error(`Configuration validation failed:\n${errorMessages}`);
    }

    return {
      redmine: {
        url: this.normalizeUrl(redmineUrl),
        apiKey: redmineApiKey,
        timeout,
      },
      server: {
        name: "redmine-mcp-server",
        version: "0.1.0",
      },
    };
  }

  /**
   * Validates that a required environment variable has a non-empty value.
   * @param value - The environment variable value to validate
   * @param fieldName - The name of the environment variable field for error reporting
   * @returns The trimmed value if valid, empty string if invalid
   */
  private static validateRequired(value: string | undefined, fieldName: string): string {
    if (!value || value.trim() === "") {
      this.errors.push({
        field: fieldName,
        message: "is required and cannot be empty",
      });
      return "";
    }
    return value.trim();
  }

  /**
   * Parses and validates the timeout value from environment variable.
   * @param value - The timeout value as a string from environment variables
   * @returns The parsed timeout in milliseconds, or default 10000ms if invalid
   */
  private static parseTimeout(value: string | undefined): number {
    const defaultTimeout = 10000;

    if (!value) {
      return defaultTimeout;
    }

    const parsed = parseInt(value, 10);
    if (isNaN(parsed) || parsed <= 0) {
      this.errors.push({
        field: "REDMINE_TIMEOUT",
        message: "must be a positive number",
      });
      return defaultTimeout;
    }

    return parsed;
  }

  /**
   * Normalizes and validates a URL by removing trailing slashes and checking format.
   * @param url - The URL string to normalize and validate
   * @returns The normalized URL if valid, or original URL if invalid (with error logged)
   */
  private static normalizeUrl(url: string): string {
    if (!url) {
      return "";
    }

    // Remove trailing slash
    const normalized = url.replace(/\/$/, "");

    // Validate URL format
    try {
      new URL(normalized);
    } catch {
      this.errors.push({
        field: "REDMINE_URL",
        message: "must be a valid URL",
      });
      return url;
    }

    return normalized;
  }
}
