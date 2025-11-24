import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

let consoleMessages = [];
page.on('console', msg => {
  consoleMessages.push(msg.text());
  console.log('BROWSER:', msg.text());
});
page.on('pageerror', err => console.log('ERROR:', err.message));

await page.goto('http://localhost:3000/bundle-test.html');
await page.waitForTimeout(1000);

const result = await page.evaluate(async () => {
  // Create element with click handler
  const div = document.createElement('div');
  div.id = 'dynamic-click-test';
  div.textContent = 'Click me';
  div.setAttribute('_', 'on click put "WORKED!" into me');
  
  document.body.appendChild(div);
  
  // Wait for observer
  await new Promise(r => setTimeout(r, 500));
  
  // Click it
  div.click();
  
  // Wait for execution
  await new Promise(r => setTimeout(r, 200));
  
  return {
    innerHTML: div.innerHTML,
    textContent: div.textContent,
    expected: 'WORKED!'
  };
});

console.log('\n=== Dynamic Attribute Test ===');
console.log('Result:', result);
console.log('Success:', result.textContent === result.expected);

await browser.close();
