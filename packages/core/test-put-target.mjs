import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('http://localhost:3000/bundle-test.html');
await page.waitForTimeout(1000);

const result = await page.evaluate(async () => {
  const results = {};
  
  // Test 1: Put into element (working in dashboard)
  results.test1 = await hyperfixi.evalHyperScript('put "test1" into me', {
    me: document.body
  });
  
  // Test 2: Put into property
  const div = document.createElement('div');
  div.id = 'target';
  document.body.appendChild(div);
  
  results.test2 = await hyperfixi.evalHyperScript('put "test2" into #target', {});
  
  return {
    test1Body: document.body.textContent.includes('test1'),
    test2Div: div.textContent,
    divHTML: div.innerHTML
  };
});

console.log('Results:', result);

await browser.close();
