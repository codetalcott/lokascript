import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', msg => console.log('BROWSER:', msg.text()));

await page.goto('http://localhost:3000/bundle-test.html');
await page.waitForTimeout(1000);

const result = await page.evaluate(async () => {
  // Test 1: Non-standard syntax (test uses this)
  const div1 = document.createElement('div');
  div1.id = 'test1';
  div1.setAttribute('_', 'on click put "test1" into #test1.innerHTML');
  document.body.appendChild(div1);
  await new Promise(r => setTimeout(r, 200));
  div1.click();
  await new Promise(r => setTimeout(r, 200));
  
  // Test 2: Standard syntax (possessive)
  const div2 = document.createElement('div');
  div2.id = 'test2';
  div2.setAttribute('_', 'on click put "test2" into my innerHTML');
  document.body.appendChild(div2);
  await new Promise(r => setTimeout(r, 200));
  div2.click();
  await new Promise(r => setTimeout(r, 200));
  
  return {
    test1: div1.innerHTML,
    test2: div2.innerHTML,
    test1Works: div1.innerHTML === 'test1',
    test2Works: div2.innerHTML === 'test2'
  };
});

console.log('\n=== Syntax Comparison ===');
console.log('Non-standard (#id.property):', result.test1, '- Works:', result.test1Works);
console.log('Standard (my property):', result.test2, '- Works:', result.test2Works);

await browser.close();
