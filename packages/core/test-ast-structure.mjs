import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto('http://localhost:3000/bundle-test.html');
await page.waitForTimeout(1000);

const result = await page.evaluate(async () => {
  const code = 'put "test" into #target.innerHTML';
  const compiled = hyperfixi.compile(code);
  
  return {
    success: compiled.success,
    targetArg: compiled.ast?.args?.[2],  // Third argument is the target
    targetType: compiled.ast?.args?.[2]?.type,
    allArgs: compiled.ast?.args?.map(arg => ({ type: arg?.type, name: arg?.name, value: arg?.value }))
  };
});

console.log('AST Structure:', JSON.stringify(result, null, 2));
await browser.close();
