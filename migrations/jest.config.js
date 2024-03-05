module.exports = {
  testPathIgnorePatterns: [".*/bin/", ".*/lib/"],
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/node_modules/**",
    "!**/test-data/**",
  ],
  maxConcurrency: 10,
  globalSetup: "<rootDir>/../test/globalSetup.ts",
};
