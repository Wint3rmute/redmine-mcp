/**
 * Main configuration module
 * Exports validated configuration for the entire application
 */

import { ConfigValidator, type ServerConfig } from "./server-config.js";

/**
 * Validated server configuration
 * This is the single source of truth for all configuration values
 */
export const config: ServerConfig = ConfigValidator.validate(process.env);

// Re-export types for convenience
export type { ServerConfig, RedmineConfig, ConfigValidationError } from "./server-config.js";
export { ConfigValidator } from "./server-config.js";
