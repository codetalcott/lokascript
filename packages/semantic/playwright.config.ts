import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './editor',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npx http-server ../.. -p 3000 -c-1',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },

  timeout: 30000,
  globalTimeout: 600000,
});
