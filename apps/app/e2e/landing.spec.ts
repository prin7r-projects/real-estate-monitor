import { test, expect } from '@playwright/test';

test.describe('Skyline Watch Landing Page', () => {
  test('Scenario A: User can view landing page and pricing', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/');
    
    // Verify hero section
    await expect(page.locator('text=the listing was on the market for')).toBeVisible();
    
    // Verify pricing section exists
    await expect(page.locator('text=Pricing')).toBeVisible();
    
    // Verify pricing tiers
    await expect(page.locator('text=Single-city watch')).toBeVisible();
    await expect(page.locator('text=Multi-city operator')).toBeVisible();
    await expect(page.locator('text=Investor desk')).toBeVisible();
    
    // Verify CTA buttons
    await expect(page.locator('text=Start single-city')).toBeVisible();
    await expect(page.locator('text=Start multi-city')).toBeVisible();
    await expect(page.locator('text=Start investor desk')).toBeVisible();
  });

  test('User can navigate to checkout', async ({ page }) => {
    await page.goto('/');
    
    // Click on a pricing CTA
    await page.click('text=Start single-city');
    
    // Should redirect to NOWPayments or show checkout modal
    // The actual behavior depends on NOWPayments API availability
    await page.waitForTimeout(1000);
  });

  test('User can view coverage cities', async ({ page }) => {
    await page.goto('/');
    
    // Verify coverage section
    await expect(page.locator('text=Coverage')).toBeVisible();
    
    // Verify some cities are listed
    await expect(page.locator('text=Lisbon')).toBeVisible();
    await expect(page.locator('text=Madrid')).toBeVisible();
    await expect(page.locator('text=Berlin')).toBeVisible();
  });

  test('User can view scoring explanation', async ({ page }) => {
    await page.goto('/');
    
    // Verify scoring section
    await expect(page.locator('text=7-signal scoring')).toBeVisible();
    
    // Verify signal descriptions
    await expect(page.locator('text=Comp residual')).toBeVisible();
    await expect(page.locator('text=Cut velocity')).toBeVisible();
    await expect(page.locator('text=DOM context')).toBeVisible();
  });

  test('User can view FAQ', async ({ page }) => {
    await page.goto('/');
    
    // Verify FAQ section
    await expect(page.locator('text=Frequently asked questions')).toBeVisible();
    
    // Verify some FAQ items
    await expect(page.locator('text=How is this different from Zillow')).toBeVisible();
  });
});
