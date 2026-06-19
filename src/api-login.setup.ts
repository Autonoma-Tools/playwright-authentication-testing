import { test as setup, request } from '@playwright/test';
import path from 'path';

export const STORAGE_STATE = path.join(__dirname, '../.auth/user.json');

/**
 * API-based auth setup: POSTs credentials directly to the login endpoint
 * instead of going through the UI. This avoids page loads, fragile selectors,
 * and redesign-induced breakage.
 *
 * Faster and more stable than UI login for auth setup purposes.
 * Note: this bypasses client-side login validation — keep a separate UI
 * login test if you want to verify the login flow itself.
 *
 * Requires a running app at BASE_URL with a REST login endpoint that sets
 * session cookies on success.
 *
 * Run: npx playwright test --project=setup
 */
setup('authenticate via API', async () => {
  const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';

  // Create a standalone request context — no browser needed.
  const requestContext = await request.newContext({
    baseURL,
  });

  const response = await requestContext.post('/api/auth/login', {
    data: {
      email:    process.env.TEST_EMAIL    ?? 'test@example.com',
      password: process.env.TEST_PASSWORD ?? 'password',
    },
  });

  if (!response.ok()) {
    throw new Error(
      `API login failed: ${response.status()} ${await response.text()}`
    );
  }

  // Serialize cookies from the request context (includes the session cookie
  // set by the login endpoint) to a JSON file that test projects can reuse.
  await requestContext.storageState({ path: STORAGE_STATE });
  await requestContext.dispose();
});
