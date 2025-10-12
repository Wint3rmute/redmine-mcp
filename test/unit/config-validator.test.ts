import { describe, it, expect } from "vitest";
import { ConfigValidator } from "../../src/config/server-config.js";

/**
 * Unit tests for ConfigValidator
 * Tests environment variable validation and configuration generation
 */
describe("ConfigValidator", () => {
  describe("validate", () => {
    it("should successfully validate with all required environment variables", () => {
      const envVars = {
        REDMINE_URL: "https://redmine.example.com",
        REDMINE_API_KEY: "test_api_key_123",
      };

      const config = ConfigValidator.validate(envVars);

      expect(config).toBeDefined();
      expect(config.redmine.url).toBe("https://redmine.example.com");
      expect(config.redmine.apiKey).toBe("test_api_key_123");
      expect(config.redmine.timeout).toBe(10000); // default timeout
      expect(config.server.name).toBe("redmine-mcp-server");
      expect(config.server.version).toBe("0.1.0");
    });

    it("should remove trailing slash from URL", () => {
      const envVars = {
        REDMINE_URL: "https://redmine.example.com/",
        REDMINE_API_KEY: "test_api_key_123",
      };

      const config = ConfigValidator.validate(envVars);

      expect(config.redmine.url).toBe("https://redmine.example.com");
    });

    it("should use custom timeout when provided", () => {
      const envVars = {
        REDMINE_URL: "https://redmine.example.com",
        REDMINE_API_KEY: "test_api_key_123",
        REDMINE_TIMEOUT: "20000",
      };

      const config = ConfigValidator.validate(envVars);

      expect(config.redmine.timeout).toBe(20000);
    });

    it("should throw error when REDMINE_URL is missing", () => {
      const envVars = {
        REDMINE_API_KEY: "test_api_key_123",
      };

      expect(() => ConfigValidator.validate(envVars)).toThrow(/Configuration validation failed/);
    });

    it("should throw error when REDMINE_API_KEY is missing", () => {
      const envVars = {
        REDMINE_URL: "https://redmine.example.com",
      };

      expect(() => ConfigValidator.validate(envVars)).toThrow(/Configuration validation failed/);
    });

    it("should throw error when REDMINE_URL is empty string", () => {
      const envVars = {
        REDMINE_URL: "",
        REDMINE_API_KEY: "test_api_key_123",
      };

      expect(() => ConfigValidator.validate(envVars)).toThrow(/Configuration validation failed/);
    });

    it("should throw error when REDMINE_API_KEY is empty string", () => {
      const envVars = {
        REDMINE_URL: "https://redmine.example.com",
        REDMINE_API_KEY: "",
      };

      expect(() => ConfigValidator.validate(envVars)).toThrow(/Configuration validation failed/);
    });

    it("should handle various valid URL formats", () => {
      const envVars = {
        REDMINE_URL: "http://localhost:3000",
        REDMINE_API_KEY: "test_api_key_123",
      };

      const config = ConfigValidator.validate(envVars);

      expect(config.redmine.url).toBe("http://localhost:3000");
    });

    it("should throw error when timeout is not a valid number", () => {
      const envVars = {
        REDMINE_URL: "https://redmine.example.com",
        REDMINE_API_KEY: "test_api_key_123",
        REDMINE_TIMEOUT: "not-a-number",
      };

      expect(() => ConfigValidator.validate(envVars)).toThrow(/Configuration validation failed/);
    });

    it("should throw error when timeout is negative", () => {
      const envVars = {
        REDMINE_URL: "https://redmine.example.com",
        REDMINE_API_KEY: "test_api_key_123",
        REDMINE_TIMEOUT: "-1000",
      };

      expect(() => ConfigValidator.validate(envVars)).toThrow(/Configuration validation failed/);
    });
  });
});
