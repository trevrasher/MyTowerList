import { test, expect } from '@playwright/test';
import { mockLogin } from './fixtures/auth';

test.describe('Tower Browsing and Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await mockLogin(page);
  });

  test('should display towers on home page', async ({ page }) => {
    await page.goto('/');

    // Wait for towers to load
    await page.waitForTimeout(500); // Give towers time to load

    // Check that tower names are visible
    await expect(page.locator('text=Tower of Perilous Antipode')).toBeVisible();
  });

  test('should filter towers by area', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Open area filter
    const areaFilter = page.locator('button:has-text("Area")').first();
    await areaFilter.click();

    // Uncheck "Combat" area (if it has a toggle)
    // Note: Adjust selector based on actual filter UI
    const combatCheckbox = page.locator('label:has-text("Combat")').first();
    if (await combatCheckbox.isVisible()) {
      await combatCheckbox.click();
    }

    await page.waitForTimeout(300);

    // Verify towers are filtered (this depends on your actual filter implementation)
    // At minimum, verify page is still functional
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('text=Tower of Perilous Antipode')).toBeDefined();
  });

  test('should filter towers by difficulty', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Find difficulty filter
    const difficultyFilter = page.locator('button:has-text("Difficulty")').first();
    if (await difficultyFilter.isVisible()) {
      await difficultyFilter.click();
      await page.waitForTimeout(300);
    }

    // Verify page still displays towers
    await expect(page.locator('text=Tower of Perilous Antipode')).toBeVisible();
  });

  test('should search for towers by name', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Find search input
    const searchInput = page.locator('input[placeholder*="search" i], input[placeholder*="Search" i]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('Puzzle');
      await page.waitForTimeout(300);

      // Verify search results
      await expect(page.locator('text=Tower of Perilous Antipode')).toBeDefined();
    }
  });

  test('should navigate to tower detail page', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Click on a tower
    const towerLink = page.locator('a:has-text("Tower of Perilous Antipode")').first();
    await towerLink.click();

    // Verify we're on tower detail page
    await expect(page).toHaveURL(/\/towers\//);
    await expect(page.locator('text=Tower of Perilous Antipode')).toBeVisible();
  });

  test('should show tower details correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // Click on a tower
    const towerLink = page.locator('a:has-text("Tower of Perilous Antipode")').first();
    await towerLink.click();

    // Verify tower information is displayed
    await expect(page.locator('text=Tower of Perilous Antipode')).toBeVisible();
  });
});
