import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:3000';

async function testHttpErrors() {
  console.log('🧪 Testing HTTP Error Handling...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = {
    test1: { name: 'Success (200)', passed: false, output: '' },
    test2: { name: 'HTTP 404 Error', passed: false, output: '' },
    test3: { name: 'Network Error', passed: false, output: '' },
  };

  // Listen for ALL console logs
  page.on('console', msg => {
    const text = msg.text();
    console.log(`  ${text}`);

    // Check for success/error patterns
    if (text.includes('Test 1') && text.includes('SUCCESS: Got data')) {
      results.test1.passed = true;
      results.test1.output = 'Got successful 200 response';
    }
    if (text.includes('Test 2') && text.includes('ERROR caught (expected)')) {
      results.test2.passed = true;
      results.test2.output = 'HTTP 404 error caught correctly';
    }
    if (text.includes('Test 3') && text.includes('ERROR caught (expected)')) {
      results.test3.passed = true;
      results.test3.output = 'Network error caught correctly';
    }
  });

  page.on('pageerror', error => {
    console.error(`  ❌ [PAGE ERROR]: ${error.message}`);
  });

  try {
    console.log(`📄 Loading: ${BASE_URL}/packages/core/test-http-errors.html\n`);
    await page.goto(`${BASE_URL}/packages/core/test-http-errors.html`, {
      waitUntil: 'networkidle'
    });

    // Wait for auto-tests to complete (3 tests with 1s delay each)
    await page.waitForTimeout(5000);

    // Check results on page
    const result1 = await page.textContent('#result1');
    const result2 = await page.textContent('#result2');
    const result3 = await page.textContent('#result3');

    console.log('\n========================================');
    console.log('TEST RESULTS');
    console.log('========================================\n');

    console.log(`Test 1 (${results.test1.name}):`);
    console.log(`  Status: ${results.test1.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  DOM Result: ${result1}`);
    console.log(`  Expected: "SUCCESS: Got data"`);
    console.log();

    console.log(`Test 2 (${results.test2.name}):`);
    console.log(`  Status: ${results.test2.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  DOM Result: ${result2}`);
    console.log(`  Expected: "SUCCESS: Error was caught!"`);
    console.log();

    console.log(`Test 3 (${results.test3.name}):`);
    console.log(`  Status: ${results.test3.passed ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  DOM Result: ${result3}`);
    console.log(`  Expected: "SUCCESS: Error was caught!"`);
    console.log();

    const allPassed = results.test1.passed && results.test2.passed && results.test3.passed;

    console.log('========================================');
    console.log(allPassed ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED');
    console.log('========================================\n');

    await browser.close();
    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await browser.close();
    process.exit(1);
  }
}

testHttpErrors();
