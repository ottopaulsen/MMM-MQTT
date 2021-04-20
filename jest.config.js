module.exports = {
  moduleFileExtensions: ["js"],
  testEnvironment: "node",
  testRegex: "(/test/.*)\\.test.js$",
  testPathIgnorePatterns: ["setupJest.js"],
  setupFilesAfterEnv: ["<rootDir>/setupJest.js"],
  collectCoverageFrom: []
};
