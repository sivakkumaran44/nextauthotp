import type { Config } from 'jest'
import nextJest from 'next/jest'
const createJestConfig = nextJest({
 dir: './',
})
const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
     '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
  '^.+\\.(css|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
   '^.+\\.(jpg|jpeg|png|gif|webp|avif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
  },
  collectCoverageFrom: [
    'components/**/*.{js,jsx,ts,tsx}',
    'pages/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
    testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
}
export default createJestConfig(config)