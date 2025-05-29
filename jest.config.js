const nextJest = require("next/jest")

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
})

// Add any custom config to be passed to Jest
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  testEnvironment: "jsdom",
  moduleNameMapping: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "components/**/*.{js,jsx,ts,tsx}",
    "hooks/**/*.{js,jsx,ts,tsx}",
    "lib/**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
    "!**/__mocks__/**",
  ],
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/__tests__/__mocks__/", // Ignore mock files
    "<rootDir>/__mocks__/", // Also ignore root level mocks
  ],
  // Handle module mocks
  moduleDirectories: ["node_modules", "<rootDir>"],
  testMatch: [
    "**/__tests__/**/*.(ts|tsx|js)",
    "**/*.(test|spec).(ts|tsx|js)",
    "!**/__tests__/__mocks__/**", // Exclude mocks from test matching
    "!**/__mocks__/**", // Exclude root level mocks
  ],
  // Increase timeout for async tests
  testTimeout: 10000,
  // Handle async operations better
  maxWorkers: 1,
  // Suppress console output during tests
  silent: false,
  verbose: true,
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
