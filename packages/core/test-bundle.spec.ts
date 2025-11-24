import { test, expect } from '@playwright/test';

test('Check if browser bundle loads correctly', async ({ page }) => {
  await page.goto('http://localhost:3000/bundle-test.html');
  await page.waitForTimeout(1000);

  const outputHtml = await page.locator('#output').innerHTML();
  console.log('=== Bundle Test Output ===');
  console.log(outputHtml);

  // Check if hyperfixi global exists
  const hasHyperfixi = await page.evaluate(() => typeof window.hyperfixi !== 'undefined');
  console.log('Has hyperfixi global:', hasHyperfixi);

  if (hasHyperfixi) {
    const keys = await page.evaluate(() => Object.keys(window.hyperfixi));
    console.log('Hyperfixi keys:', keys);
  }
});
