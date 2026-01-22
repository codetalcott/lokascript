import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.addScriptTag({ url: 'http://localhost:3000/dist/lokascript-browser-unminified.js' });
await page.waitForTimeout(500);

const hasHyperfixi = await page.evaluate(() => typeof window.hyperfixi !== 'undefined');
console.log('Unminified - hyperfixi exists:', hasHyperfixi ? '✅' : '❌');

await browser.close();
