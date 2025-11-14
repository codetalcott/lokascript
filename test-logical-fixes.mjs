/**
 * Test Session 18 logical operator fixes
 * Tests: ===, !==, exists, some, is a, is an
 */

import { chromium } from 'playwright';

async function runTests() {
  console.log('🔍 Testing Session 18 logical operator fixes...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Listen for console logs
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🧪') || text.includes('🔍')) {
      console.log('  ', text);
    }
  });

  // Navigate to test page
  await page.goto('http://127.0.0.1:3000/test-logical-operators.html');
  await page.waitForTimeout(500);

  const tests = [
    { id: 'test1', resultId: 'result1', expected: 'PASS', name: '=== (5 === 5)' },
    { id: 'test2', resultId: 'result2', expected: 'PASS', name: '=== type check (5 !== "5")' },
    { id: 'test3', resultId: 'result3', expected: 'PASS', name: '!== (5 !== "5")' },
    { id: 'test4', resultId: 'result4', expected: 'PASS', name: 'exists operator' },
    { id: 'test5', resultId: 'result5', expected: 'PASS', name: 'does not exist operator' },
    { id: 'test6', resultId: 'result6', expected: 'PASS', name: 'some (non-empty array)' },
    { id: 'test7', resultId: 'result7', expected: 'PASS', name: 'some (empty array)' },
    { id: 'test8', resultId: 'result8', expected: 'PASS', name: 'is a String' },
    { id: 'test9', resultId: 'result9', expected: 'PASS', name: 'is a Number' },
    { id: 'test10', resultId: 'result10', expected: 'PASS', name: 'is an Array' },
    { id: 'test11', resultId: 'result11', expected: 'PASS', name: 'is not a String' },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n🧪 Testing: ${test.name}...`);

    // Click the test button
    await page.click(`#${test.id}`);

    // Wait for execution
    await page.waitForTimeout(200);

    // Get the result
    const result = await page.textContent(`#${test.resultId}`);

    if (result === test.expected) {
      console.log(`📊 Result: ${result} ✅ PASS`);
      passed++;
    } else {
      console.log(`📊 Result: ${result} ❌ FAIL (expected ${test.expected})`);
      failed++;
    }
  }

  await browser.close();

  const total = passed + failed;
  console.log(`\n📊 Summary:`);
  console.log(`  Passed: ${passed}/${total} (${((passed / total) * 100).toFixed(1)}%)`);
  console.log(`  Failed: ${failed}/${total} (${((failed / total) * 100).toFixed(1)}%)`);

  if (failed === 0) {
    console.log(`\n✅ SUCCESS! All logical operator tests passed!`);
    console.log(`\nFixed operators:`);
    console.log(`  ✅ === (strict equality)`);
    console.log(`  ✅ !== (strict inequality)`);
    console.log(`  ✅ exists`);
    console.log(`  ✅ does not exist`);
    console.log(`  ✅ some`);
    console.log(`  ✅ is a / is an`);
    console.log(`  ✅ is not a / is not an`);
    process.exit(0);
  } else {
    console.log(`\n❌ Some tests failed`);
    process.exit(1);
  }
}

runTests().catch(error => {
  console.error('❌ Test error:', error);
  process.exit(1);
});
