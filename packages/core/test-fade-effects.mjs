import { chromium } from 'playwright';

async function testFadeEffects() {
  console.log('🧪 Testing Fade Effects Example...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('📄 Loading fade effects example...');
    await page.goto('http://127.0.0.1:3000/examples/intermediate/03-fade-effects.html', {
      waitUntil: 'networkidle'
    });

    console.log('✅ Page loaded\n');

    // Test 1: Set opacity to 30%
    console.log('Test 1: Setting opacity to 30%...');
    await page.click('text=🌓 30% Opacity');
    await page.waitForTimeout(500);
    const opacity30 = await page.evaluate(() => {
      const box = document.querySelector('#fade-box1');
      return box.style.opacity;
    });
    console.log(`  Result: opacity = "${opacity30}"`);
    console.log(`  ${opacity30 === '0.3' ? '✅ PASS' : '❌ FAIL'}\n`);

    // Test 2: Set opacity to 100%
    console.log('Test 2: Setting opacity to 100%...');
    await page.click('text=🌕 Full Opacity');
    await page.waitForTimeout(500);
    const opacity100 = await page.evaluate(() => {
      const box = document.querySelector('#fade-box1');
      return box.style.opacity;
    });
    console.log(`  Result: opacity = "${opacity100}"`);
    console.log(`  ${opacity100 === '1' ? '✅ PASS' : '❌ FAIL'}\n`);

    const allPassed = opacity30 === '0.3' && opacity100 === '1';
    console.log(allPassed ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED');

    await browser.close();
    process.exit(allPassed ? 0 : 1);

  } catch (error) {
    console.error('❌ Test failed:', error);
    await browser.close();
    process.exit(1);
  }
}

testFadeEffects();
