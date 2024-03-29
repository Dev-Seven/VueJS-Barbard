import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    includeSource: ["src/**/*test.ts"],
    exclude: ["lib/**/*"],
    coverage: {
      reporter: ["html", "text"],
    },
  },
});
