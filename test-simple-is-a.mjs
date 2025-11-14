import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER:', msg.text()));

  await page.goto('http://127.0.0.1:3000/test-simple-is-a.html');
  await page.waitForTimeout(1000);

  console.log('\n🧪 Clicking test button...');
  await page.click('#test');

  await page.waitForTimeout(5000);
  await browser.close();
}

test().catch(console.error);
