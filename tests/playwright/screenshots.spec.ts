import { test } from '@playwright/test';
import { loginViaAPI } from './helpers/auth';
import { API_URL } from './helpers/routes';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(__dirname, '../../docs/screenshots');

async function screenshot(page: any, name: string) {
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, `${name}.png`),
    fullPage: true,
  });
}

test.describe('Screenshots — Public Pages', () => {
  test('01 — Landing / Beranda', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    await screenshot(page, '01-landing-beranda');
  });

  test('02 — Katalog Produk', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(3000);
    await screenshot(page, '02-katalog-produk');
  });

  test('03 — Detail Produk', async ({ page }) => {
    await page.goto('/products/ml-86-diamonds');
    await page.waitForTimeout(3000);
    await screenshot(page, '03-detail-produk');
  });

  test('04 — Checkout Step 2 (Data Akun)', async ({ page }) => {
    await page.goto('/products/ml-86-diamonds');
    await page.waitForTimeout(3000);
    // Select a price
    const priceBtn = page.locator('button').filter({ hasText: /Rp\s?[\d.,]/i }).first();
    await priceBtn.click();
    // Click Lanjutkan to go to step 2
    await page.getByText(/Lanjutkan/i).first().click();
    await page.waitForTimeout(1000);
    await screenshot(page, '04-checkout-data-akun');
  });

  test('05 — Checkout Step 3 (Pembayaran)', async ({ page }) => {
    await page.goto('/products/ml-86-diamonds');
    await page.waitForTimeout(3000);
    const priceBtn = page.locator('button').filter({ hasText: /Rp\s?[\d.,]/i }).first();
    await priceBtn.click();
    await page.getByText(/Lanjutkan/i).first().click();
    await page.waitForTimeout(1000);
    // Fill user ID
    await page.locator('input[placeholder*="User ID"]').fill('123456');
    await page.getByText(/Lanjutkan/i).first().click();
    await page.waitForTimeout(1000);
    await screenshot(page, '05-checkout-pembayaran');
  });

  test('06 — Leaderboard', async ({ page }) => {
    await page.goto('/leaderboard');
    await page.waitForTimeout(3000);
    await screenshot(page, '06-leaderboard');
  });

  test('07 — Cek Transaksi', async ({ page }) => {
    await page.goto('/cek-transaksi');
    await page.waitForTimeout(2000);
    await screenshot(page, '07-cek-transaksi');
  });

  test('08 — Order Status (Success)', async ({ page }) => {
    await page.goto('/order/INV-20260222-00001');
    await page.waitForTimeout(3000);
    await screenshot(page, '08-order-success');
  });

  test('09 — Order Status (Pending)', async ({ page }) => {
    await page.goto('/order/INV-20260222-00002');
    await page.waitForTimeout(3000);
    await screenshot(page, '09-order-pending');
  });

  test('10 — Login Page', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(2000);
    await screenshot(page, '10-login');
  });

  test('11 — Register Page', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(2000);
    await screenshot(page, '11-register');
  });

  test('12 — FAQ Page', async ({ page }) => {
    await page.goto('/faq');
    await page.waitForTimeout(2000);
    await screenshot(page, '12-faq');
  });

  test('13 — 404 Not Found', async ({ page }) => {
    await page.goto('/halaman-tidak-ada-xyz');
    await page.waitForTimeout(2000);
    await screenshot(page, '13-not-found');
  });
});

test.describe('Screenshots — Admin Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await loginViaAPI(page, 'admin');
  });

  test('14 — Admin Dashboard', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForTimeout(3000);
    await screenshot(page, '14-admin-dashboard');
  });

  test('15 — Admin Produk', async ({ page }) => {
    await page.goto('/admin/products');
    await page.waitForTimeout(3000);
    await screenshot(page, '15-admin-produk');
  });

  test('16 — Admin Pesanan', async ({ page }) => {
    await page.goto('/admin/orders');
    await page.waitForTimeout(3000);
    await screenshot(page, '16-admin-pesanan');
  });

  test('17 — Admin Pengguna', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForTimeout(3000);
    await screenshot(page, '17-admin-pengguna');
  });

  test('18 — Admin Komplain', async ({ page }) => {
    await page.goto('/admin/complaints');
    await page.waitForTimeout(3000);
    await screenshot(page, '18-admin-komplain');
  });

  test('19 — Admin Pengaturan', async ({ page }) => {
    await page.goto('/admin/settings');
    await page.waitForTimeout(3000);
    await screenshot(page, '19-admin-pengaturan');
  });
});

test.describe('Screenshots — Mobile Responsive', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('20 — Mobile Landing', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(3000);
    await screenshot(page, '20-mobile-landing');
  });

  test('21 — Mobile Produk', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(3000);
    await screenshot(page, '21-mobile-produk');
  });
});
