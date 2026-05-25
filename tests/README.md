# End-to-End Tests with Playwright

This directory contains E2E tests for the MyTowerList application using [Playwright](https://playwright.dev/).

## Overview

E2E tests simulate real user interactions to test complete workflows:

- **Authentication**: Login/logout flows
- **Tower Browsing**: Displaying and filtering towers
- **Review System**: Viewing, posting, and deleting reviews

## Setup

Playwright is already installed. Just run:

```bash
npm run e2e
```

## Running Tests

### Run all tests
```bash
npm run e2e
```

### Run tests in UI mode (interactive)
```bash
npm run e2e:ui
```

Starts an interactive dashboard where you can:
- Watch tests run step-by-step
- See test timeline
- Inspect elements
- Re-run tests

### Debug tests
```bash
npm run e2e:debug
```

Opens the Playwright Inspector to step through tests manually.

### Run specific test file
```bash
npx playwright test tests/auth.spec.ts
```

### Run tests matching a pattern
```bash
npx playwright test -g "login"
```

## Test Structure

### `auth.spec.ts`
Tests authentication flows:
- Login without credentials (mocked)
- Display login button
- Display username after login
- Logout
- Token cleanup on logout

### `towers.spec.ts`
Tests tower browsing and filtering:
- Display towers on home page
- Filter by area
- Filter by difficulty
- Search by name
- Navigate to tower detail
- Display tower information

### `reviews.spec.ts`
Tests the review system:
- Display reviews on tower pages
- Show ratings and summaries
- Post new review (authenticated)
- View review details
- Delete review
- Show review count

## Mock Authentication

Tests use **mocked authentication** to avoid:
- Needing real credentials
- Creating test data on production
- OAuth redirects

See `fixtures/auth.ts` for the `mockLogin()` helper function.

## Mock API

Tests intercept API requests using `setupApiMocks()` from `fixtures/mocks.ts`. This allows:
- Testing without a backend server
- Consistent test data
- Fast test execution
- No data persistence

## Configuration

`playwright.config.ts` contains test settings:
- Browser configuration (chromium by default)
- Base URL: `http://localhost:3000`
- Web server: `npm run dev` (started automatically)
- Reporter: HTML (view with `npx playwright show-report`)

## Notes

- Tests assume your dev server runs on `http://localhost:3000`
- Tests use mocked API responses (not real backend)
- Tests use mocked authentication (no OAuth needed)
- Each test is independent and can run in any order
- Some selectors may need adjustment based on actual UI (look for TODOs in tests)

## Troubleshooting

### Tests fail to find elements
The selectors in tests are based on common naming patterns. If elements don't match, check:
1. Actual button/input text in your UI
2. Update selectors in test files
3. Use `npx playwright test --debug` to inspect

### Dev server doesn't start
Ensure `npm run dev` works manually, then:
```bash
npx playwright test --headed  # Run with visible browser
```

### Need to add/modify tests
Follow the existing patterns:
1. Use `test()` and `expect()` from `@playwright/test`
2. Call `setupApiMocks()` in `beforeEach` if mocking API
3. Use `mockLogin()` for authenticated tests
4. Use descriptive test names with `test.describe()` groups
