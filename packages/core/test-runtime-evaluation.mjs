import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', msg => {
  const text = msg.text();
  if (text.includes('ARG EVAL') || text.includes('TARGET')) {
    console.log('BROWSER:', text);
  }
});

await page.goto('http://localhost:3000/bundle-test.html');
await page.waitForTimeout(1000);

const result = await page.evaluate(async () => {
  // Create element first
  const div = document.createElement('div');
  div.id = 'test-target';
  document.body.appendChild(div);
  
  console.log('TARGET innerHTML before:', div.innerHTML);
  
  // Try direct execution
  try {
    const result = await hyperfixi.evalHyperScript('put "works" into #test-target', {});
    console.log('TARGET innerHTML after direct:', div.innerHTML);
  } catch (e) {
    console.log('Direct failed:', e.message);
  }
  
  // Try with property syntax
  div.innerHTML = '';  // reset
  try {
    const result = await hyperfixi.evalHyperScript('put "works" into #test-target.innerHTML', {});
    console.log('TARGET innerHTML after property:', div.innerHTML);
  } catch (e) {
    console.log('Property failed:', e.message);
  }
  
  return {
    directWorks: div.innerHTML !== '',
  };
});

console.log('\n=== Runtime Evaluation Test ===');
console.log('Result:', result);

await browser.close();
