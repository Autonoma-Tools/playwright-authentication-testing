// NOTE: globalSetup is the legacy approach (pre-v1.31). Use setup projects instead.
import { defineConfig, devices } from '@playwright/test';

/**
 * Full Playwright config demonstrating the modern setup-project pattern.
 *
 * - The "setup" project runs auth.setup.ts files first.
 * - The "chromium" project declares setup as a dependency and loads the
 *   saved storageState so every test starts already authenticated.
 *
 * Docs: https://playwright.dev/docs/auth
 */
export default defineConfig({
  testDir: './src',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'setup',
      testMatch: '**/*.setup.ts',
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Load the saved auth state before every test in this project.
        storageState: '.auth/user.json',
      },
      // The setup project must finish before any chromium test starts.
      dependencies: ['setup'],
    },
  ],
});
