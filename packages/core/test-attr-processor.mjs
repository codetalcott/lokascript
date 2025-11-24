import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', msg => console.log('BROWSER:', msg.text()));
page.on('pageerror', err => console.log('ERROR:', err.message));

await page.goto('http://localhost:3000/bundle-test.html');
await page.waitForTimeout(1000);

const result = await page.evaluate(async () => {
  const hasProcessor = typeof hyperfixi.attributeProcessor !== 'undefined';
  const div = document.createElement('div');
  div.setAttribute('_', 'on click put "test" into me');
  document.body.appendChild(div);
  
  await new Promise(r => setTimeout(r, 100));
  
  return { 
    hasProcessor,
    processorKeys: hasProcessor ? Object.keys(hyperfixi.attributeProcessor).slice(0, 5) : []
  };
});

console.log('Result:', result);
await browser.close();
