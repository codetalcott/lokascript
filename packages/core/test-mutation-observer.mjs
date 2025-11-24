import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

page.on('console', msg => console.log('BROWSER:', msg.text()));
page.on('pageerror', err => console.log('ERROR:', err.message));

await page.goto('http://localhost:3000/bundle-test.html');
await page.waitForTimeout(1000);

const result = await page.evaluate(async () => {
  // Check if observer exists
  const hasObserver = hyperfixi.attributeProcessor.observer !== null;
  
  // Create element with _="" attribute
  const div = document.createElement('div');
  div.id = 'dynamic-test';
  div.setAttribute('_', 'on click log "clicked!"');
  
  console.log('Adding element with _="" attribute to body...');
  document.body.appendChild(div);
  
  // Wait for observer to process
  await new Promise(r => setTimeout(r, 500));
  
  // Check if element was processed (should have event listeners)
  const wasProcessed = hyperfixi.attributeProcessor.processedElements ? 'unknown' : 'no tracking';
  
  return { 
    hasObserver,
    observerActive: hasObserver && hyperfixi.attributeProcessor.observer !== null,
    initialized: hyperfixi.attributeProcessor.initialized
  };
});

console.log('\n=== MutationObserver Test ===');
console.log('Result:', result);

await browser.close();
