export default {
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: ['/cdk.out/', '/build/', '/dist/'],
  transform: {
    '^.+\\.ts?$': 'ts-jest',
  },
}
