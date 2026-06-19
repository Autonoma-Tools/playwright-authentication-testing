import { test as setup, test, expect, Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

/**
 * Per-worker auth setup.
 *
 * Uses testInfo.parallelIndex to write each Playwright worker's auth state
 * to a unique file (.auth/user-0.json, .auth/user-1.json, ...) so that
 * concurrent workers never collide on the same file.
 *
 * NOTE: this is an advanced pattern for suites where server-side session
 * data conflicts across concurrent requests (e.g., per-session rate limits
 * or mutating fixtures). If your app handles concurrent sessions correctly,
 * the default single-setup-project approach is the right choice.
 *
 * Run: npx playwright test --workers=4
 */
setup('authenticate per worker', async ({ page }, testInfo) => {
  const stateFile = path.join(
    __dirname,
    `../.auth/user-${testInfo.parallelIndex}.json`
  );

  // Ensure the .auth directory exists before writing.
  fs.mkdirSync(path.dirname(stateFile), { recursive: true });

  await page.goto(`${BASE_URL}/login`);

  await page.getByLabel('Email').fill(process.env.TEST_EMAIL ?? 'test@example.com');
  await page.getByLabel('Password').fill(process.env.TEST_PASSWORD ?? 'password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL(`${BASE_URL}/dashboard`);
  await page.context().storageState({ path: stateFile });
});

/**
 * Custom fixture that loads the per-worker state file so individual tests
 * receive an already-authenticated page without any extra configuration.
 *
 * Usage in tests:
 *
 *   import { test } from './parallel.setup';
 *
 *   test('dashboard loads', async ({ authedPage }) => {
 *     await authedPage.goto('/dashboard');
 *     await expect(authedPage.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
 *   });
 */
export const authedTest = test.extend<{ authedPage: Page }>({
  authedPage: async ({ browser }, use, testInfo) => {
    const stateFile = path.join(
      __dirname,
      `../.auth/user-${testInfo.parallelIndex}.json`
    );

    const context = await browser.newContext({ storageState: stateFile });
    const authedPage = await context.newPage();

    await use(authedPage);

    await context.close();
  },
});
