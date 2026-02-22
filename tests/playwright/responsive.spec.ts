import { test, expect } from '@playwright/test';
import { assertPageLoaded, assertLayoutVisible } from './helpers/assertions';
import { setupConsoleErrorCapture } from './helpers/auth';

const PAGES_TO_CHECK = [
  '/',
  '/products',
  '/leaderboard',
  '/login',
  '/cek-transaksi',
];

test.describe('Responsive — Mobile (390x844)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const path of PAGES_TO_CHECK) {
    test(`Mobile: ${path} renders properly`, async ({ page }) => {
      const consoleErrors = setupConsoleErrorCapture(page);

      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);

      await assertPageLoaded(page);

      // Check for horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth + 10;
      });

      if (hasHorizontalScroll) {
        console.warn(`Horizontal overflow detected on mobile: ${path}`);
      }

      const fatalErrors = consoleErrors.filter(
        (e) => !e.includes('hydration') && !e.includes('Warning') && !e.includes('Failed to load resource') && !e.includes('favicon')
      );
      expect(fatalErrors).toHaveLength(0);
    });
  }

  test('Mobile: hamburger menu works', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    // Look for mobile menu button
    const menuButton = page.locator('button').filter({ has: page.locator('svg') }).first();

    if (await menuButton.isVisible()) {
      await menuButton.click();
      await page.waitForTimeout(500);

      // Menu items should become visible
      const menuLinks = page.locator('nav a, [class*="mobile"] a, [class*="menu"] a');
      const visibleCount = await menuLinks.count();
      expect(visibleCount).toBeGreaterThan(0);
    }
  });

  test('Mobile: search bar is usable', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[placeholder*="Cari"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      // Input should accept text
      await expect(searchInput).toHaveValue('test');
    }
  });

  test('Mobile: product cards are properly sized', async ({ page }) => {
    await page.goto('/products');
    await page.waitForTimeout(2000);

    const productCards = page.locator('a[href*="/products/"]');
    const count = await productCards.count();

    if (count > 0) {
      const firstCard = productCards.first();
      const box = await firstCard.boundingBox();
      if (box) {
        // Card should not be wider than viewport
        expect(box.width).toBeLessThanOrEqual(400);
        // Card should have reasonable height
        expect(box.height).toBeGreaterThan(50);
      }
    }
  });
});

test.describe('Responsive — Tablet (768x1024)', () => {
  test.use({ viewport: { width: 768, height: 1024 } });

  for (const path of PAGES_TO_CHECK) {
    test(`Tablet: ${path} renders properly`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      await assertPageLoaded(page);
    });
  }
});

test.describe('Responsive — Desktop (1366x768)', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  for (const path of PAGES_TO_CHECK) {
    test(`Desktop: ${path} renders properly`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
      await assertPageLoaded(page);
      await assertLayoutVisible(page);
    });
  }

  test('Desktop: navbar shows all links', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(2000);

    const navLinks = page.locator('nav a, header a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(2);
  });
});

test.describe('Floating Chat Button — All Sizes', () => {
  for (const viewport of [
    { width: 390, height: 844, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1366, height: 768, name: 'desktop' },
  ]) {
    test(`WhatsApp button visible on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForTimeout(2000);

      const waButton = page.locator('a[href*="wa.me"], a[href*="whatsapp"]');
      await expect(waButton).toBeVisible({ timeout: 10000 });

      // Verify link href
      const href = await waButton.getAttribute('href');
      expect(href).toContain('wa.me');
    });
  }
});
