module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'models/**/*.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!server.js',
    '!config/**',
    '!tests/**'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};