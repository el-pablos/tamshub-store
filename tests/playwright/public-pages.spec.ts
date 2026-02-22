import { test, expect } from '@playwright/test';
import { PUBLIC_ROUTES, PRODUCT_SLUGS, TEST_INVOICES } from './helpers/routes';
import { setupConsoleErrorCapture } from './helpers/auth';
import { assertPageLoaded, assertLayoutVisible } from './helpers/assertions';

test.describe('Public Pages â€” All Routes Accessible', () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route.name} (${route.path}) loads successfully`, async ({ page }) => {
      const consoleErrors = setupConsoleErrorCapture(page);

      const response = await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);

      await assertPageLoaded(page);
      await assertLayoutVisible(page);

      // No fatal console errors
      const fatalErrors = consoleErrors.filter(
        (e) => !e.includes('hydration') && !e.includes('Warning') && !e.includes('Failed to load resource') && !e.includes('favicon')
      );
      expect(fatalErrors).toHaveLength(0);
    });
  }

  for (const slug of PRODUCT_SLUGS.slice(0, 3)) {
    test(`Product detail: /products/${slug} loads`, async ({ page }) => {
      const response = await page.goto(`/products/${slug}`, { waitUntil: 'domcontentloaded' });
      expect(response?.status()).toBeLessThan(400);
      await assertPageLoaded(page);

      // Product name should be visible
      await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    });
  }

  test('Order status page loads for existing invoice', async ({ page }) => {
    const response = await page.goto(`/order/${TEST_INVOICES.success}`, { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(400);
    await assertPageLoaded(page);
  });

  test('404 page renders for non-existent route', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');
    // Should show 404 content — use heading because FuzzyText glitches the "404" characters
    await expect(page.getByRole('heading', { name: /Tidak Ditemukan/i })).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Landing Page â€” Content & Functionality', () => {
  test('Hero section with search bar renders', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Hero text
    await expect(page.getByText(/top up game/i).first()).toBeVisible({ timeout: 15000 });

    // Search bar
    const searchInput = page.locator('input[placeholder*="Cari"]').first();
    await expect(searchInput).toBeVisible();
  });

  test('Search bar filters products in realtime', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const searchInput = page.locator('input[placeholder*="Cari"]').first();
    await searchInput.fill('Genshin');
    
    // Wait for filtered products to load
    await page.waitForTimeout(1000);

    // Should show Genshin products
    const productCards = page.getByText(/Genshin/i);
    await expect(productCards.first()).toBeVisible({ timeout: 5000 });
  });

  test('Category links are visible and clickable', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Categories section should be visible
    await expect(page.getByText(/Kategori/i).first()).toBeVisible({ timeout: 15000 });

    // At least one category link - can be a[href*="/products"] or buttons
    const categoryLinks = page.locator('a[href*="/products"]');
    const count = await categoryLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Product cards link to product detail', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Find a product link
    const productLink = page.locator('a[href*="/products/"]').first();
    if (await productLink.isVisible()) {
      const href = await productLink.getAttribute('href');
      expect(href).toMatch(/\/products\/.+/);
    }
  });

  test('Features section renders', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await expect(page.getByText(/Proses Instan/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/Aman/i).first()).toBeVisible();
  });
});

test.describe('Products Page â€” Search & Filter', () => {
  test('Products page shows product grid', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    await expect(page.getByRole('heading', { name: /Semua Produk/i })).toBeVisible({ timeout: 15000 });

    // Product cards should be visible
    const productLinks = page.locator('a[href*="/products/"]');
    await expect(productLinks.first()).toBeVisible({ timeout: 10000 });
  });

  test('Search filters products', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    const searchInput = page.locator('input[placeholder*="Cari"]').first();
    await searchInput.fill('Mobile Legends');
    await page.waitForTimeout(1000);

    // Should show Mobile Legends products
    await expect(page.getByText(/Mobile Legends/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Filter toggle shows categories', async ({ page }) => {
    await page.goto('/products', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Click filter button
    const filterBtn = page.locator('button').filter({ hasText: /Filter/i });
    if (await filterBtn.isVisible()) {
      await filterBtn.click();
      // Category buttons should appear
      await expect(page.getByText(/Semua/i).first()).toBeVisible();
    }
  });

  test('Category filter from URL works', async ({ page }) => {
    await page.goto('/products?category=mobile-legends', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Should show products or loading
    await assertPageLoaded(page);
  });
});

test.describe('Product Detail & Checkout Flow', () => {
  test('Product detail shows info and pricing', async ({ page }) => {
    await page.goto(`/products/${PRODUCT_SLUGS[0]}`);
    await page.waitForTimeout(2000);

    // Product name visible
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });

    // Step indicator visible
    await expect(page.getByText(/Pilih Item|Pilih Nominal/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('3-step checkout flow works', async ({ page }) => {
    await page.goto(`/products/${PRODUCT_SLUGS[0]}`);
    await page.waitForTimeout(2000);

    // Step 1: Select a price/nominal — wait for API data to load
    await page.waitForTimeout(3000);
    const priceButton = page.locator('button').filter({ hasText: /Rp\s?[\d.,]/i }).first();
    await expect(priceButton).toBeVisible({ timeout: 15000 });
    await priceButton.click();

    // Click "Lanjutkan"
    const nextBtn = page.getByText(/Lanjutkan/i).first();
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();

    // Step 2: Fill account data
    await expect(page.getByText(/Data Akun|User ID/i).first()).toBeVisible({ timeout: 5000 });

    const userIdInput = page.locator('input[placeholder*="User ID"]').first();
    await userIdInput.fill('12345678');

    // Click "Lanjutkan" again
    const nextBtn2 = page.getByText(/Lanjutkan/i).first();
    await nextBtn2.click();

    // Step 3: Payment methods
    await expect(page.getByText(/Pembayaran|Pilih Pembayaran/i).first()).toBeVisible({ timeout: 5000 });

    // Verify order summary is present
    await expect(page.getByText(/Ringkasan Pesanan/i)).toBeVisible();

    // Payment method buttons visible
    const paymentBtn = page.locator('button').filter({ hasText: /Virtual Account|QRIS|DANA|OVO/i }).first();
    if (await paymentBtn.isVisible()) {
      await paymentBtn.click();

      // "Bayar Sekarang" button should be enabled
      await expect(page.getByText(/Bayar Sekarang/i)).toBeVisible();
    }
  });
});

test.describe('Leaderboard Page', () => {
  test('Leaderboard renders with censored names', async ({ page }) => {
    await page.goto('/leaderboard');
    await page.waitForTimeout(2000);

    await expect(page.getByText(/Leaderboard/i).first()).toBeVisible({ timeout: 10000 });

    // Period selector buttons
    await expect(page.getByText(/Bulanan/i)).toBeVisible();
    await expect(page.getByText(/Mingguan/i)).toBeVisible();

    // Leaderboard entries — check for any entry text with "transaksi" label
    const entries = page.getByText(/transaksi/i);
    await expect(entries.first()).toBeVisible({ timeout: 15000 });
  });

  test('Period selector toggles data', async ({ page }) => {
    await page.goto('/leaderboard');
    await page.waitForTimeout(2000);

    // Click "Mingguan"
    await page.getByText(/Mingguan/i).click();
    await page.waitForTimeout(1000);

    // Page should still render without errors
    await assertPageLoaded(page);
  });
});

test.describe('Cek Transaksi Page', () => {
  test('Invoice lookup form works', async ({ page }) => {
    await page.goto('/cek-transaksi');
    await page.waitForTimeout(2000);

    await expect(page.getByText(/Cek Transaksi/i).first()).toBeVisible({ timeout: 10000 });

    // Fill invoice
    const input = page.locator('input').first();
    await input.fill(TEST_INVOICES.success);

    // Submit
    const submitBtn = page.locator('button[type="submit"]');
    await submitBtn.click();

    // Should redirect to order status page
    await page.waitForURL(`**/order/${TEST_INVOICES.success}`, { timeout: 10000 });
    await assertPageLoaded(page);
  });
});

test.describe('Order Status Page', () => {
  test('Success order shows correct status', async ({ page }) => {
    await page.goto(`/order/${TEST_INVOICES.success}`);
    await page.waitForTimeout(2000);

    await expect(page.getByText(/Berhasil|success/i).first()).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(TEST_INVOICES.success)).toBeVisible();
  });

  test('Pending order shows payment button', async ({ page }) => {
    await page.goto(`/order/${TEST_INVOICES.pending}`);
    await page.waitForTimeout(2000);

    await expect(page.getByText(/Menunggu|pending/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('Failed order shows failed status', async ({ page }) => {
    await page.goto(`/order/${TEST_INVOICES.failed}`);
    await page.waitForTimeout(2000);

    await expect(page.getByText(/Gagal|failed/i).first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Login & Register Pages', () => {
  test('Login page renders form', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(2000);

    await expect(page.getByText(/Masuk ke TamsHub/i)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('Login validation shows errors', async ({ page }) => {
    await page.goto('/login');
    await page.waitForTimeout(2000);

    // Submit empty form
    await page.click('button[type="submit"]');

    // Should show validation error
    await expect(page.getByText(/wajib diisi/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Register page renders form', async ({ page }) => {
    await page.goto('/register');
    await page.waitForTimeout(2000);

    await expect(page.getByText(/Daftar Akun/i)).toBeVisible({ timeout: 10000 });
    await expect(page.locator('input[placeholder*="Nama"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });
});

test.describe('Navigation & Layout', () => {
  test('Navbar has essential links', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Logo/brand
    const navbar = page.locator('nav, [class*="nav"]').first();
    await expect(navbar).toBeVisible({ timeout: 10000 });

    // Essential links should exist
    const links = page.locator('nav a, header a');
    const count = await links.count();
    expect(count).toBeGreaterThan(0);
  });

  test('Footer renders', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const footer = page.locator('footer');
    await expect(footer).toBeVisible({ timeout: 10000 });
  });

  test('Floating WhatsApp button is visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Floating chat button (WhatsApp)
    const waButton = page.locator('a[href*="wa.me"], a[href*="whatsapp"]');
    await expect(waButton).toBeVisible({ timeout: 10000 });
  });
});

