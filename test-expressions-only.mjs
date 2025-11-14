import { chromium } from 'playwright';
import { readFileSync } from 'fs';
import { join } from 'path';

const HYPERSCRIPT_TEST_ROOT = '../../../_hyperscript/test';

async function runExpressionsTests() {
  console.log('🧪 Testing expressions category only...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[make]') || text.includes('[evalHyperScript]')) {
      console.log(`    ${text}`);
    }
  });

  await page.goto('http://localhost:3000/compatibility-test.html');
  await page.waitForTimeout(1000);

  // Read classRef.js test file
  const classRefPath = join(HYPERSCRIPT_TEST_ROOT, 'expressions', 'classRef.js');
  const classRefContent = readFileSync(classRefPath, 'utf8');

  // Extract test cases
  const testCaseRegex = /it\s*\(\s*["']([^"']+)["']\s*,\s*function\s*\(\s*\)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
  const tests = [];
  let match;
  while ((match = testCaseRegex.exec(classRefContent)) !== null) {
    tests.push({ description: match[1], code: match[2] });
  }

  console.log(`Found ${tests.length} classRef tests\n`);

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n📝 Test: ${test.description}`);

      const result = await page.evaluate(async ({ code }) => {
        try {
          if (window.clearWorkArea) {
            window.clearWorkArea();
          }

          const testFn = new Function(
            'make',
            'clearWorkArea',
            'evalHyperScript',
            'Array',
            `return (async function() { ${code} })();`
          );

          await testFn(
            window.make,
            window.clearWorkArea,
            window.evalHyperScript,
            Array
          );

          return { success: true };
        } catch (error) {
          return { success: false, error: error.message };
        }
      }, { code: test.code });

      if (result.success) {
        console.log(`   ✅ PASS`);
        passed++;
      } else {
        console.log(`   ❌ FAIL: ${result.error}`);
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ ERROR: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 Results: ${passed}/${tests.length} passed (${((passed/tests.length)*100).toFixed(1)}%)`);
  console.log(`${'='.repeat(60)}\n`);

  await page.waitForTimeout(2000);
  await browser.close();

  process.exit(failed === 0 ? 0 : 1);
}

runExpressionsTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
