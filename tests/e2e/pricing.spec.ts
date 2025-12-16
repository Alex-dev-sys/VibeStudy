
import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from './auth-setup';

test.describe('Pricing Page', () => {
    test.beforeEach(async ({ context }) => {
        await mockSupabaseAuth(context);
    });

    test('should display pricing plans correctly', async ({ page }) => {
        // Navigate to pricing page
        await page.goto('/pricing');

        // Check header
        await expect(page.getByRole('heading', { name: /pricing|plans/i })).toBeVisible();

        // Check for Free plan
        await expect(page.getByText(/free/i)).toBeVisible();

        // Check for Pro plan
        await expect(page.getByText(/pro/i)).toBeVisible();
    });

    test('should have upgrade/get started buttons', async ({ page }) => {
        await page.goto('/pricing');

        // Check for at least one CTA button
        const buttons = page.getByRole('button', { name: /get started|upgrade|subscribe/i });
        await expect(buttons.first()).toBeVisible();
    });
});
