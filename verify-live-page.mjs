import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('pageerror', err => console.log('❌ ERROR:', err.message));

await page.goto('http://localhost:3000/live-demo.html');
await page.waitForTimeout(1000);

const hasHyperfixi = await page.evaluate(() => typeof window.hyperfixi !== 'undefined');
console.log('✅ live-demo.html - hyperfixi loaded:', hasHyperfixi ? 'YES' : 'NO');

if (hasHyperfixi) {
  const keys = await page.evaluate(() => Object.keys(window.hyperfixi).length);
  console.log(`✅ API methods available: ${keys}`);
}

await browser.close();
