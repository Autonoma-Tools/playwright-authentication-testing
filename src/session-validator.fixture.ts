import { test, request, expect, Page, BrowserContext } from '@playwright/test';
import path from 'path';
import fs from 'fs';

const STORAGE_STATE = path.join(__dirname, '../.auth/user.json');
const BASE_URL      = process.env.BASE_URL ?? 'http://localhost:3000';

/**
 * Session-validation fixture.
 *
 * Before each test, makes a lightweight authenticated request to /api/me.
 * If the response is 401, the saved state is stale (expired JWT or revoked
 * session). The fixture then re-runs the login flow, writes a fresh state
 * file, and hands the test a page loaded with the new session.
 *
 * Use this for:
 *   - Long-running suites where the suite runs longer than the JWT TTL
 *   - Providers that issue short-lived tokens (e.g., 1-hour JWTs)
 *   - Suites that run across multiple days in CI
 *
 * Not needed when:
 *   - Your session TTL is longer than your longest suite run
 *   - You refresh state as a scheduled CI step before the suite starts
 *
 * Run: npx playwright test
 */
export const authedTest = test.extend<{ authedPage: Page }>({
  authedPage: async ({ browser }, use) => {
    let storageState: string | undefined = STORAGE_STATE;

    // Check whether the saved state is still valid.
    const rc = await request.newContext({ storageState, baseURL: BASE_URL });
    const probe = await rc.get('/api/me');
    await rc.dispose();

    if (probe.status() === 401) {
      // State is stale — delete it and re-authenticate via the UI.
      if (fs.existsSync(STORAGE_STATE)) {
        fs.unlinkSync(STORAGE_STATE);
      }

      const setupContext: BrowserContext = await browser.newContext();
      const setupPage = await setupContext.newPage();

      await setupPage.goto(`${BASE_URL}/login`);
      await setupPage.getByLabel('Email').fill(process.env.TEST_EMAIL ?? 'test@example.com');
      await setupPage.getByLabel('Password').fill(process.env.TEST_PASSWORD ?? 'password');
      await setupPage.getByRole('button', { name: 'Sign in' }).click();
      await setupPage.waitForURL(`${BASE_URL}/dashboard`);

      await setupContext.storageState({ path: STORAGE_STATE });
      await setupContext.close();
    }

    // Create the test context with the valid (or freshly-renewed) state.
    const context = await browser.newContext({ storageState: STORAGE_STATE });
    const authedPage = await context.newPage();

    await use(authedPage);

    await context.close();
  },
});
