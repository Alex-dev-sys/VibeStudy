import { test, expect } from '@playwright/test';

test.describe('Data Persistence', () => {
  test('should save progress to localStorage', async ({ page, context }) => {
    // Set up initial state
    await context.addInitScript(() => {
      localStorage.clear();
    });
    
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    
    // Select Python
    const pythonButton = page.locator('button:has-text("Python")').first();
    await pythonButton.click();
    await page.waitForTimeout(500);
    
    // Check localStorage has progress data
    const hasProgressData = await page.evaluate(() => {
      const progressData = localStorage.getItem('vibestudy-progress');
      return progressData !== null && progressData.length > 0;
    });
    
    expect(hasProgressData).toBe(true);
  });

  test('should load progress from localStorage', async ({ page, context }) => {
    // Pre-populate localStorage with progress data
    await context.addInitScript(() => {
      localStorage.setItem('vibestudy-progress', JSON.stringify({
        state: {
          selectedLanguage: 'python',
          currentDay: 1
        },
        version: 0
      }));
    });
    
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    
    // Verify Python is selected
    const activeLanguage = page.locator('button:has-text("Python"):has-text("Активно")');
    await expect(activeLanguage).toBeVisible({ timeout: 5000 });
  });

  test('should handle empty localStorage gracefully', async ({ page, context }) => {
    // Clear all localStorage
    await context.addInitScript(() => {
      localStorage.clear();
    });
    
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    
    // Page should load without errors
    await expect(page.locator('h1:has-text("90-дневный план")')).toBeVisible({ timeout: 10000 });
    
    // Should show language selection
    const pythonButton = page.locator('button:has-text("Python")').first();
    await expect(pythonButton).toBeVisible();
  });

  test('should handle corrupted localStorage data', async ({ page, context }) => {
    // Set corrupted data
    await context.addInitScript(() => {
      localStorage.setItem('vibestudy-progress', 'invalid json data');
    });
    
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    
    // Page should still load (fallback to defaults)
    await expect(page.locator('h1:has-text("90-дневный план")')).toBeVisible({ timeout: 10000 });
  });
});
