import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/', '/login', '/learn'];

pages.forEach((path) => {
  test(`accessibility check for ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'networkidle' });
    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();
    expect(accessibilityScanResults.violations, JSON.stringify(accessibilityScanResults.violations, null, 2)).toHaveLength(0);
  });
});

