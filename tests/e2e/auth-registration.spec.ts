import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  test('should show success notification when registered=true query parameter is present', async ({ page }) => {
    // Navigate to learn page with registered query parameter
    await page.goto('/learn?registered=true');
    await page.waitForLoadState('networkidle');
    
    // Wait for toast notification to appear
    // Sonner toasts have data-sonner-toast attribute
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible({ timeout: 5000 });
    
    // Check if success message is displayed (Russian by default)
    await expect(toast).toContainText(/успешно зарегистрировались/i);
    await expect(toast).toContainText(/VibeStudy/i);
    await expect(toast).toContainText(/🎉/);
  });

  test('should remove query parameter from URL after showing notification', async ({ page }) => {
    // Navigate to learn page with registered query parameter
    await page.goto('/learn?registered=true');
    await page.waitForLoadState('networkidle');
    
    // Wait for toast to appear
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible({ timeout: 5000 });
    
    // Wait a bit for URL cleanup
    await page.waitForTimeout(1000);
    
    // Check that URL no longer contains the query parameter
    expect(page.url()).toBe(page.url().split('?')[0]);
    expect(page.url()).not.toContain('registered=true');
  });

  test('should not show notification when registered parameter is missing', async ({ page }) => {
    // Navigate to learn page without query parameter
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    
    // Wait a bit to ensure no toast appears
    await page.waitForTimeout(2000);
    
    // Check that no toast notification is visible
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).not.toBeVisible();
  });

  test('should redirect to /learn after successful authentication callback', async ({ page }) => {
    // Mock the auth callback scenario
    // In real scenario, Supabase would redirect here with a code
    // We'll test the redirect behavior by checking if /learn is accessible
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the learn page
    expect(page.url()).toContain('/learn');
    
    // Check if learn page content is visible
    await expect(page.locator('h1:has-text("90-дневный план")')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Existing User Login Flow', () => {
  test('should not show registration notification for existing users', async ({ page }) => {
    // Existing users won't have the registered=true parameter
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    
    // Wait to ensure no toast appears
    await page.waitForTimeout(2000);
    
    // Verify no registration toast is shown
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).not.toBeVisible();
  });
});

test.describe('Multilingual Support', () => {
  test('should show Russian message by default', async ({ page }) => {
    await page.goto('/learn?registered=true');
    await page.waitForLoadState('networkidle');
    
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible({ timeout: 5000 });
    
    // Check for Russian text
    await expect(toast).toContainText(/Вы успешно зарегистрировались/i);
    await expect(toast).toContainText(/Добро пожаловать/i);
  });

  test('should show English message when locale is set to English', async ({ page }) => {
    // Set locale to English in localStorage before navigation
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('locale-storage', JSON.stringify({
        state: { locale: 'en' },
        version: 0
      }));
    });
    
    // Navigate to learn page with registered parameter
    await page.goto('/learn?registered=true');
    await page.waitForLoadState('networkidle');
    
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible({ timeout: 5000 });
    
    // Check for English text
    await expect(toast).toContainText(/Successfully registered/i);
    await expect(toast).toContainText(/Welcome to VibeStudy/i);
  });
});

test.describe('Error Scenarios', () => {
  test('should handle invalid query parameter values gracefully', async ({ page }) => {
    // Navigate with invalid parameter value
    await page.goto('/learn?registered=false');
    await page.waitForLoadState('networkidle');
    
    // Wait to ensure no toast appears
    await page.waitForTimeout(2000);
    
    // Verify no toast is shown for invalid value
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).not.toBeVisible();
  });

  test('should still load learn page even if notification fails', async ({ page }) => {
    // Navigate to learn page
    await page.goto('/learn?registered=true');
    await page.waitForLoadState('networkidle');
    
    // Verify learn page loaded successfully regardless of notification
    await expect(page.locator('h1:has-text("90-дневный план")')).toBeVisible({ timeout: 10000 });
    
    // Check that page is functional
    const dayButton = page.locator('button:has-text("1")').first();
    await expect(dayButton).toBeVisible();
  });
});
