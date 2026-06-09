import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    testTimeout: 30000,
    env: {
      JWT_ACCESS_SECRET: 'test_access_secret',
      JWT_REFRESH_SECRET: 'test_refresh_secret',
      MONGODB_URI: 'mongodb://localhost:27017/test',
      BASE_URL: 'http://localhost:3000',
    },
  },
});
