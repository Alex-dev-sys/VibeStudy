import { defineConfig, devices } from '@playwright/test';
import path from 'path';

// Resolve paths relative to project root (two levels up from config/tools/)
const projectRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  testDir: path.resolve(projectRoot, 'tests/e2e'),
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev:next',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
