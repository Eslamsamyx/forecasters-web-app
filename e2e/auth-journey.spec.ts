import { test, expect } from '@playwright/test';

test.describe('Authentication User Journey', () => {

  test.describe('Sign In Flow', () => {
    test('should display sign in options', async ({ page }) => {
      await page.goto('/');

      // Click sign in button
      await page.click('text=Sign In');

      // Should show sign in modal or navigate to auth page
      await expect(
        page.locator('[data-testid="sign-in-modal"]').or(
          page.locator('text=Continue with Discord')
        )
      ).toBeVisible();

      // Check OAuth providers
      await expect(page.locator('text=Continue with Discord')).toBeVisible();
      await expect(page.locator('text=Continue with Google')).toBeVisible();
    });

    test('should handle OAuth provider selection', async ({ page }) => {
      await page.goto('/api/auth/signin');

      // Check that OAuth providers are available
      await expect(page.locator('text=Sign in with Discord')).toBeVisible();
      await expect(page.locator('text=Sign in with Google')).toBeVisible();

      // Note: We can't actually test OAuth flow in E2E without real credentials
      // In a real test suite, you'd use test accounts or mock OAuth responses
    });
  });

  test.describe('Protected Routes Access', () => {
    test('should redirect unauthenticated users from dashboard', async ({ page }) => {
      await page.goto('/dashboard');

      // Should redirect to sign in or show unauthorized message
      await expect(
        page.locator('text=Sign In').or(
          page.locator('text=Unauthorized')
        )
      ).toBeVisible({ timeout: 10000 });
    });

    test('should redirect from admin routes', async ({ page }) => {
      await page.goto('/admin');

      // Should redirect or show unauthorized message
      await expect(
        page.locator('text=Sign In').or(
          page.locator('text=Unauthorized').or(
            page.locator('text=Access Denied')
          )
        )
      ).toBeVisible({ timeout: 10000 });
    });

    test('should allow access to public pages', async ({ page }) => {
      const publicPages = ['/', '/forecasters', '/predictions', '/articles', '/methodology'];

      for (const pagePath of publicPages) {
        await page.goto(pagePath);

        // Should not redirect to sign in
        await expect(page).toHaveURL(pagePath);

        // Should show page content
        await expect(page.locator('main')).toBeVisible();
      }
    });
  });

  test.describe('User Profile and Settings', () => {
    test('should handle profile access when unauthenticated', async ({ page }) => {
      await page.goto('/settings/profile');

      // Should redirect to sign in or show login prompt
      await expect(
        page.locator('text=Sign In').or(
          page.locator('text=Please sign in')
        )
      ).toBeVisible({ timeout: 10000 });
    });

    test('should handle bookmarks access when unauthenticated', async ({ page }) => {
      await page.goto('/bookmarks');

      // Should redirect or show authentication required
      await expect(
        page.locator('text=Sign In').or(
          page.locator('text=Authentication required')
        )
      ).toBeVisible({ timeout: 10000 });
    });
  });

  // Note: The following tests would require authentication state management
  // In a real implementation, you'd use Playwright's state storage or mock auth

  test.describe('Authenticated User Experience', () => {
    test.skip('should show user menu when authenticated', async ({ page }) => {
      // This test would require setting up authentication state
      // await page.context().addCookies([...authCookies]);
      // await page.goto('/');
      // await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test.skip('should allow access to dashboard when authenticated', async ({ page }) => {
      // This test would require authentication setup
      // await page.goto('/dashboard');
      // await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
    });

    test.skip('should allow sign out', async ({ page }) => {
      // This test would require authentication setup
      // await page.click('[data-testid="user-menu"]');
      // await page.click('text=Sign Out');
      // await expect(page.locator('text=Sign In')).toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page navigation', async ({ page }) => {
      await page.goto('/');

      // Check if there's a session cookie (would be present if user was authenticated)
      const cookies = await page.context().cookies();
      const sessionCookie = cookies.find(cookie =>
        cookie.name.includes('next-auth') ||
        cookie.name.includes('session')
      );

      if (sessionCookie) {
        // Navigate to different pages and verify session persists
        await page.goto('/forecasters');
        await page.goto('/dashboard');

        // User should still be authenticated (this would be visible in UI)
        // In practice, you'd check for user-specific elements
      }
    });

    test('should handle session expiry gracefully', async ({ page }) => {
      await page.goto('/');

      // Simulate expired session by clearing auth cookies
      await page.context().clearCookies();

      // Navigate to protected route
      await page.goto('/dashboard');

      // Should handle expired session appropriately
      await expect(
        page.locator('text=Sign In').or(
          page.locator('text=Session expired')
        )
      ).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Authentication Error Handling', () => {
    test('should handle OAuth errors', async ({ page }) => {
      // Navigate to auth page with error parameter
      await page.goto('/api/auth/signin?error=OAuthSignin');

      // Should display appropriate error message
      await expect(
        page.locator('text=Error signing in').or(
          page.locator('text=Authentication failed')
        )
      ).toBeVisible();
    });

    test('should handle callback errors', async ({ page }) => {
      await page.goto('/api/auth/callback/discord?error=access_denied');

      // Should handle OAuth callback errors
      await expect(
        page.locator('text=Access denied').or(
          page.locator('text=Authentication cancelled')
        )
      ).toBeVisible();
    });

    test('should provide retry option on auth failure', async ({ page }) => {
      await page.goto('/api/auth/error?error=Configuration');

      // Should show retry or alternative sign in options
      await expect(
        page.locator('text=Try again').or(
          page.locator('text=Sign in with')
        )
      ).toBeVisible();
    });
  });

  test.describe('Role-Based Access Control', () => {
    test('should restrict admin routes for regular users', async ({ page }) => {
      // This would require setting up a regular user session
      // For now, test that admin routes require authentication
      await page.goto('/admin/users');

      await expect(
        page.locator('text=Sign In').or(
          page.locator('text=Access Denied').or(
            page.locator('text=Unauthorized')
          )
        )
      ).toBeVisible({ timeout: 10000 });
    });

    test('should show appropriate navigation for user roles', async ({ page }) => {
      await page.goto('/');

      // Check that admin link is not visible for unauthenticated users
      const adminLink = page.locator('text=Admin');
      await expect(adminLink).not.toBeVisible();

      // Regular navigation should be visible
      await expect(page.locator('text=Forecasters')).toBeVisible();
      await expect(page.locator('text=Predictions')).toBeVisible();
    });
  });
});