const path = require("path");
const nextJest = require("next/jest");
const projectDir = path.resolve(__dirname, "..");

module.exports = nextJest({ dir: projectDir })({
  rootDir: projectDir,
  moduleNameMapper: { "^@/(.*)$": "<rootDir>/$1" },
  testEnvironment: "jsdom",
  testMatch: ["**/tests/profile-unsaved-changes.tests.jsx"],
});
