import { test, expect } from '@playwright/test';

test.describe('Sync Functionality', () => {
  test.skip('should show offline indicator when offline', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await context.setOffline(true);
    
    // Make a change that would trigger sync
    const taskCheckbox = page.locator('input[type="checkbox"]').first();
    await taskCheckbox.click();
    
    // Check for offline indicator
    const offlineIndicator = page.locator('text=/нет подключения/i');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });
    
    // Go back online
    await context.setOffline(false);
    
    // Wait for sync
    await page.waitForTimeout(2000);
    
    // Offline indicator should disappear
    await expect(offlineIndicator).not.toBeVisible();
  });

  test.skip('should queue operations when offline', async ({ page, context }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await context.setOffline(true);
    
    // Make multiple changes
    const checkboxes = page.locator('input[type="checkbox"]');
    await checkboxes.nth(0).click();
    await checkboxes.nth(1).click();
    
    // Check queue size in offline indicator
    const queueInfo = page.locator('text=/операци/i');
    await expect(queueInfo).toBeVisible();
    
    // Go back online
    await context.setOffline(false);
    
    // Wait for queue to process
    await page.waitForTimeout(3000);
    
    // Queue should be empty
    await expect(queueInfo).not.toBeVisible();
  });

  test.skip('should sync progress across tabs', async ({ browser }) => {
    // Open two tabs
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();
    
    // Navigate both to app
    await page1.goto('/');
    await page2.goto('/');
    
    await page1.waitForLoadState('networkidle');
    await page2.waitForLoadState('networkidle');
    
    // Complete task in first tab
    const checkbox1 = page1.locator('input[type="checkbox"]').first();
    await checkbox1.click();
    
    // Wait for sync
    await page1.waitForTimeout(2000);
    
    // Reload second tab
    await page2.reload();
    await page2.waitForLoadState('networkidle');
    
    // Check if task is completed in second tab
    const checkbox2 = page2.locator('input[type="checkbox"]').first();
    await expect(checkbox2).toBeChecked();
    
    await context.close();
  });
});
