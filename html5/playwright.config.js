import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'src/test/e2e',
  timeout: 30000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npx http-server src -p 4173 -s',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
  },
});
