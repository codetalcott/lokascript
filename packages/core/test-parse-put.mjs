import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('http://localhost:3000/bundle-test.html');
await page.waitForTimeout(1000);

const result = await page.evaluate(async () => {
  // Test what the parser produces
  const code1 = 'put "test" into #target';
  const code2 = 'put "test" into #target.innerHTML';
  
  const ast1 = hyperfixi.compile(code1);
  const ast2 = hyperfixi.compile(code2);
  
  return {
    code1_success: ast1.success,
    code1_args: ast1.ast?.args?.length,
    code2_success: ast2.success,
    code2_args: ast2.ast?.args?.length
  };
});

console.log('Parse Results:', result);
await browser.close();
