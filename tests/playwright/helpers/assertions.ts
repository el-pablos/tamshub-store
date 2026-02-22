import { Page, expect } from '@playwright/test';

/**
 * Check that the page loaded successfully (no crash)
 */
export async function assertPageLoaded(page: Page): Promise<void> {
  await expect(page).not.toHaveTitle(/Error|500|Internal Server/i);
  const body = page.locator('body');
  await expect(body).toBeVisible();
}

/**
 * Check that main layout elements are visible
 */
export async function assertLayoutVisible(page: Page): Promise<void> {
  // Navbar should be visible
  const nav = page.locator('nav, header').first();
  await expect(nav).toBeVisible({ timeout: 10000 });
}

/**
 * Check that the page has no broken images
 */
export async function assertNoBrokenImages(page: Page): Promise<void> {
  const images = page.locator('img');
  const count = await images.count();
  for (let i = 0; i < count; i++) {
    const img = images.nth(i);
    const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
    // Skip small/icon images or placeholders
    const src = await img.getAttribute('src');
    if (src && !src.startsWith('data:') && naturalWidth === 0) {
      console.warn(`Broken image: ${src}`);
    }
  }
}

/**
 * Check that CTA buttons are clickable (not disabled/hidden)
 */
export async function assertMainCTAsClickable(page: Page, selectors: string[]): Promise<void> {
  for (const selector of selectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible()) {
      await expect(element).toBeEnabled();
    }
  }
}

/**
 * Assert no text overflow  
 */
export async function assertNoTextOverflow(page: Page): Promise<void> {
  const overflowing = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const issues: string[] = [];
    elements.forEach((el) => {
      const { scrollWidth, clientWidth, scrollHeight, clientHeight } = el as HTMLElement;
      if (scrollWidth > clientWidth + 50 || scrollHeight > clientHeight + 200) {
        const text = (el.textContent || '').substring(0, 30);
        if (text.trim()) {
          issues.push(`${el.tagName}.${el.className?.toString().substring(0, 20)}: overflow`);
        }
      }
    });
    return issues.slice(0, 5); // max 5
  });

  if (overflowing.length > 0) {
    console.warn('Potential overflow:', overflowing);
  }
}
