import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', msg => console.log('BROWSER:', msg.text()));
page.on('pageerror', err => console.log('ERROR:', err.message));

await page.goto('http://localhost:3000/bundle-test.html');
await page.waitForTimeout(2000);

const hasHyperfixi = await page.evaluate(() => typeof window.hyperfixi !== 'undefined');
console.log('\nhyperfixi exists:', hasHyperfixi ? '✅' : '❌');

await browser.close();
