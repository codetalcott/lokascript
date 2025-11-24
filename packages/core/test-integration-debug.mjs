import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', msg => console.log('BROWSER:', msg.text()));
page.on('pageerror', err => console.log('ERROR:', err.message));

await page.goto('http://localhost:3000/compatibility-test.html');
await page.waitForTimeout(2000);

const result = await page.evaluate(async () => {
  // This mimics the exact test
  clearWorkArea();
  
  const div = make('<div id="test-put" _=\'on click put "hello world" into #test-put.innerHTML\'></div>');
  
  document.body.appendChild(div);
  
  // Trigger click
  div.click();
  
  await new Promise(r => setTimeout(r, 100));
  
  return {
    innerHTML: div.innerHTML,
    expected: 'hello world',
    success: div.innerHTML === 'hello world'
  };
});

console.log('\n=== Integration Test Debug ===');
console.log('Result:', result);

await browser.close();
