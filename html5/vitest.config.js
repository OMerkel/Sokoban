import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/test/unit/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/js/**/*.js'],
      exclude: [],
      thresholds: {
        statements: 96,
        branches: 96,
        functions: 96,
        lines: 96,
      },
    },
  },
});
