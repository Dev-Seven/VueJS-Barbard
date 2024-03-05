import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    includeSource: ["src/**/*test.ts"],
    exclude: ["lib/**/*", "node_modules/**/*"],
    coverage: {
      enabled: true,
      reporter: ["html", "text", "json-summary", "json"],
      reportOnFailure: true,
      thresholds: {
        lines: 100,
        branches: 100,
        functions: 100,
        statements: 100,
      },
    },
  },
});
