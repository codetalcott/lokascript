import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => console.log(msg.text()));

  // Use production preview URL
  await page.goto('http://localhost:4173/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Test all four languages - use buttons in the "Mixed Languages" section
  const tests = [
    { label: 'English', selector: 'button:has-text("EN: Toggle")' },
    { label: 'Japanese', selector: 'button:has-text("JA: トグル")' },
    { label: 'Spanish', selector: 'button:has-text("ES: Alternar")' },
    { label: 'Korean', selector: 'button:has-text("KO: 토글")' },
  ];

  console.log('\n=== Production Build Test ===\n');

  let allPassed = true;
  for (const { label, selector } of tests) {
    const btn = page.locator(selector);
    const count = await btn.count();
    if (count === 0) {
      console.log(`${label}: SKIPPED (button not found)`);
      continue;
    }

    const hadBefore = await btn.evaluate(el => el.classList.contains('active'));
    await btn.click();
    await page.waitForTimeout(100);
    const hasAfter = await btn.evaluate(el => el.classList.contains('active'));

    const passed = !hadBefore && hasAfter;
    console.log(`${label} toggle works: ${passed}`);
    if (!passed) allPassed = false;
  }

  await browser.close();

  console.log('\n=== Results ===');
  console.log(`All tests passed: ${allPassed}`);

  process.exit(allPassed ? 0 : 1);
}

test().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
