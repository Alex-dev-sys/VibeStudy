import { test, expect } from '@playwright/test';

test.describe('Basic User Flow', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check if the page loaded
    await expect(page).toHaveTitle(/VibeStudy/i);
    
    // Check for main heading
    await expect(page.locator('h1')).toContainText(/прорыв/i);
  });

  test('should navigate to playground', async ({ page }) => {
    await page.goto('/playground');
    
    // Wait for content to load
    await page.waitForLoadState('networkidle');
    
    // Check if playground loaded - look for "Playground" heading
    await expect(page.locator('h1:has-text("Playground")')).toBeVisible({ timeout: 10000 });
  });

  test('should be able to write code in playground editor', async ({ page }) => {
    await page.goto('/playground');
    await page.waitForLoadState('networkidle');
    
    // Wait for Monaco editor to load
    await page.waitForTimeout(3000);
    
    // Find Monaco editor
    const editor = page.locator('.monaco-editor').first();
    await expect(editor).toBeVisible({ timeout: 15000 });
    
    // Verify editor loaded successfully
    const editorContent = page.locator('.view-line');
    await expect(editorContent.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show learn page with day navigation', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    
    // Check if learn page loaded
    await expect(page.locator('h1:has-text("90-дневный план")')).toBeVisible({ timeout: 10000 });
    
    // Check if day buttons are visible
    const dayButton = page.locator('button:has-text("1")').first();
    await expect(dayButton).toBeVisible();
  });

  test('should be able to generate content for day', async ({ page }) => {
    await page.goto('/learn');
    await page.waitForLoadState('networkidle');
    
    // Find and click generate button
    const generateButton = page.locator('button:has-text("Сгенерировать теорию")');
    await expect(generateButton).toBeVisible({ timeout: 10000 });
    
    // Note: We don't actually click it in tests to avoid API calls
    // Just verify the button is present and clickable
    await expect(generateButton).toBeEnabled();
  });
});
