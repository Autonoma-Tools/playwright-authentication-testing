import { test as setup } from '@playwright/test';
import path from 'path';

export const STORAGE_STATE = path.join(__dirname, '../.auth/user.json');

/**
 * Auth setup test: runs once before the main test suite.
 * Navigates to the login page, submits credentials, and saves
 * the resulting browser state (cookies + localStorage) to disk.
 *
 * Run: npx playwright test --project=setup
 */
setup('authenticate', async ({ page }) => {
  const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

  await page.goto(`${baseURL}/login`);

  // Fill the login form — adjust selectors to match your app.
  await page.getByLabel('Email').fill(process.env.TEST_EMAIL ?? 'test@example.com');
  await page.getByLabel('Password').fill(process.env.TEST_PASSWORD ?? 'password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait until the app has fully navigated to the post-login page.
  await page.waitForURL(`${baseURL}/dashboard`);

  // Serialize cookies + storage so subsequent tests can reuse this session.
  await page.context().storageState({ path: STORAGE_STATE });
});
