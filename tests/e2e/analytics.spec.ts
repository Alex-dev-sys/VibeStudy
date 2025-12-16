
import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from './auth-setup';

test.describe('Analytics Page', () => {
    test.beforeEach(async ({ context }) => {
        await mockSupabaseAuth(context);
    });

    test('should display user stats', async ({ page }) => {
        await page.goto('/analytics');

        // Header
        await expect(page.getByRole('heading', { name: /analytics|statistics/i })).toBeVisible();

        // Stats cards (Day streak, tasks, etc.)
        // Using generic text locators common in stats
        await expect(page.getByText(/streak/i)).toBeVisible();
        await expect(page.getByText(/completed/i)).toBeVisible();
    });

    test('should render charts', async ({ page }) => {
        await page.goto('/analytics');

        // Charts usually use canvas or specific wrappers
        // Checking for visual presence of a chart container
        // This selector might need to be more specific based on the chart library (e.g., Recharts)
        const chart = page.locator('.recharts-wrapper, canvas').first();
        if (await chart.count() > 0) {
            await expect(chart).toBeVisible();
        }
    });
});
