import { test, expect } from '@playwright/test';

test.describe('Sync Functionality', () => {
  test('should work in guest mode without sync', async ({ page }) => {
    // Navigate to learn page
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    
    // Verify page loads without sync errors
    await expect(page.locator('h1:has-text("90-дневный план")')).toBeVisible({ timeout: 10000 });
    
    // Check that we can interact with the page
    const dayButton = page.locator('button:has-text("1")').first();
    await expect(dayButton).toBeVisible();
    await expect(dayButton).toBeEnabled();
  });

  test('should persist data in localStorage', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    
    // Select a language
    const pythonButton = page.locator('button:has-text("Python")').first();
    await pythonButton.click();
    
    // Wait for state to save
    await page.waitForTimeout(500);
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Check that Python is still selected (has "Активно" badge)
    const activeLanguage = page.locator('button:has-text("Python"):has-text("Активно")');
    await expect(activeLanguage).toBeVisible({ timeout: 5000 });
  });

  test('should maintain state across page navigation', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    
    // Select Python
    const pythonButton = page.locator('button:has-text("Python")').first();
    await pythonButton.click();
    await page.waitForTimeout(500);
    
    // Navigate to playground
    await page.goto('/playground');
    await page.waitForLoadState('networkidle');
    
    // Navigate back to learn
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    
    // Verify Python is still selected
    const activeLanguage = page.locator('button:has-text("Python"):has-text("Активно")');
    await expect(activeLanguage).toBeVisible({ timeout: 5000 });
  });
});
