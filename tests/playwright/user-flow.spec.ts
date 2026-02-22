import { test, expect } from '@playwright/test';
import { loginAsUser, loginViaAPI, setupConsoleErrorCapture } from './helpers/auth';
import { TEST_USER, TEST_INVOICES } from './helpers/routes';
import { assertPageLoaded } from './helpers/assertions';

test.describe('User Login Flow', () => {
  test('User can login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(2000);

    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button[type="submit"]');

    // Should redirect to home after successful login
    await expect(page).toHaveURL(/^\/$|^http.+\/$/, { timeout: 20000 });
    await assertPageLoaded(page);
  });

  test('Login with wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(2000);

    await page.fill('input[type="email"]', TEST_USER.email);
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message (API returns "Email atau password salah." or fallback "Login gagal")
    await expect(page.getByText(/gagal|salah|error|invalid|Email atau password/i).first()).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Authenticated User — Browse & History', () => {
  test.beforeEach(async ({ page }) => {
    // Login via API for speed
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await loginViaAPI(page, 'user');
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
  });

  test('Logged in user can browse products', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);

    const productLinks = page.locator('a[href*="/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 10000 });
  });

  test('Logged in user can view order history', async ({ page }) => {
    await page.goto('/history');
    await page.waitForTimeout(2000);

    await expect(page.getByText(/Riwayat Transaksi/i)).toBeVisible({ timeout: 10000 });

    // Should have order entries
    const orderCards = page.locator('a[href*="/order/"]');
    await expect(orderCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('User can click order to view status', async ({ page }) => {
    await page.goto('/history');
    await page.waitForTimeout(2000);

    // Click first order
    const firstOrder = page.locator('a[href*="/order/"]').first();
    await expect(firstOrder).toBeVisible({ timeout: 10000 });
    await firstOrder.click();

    // Should navigate to order status page
    await page.waitForURL('**/order/**', { timeout: 10000 });
    await assertPageLoaded(page);

    // Invoice number should be visible
    await expect(page.getByText(/INV-/)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('User Checkout Flow (End-to-End)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await loginViaAPI(page, 'user');
  });

  test('Full checkout flow: search → select → fill data → select payment', async ({ page }) => {
    // 1. Search for a product
    await page.goto('/products');
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[placeholder*="Cari"]').first();
    await searchInput.fill('Mobile Legends');
    await page.waitForTimeout(1000);

    // 2. Click on a product
    const productLink = page.locator('a[href*="/products/ml-"]').first();
    await expect(productLink).toBeVisible({ timeout: 10000 });
    await productLink.click();

    // Wait for product detail
    await page.waitForURL('**/products/ml-**', { timeout: 10000 });
    await page.waitForTimeout(2000);

    // 3. Step 1: Select nominal — wait for prices to load from API
    await page.waitForTimeout(3000);
    const priceButton = page.locator('button').filter({ hasText: /Rp\s?[\d.,]/i }).first();
    await expect(priceButton).toBeVisible({ timeout: 15000 });
    await priceButton.click();

    await page.getByText(/Lanjutkan/i).first().click();

    // 4. Step 2: Fill account data
    await expect(page.getByText(/Data Akun|User ID/i).first()).toBeVisible({ timeout: 5000 });
    await page.locator('input[placeholder*="User ID"]').fill('12345678');

    // Optional: fill server
    const serverInput = page.locator('input[placeholder*="Server"]');
    if (await serverInput.isVisible()) {
      await serverInput.fill('9999');
    }

    await page.getByText(/Lanjutkan/i).first().click();

    // 5. Step 3: Select payment method
    await expect(page.getByText(/Pembayaran|Pilih Pembayaran/i).first()).toBeVisible({ timeout: 5000 });

    // Select a payment method
    const paymentOption = page.locator('button').filter({ hasText: /QRIS|BCA|DANA/i }).first();
    if (await paymentOption.isVisible()) {
      await paymentOption.click();

      // "Bayar Sekarang" should be visible
      await expect(page.getByText(/Bayar Sekarang/i)).toBeVisible();
      // We don't actually submit checkout to avoid creating real transactions
    }
  });
});

test.describe('Order Status — Different Statuses', () => {
  test('Success order displays correctly', async ({ page }) => {
    await page.goto(`/order/${TEST_INVOICES.success}`);
    await page.waitForTimeout(2000);

    await expect(page.getByText(/Berhasil|success/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(TEST_INVOICES.success)).toBeVisible();

    // Should show SN
    await expect(page.getByText(/SN/i).first()).toBeVisible();
  });

  test('Failed order displays correctly', async ({ page }) => {
    await page.goto(`/order/${TEST_INVOICES.failed}`);
    await page.waitForTimeout(2000);

    await expect(page.getByText(/Gagal|failed/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Non-existent order shows error', async ({ page }) => {
    await page.goto('/order/INV-NONEXISTENT-99999');
    await page.waitForTimeout(2000);

    // Should show error or "not found"
    await expect(page.getByText(/tidak ditemukan|error|not found/i).first()).toBeVisible({ timeout: 10000 });
  });
});
