import { chromium } from 'playwright';

async function runTests() {
  console.log('🔍 Testing parser operator recognition...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('🧪') || text.includes('🔍') || text.includes('❌')) {
      console.log('  ', text);
    }
  });

  await page.goto('http://127.0.0.1:3000/test-parser-operators.html');
  await page.waitForTimeout(500);

  const tests = [
    { id: 'test1', resultId: 'result1', expected: 'PASS', name: 'some (prefix)' },
    { id: 'test2', resultId: 'result2', expected: 'PASS', name: 'exists (prefix)' },
    { id: 'test3', resultId: 'result3', expected: 'PASS', name: 'is a String' },
    { id: 'test4', resultId: 'result4', expected: 'PASS', name: 'is an Array' },
    { id: 'test5', resultId: 'result5', expected: 'PASS', name: 'is not a String' },
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    console.log(`\n🧪 Testing: ${test.name}...`);
    await page.click(`#${test.id}`);
    await page.waitForTimeout(200);
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

  if (failed === 0) {
    console.log(`\n✅ SUCCESS! All parser operators working!`);
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
