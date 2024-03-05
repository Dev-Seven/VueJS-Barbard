import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  define: {
    "import.meta.vitest": "undefined",
  },
  build: {
    lib: {
      entry: resolve(`${__dirname}/src`, "index.ts"),
      name: "data",
    },
  },
  plugins: [dts()],
  test: {
    includeSource: ["src/**/*.ts"],
    coverage: {
      reporter: ["html", "text"],
    },
  },
});
