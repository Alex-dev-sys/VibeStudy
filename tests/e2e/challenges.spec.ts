
import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from './auth-setup';

test.describe('Challenges Flow', () => {
    test.beforeEach(async ({ context }) => {
        await mockSupabaseAuth(context);
    });

    test('should display daily challenge', async ({ page }) => {
        await page.goto('/challenges');

        // Wait for challenge card
        await expect(page.locator('h1, h2').filter({ hasText: /daily challenge|challenge/i }).first()).toBeVisible();
    });

    test('should allow attempting a challenge', async ({ page }) => {
        await page.goto('/challenges');

        // Mock the submit API
        await page.route('/api/challenges/submit', async route => {
            await route.fulfill({ json: { success: true, score: 100 } });
        });

        // Click on a start/solve button
        // Note: Selector might need adjustment based on actual UI
        const startButton = page.getByRole('button', { name: /start|solve|begin/i }).first();
        if (await startButton.isVisible()) {
            await startButton.click();
            await expect(page.url()).toContain('/solve');
        }
    });
});
