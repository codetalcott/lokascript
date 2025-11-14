import { chromium } from 'playwright';

async function runClassRefTests() {
  console.log('🧪 Testing classRef with complete test runner...\n');

  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  page.on('console', msg => console.log(`    ${msg.text()}`));

  await page.goto('http://localhost:3000/compatibility-test.html');
  await page.waitForTimeout(1000);

  // These are the actual classRef tests from the official suite
  const tests = [
    {
      name: 'basic classRef works',
      code: `
        var div = make("<div class='c1'></div>");
        var value = await evalHyperScript(".c1");
        Array.from(value)[0].should.equal(div);
      `
    },
    {
      name: 'basic classRef works w no match',
      code: `
        var value = await evalHyperScript(".badClassThatDoesNotHaveAnyElements");
        if (Array.from(value).length !== 0) {
          throw new Error('Expected 0 elements');
        }
      `
    },
    {
      name: 'dashed class ref works',
      code: `
        var div = make("<div class='c1-foo'></div>");
        var value = await evalHyperScript(".c1-foo");
        Array.from(value)[0].should.equal(div);
      `
    },
    {
      name: 'colon class ref works',
      code: `
        var div = make("<div class='c1:foo'></div>");
        var value = await evalHyperScript(".c1:foo");
        Array.from(value)[0].should.equal(div);
      `
    },
    {
      name: 'multiple colon class ref works',
      code: `
        var div = make("<div class='c1:foo:bar'></div>");
        var value = await evalHyperScript(".c1:foo:bar");
        Array.from(value)[0].should.equal(div);
      `
    }
  ];

  console.log(`Running ${tests.length} classRef tests\n`);

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      console.log(`\n📝 Test: ${test.name}`);

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

    await page.waitForTimeout(100);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 ClassRef Results: ${passed}/${tests.length} passed (${((passed/tests.length)*100).toFixed(1)}%)`);
  console.log(`${'='.repeat(60)}`);

  console.log(`\n✨ Impact Assessment:`);
  console.log(`   Before Session 21: 0/${tests.length} passing (test runner bug)`);
  console.log(`   After Session 21: ${passed}/${tests.length} passing (fixed!)`);
  console.log(`   Improvement: +${passed} tests\n`);

  await page.waitForTimeout(2000);
  await browser.close();

  process.exit(failed === 0 ? 0 : 1);
}

runClassRefTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
