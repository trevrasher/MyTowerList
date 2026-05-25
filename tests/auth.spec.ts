import { test, expect } from '@playwright/test';
import { mockLogin, mockLogout } from './fixtures/auth';

test.describe('Authentication', () => {
  test('should show login button when not authenticated', async ({ page }) => {
    await page.goto('/');

    // Check that login button is visible
    const loginButton = page.locator('button:has-text("Login")');
    await expect(loginButton).toBeVisible();
  });

  test('should successfully login with mock auth', async ({ page }) => {
    await mockLogin(page);

    // After login, we should see logout button or user info
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await mockLogin(page);

    // Click logout button
    const logoutButton = page.locator('button:has-text("Logout")');
    await logoutButton.click();

    // After logout, should see login button again
    const loginButton = page.locator('button:has-text("Login")');
    await expect(loginButton).toBeVisible();
  });

  test('should clear localStorage on logout', async ({ page }) => {
    await mockLogin(page);

    // Verify tokens are set
    const accessToken = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(accessToken).toBeTruthy();

    // Logout
    const logoutButton = page.locator('button:has-text("Logout")');
    await logoutButton.click();

    // Verify tokens are cleared
    const clearedToken = await page.evaluate(() => localStorage.getItem('access_token'));
    expect(clearedToken).toBeNull();
  });
});
