
import { test, expect } from '@playwright/test';
import { mockSupabaseAuth } from './auth-setup';

test.describe('Playground', () => {
    test.beforeEach(async ({ context }) => {
        await mockSupabaseAuth(context);
    });

    test('should load code editor', async ({ page }) => {
        await page.goto('/playground');

        // Editor container should be visible
        await expect(page.locator('.monaco-editor')).toBeVisible(); // Assuming Monaco editor class

        // Language selector
        await expect(page.getByRole('combobox').first()).toBeVisible();
    });

    test('should execute code mock', async ({ page }) => {
        await page.goto('/playground');

        // Mock the execute API
        await page.route('/api/execute', async route => {
            await route.fulfill({ json: { output: 'Hello World' } });
        });

        // Click run button
        await page.getByRole('button', { name: /run|execute/i }).click();

        // Check output
        await expect(page.getByText('Hello World')).toBeVisible();
    });
});
