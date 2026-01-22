import { test, expect } from '@playwright/test';

test('Check behavior registration', async ({ page }) => {
  await page.goto('/examples/behaviors/demo.html');

  await page.waitForFunction(
    () => (window as any).__hyperfixi_debug?.includes('init() completed'),
    { timeout: 10000 }
  );

  const result = await page.evaluate(() => {
    const runtime = (window as any).lokascript?.runtime;
    return {
      hasRuntime: !!runtime,
      hasBehaviorRegistry: !!runtime?.behaviorRegistry,
      registrySize: runtime?.behaviorRegistry?.size || 0,
      behaviors: runtime?.behaviorRegistry ? Array.from(runtime.behaviorRegistry.keys()) : [],
      hasToggleable: runtime?.behaviorRegistry?.has('Toggleable')
    };
  });

  console.log('Behavior registration check:', result);
  expect(result.hasRuntime).toBe(true);
  expect(result.hasBehaviorRegistry).toBe(true);
  expect(result.registrySize).toBeGreaterThan(0);
  expect(result.behaviors).toContain('Toggleable');
});
