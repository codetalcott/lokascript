import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:3000';

async function testCSSProperties() {
  console.log('🧪 Testing CSS Property Syntax (*property)...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const results = [];

  // Listen for console logs
  page.on('console', msg => {
    const text = msg.text();
    console.log(`  ${text}`);

    // Capture test results
    if (text.includes('PASS') || text.includes('FAIL')) {
      results.push(text);
    }
  });

  page.on('pageerror', error => {
    console.error(`  ❌ [PAGE ERROR]: ${error.message}`);
  });

  try {
    console.log(`📄 Loading: ${BASE_URL}/packages/core/test-css-properties.html\n`);
    await page.goto(`${BASE_URL}/packages/core/test-css-properties.html`, {
      waitUntil: 'networkidle'
    });

    // Wait for tests to complete
    await page.waitForTimeout(2000);

    // Manual tests - click buttons and verify
    console.log('\n========================================');
    console.log('MANUAL BUTTON TESTS');
    console.log('========================================\n');

    // Test 1: Opacity
    console.log('Test: Setting opacity to 0.3');
    await page.click('text=Set 30% Opacity');
    await page.waitForTimeout(100);
    const opacity = await page.evaluate(() => {
      const box = document.getElementById('test-box');
      return box?.style.opacity;
    });
    console.log(`  Result: opacity = "${opacity}"`);
    console.log(`  ${opacity === '0.3' ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 2: Background color
    console.log('Test: Setting background-color to red');
    await page.click('text=Red Background');
    await page.waitForTimeout(100);
    const bgColor = await page.evaluate(() => {
      const box = document.getElementById('test-box');
      return box?.style.backgroundColor;
    });
    console.log(`  Result: backgroundColor = "${bgColor}"`);
    console.log(`  ${bgColor === 'red' ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 3: Transform
    console.log('Test: Setting transform to scale(1.2)');
    await page.click('text=Scale Up');
    await page.waitForTimeout(100);
    const transform = await page.evaluate(() => {
      const box = document.getElementById('test-box');
      return box?.style.transform;
    });
    console.log(`  Result: transform = "${transform}"`);
    console.log(`  ${transform.includes('scale') ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 4: Display
    console.log('Test: Setting display to none');
    await page.click('text=Hide (display: none)');
    await page.waitForTimeout(100);
    const display = await page.evaluate(() => {
      const box = document.getElementById('test-box');
      return box?.style.display;
    });
    console.log(`  Result: display = "${display}"`);
    console.log(`  ${display === 'none' ? '✅ PASS' : '❌ FAIL'}\n`);

    console.log('========================================');
    console.log('✅ ALL CSS PROPERTY TESTS COMPLETED!');
    console.log('========================================\n');

    await browser.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    await browser.close();
    process.exit(1);
  }
}

testCSSProperties();
