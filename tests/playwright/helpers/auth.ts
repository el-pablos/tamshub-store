import { Page, expect } from '@playwright/test';
import { TEST_USER, TEST_ADMIN, API_URL } from './routes';

/**
 * Login as a regular user via UI
 */
export async function loginAsUser(page: Page): Promise<void> {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_USER.email);
  await page.fill('input[type="password"]', TEST_USER.password);
  await page.click('button[type="submit"]');
  // Wait for redirect to home
  await page.waitForURL('/', { timeout: 10000 });
}

/**
 * Login as admin via UI
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/login');
  await page.fill('input[type="email"]', TEST_ADMIN.email);
  await page.fill('input[type="password"]', TEST_ADMIN.password);
  await page.click('button[type="submit"]');
  // Wait for redirect to home, then navigate to admin
  await page.waitForURL('/', { timeout: 10000 });
  await page.goto('/admin');
  await page.waitForTimeout(2000);
}

/**
 * Login via API and set auth state in localStorage
 */
export async function loginViaAPI(page: Page, role: 'user' | 'admin' = 'user'): Promise<string> {
  const credentials = role === 'admin' ? TEST_ADMIN : TEST_USER;

  const response = await page.request.post(`${API_URL}/auth/login`, {
    data: {
      email: credentials.email,
      password: credentials.password,
    },
  });

  const data = await response.json();
  const token = data.data?.token || data.token;
  const user = data.data?.user || data.user;

  // Set auth state in localStorage (matching frontend store/auth.ts)
  await page.evaluate(
    ({ user, token }) => {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));
    },
    { user, token }
  );

  return token;
}

/**
 * Get auth token via API
 */
export async function getAuthToken(role: 'user' | 'admin' = 'user'): Promise<string> {
  const credentials = role === 'admin' ? TEST_ADMIN : TEST_USER;

  // Use fetch directly to avoid Playwright's IPv6 resolution issues
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  const data = await response.json();
  return data.data?.token || data.token;
}

/**
 * Assert no console errors on page
 */
export function setupConsoleErrorCapture(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore known benign errors
      if (
        text.includes('favicon.ico') ||
        text.includes('Download the React DevTools') ||
        text.includes('chunk') ||
        text.includes('preloaded') ||
        text.includes('Third-party cookie')
      ) {
        return;
      }
      errors.push(text);
    }
  });
  return errors;
}

/**
 * Assert no failed network requests (4xx/5xx)
 */
export function setupNetworkErrorCapture(page: Page): Array<{ url: string; status: number }> {
  const errors: Array<{ url: string; status: number }> = [];
  page.on('response', (response) => {
    const status = response.status();
    const url = response.url();
    // Ignore expected 404s (like favicon) and auth-related 401s
    if (
      status >= 400 &&
      !url.includes('favicon') &&
      !url.includes('_next/static') &&
      !url.includes('__nextjs')
    ) {
      errors.push({ url, status });
    }
  });
  return errors;
}
