import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 120000, // 2 minutes for e2e tests with Docker
    hookTimeout: 60000, // 1 minute for setup/teardown
    exclude: [
      "**/node_modules/**",
      "**/build/**",
      "**/dist/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "json", "html"],
      reportsDirectory: "./coverage",
      exclude: [
        "**/node_modules/**",
        "**/build/**",
        "**/dist/**",
        "**/test/**",
        "**/*.config.*",
        "**/.{idea,git,cache,output,temp}/**",
      ],
    },
  },
});
