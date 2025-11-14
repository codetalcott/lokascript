import { chromium } from 'playwright';

async function test() {
  console.log('🚀 Starting CSS selector debug test...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture console messages
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      console.log('❌ BROWSER ERROR:', text);
    } else {
      console.log(`   ${text}`);
    }
  });

  // Navigate to test page
  await page.goto('http://127.0.0.1:3000/test-css-selector-debug.html');

  // Wait for tests to complete
  await page.waitForTimeout(3000);

  // Get the results
  const results = await page.evaluate(() => {
    const resultDivs = document.querySelectorAll('.result');
    return Array.from(resultDivs).map(div => ({
      text: div.textContent.trim(),
      passed: div.classList.contains('pass')
    }));
  });

  console.log('\n📊 Test Results:\n');
  results.forEach(r => {
    console.log(r.text);
    console.log();
  });

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Summary: ${passedCount}/${totalCount} tests passed`);
  console.log(`${'='.repeat(60)}\n`);

  await page.waitForTimeout(2000);
  await browser.close();

  process.exit(passedCount === totalCount ? 0 : 1);
}

test().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
