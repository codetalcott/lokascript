#!/usr/bin/env node
/**
 * Simple diagnostic test for experimental bundle
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:3000';

async function testSimple() {
  console.log('🔍 Running simple diagnostic test...\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Capture console output
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('❌ Browser console error:', msg.text());
    }
  });

  // Capture errors
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));

  try {
    // Load page
    await page.goto(`${BASE_URL}/test-experimental-simple.html`, {
      waitUntil: 'networkidle',
    });

    await page.waitForTimeout(500);

    // Get diagnostics
    const diagnostics = await page.textContent('#diagnostics');
    console.log('📊 Diagnostics:\n');
    console.log(diagnostics);

    // Click manual test button
    console.log('\n🔘 Clicking manual test button...');
    await page.click('#manual-test-btn');
    await page.waitForTimeout(500);

    // Get updated diagnostics
    const updatedDiag = await page.textContent('#diagnostics');
    console.log('\n📊 After manual test:\n');
    console.log(updatedDiag);

    // Check output
    const outputHTML = await page.innerHTML('#manual-output');
    console.log(`\n📝 Output innerHTML: "${outputHTML}"`);

    if (errors.length > 0) {
      console.log('\n⚠️  Errors detected:');
      errors.forEach(err => console.log(`   - ${err}`));
    }

    await browser.close();
    process.exit(0);
  } catch (error) {
    console.log(`\n❌ Test failed: ${error.message}`);
    await browser.close();
    process.exit(1);
  }
}

testSimple();
