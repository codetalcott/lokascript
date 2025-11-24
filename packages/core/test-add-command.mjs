#!/usr/bin/env node
import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:3000';

async function testAddCommand() {
  console.log('🔍 Testing ADD command...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console and errors
  const errors = [];
  page.on('pageerror', (err) => {
    console.log('❌ Page error:', err.message);
    errors.push(err.message);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('❌ Console error:', msg.text());
      errors.push(msg.text());
    } else {
      console.log(`📝 Console ${msg.type()}:`, msg.text());
    }
  });

  try {
    await page.goto(`${BASE_URL}/test-add-command.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // Get diagnostics
    const diag = await page.textContent('#diagnostics');
    console.log('📊 Diagnostics:', diag);

    // Test 1: _="" attribute
    console.log('\n🔘 Test 1: Clicking button with _="" attribute...');
    await page.click('button[_]');
    await page.waitForTimeout(300);

    let hasHighlight = await page.evaluate(() => {
      return document.getElementById('target1').classList.contains('highlight');
    });
    console.log(`   Target 1 has highlight class: ${hasHighlight}`);

    // Test 2: hyperfixi.execute()
    console.log('\n🔘 Test 2: Clicking button with hyperfixi.execute()...');
    await page.click('#manual-btn');
    await page.waitForTimeout(300);

    hasHighlight = await page.evaluate(() => {
      return document.getElementById('target2').classList.contains('highlight');
    });
    console.log(`   Target 2 has highlight class: ${hasHighlight}`);

    if (errors.length > 0) {
      console.log('\n⚠️  Errors detected:', errors);
    } else {
      console.log('\n✅ No errors detected');
    }

    await browser.close();
    process.exit(0);
  } catch (error) {
    console.log(`\n❌ Test failed: ${error.message}`);
    await browser.close();
    process.exit(1);
  }
}

testAddCommand();
