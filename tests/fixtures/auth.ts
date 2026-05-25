import { Page } from '@playwright/test';

/**
 * Mock authentication by setting localStorage tokens
 * This allows testing without going through the OAuth flow
 */
export async function mockLogin(page: Page, userData = {}) {
  const defaultUser = {
    username: 'testuser',
    avatar_url: 'https://example.com/avatar.png',
    roblox_user_id: 123456,
    ...userData,
  };

  // Navigate to app first to set localStorage
  await page.goto('/');

  // Set auth tokens in localStorage
  await page.evaluate(({ user }) => {
    localStorage.setItem('access_token', 'mock_access_token_12345');
    localStorage.setItem('refresh_token', 'mock_refresh_token_67890');
    localStorage.setItem('username', user.username);
    localStorage.setItem('avatar_url', user.avatar_url);
    localStorage.setItem('roblox_user_id', String(user.roblox_user_id));
  }, { user: defaultUser });

  // Reload page to let useAuth hook pick up the tokens
  await page.reload();
}

export async function mockLogout(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('avatar_url');
    localStorage.removeItem('roblox_user_id');
  });
  
  await page.reload();
}
