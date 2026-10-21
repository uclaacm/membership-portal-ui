const nextJest = require("next/jest");

// next/jest compiles TS/JSX with Next's SWC and stubs out CSS and image imports
const createJestConfig = nextJest({ dir: "./" });

module.exports = createJestConfig({
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testRegex: "tests/.*\\.tests?\\.(js|ts)x?$",
});
