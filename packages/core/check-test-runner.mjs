import { chromium } from 'playwright';

async function checkTestRunner() {
  console.log('🚀 Checking test runner at http://127.0.0.1:3000/src/compatibility/hyperscript-tests/test-runner.html\n');

  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Collect console messages
  const consoleMessages = [];
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
  });

  // Collect errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  try {
    // Navigate to the test runner
    await page.goto('http://127.0.0.1:3000/src/compatibility/hyperscript-tests/test-runner.html', {
      waitUntil: 'networkidle',
      timeout: 15000
    });

    // Wait for tests to complete
    await page.waitForTimeout(5000);

    // Try to extract test results from the page
    const testResults = await page.evaluate(() => {
      // Look for common test result indicators
      const results = {
        pageTitle: document.title,
        bodyText: document.body.innerText,
        hasTestResults: false,
        passed: 0,
        failed: 0,
        testDetails: []
      };

      // Check for test result elements
      const resultElements = document.querySelectorAll('.test-result, .test, [class*="test"]');
      results.hasTestResults = resultElements.length > 0;

      // Try to find pass/fail counts
      const passElements = document.querySelectorAll('.pass, .passed, .success, [class*="pass"]');
      const failElements = document.querySelectorAll('.fail, .failed, .error, [class*="fail"]');

      results.passed = passElements.length;
      results.failed = failElements.length;

      // Capture test details
      resultElements.forEach((el, i) => {
        if (i < 20) { // Limit to first 20 for output
          results.testDetails.push({
            className: el.className,
            text: el.innerText.substring(0, 200)
          });
        }
      });

      return results;
    });

    // Print results
    console.log('📊 Test Runner Analysis:');
    console.log('━'.repeat(70));
    console.log(`📄 Page Title: ${testResults.pageTitle}`);
    console.log(`🔍 Has Test Results: ${testResults.hasTestResults}`);

    if (testResults.hasTestResults) {
      console.log(`✅ Passed: ${testResults.passed}`);
      console.log(`❌ Failed: ${testResults.failed}`);

      if (testResults.testDetails.length > 0) {
        console.log('\n📝 Test Details (first 20):');
        testResults.testDetails.forEach((detail, i) => {
          console.log(`\n${i + 1}. [${detail.className}]`);
          console.log(`   ${detail.text}`);
        });
      }
    }

    // Print body text (first 1000 chars)
    console.log('\n📄 Page Content (first 1000 chars):');
    console.log('━'.repeat(70));
    console.log(testResults.bodyText.substring(0, 1000));

    // Print errors
    if (errors.length > 0) {
      console.log('\n❌ JavaScript Errors:');
      console.log('━'.repeat(70));
      errors.forEach((error, i) => {
        console.log(`${i + 1}. ${error}`);
      });
    }

    // Print relevant console messages
    const relevantMessages = consoleMessages.filter(m =>
      m.type === 'error' ||
      m.text.toLowerCase().includes('fail') ||
      m.text.toLowerCase().includes('error') ||
      m.text.toLowerCase().includes('test')
    );

    if (relevantMessages.length > 0) {
      console.log('\n💬 Relevant Console Messages:');
      console.log('━'.repeat(70));
      relevantMessages.forEach((msg, i) => {
        console.log(`${i + 1}. [${msg.type}] ${msg.text}`);
      });
    }

  } catch (error) {
    console.error('❌ Error loading test runner:', error.message);
  } finally {
    await browser.close();
  }
}

checkTestRunner().catch(console.error);
