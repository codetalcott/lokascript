import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:3000';

async function debugFetchCommand() {
  console.log('🔍 Debugging Fetch Command...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Listen for ALL console logs
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`  [${type.toUpperCase()}] ${text}`);
  });

  // Listen for errors
  page.on('pageerror', error => {
    console.error(`  ❌ [PAGE ERROR]: ${error.message}`);
  });

  try {
    console.log(`📄 Loading debug page: ${BASE_URL}/packages/core/test-fetch-debug.html`);
    await page.goto(`${BASE_URL}/packages/core/test-fetch-debug.html`, {
      waitUntil: 'networkidle'
    });

    // Wait for auto-test to complete
    await page.waitForTimeout(3000);

    console.log('\n✅ Debug session complete');
    await browser.close();

  } catch (error) {
    console.error('\n❌ Debug failed:', error);
    await browser.close();
    process.exit(1);
  }
}

debugFetchCommand();
