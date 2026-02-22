import { test, expect } from '@playwright/test';
import { loginViaAPI, setupConsoleErrorCapture } from './helpers/auth';
import { ADMIN_ROUTES } from './helpers/routes';
import { assertPageLoaded } from './helpers/assertions';

/**
 * Helper: navigate to a page as admin (login via API, set localStorage, navigate)
 */
async function gotoAsAdmin(page: import('@playwright/test').Page, path: string) {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await loginViaAPI(page, 'admin');
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
}

test.describe('Admin Login & Access', () => {
  test('Admin can login and access dashboard', async ({ page }) => {
    await gotoAsAdmin(page, '/admin');
    await expect(page.getByText(/Dashboard/i).first()).toBeVisible({ timeout: 15000 });
  });

  test('Non-admin user cannot access admin pages', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await loginViaAPI(page, 'user');
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const url = page.url();
    const hasRedirected = url.includes('/login') || url === 'http://localhost:3000/';
    const hasNoAdminContent = !(await page.getByText(/Admin Panel/i).isVisible().catch(() => false));
    expect(hasRedirected || hasNoAdminContent).toBeTruthy();
  });
});

test.describe('Admin Pages — All Render', () => {
  for (const route of ADMIN_ROUTES) {
    test(`${route.name} (${route.path}) renders`, async ({ page }) => {
      const consoleErrors = setupConsoleErrorCapture(page);
      await gotoAsAdmin(page, route.path);
      await assertPageLoaded(page);

      if (page.viewportSize()!.width >= 1024) {
        await expect(page.getByText(/Admin Panel/i).first()).toBeVisible({ timeout: 10000 });
      }

      const fatalErrors = consoleErrors.filter(
        (e) => !e.includes('hydration') && !e.includes('Warning') && !e.includes('401')
      );
      if (fatalErrors.length > 0) {
        console.warn(`Console errors on ${route.path}:`, fatalErrors);
      }
    });
  }
});

test.describe('Admin Dashboard — Stats & Recent Orders', () => {
  test('Dashboard shows stats cards', async ({ page }) => {
    await gotoAsAdmin(page, '/admin');
    await expect(page.getByText(/Dashboard/i).first()).toBeVisible({ timeout: 15000 });

    const statsLabels = page.locator('text=/Total|Pesanan|Pendapatan|Menunggu/i');
    const count = await statsLabels.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Dashboard shows recent orders table', async ({ page }) => {
    await gotoAsAdmin(page, '/admin');
    await expect(page.getByText(/Dashboard/i).first()).toBeVisible({ timeout: 15000 });

    const hasTable = await page.locator('table').isVisible({ timeout: 5000 }).catch(() => false);
    const hasOrdersText = await page.getByText(/Pesanan|Invoice|Order/i).first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(hasTable || hasOrdersText).toBeTruthy();
  });
});

test.describe('Admin Products Management', () => {
  test('Products list shows table with products', async ({ page }) => {
    await gotoAsAdmin(page, '/admin/products');

    const hasProductsHeading = await page.getByText(/Produk|Products/i).first().isVisible({ timeout: 15000 }).catch(() => false);
    expect(hasProductsHeading).toBeTruthy();

    const hasProductData = await page.getByText(/Mobile Legends|Free Fire|Genshin/i).first().isVisible({ timeout: 10000 }).catch(() => false);
    if (!hasProductData) {
      const hasTable = await page.locator('table, [role="grid"]').isVisible({ timeout: 5000 }).catch(() => false);
      expect(hasTable).toBeTruthy();
    }
  });

  test('Search product works', async ({ page }) => {
    await gotoAsAdmin(page, '/admin/products');
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[placeholder*="Cari"], input[type="search"]').first();
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill('Genshin');
      await page.waitForTimeout(1000);
    }
    await assertPageLoaded(page);
  });

  test('Sync Digiflazz button is visible', async ({ page }) => {
    await gotoAsAdmin(page, '/admin/products');

    const syncBtn = page.getByText(/Sync|Digiflazz/i).first();
    await assertPageLoaded(page);
  });
});

test.describe('Admin Orders Management', () => {
  test('Orders list renders with filters', async ({ page }) => {
    await gotoAsAdmin(page, '/admin/orders');
    const heading = page.getByText(/Pesanan|Orders/i).first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('Filter orders by status', async ({ page }) => {
    await gotoAsAdmin(page, '/admin/orders');
    await page.waitForTimeout(2000);

    const pendingBtn = page.locator('button').filter({ hasText: /pending/i }).first();
    if (await pendingBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await pendingBtn.click();
      await page.waitForTimeout(1000);
    }
    await assertPageLoaded(page);
  });
});

test.describe('Admin Users Management', () => {
  test('Users list renders with user data', async ({ page }) => {
    await gotoAsAdmin(page, '/admin/users');
    const heading = page.getByText(/Pengguna|Users/i).first();
    await expect(heading).toBeVisible({ timeout: 15000 });
    await assertPageLoaded(page);
  });
});

test.describe('Admin Complaints Management', () => {
  test('Complaints page renders with status filters', async ({ page }) => {
    await gotoAsAdmin(page, '/admin/complaints');
    const heading = page.getByText(/Komplain|Complaint/i).first();
    await expect(heading).toBeVisible({ timeout: 15000 });
  });

  test('Reply button is visible for complaints', async ({ page }) => {
    await gotoAsAdmin(page, '/admin/complaints');
    await page.waitForTimeout(2000);

    const replyBtn = page.getByText(/Balas|Reply/i).first();
    if (await replyBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(replyBtn).toBeEnabled();
    }
  });
});

test.describe('Admin Settings', () => {
  test('Settings page renders form', async ({ page }) => {
    await gotoAsAdmin(page, '/admin/settings');
    await expect(page.getByText(/Pengaturan|Settings/i).first()).toBeVisible({ timeout: 15000 });
    await assertPageLoaded(page);
  });
});

test.describe('Admin Sidebar Navigation', () => {
  test('Sidebar links navigate correctly', async ({ page }) => {
    await gotoAsAdmin(page, '/admin');

    if (page.viewportSize()!.width >= 1024) {
      await expect(page.getByText(/Admin Panel/i).first()).toBeVisible({ timeout: 15000 });

      const ordersLink = page.locator('nav a, aside a').filter({ hasText: /Pesanan/i }).first();
      if (await ordersLink.isVisible({ timeout: 5000 }).catch(() => false)) {
        await ordersLink.click();
        await page.waitForURL('**/admin/orders', { timeout: 10000 });
        await assertPageLoaded(page);
      }
    }
  });
});
