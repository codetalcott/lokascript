import { chromium } from 'playwright';

async function runTestSuite() {
  console.log('🚀 Running full test suite...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push({ type: msg.type(), text });

    // Print test progress in real-time
    if (text.includes('✅') || text.includes('❌') || text.includes('Running') || text.includes('Test')) {
      console.log(`  ${text}`);
    }
  });

  // Collect errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
    console.error(`❌ Page Error: ${error.message}`);
  });

  try {
    console.log('📄 Loading test runner...');
    await page.goto('http://127.0.0.1:3000/src/compatibility/hyperscript-tests/test-runner.html', {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    console.log('✅ Page loaded\n');
    console.log('🏃 Running all tests...\n');

    // Click "Run All Tests" button
    const runButton = await page.locator('button:has-text("Run All Tests")');
    if (await runButton.count() > 0) {
      await runButton.click();
      console.log('✅ Test run initiated\n');
    } else {
      console.log('⚠️  Could not find "Run All Tests" button, trying alternative selectors...');
      // Try clicking any button that might run tests
      await page.click('button');
    }

    // Wait for tests to complete (increase timeout for full suite)
    console.log('⏳ Waiting for tests to complete (this may take a minute)...\n');

    // Poll for test completion
    let lastTotal = 0;
    let sameCount = 0;
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(2000);

      const stats = await page.evaluate(() => {
        const passingEl = document.querySelector('.stats .passing');
        const failingEl = document.querySelector('.stats .failing');
        const totalEl = document.querySelector('.stats .total');
        const completeEl = document.querySelector('.stats .complete');

        return {
          passing: passingEl ? parseInt(passingEl.textContent) : 0,
          failing: failingEl ? parseInt(failingEl.textContent) : 0,
          total: totalEl ? parseInt(totalEl.textContent) : 0,
          complete: completeEl ? parseFloat(completeEl.textContent) : 0
        };
      });

      if (stats.total > 0) {
        process.stdout.write(`\r  Progress: ${stats.complete.toFixed(1)}% | ✅ ${stats.passing} | ❌ ${stats.failing} | Total: ${stats.total}`);

        // Check if tests are still running
        if (stats.total === lastTotal) {
          sameCount++;
          if (sameCount > 5 && stats.complete >= 99) {
            console.log('\n\n✅ Tests appear complete');
            break;
          }
        } else {
          sameCount = 0;
          lastTotal = stats.total;
        }
      }
    }

    console.log('\n\n📊 Extracting detailed results...\n');

    // Extract full test results
    const results = await page.evaluate(() => {
      const stats = {
        passing: document.querySelector('.stats .passing')?.textContent || '0',
        failing: document.querySelector('.stats .failing')?.textContent || '0',
        total: document.querySelector('.stats .total')?.textContent || '0',
        complete: document.querySelector('.stats .complete')?.textContent || '0%'
      };

      // Get all test results
      const failedTests = [];
      const passedTests = [];

      document.querySelectorAll('.test-result').forEach(test => {
        const name = test.querySelector('.test-name')?.textContent || 'Unknown';
        const status = test.classList.contains('pass') ? 'pass' :
                      test.classList.contains('fail') ? 'fail' : 'unknown';
        const details = test.querySelector('.test-details')?.textContent || '';
        const error = test.querySelector('.test-error')?.textContent || '';

        const testInfo = { name, status, details, error };

        if (status === 'fail') {
          failedTests.push(testInfo);
        } else if (status === 'pass') {
          passedTests.push(testInfo);
        }
      });

      return {
        stats,
        failedTests,
        passedTests: passedTests.slice(0, 10), // Only return first 10 passing tests
        totalPassed: passedTests.length,
        totalFailed: failedTests.length
      };
    });

    // Print summary
    console.log('╔══════════════════════════════════════════════════════════════════╗');
    console.log('║                     Test Suite Results                          ║');
    console.log('╚══════════════════════════════════════════════════════════════════╝\n');
    console.log(`📊 Summary:`);
    console.log(`   Total Tests: ${results.stats.total}`);
    console.log(`   ✅ Passed:    ${results.stats.passing}`);
    console.log(`   ❌ Failed:    ${results.stats.failing}`);
    console.log(`   📈 Progress:  ${results.stats.complete}\n`);

    // Print failed tests
    if (results.failedTests.length > 0) {
      console.log('❌ Failed Tests:\n');
      console.log('━'.repeat(70));
      results.failedTests.forEach((test, i) => {
        console.log(`\n${i + 1}. ${test.name}`);
        if (test.error) {
          console.log(`   Error: ${test.error.substring(0, 300)}`);
        }
        if (test.details) {
          console.log(`   Details: ${test.details.substring(0, 200)}`);
        }
      });
      console.log('\n' + '━'.repeat(70));
    }

    // Print sample of passing tests
    if (results.totalPassed > 0) {
      console.log(`\n✅ Sample of Passing Tests (showing 10 of ${results.totalPassed}):\n`);
      results.passedTests.forEach((test, i) => {
        console.log(`   ${i + 1}. ${test.name}`);
      });
    }

    // Print JavaScript errors
    if (errors.length > 0) {
      console.log('\n\n❌ JavaScript Errors Detected:\n');
      console.log('━'.repeat(70));
      errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }

    // Exit with appropriate code
    const exitCode = results.failedTests.length > 0 ? 1 : 0;
    await browser.close();
    process.exit(exitCode);

  } catch (error) {
    console.error('\n❌ Error running test suite:', error.message);
    await browser.close();
    process.exit(1);
  }
}

runTestSuite().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
