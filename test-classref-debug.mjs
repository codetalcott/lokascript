import { chromium } from 'playwright';

async function test() {
  console.log('🔍 Debugging classRef test...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Capture all console messages
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    logs.push(text);
    console.log(`  ${text}`);
  });

  // Navigate to compatibility test page
  await page.goto('http://localhost:3000/compatibility-test.html');
  await page.waitForTimeout(1000);

  console.log('\n🧪 Running manual classRef test...\n');

  // Run the test manually in the browser
  const result = await page.evaluate(async () => {
    // Clear work area
    if (window.clearWorkArea) {
      window.clearWorkArea();
    }

    // This is what the official test does
    const div = window.make("<div class='c1'></div>");
    console.log('[TEST] Created div:', div, 'className:', div.className);

    const value = await window.evalHyperScript(".c1");
    console.log('[TEST] evalHyperScript returned:', value);

    const arr = Array.from(value);
    console.log('[TEST] Array.from result:', arr, 'length:', arr.length);

    if (arr.length > 0) {
      console.log('[TEST] First element:', arr[0], 'same as div?', arr[0] === div);
    }

    // Also try direct DOM query
    const direct = document.querySelectorAll('.c1');
    console.log('[TEST] Direct querySelectorAll:', direct, 'length:', direct.length);

    return {
      divCreated: !!div,
      divClassName: div?.className,
      valueLength: arr.length,
      directLength: direct.length,
      passed: arr.length === 1 && arr[0] === div
    };
  });

  console.log('\n📊 Test Result:');
  console.log(JSON.stringify(result, null, 2));
  console.log();

  if (result.passed) {
    console.log('✅ TEST PASSED');
  } else {
    console.log('❌ TEST FAILED');
    console.log('   Expected: 1 element matching the created div');
    console.log(`   Got: ${result.valueLength} elements from evalHyperScript`);
    console.log(`   Direct querySelectorAll found: ${result.directLength} elements`);
  }

  await page.waitForTimeout(3000);
  await browser.close();

  process.exit(result.passed ? 0 : 1);
}

test().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
