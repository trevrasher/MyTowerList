import { Page } from '@playwright/test';

/**
 * Mock API responses for towers, reviews, and other endpoints
 */
export async function setupApiMocks(page: Page) {
  // Mock tower list endpoint
  await page.route('**/api/towers/**', (route) => {
    const url = new URL(route.request().url());
    const towerId = url.pathname.split('/')[3];

    if (towerId && towerId !== 'reviews') {
      // Single tower endpoint
      route.abort();
    } else {
      // Tower list endpoint
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          count: 3,
          next: null,
          previous: null,
          results: [
            {
              id: 1,
              name: 'Forsaken Fortress',
              difficulty: 8,
              area: 'Combat',
              creators: ['Creator1'],
              thumbnail_url: 'https://example.com/tower1.png',
              score: 4.5,
            },
            {
              id: 2,
              name: 'Puzzle Palace',
              difficulty: 5,
              area: 'Puzzle',
              creators: ['Creator2'],
              thumbnail_url: 'https://example.com/tower2.png',
              score: 4.2,
            },
            {
              id: 3,
              name: 'Parkour Peak',
              difficulty: 6,
              area: 'Parkour',
              creators: ['Creator3'],
              thumbnail_url: 'https://example.com/tower3.png',
              score: 4.8,
            },
          ],
        }),
      });
    }
  });

  // Mock reviews endpoint
  await page.route('**/api/towers/*/reviews/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            id: 1,
            profile: {
              username: 'reviewer1',
              roblox_user_id: 111,
              avatar_url: 'https://example.com/avatar1.png',
            },
            score: 5,
            review_text: 'Amazing tower!',
            summary: 'Great experience',
          },
          {
            id: 2,
            profile: {
              username: 'reviewer2',
              roblox_user_id: 222,
              avatar_url: 'https://example.com/avatar2.png',
            },
            score: 4,
            review_text: 'Good but challenging',
            summary: 'Well designed',
          },
        ],
      }),
    });
  });

  // Mock POST review endpoint
  await page.route('**/api/reviews/**', async (route) => {
    if (route.request().method() === 'POST') {
      route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 100,
          profile: {
            username: 'testuser',
            roblox_user_id: 123456,
            avatar_url: 'https://example.com/avatar.png',
          },
          score: 5,
          review_text: 'Test review',
          summary: 'Test summary',
        }),
      });
    } else if (route.request().method() === 'DELETE') {
      route.fulfill({ status: 204 });
    }
  });

  // Mock tower status endpoint
  await page.route('**/api/tower-status/**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tower_id: 1,
        status: 'completed',
      }),
    });
  });
}
