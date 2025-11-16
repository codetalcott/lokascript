import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:3000';

async function testFetchCommand() {
  console.log('🧪 Testing Native Fetch Command Syntax...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Listen for console logs
  const logs = [];
  page.on('console', msg => {
    logs.push(`${msg.type()}: ${msg.text()}`);
    console.log(`  [Browser] ${msg.type()}: ${msg.text()}`);
  });

  // Listen for errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.error(`  ❌ [Error]: ${error.message}`);
  });

  try {
    // Load test page
    console.log(`📄 Loading test page: ${BASE_URL}/packages/core/test-fetch-native.html`);
    await page.goto(`${BASE_URL}/packages/core/test-fetch-native.html`, {
      waitUntil: 'networkidle'
    });

    // Wait for page to fully load
    await page.waitForTimeout(3000);

    // Check test results
    const result1 = await page.textContent('#result1');
    const result2 = await page.textContent('#result2');
    const result3 = await page.textContent('#result3');

    console.log('\n📊 Test Results:');
    console.log(`  Test 1 (fetch as json): ${result1 || 'NO RESULT'}`);
    console.log(`  Test 2 (fetch as text): ${result2 || 'NO RESULT'}`);
    console.log(`  Test 3 (fetch + assign): ${result3 || 'NO RESULT'}`);

    console.log('\n📝 All Console Logs:');
    logs.forEach(log => console.log(`  ${log}`));

    // Check for errors
    if (errors.length > 0) {
      console.log('\n❌ ERRORS DETECTED:');
      errors.forEach(err => console.log(`  - ${err}`));
      await browser.close();
      process.exit(1);
    }

    // Verify success
    const allSuccessful =
      result1?.includes('Success') &&
      result2?.includes('Success') &&
      result3?.includes('User:');

    if (allSuccessful) {
      console.log('\n✅ ALL TESTS PASSED! Native fetch syntax works!');
      await browser.close();
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests did not complete successfully');
      await browser.close();
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test failed with error:', error);
    await browser.close();
    process.exit(1);
  }
}

testFetchCommand();
