module.exports = {
    transform: {
      "^.+\\.(js|jsx)$": "babel-jest", // Transforms JS and JSX files using Babel
    },
    moduleNameMapper: {
      "\\.(css|less)$": "jest-transform-stub", // Mocks CSS imports to avoid issues
    },
    testEnvironment: "jsdom", // Use jsdom for the test environment
  };
  