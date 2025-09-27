import { test, expect } from '@playwright/test';

test.describe('Critical User Journeys', () => {

  test.describe('Homepage and Navigation', () => {
    test('should load homepage successfully', async ({ page }) => {
      await page.goto('/');

      // Check main title
      await expect(page.getByRole('heading', { name: /Prediction Prism Analytics/i })).toBeVisible();

      // Check hero section
      await expect(page.getByText(/Track the world's best financial forecasters/i)).toBeVisible();

      // Check CTA buttons
      await expect(page.getByRole('button', { name: /Get Started/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Browse Forecasters/i })).toBeVisible();

      // Verify glass morphism styling is applied
      await expect(page.locator('.backdrop-blur')).toBeVisible();
    });

    test('should navigate between main pages', async ({ page }) => {
      await page.goto('/');

      // Navigate to Forecasters
      await page.click('text=Forecasters');
      await expect(page).toHaveURL('/forecasters');
      await expect(page.getByRole('heading', { name: /Top Forecasters/i })).toBeVisible();

      // Navigate to Predictions
      await page.click('text=Predictions');
      await expect(page).toHaveURL('/predictions');
      await expect(page.getByRole('heading', { name: /Live Predictions/i })).toBeVisible();

      // Navigate to Articles
      await page.click('text=Articles');
      await expect(page).toHaveURL('/articles');
      await expect(page.getByRole('heading', { name: /Articles & Insights/i })).toBeVisible();
    });

    test('should handle mobile navigation', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
      await page.goto('/');

      // Mobile menu button should be visible
      const menuButton = page.getByRole('button', { name: /menu/i });
      await expect(menuButton).toBeVisible();

      // Click mobile menu
      await menuButton.click();

      // Mobile navigation should open
      await expect(page.getByRole('navigation')).toBeVisible();
    });
  });

  test.describe('Forecaster Discovery Journey', () => {
    test('should browse and filter forecasters', async ({ page }) => {
      await page.goto('/forecasters');

      // Check forecasters are displayed
      await expect(page.locator('[data-testid="forecaster-card"]').first()).toBeVisible();

      // Test tier filter
      await page.selectOption('[data-testid="tier-filter"]', 'Elite');
      await page.waitForTimeout(1000); // Wait for filter to apply

      // Test search functionality
      await page.fill('[data-testid="search-input"]', 'Michael');
      await page.waitForTimeout(1000);

      // Should show filtered results
      const searchResults = page.locator('[data-testid="forecaster-card"]');
      await expect(searchResults).toHaveCount(0);
    });

    test('should view individual forecaster profile', async ({ page }) => {
      await page.goto('/forecasters');

      // Click on first forecaster
      await page.locator('[data-testid="forecaster-card"]').first().click();

      // Should navigate to profile page
      await expect(page).toHaveURL(/\/forecasters\/\d+/);

      // Check profile elements
      await expect(page.locator('[data-testid="forecaster-avatar"]')).toBeVisible();
      await expect(page.locator('[data-testid="accuracy-stat"]')).toBeVisible();
      await expect(page.locator('[data-testid="predictions-stat"]')).toBeVisible();

      // Test tabs functionality
      await page.click('text=Performance');
      await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible();

      await page.click('text=Insights');
      await expect(page.locator('[data-testid="insights-content"]')).toBeVisible();
    });

    test('should handle following a forecaster', async ({ page }) => {
      await page.goto('/forecasters/1');

      const followButton = page.getByRole('button', { name: /Follow/i });
      await expect(followButton).toBeVisible();

      // Note: In real implementation, this would require authentication
      await followButton.click();

      // Should show feedback (login modal or success message)
      await expect(
        page.locator('text=Please sign in').or(page.locator('text=Following'))
      ).toBeVisible();
    });
  });

  test.describe('Predictions Journey', () => {
    test('should browse predictions with filters', async ({ page }) => {
      await page.goto('/predictions');

      // Check predictions are displayed
      await expect(page.locator('[data-testid="prediction-card"]').first()).toBeVisible();

      // Test status filter
      await page.selectOption('[data-testid="status-filter"]', 'pending');
      await page.waitForTimeout(1000);

      // Test category filter
      await page.selectOption('[data-testid="category-filter"]', 'Crypto');
      await page.waitForTimeout(1000);

      // Test sort functionality
      await page.selectOption('[data-testid="sort-select"]', 'confidence');
      await page.waitForTimeout(1000);
    });

    test('should view prediction details', async ({ page }) => {
      await page.goto('/predictions');

      // Click on first prediction
      await page.locator('[data-testid="prediction-card"]').first().click();

      // Should show prediction details modal or navigate to detail page
      await expect(
        page.locator('[data-testid="prediction-modal"]').or(
          page.locator('[data-testid="prediction-details"]')
        )
      ).toBeVisible();
    });
  });

  test.describe('Content Discovery Journey', () => {
    test('should browse and read articles', async ({ page }) => {
      await page.goto('/articles');

      // Check articles are displayed
      await expect(page.locator('[data-testid="article-card"]').first()).toBeVisible();

      // Test search functionality
      await page.fill('[data-testid="article-search"]', 'AI');
      await page.waitForTimeout(1000);

      // Test category filter
      await page.selectOption('[data-testid="category-filter"]', 'AI & Technology');
      await page.waitForTimeout(1000);
    });

    test('should read full article', async ({ page }) => {
      await page.goto('/articles');

      // Click on first article
      await page.locator('[data-testid="article-card"]').first().click();

      // Should navigate to article page
      await expect(page).toHaveURL(/\/articles\/\d+/);

      // Check article elements
      await expect(page.locator('[data-testid="article-title"]')).toBeVisible();
      await expect(page.locator('[data-testid="article-content"]')).toBeVisible();
      await expect(page.locator('[data-testid="author-info"]')).toBeVisible();

      // Check social sharing buttons
      await expect(page.locator('[data-testid="share-buttons"]')).toBeVisible();

      // Check related articles
      await expect(page.locator('[data-testid="related-articles"]')).toBeVisible();
    });
  });

  test.describe('Performance and Accessibility', () => {
    test('should meet performance standards', async ({ page }) => {
      await page.goto('/');

      // Test page load performance
      const startTime = Date.now();
      await page.waitForLoadState('networkidle');
      const loadTime = Date.now() - startTime;

      // Should load within reasonable time (adjust threshold as needed)
      expect(loadTime).toBeLessThan(5000);
    });

    test('should be accessible', async ({ page }) => {
      await page.goto('/');

      // Check for proper heading hierarchy
      const h1s = await page.locator('h1').count();
      expect(h1s).toBeGreaterThanOrEqual(1);

      // Check for alt text on images
      const images = page.locator('img');
      const imageCount = await images.count();

      for (let i = 0; i < imageCount; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).not.toBeNull();
      }

      // Check for proper form labels
      const inputs = page.locator('input');
      const inputCount = await inputs.count();

      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        const ariaLabel = await input.getAttribute('aria-label');
        const placeholder = await input.getAttribute('placeholder');
        const hasLabel = await page.locator(`label[for="${await input.getAttribute('id')}"]`).count() > 0;

        // Input should have either aria-label, placeholder, or associated label
        expect(ariaLabel || placeholder || hasLabel).toBeTruthy();
      }
    });

    test('should work on different screen sizes', async ({ page }) => {
      const viewports = [
        { width: 1920, height: 1080 }, // Desktop
        { width: 1024, height: 768 },  // Tablet landscape
        { width: 768, height: 1024 },  // Tablet portrait
        { width: 375, height: 667 },   // Mobile
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto('/');

        // Check that main content is visible and readable
        await expect(page.getByRole('heading', { name: /Prediction Prism Analytics/i })).toBeVisible();

        // Check that navigation is accessible
        if (viewport.width < 768) {
          // Mobile: hamburger menu should be visible
          await expect(page.getByRole('button', { name: /menu/i })).toBeVisible();
        } else {
          // Desktop/tablet: navigation links should be visible
          await expect(page.getByRole('link', { name: /Forecasters/i })).toBeVisible();
        }
      }
    });
  });

  test.describe('Error Handling', () => {
    test('should handle 404 pages gracefully', async ({ page }) => {
      await page.goto('/non-existent-page');

      // Should show 404 page or redirect to homepage
      const is404 = await page.locator('text=404').isVisible();
      const isHomepage = await page.locator('text=Prediction Prism Analytics').isVisible();

      expect(is404 || isHomepage).toBeTruthy();
    });

    test('should handle network errors', async ({ page }) => {
      // Simulate offline condition
      await page.context().setOffline(true);

      await page.goto('/');

      // Should show appropriate error message or cached content
      const hasErrorMessage = await page.locator('text=Network error').isVisible();
      const hasContent = await page.locator('main').isVisible();

      expect(hasErrorMessage || hasContent).toBeTruthy();

      // Restore network
      await page.context().setOffline(false);
    });
  });
});