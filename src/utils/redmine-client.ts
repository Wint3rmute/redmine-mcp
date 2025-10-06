/**
 * Redmine API HTTP client utilities
 */

/**
 * Configuration for the Redmine HTTP client
 */
export interface RedmineClientConfig {
  baseUrl: string;
  apiKey: string;
  timeout: number;
}

/**
 * Options for making HTTP requests to the Redmine API
 */
export interface RedmineFetchOptions {
  method?: string;
  params?: Record<string, string | number>;
  body?: unknown;
}

/**
 * Creates a Redmine API client with the given configuration
 *
 * @param config - Configuration for the Redmine API client
 * @returns Function to make HTTP requests to the Redmine API
 */
export function createRedmineClient(config: RedmineClientConfig) {
  const { baseUrl, apiKey, timeout } = config;

  /**
   * Makes an HTTP request to the Redmine API using native fetch
   *
   * @param path - API endpoint path (e.g., "/issues.json")
   * @param options - Fetch options including method, body, etc.
   * @param options.method - HTTP method (GET, POST, PUT, DELETE)
   * @param options.params - Query parameters to append to URL
   * @param options.body - Request body to send (will be JSON stringified)
   * @returns Promise resolving to the parsed JSON response
   * @throws {Error} When the request fails or returns non-OK status
   */
  async function fetchRedmine<T = unknown>(
    path: string,
    options: RedmineFetchOptions = {},
  ): Promise<T> {
    const { method = "GET", params, body } = options;

    // Build URL with query parameters
    const url = new URL(path, baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    // Set up timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Build fetch options, only including body if it's defined
      const fetchOptions: RequestInit = {
        method,
        headers: {
          "X-Redmine-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      };

      // Only add body if it exists to satisfy exactOptionalPropertyTypes
      if (body !== undefined) {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await fetch(url.toString(), fetchOptions);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`Redmine API error: ${response.status} ${errorText}`);
      }

      // Check if response has content before parsing JSON
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return (await response.json()) as T;
      }

      // Return empty object for successful responses without content (e.g., 204 No Content)
      return {} as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    }
  }

  return fetchRedmine;
}
