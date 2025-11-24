import { chromium } from 'playwright';

async function checkBundle() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('🔍 Checking browser bundle...\n');

  try {
    await page.goto('http://localhost:3000/bundle-test.html');
    await page.waitForTimeout(1000);

    // Check if hyperfixi exists
    const hasHyperfixi = await page.evaluate(() => typeof window.hyperfixi !== 'undefined');
    console.log(`hyperfixi global exists: ${hasHyperfixi ? '✅' : '❌'}`);

    if (hasHyperfixi) {
      const keys = await page.evaluate(() => Object.keys(window.hyperfixi));
      console.log(`\nAvailable methods: ${keys.slice(0, 10).join(', ')}...`);

      // Test evalHyperScript
      const hasEval = await page.evaluate(() => typeof window.hyperfixi.evalHyperScript === 'function');
      console.log(`\nevalHyperScript function: ${hasEval ? '✅' : '❌'}`);

      if (hasEval) {
        // Try to execute simple code
        const result = await page.evaluate(async () => {
          try {
            const res = await window.hyperfixi.evalHyperScript('2 + 3');
            return { success: true, result: res };
          } catch (err) {
            return { success: false, error: err.message };
          }
        });

        if (result.success) {
          console.log(`\nSimple evaluation test: ✅ (2 + 3 = ${result.result})`);
        } else {
          console.log(`\nSimple evaluation test: ❌ (${result.error})`);
        }
      }
    } else {
      console.log('\n❌ hyperfixi global is not defined!');
      console.log('This means the browser bundle is not loading correctly.');
    }

    // Check the output div content
    const outputHtml = await page.locator('#output').innerHTML();
    console.log('\n=== Bundle Test Page Output ===');
    console.log(outputHtml.replace(/<\/?p>/g, '\n'));

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await browser.close();
  }
}

checkBundle();
