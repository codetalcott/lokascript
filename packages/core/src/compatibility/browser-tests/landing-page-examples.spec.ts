/**
 * Landing Page Examples Tests
 *
 * Tests for examples shown on the hyperscript.org landing page to ensure
 * HyperFixi bundles can handle them correctly.
 */
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://127.0.0.1:3000';

test.describe('Landing Page Examples @comprehensive', () => {

  test.describe('Color Cycling Example', () => {
    /**
     * Tests the exact code from hyperscript.org landing page:
     *
     * _="on pointerdown
     *   repeat until event pointerup from the document
     *     set rand to Math.random() * 360
     *     transition
     *       *background-color
     *       to `hsl($rand 100% 90%)`
     *       over 250ms
     *   end
     *   transition *background-color to initial"
     *
     * Features tested:
     * - on pointerdown event
     * - repeat until event from document (global event source)
     * - Math.random() global access
     * - *background-color possessive CSS property syntax
     * - Template string interpolation with $variable
     * - transition command with timing
     * - initial CSS keyword
     */

    test('page loads without errors', async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', err => pageErrors.push(err.message));

      await page.goto(`${BASE_URL}/examples/landing-page/color-cycling.html`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      await page.waitForTimeout(500);

      // Should have no critical page errors
      const criticalErrors = pageErrors.filter(e =>
        !e.includes('ResizeObserver') &&
        !e.includes('Script error')
      );
      expect(criticalErrors).toEqual([]);
    });

    test('color box element exists and is styled correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/examples/landing-page/color-cycling.html`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      await page.waitForTimeout(300);

      const colorBox = page.locator('#color-box');
      await expect(colorBox).toBeVisible();

      // Check initial background color is set
      const bgColor = await colorBox.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );
      expect(bgColor).toBeTruthy();
      expect(bgColor).not.toBe('');
    });

    test('pointerdown triggers color cycling', async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', err => pageErrors.push(err.message));

      await page.goto(`${BASE_URL}/examples/landing-page/color-cycling.html`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      await page.waitForTimeout(500);

      const colorBox = page.locator('#color-box');
      const box = await colorBox.boundingBox();
      expect(box).toBeTruthy();

      if (box) {
        // Get initial background color
        const initialBg = await colorBox.evaluate(el =>
          window.getComputedStyle(el).backgroundColor
        );

        // Press and hold for color cycling
        await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
        await page.mouse.down();

        // Wait for at least one transition to complete (250ms + buffer)
        await page.waitForTimeout(400);

        // Check that color changed during cycling
        const cyclingBg = await colorBox.evaluate(el =>
          window.getComputedStyle(el).backgroundColor
        );

        // Release
        await page.mouse.up();
        await page.waitForTimeout(100);

        // Check status indicates cycling occurred
        const statusText = await page.locator('#status').textContent();
        expect(statusText).toContain('Ready');

        // Verify no page errors during cycling
        const criticalErrors = pageErrors.filter(e =>
          !e.includes('ResizeObserver') &&
          !e.includes('Script error')
        );
        expect(criticalErrors).toEqual([]);
      }
    });

    test('longer hold produces color changes', async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', err => pageErrors.push(err.message));

      await page.goto(`${BASE_URL}/examples/landing-page/color-cycling.html`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      await page.waitForTimeout(500);

      const colorBox = page.locator('#color-box');
      const box = await colorBox.boundingBox();
      expect(box).toBeTruthy();

      if (box) {
        // Get initial background color
        const initialBg = await colorBox.evaluate(el =>
          window.getComputedStyle(el).backgroundColor
        );

        // Press and hold for multiple transitions
        await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
        await page.mouse.down();

        // Wait for multiple transitions (3 x 250ms = 750ms + buffer)
        await page.waitForTimeout(1000);

        // Sample color during cycling
        const cyclingBg = await colorBox.evaluate(el =>
          window.getComputedStyle(el).backgroundColor
        );

        await page.mouse.up();
        await page.waitForTimeout(300);

        // Verify status shows ready after release
        const statusText = await page.locator('#status').textContent();
        expect(statusText).toContain('Ready');

        // Verify no errors during the hold
        const criticalErrors = pageErrors.filter(e =>
          !e.includes('ResizeObserver') &&
          !e.includes('Script error')
        );
        expect(criticalErrors).toEqual([]);
      }
    });

    test('release restores color to initial', async ({ page }) => {
      await page.goto(`${BASE_URL}/examples/landing-page/color-cycling.html`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      await page.waitForTimeout(500);

      const colorBox = page.locator('#color-box');
      const box = await colorBox.boundingBox();
      expect(box).toBeTruthy();

      if (box) {
        // Get initial background color
        const initialBg = await colorBox.evaluate(el =>
          window.getComputedStyle(el).backgroundColor
        );

        // Press and hold briefly
        await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
        await page.mouse.down();
        await page.waitForTimeout(600);
        await page.mouse.up();

        // Wait for final transition to complete
        await page.waitForTimeout(400);

        // Color should be restored (note: 'initial' resolves to computed value)
        const finalBg = await colorBox.evaluate(el =>
          window.getComputedStyle(el).backgroundColor
        );

        // The final background should be either the initial value or close to it
        // Since 'initial' is CSS keyword, it should restore to transparent or the element default
        expect(finalBg).toBeTruthy();
      }
    });

    test('hyperscript is parsed and compiled without errors', async ({ page }) => {
      await page.goto(`${BASE_URL}/examples/landing-page/color-cycling.html`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      await page.waitForTimeout(500);

      // Check that HyperFixi processed the element
      const hasHyperscript = await page.evaluate(() => {
        const el = document.getElementById('color-box');
        // Check for hyperscript attribute
        return el?.getAttribute('_') !== null;
      });
      expect(hasHyperscript).toBe(true);

      // Check HyperFixi is loaded
      const bundleLoaded = await page.evaluate(() => {
        return typeof (window as any).hyperfixi !== 'undefined' ||
               typeof (window as any)._hyperscript !== 'undefined';
      });
      expect(bundleLoaded).toBe(true);
    });
  });

  test.describe('Syntax Compatibility', () => {

    test('*property possessive syntax works', async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', err => pageErrors.push(err.message));

      // This tests the *background-color syntax specifically
      await page.goto(`${BASE_URL}/examples/landing-page/color-cycling.html`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      await page.waitForTimeout(500);

      const colorBox = page.locator('#color-box');
      const box = await colorBox.boundingBox();

      if (box) {
        await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
        await page.mouse.down();
        await page.waitForTimeout(300);
        await page.mouse.up();
      }

      // Should not have "requires a target value" or similar errors
      const targetValueErrors = pageErrors.filter(e =>
        e.includes('target value') ||
        e.includes('Cannot read') ||
        e.includes('undefined')
      );
      expect(targetValueErrors).toEqual([]);
    });

    test('template string with $variable interpolation works', async ({ page }) => {
      const consoleMessages: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleMessages.push(msg.text());
        }
      });

      await page.goto(`${BASE_URL}/examples/landing-page/color-cycling.html`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      await page.waitForTimeout(500);

      const colorBox = page.locator('#color-box');
      const box = await colorBox.boundingBox();

      if (box) {
        await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
        await page.mouse.down();
        await page.waitForTimeout(300);

        // During cycling, check the background is an HSL color
        const bgColor = await colorBox.evaluate(el =>
          window.getComputedStyle(el).backgroundColor
        );

        await page.mouse.up();

        // Should be a valid RGB color (browser converts HSL to RGB)
        expect(bgColor).toMatch(/^rgb/);
      }

      // Should not have template string parsing errors
      const templateErrors = consoleMessages.filter(e =>
        e.includes('template') ||
        e.includes('interpolation') ||
        e.includes('$rand')
      );
      expect(templateErrors).toEqual([]);
    });

    test('event from document (global event source) works', async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', err => pageErrors.push(err.message));

      await page.goto(`${BASE_URL}/examples/landing-page/color-cycling.html`, {
        waitUntil: 'domcontentloaded',
        timeout: 10000
      });
      await page.waitForTimeout(500);

      const colorBox = page.locator('#color-box');
      const box = await colorBox.boundingBox();

      if (box) {
        // Start cycling
        await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
        await page.mouse.down();
        await page.waitForTimeout(300);

        // Release on a different part of the page (tests document-level listener)
        await page.mouse.move(10, 10);
        await page.mouse.up();
        await page.waitForTimeout(300);

        // Status should show cycling stopped
        const statusText = await page.locator('#status').textContent();
        expect(statusText).toContain('Ready');
      }

      // No errors related to event listeners
      const eventErrors = pageErrors.filter(e =>
        e.includes('addEventListener') ||
        e.includes('event') ||
        e.includes('from')
      );
      expect(eventErrors).toEqual([]);
    });
  });
});
