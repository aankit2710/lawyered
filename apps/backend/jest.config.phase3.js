/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testMatch: [
    '<rootDir>/test/ai/**/*.spec.ts',
    '<rootDir>/test/wills/chat.service.spec.ts',
    '<rootDir>/test/wills/snapshot-schema.spec.ts',
  ],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/modules/ai/**/*.ts', 'src/modules/wills/chat.service.ts'],
  coverageDirectory: 'coverage/phase3',
  testEnvironment: 'node',
};
