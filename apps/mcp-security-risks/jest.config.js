const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

module.exports = createJestConfig({
  displayName: '@mcp-security-risks/mcp-security-risks',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../coverage/apps/mcp-security-risks',
  testEnvironment: 'jsdom',
});
