import { test as setup, Browser, BrowserContext } from '@playwright/test';
import path from 'path';

const ADMIN_STATE = path.join(__dirname, '../.auth/admin.json');
const USER_STATE  = path.join(__dirname, '../.auth/user.json');

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

/**
 * Multi-role auth setup.
 *
 * Two setup tests, each writing to a separate state file.
 * In playwright.config.ts, define matching projects:
 *
 *   { name: 'setup-admin', testMatch: 'multi-role.setup.ts#admin' }
 *   { name: 'setup-user',  testMatch: 'multi-role.setup.ts#user'  }
 *
 * Or combine them into a single setup project by putting both .setup.ts
 * files in the same directory and using testMatch: '**\/*.setup.ts'.
 *
 * Run (separate projects): npx playwright test --project=setup-admin --project=setup-user
 */

setup('authenticate as admin', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);

  await page.getByLabel('Email').fill(process.env.ADMIN_EMAIL ?? 'admin@example.com');
  await page.getByLabel('Password').fill(process.env.ADMIN_PASSWORD ?? 'adminpassword');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL(`${BASE_URL}/admin/dashboard`);
  await page.context().storageState({ path: ADMIN_STATE });
});

setup('authenticate as user', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);

  await page.getByLabel('Email').fill(process.env.USER_EMAIL ?? 'user@example.com');
  await page.getByLabel('Password').fill(process.env.USER_PASSWORD ?? 'userpassword');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL(`${BASE_URL}/dashboard`);
  await page.context().storageState({ path: USER_STATE });
});

/**
 * Example: a single test that opens both an admin context and a user context
 * simultaneously, simulating two roles interacting in real time.
 *
 * Usage (separate from this setup file — place in a regular test file):
 *
 *   test('admin grants access; user sees the change', async ({ browser }) => {
 *     const adminContext = await browser.newContext({ storageState: '.auth/admin.json' });
 *     const userContext  = await browser.newContext({ storageState: '.auth/user.json' });
 *
 *     const adminPage = await adminContext.newPage();
 *     const userPage  = await userContext.newPage();
 *
 *     await adminPage.goto('/admin/permissions');
 *     await adminPage.getByRole('button', { name: 'Grant access' }).click();
 *
 *     await userPage.goto('/dashboard');
 *     await userPage.getByText('Access granted').waitFor();
 *
 *     await adminContext.close();
 *     await userContext.close();
 *   });
 */
