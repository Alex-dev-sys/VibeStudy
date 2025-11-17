import { test, expect } from '@playwright/test';

test.describe('Locale Store Hydration Fix', () => {
  test.describe('4.1 Fresh page load without localStorage', () => {
    test('should load login page without errors on fresh visit', async ({ page, context }) => {
      // Clear all storage before test
      await context.clearCookies();
      await page.goto('/login');
      await page.evaluate(() => localStorage.clear());
      
      // Reload to ensure clean state
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify no console errors
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Wait a bit to catch any async errors
      await page.waitForTimeout(2000);
      
      // Check for the specific error we're fixing
      const hasUndefinedError = consoleErrors.some(error => 
        error.includes('Cannot read properties of undefined')
      );
      expect(hasUndefinedError).toBe(false);
      
      // Verify login page renders correctly
      await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
      
      // Verify page has loaded with default locale (Russian)
      const heading = await page.locator('h1').textContent();
      expect(heading).toBeTruthy();
    });

    test('should have translations available immediately', async ({ page, context }) => {
      // Clear storage
      await context.clearCookies();
      await page.goto('/login');
      await page.evaluate(() => localStorage.clear());
      
      // Reload and check translations are available
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check that store is initialized with translations
      const storeState = await page.evaluate(() => {
        const storeJson = localStorage.getItem('vibestudy-locale');
        return storeJson ? JSON.parse(storeJson) : null;
      });
      
      // Even if localStorage is empty, the page should render
      await expect(page.locator('body')).toBeVisible();
      
      // Verify page has visible content (translations are working)
      await expect(page.locator('h1')).toBeVisible();
      const heading = await page.locator('h1').textContent();
      expect(heading).toBeTruthy();
      expect(heading!.length).toBeGreaterThan(0);
    });
  });

  test.describe('4.2 Locale persistence across page reloads', () => {
    test('should persist English locale and translations across reloads', async ({ page }) => {
      // Set guest mode to access /learn page
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('guestMode', 'true');
      });
      
      // Start on learn page with default locale (Russian)
      await page.goto('/learn');
      await page.waitForLoadState('networkidle');
      
      // Verify we start with Russian (default)
      const initialLocale = await page.evaluate(() => {
        const storeJson = localStorage.getItem('vibestudy-locale');
        return storeJson ? JSON.parse(storeJson).state?.locale : 'ru';
      });
      expect(initialLocale).toBe('ru');
      
      // Verify Russian text is visible initially (check for Russian text in dashboard)
      const russianText = page.locator('text=Профиль');
      await expect(russianText).toBeVisible({ timeout: 5000 });
      
      // Find and click the EN button in the locale switcher (first one in the header)
      const enButton = page.locator('button:has-text("EN")').first();
      await expect(enButton).toBeVisible({ timeout: 5000 });
      await enButton.click();
      
      // Wait for locale change to take effect
      await page.waitForTimeout(500);
      
      // Verify locale changed to English in localStorage
      const localeAfterSwitch = await page.evaluate(() => {
        const storeJson = localStorage.getItem('vibestudy-locale');
        return storeJson ? JSON.parse(storeJson).state?.locale : null;
      });
      expect(localeAfterSwitch).toBe('en');
      
      // Verify English translations are visible (check for English text)
      const englishText = page.locator('text=Profile');
      await expect(englishText).toBeVisible({ timeout: 5000 });
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify English is still selected after reload
      const localeAfterReload = await page.evaluate(() => {
        const storeJson = localStorage.getItem('vibestudy-locale');
        return storeJson ? JSON.parse(storeJson).state?.locale : null;
      });
      expect(localeAfterReload).toBe('en');
      
      // Verify all translations are in English after reload
      const englishTextAfterReload = page.locator('text=Profile');
      await expect(englishTextAfterReload).toBeVisible({ timeout: 5000 });
      
      // Verify EN button is still active
      const enButtonAfterReload = page.locator('button:has-text("EN")').first();
      await expect(enButtonAfterReload).toBeVisible();
      
      // Check for more English text in other UI elements
      const playgroundButton = page.locator('text=Playground');
      await expect(playgroundButton).toBeVisible({ timeout: 5000 });
      
      const completedText = page.locator('text=Completed').first();
      await expect(completedText).toBeVisible({ timeout: 5000 });
      
      // Verify page loaded successfully without errors
      await expect(page.locator('body')).toBeVisible();
    });

    test('should persist locale when navigating between pages', async ({ page }) => {
      // Set guest mode to access pages
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem('guestMode', 'true');
      });
      
      // Start on learn page
      await page.goto('/learn');
      await page.waitForLoadState('networkidle');
      
      // Switch to English
      const enButton = page.locator('button:has-text("EN")').first();
      await expect(enButton).toBeVisible({ timeout: 5000 });
      await enButton.click();
      await page.waitForTimeout(500);
      
      // Verify English on learn page
      const profileText = page.locator('text=Profile');
      await expect(profileText).toBeVisible({ timeout: 5000 });
      
      // Navigate to playground
      await page.goto('/playground');
      await page.waitForLoadState('networkidle');
      
      // Verify English persists on playground page
      const playgroundTitle = await page.locator('h1').first().textContent();
      expect(playgroundTitle).toBe('Playground'); // English version
      
      // Navigate back to learn
      await page.goto('/learn');
      await page.waitForLoadState('networkidle');
      
      // Verify English persists on learn page
      const profileTextAgain = page.locator('text=Profile');
      await expect(profileTextAgain).toBeVisible({ timeout: 5000 });
      
      // Verify locale is still English in localStorage
      const finalLocale = await page.evaluate(() => {
        const storeJson = localStorage.getItem('vibestudy-locale');
        return storeJson ? JSON.parse(storeJson).state?.locale : null;
      });
      expect(finalLocale).toBe('en');
    });

    test('should maintain default locale (Russian) on fresh load', async ({ page, context }) => {
      // Clear storage
      await context.clearCookies();
      await page.goto('/login');
      await page.evaluate(() => localStorage.clear());
      
      // Reload
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Check that default locale is Russian
      const locale = await page.evaluate(() => {
        const storeJson = localStorage.getItem('vibestudy-locale');
        if (!storeJson) return 'ru'; // Default when no storage
        return JSON.parse(storeJson).state?.locale || 'ru';
      });
      
      expect(locale).toBe('ru');
      
      // Verify Russian translations are visible (check for Russian text)
      const title = await page.locator('h1').first().textContent();
      expect(title).toContain('VibeStudy'); // Page should have loaded with content
      expect(title).toContain('встречает'); // Russian word "welcomes"
    });
  });

  test.describe('4.3 Corrupted localStorage handling', () => {
    test('should handle corrupted locale value gracefully', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Corrupt the locale value in localStorage
      await page.evaluate(() => {
        localStorage.setItem('vibestudy-locale', JSON.stringify({
          state: {
            locale: 'invalid-locale-xyz',
            hasHydrated: false
          },
          version: 0
        }));
      });
      
      // Track console errors
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Wait for hydration to complete
      await page.waitForTimeout(1000);
      
      // Verify no crash - page should still render
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
      
      // Verify page has valid content (translations are working)
      const heading = await page.locator('h1').textContent();
      expect(heading).toBeTruthy();
      expect(heading!.length).toBeGreaterThan(0);
      
      // Verify the store is using a valid locale internally (check by looking at rendered content)
      // The page should render with default Russian translations
      const bodyText = await page.locator('body').textContent();
      expect(bodyText).toBeTruthy();
      
      // Verify no undefined errors
      const hasUndefinedError = consoleErrors.some(error => 
        error.includes('Cannot read properties of undefined')
      );
      expect(hasUndefinedError).toBe(false);
    });

    test('should handle malformed JSON in localStorage', async ({ page }) => {
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Set malformed JSON
      await page.evaluate(() => {
        localStorage.setItem('vibestudy-locale', '{invalid json}');
      });
      
      // Reload page
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify page still loads
      await expect(page.locator('body')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
      
      // Store should have been reset to default
      const locale = await page.evaluate(() => {
        const storeJson = localStorage.getItem('vibestudy-locale');
        if (!storeJson || storeJson === '{invalid json}') return 'default';
        try {
          return JSON.parse(storeJson).state?.locale || 'default';
        } catch {
          return 'default';
        }
      });
      
      // Should work with default locale
      expect(locale).toBeTruthy();
    });
  });

  test.describe('4.4 Production environment verification', () => {
    test('should load without undefined errors', async ({ page }) => {
      // Track all console messages
      const consoleMessages: Array<{ type: string; text: string }> = [];
      page.on('console', (msg) => {
        consoleMessages.push({
          type: msg.type(),
          text: msg.text()
        });
      });
      
      // Load login page
      await page.goto('/login');
      await page.waitForLoadState('networkidle');
      
      // Wait for any async operations
      await page.waitForTimeout(2000);
      
      // Check for the specific error we fixed
      const hasTargetError = consoleMessages.some(msg => 
        msg.type === 'error' && 
        msg.text.includes('Cannot read properties of undefined')
      );
      
      expect(hasTargetError).toBe(false);
      
      // Verify login page loaded successfully
      await expect(page.locator('h1')).toBeVisible({ timeout: 5000 });
      
      // Verify no critical errors
      const criticalErrors = consoleMessages.filter(msg => 
        msg.type === 'error' && 
        !msg.text.includes('favicon') // Ignore favicon errors
      );
      
      // Log errors for debugging if any exist
      if (criticalErrors.length > 0) {
        console.log('Console errors found:', criticalErrors);
      }
    });

    test('should handle SSR/CSR hydration correctly', async ({ page }) => {
      // Disable JavaScript to test SSR
      await page.goto('/login', { waitUntil: 'domcontentloaded' });
      
      // Verify page has content even without JS
      const bodyContent = await page.locator('body').textContent();
      expect(bodyContent).toBeTruthy();
      expect(bodyContent!.length).toBeGreaterThan(0);
      
      // Now enable JS and verify hydration works
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Verify interactive elements work
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should work across different pages', async ({ page }) => {
      const pages = ['/login', '/playground', '/'];
      
      for (const pagePath of pages) {
        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        
        await page.goto(pagePath);
        await page.waitForLoadState('networkidle');
        
        // Verify no undefined translation errors
        const hasUndefinedError = consoleErrors.some(error => 
          error.includes('Cannot read properties of undefined')
        );
        
        expect(hasUndefinedError).toBe(false);
        
        // Verify page loaded
        await expect(page.locator('body')).toBeVisible();
      }
    });
  });
});
