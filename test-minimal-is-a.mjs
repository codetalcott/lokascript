import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER:', msg.text()));

  await page.goto('http://127.0.0.1:3000/test-is-a-minimal.html');
  await page.waitForTimeout(3000);

  const result = await page.textContent('#result');
  console.log('\nFinal result:', result);

  await page.waitForTimeout(2000);
  await browser.close();
}

test().catch(console.error);
