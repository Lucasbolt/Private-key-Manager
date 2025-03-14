module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: ['src/**/*.ts'],
    // maxWorkers: '50%',
    testPathIgnorePatterns: ['/node_modules/', '/dist/'], 
  };