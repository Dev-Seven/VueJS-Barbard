module.exports = {
  testPathIgnorePatterns: [
    ".*/bin/",
    ".*/lib/",
    // Ignoring otherwise tests duplicate due to Jest `projects`
    ".*/__tests__/.*.ts",
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  globalSetup: "<rootDir>/test/globalSetup.ts",
  collectCoverageFrom: [
    "**/*.{ts,tsx}",
    "!**/node_modules/**",
    "!**/test-data/**",
  ],
  maxConcurrency: 10,
  projects: ["<rootDir>/apps/api", "<rootDir>/migrations"],
  reporters: ["default", "jest-junit"],
};
