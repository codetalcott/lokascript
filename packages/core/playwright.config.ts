import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  testDir: './src/compatibility/browser-tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],

  // Exclude debug tests from normal runs (use --project=debug to run them)
  testIgnore: ['**/debug/**'],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    navigationTimeout: 30000,
    ...devices['Desktop Chrome'],
  },

  // Tiered test projects for different scenarios
  projects: [
    {
      // Fast critical path tests (~10s) - run on every change
      name: 'smoke',
      grep: /@smoke/,
      timeout: 10000,
    },
    {
      // Integration tests (~60s) - run before commits
      name: 'integration',
      grep: /@integration/,
      timeout: 30000,
    },
    {
      // Full test suite - all tests except @skip
      name: 'full',
      grepInvert: /@skip/,
      timeout: 60000,
    },
    {
      // Comprehensive feature coverage (existing tag)
      name: 'comprehensive',
      grep: /@comprehensive/,
      timeout: 60000,
    },
    {
      // Cookbook pattern validation (existing tag)
      name: 'cookbook',
      grep: /@cookbook/,
      timeout: 60000,
    },
    {
      // Debug/diagnostic tests - only run explicitly
      name: 'debug',
      testDir: './src/compatibility/browser-tests/debug',
      testIgnore: [],
      timeout: 120000,
    },
  ],

  webServer: {
    command: 'npx http-server ../.. -p 3000 -c-1',
    port: 3000,
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    cwd: __dirname,
  },

  timeout: 30000,
  globalTimeout: 600000,
});