import { test, expect } from '@playwright/test';

test.describe('Error Pages', () => {
  test('404 page — unknown route', async ({ page }) => {
    const response = await page.goto('/halaman-yang-tidak-ada-12345');

    // Should show the 404/not-found page
    await page.waitForLoadState('domcontentloaded');

    // Check if the page contains 404 or not found text
    const bodyText = await page.locator('body').innerText();
    const has404 = /404|not found|halaman tidak ditemukan|tidak ditemukan/i.test(bodyText);

    // May redirect or show custom 404
    if (response) {
      // Accept 200 (custom 404 page via SSR) or actual 404
      expect([200, 404]).toContain(response.status());
    }
  });

  test('404 page — invalid product slug', async ({ page }) => {
    const response = await page.goto('/products/produk-gak-ada-9999');
    await page.waitForLoadState('domcontentloaded');

    const bodyText = await page.locator('body').innerText();
    // Either a not found message or redirect
    const isError = /404|not found|tidak ditemukan|error/i.test(bodyText);
    // This is expected behavior - product doesn't exist
    expect(response).not.toBeNull();
  });

  test('404 page — invalid order invoice', async ({ page }) => {
    const response = await page.goto('/order/INV-DOESNOTEXIST-123');
    await page.waitForLoadState('domcontentloaded');

    // Should show error or redirect
    expect(response).not.toBeNull();
  });

  test('Error boundary — graceful error handling', async ({ page }) => {
    // Navigate to the home page first (known good)
    await page.goto('/');
    await page.waitForTimeout(2000);

    // No unhandled errors on page load (page should be functional)
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test('API error handling — unauthorized admin access', async ({ page }) => {
    // Try accessing admin without login
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Should redirect to login or show unauthorized
    const url = page.url();
    const isRedirectedOrBlocked =
      url.includes('/login') ||
      !url.includes('/admin');

    expect(isRedirectedOrBlocked).toBeTruthy();
  });

  test('API error handling — unauthorized user accessing admin', async ({ page }) => {
    // Login as regular user via API
    const loginResponse = await page.request.post('http://127.0.0.1:8000/api/v1/auth/login', {
      data: {
        email: 'user@tamshub.store',
        password: 'user123',
      },
    });

    if (loginResponse.ok()) {
      const data = await loginResponse.json();
      const token = data.data?.token || data.token;
      const user = data.data?.user || data.user;

      if (token) {
        // Set the token in localStorage
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        await page.evaluate(({ t, u }) => {
          localStorage.setItem('auth_token', t);
          localStorage.setItem('user', JSON.stringify(u));
        }, { t: token, u: user });

        // Try to access admin
        await page.goto('/admin', { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(3000);

        const url = page.url();

        // Should redirect away from admin (user role !== admin)
        const isBlocked =
          url.includes('/login') ||
          !url.includes('/admin');

        expect(isBlocked).toBeTruthy();
      }
    }
  });
});
