#!/usr/bin/env node
/**
 * Automated test for experimental bundles (RuntimeBase + V2 commands)
 * Tests the PUT memberExpression fix in particular
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:3000';

async function testExperimentalBundle() {
  console.log('🚀 Testing Experimental Bundle (RuntimeBase + V2 Commands)\n');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Error tracking
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  try {
    // Load test page
    await page.goto(`${BASE_URL}/test-experimental-bundle.html`, {
      waitUntil: 'networkidle',
    });

    // Wait for hyperfixi to load
    await page.waitForTimeout(500);

    // Test 1: Check if bundle loaded
    const hyperfixiExists = await page.evaluate(() => typeof hyperfixi !== 'undefined');
    if (!hyperfixiExists) {
      console.log('❌ FAIL - hyperfixi bundle did not load');
      await browser.close();
      process.exit(1);
    }

    const version = await page.evaluate(() => window.hyperfixi?.version);
    console.log(`✅ Bundle loaded: ${version}`);

    // Test 2: Basic PUT command
    console.log('\n📝 Testing PUT command (basic)...');
    await page.click('button:has-text("Test PUT Basic")');
    await page.waitForTimeout(300);

    const basicPutResult = await page.textContent('#test-output');
    if (basicPutResult && basicPutResult.includes('Hello World')) {
      console.log('✅ PUT command (basic) works correctly');
    } else {
      console.log(`❌ FAIL - PUT basic failed. Got: "${basicPutResult}"`);
      await browser.close();
      process.exit(1);
    }

    // Test 3: PUT command with .innerHTML (memberExpression fix)
    console.log('\n📝 Testing PUT command with .innerHTML (memberExpression fix)...');
    await page.click('button:has-text("Test PUT .innerHTML")');
    await page.waitForTimeout(300);

    const innerHTML = await page.innerHTML('#test-put');
    const hasStrongTag = innerHTML.includes('<strong>');
    const hasCorrectText = innerHTML.includes('HTML Content');

    if (hasStrongTag && hasCorrectText) {
      console.log('✅ PUT with .innerHTML works - memberExpression fix SUCCESSFUL!');
      console.log(`   Result: ${innerHTML}`);
    } else {
      console.log(`❌ FAIL - PUT .innerHTML failed. Got: "${innerHTML}"`);
      await browser.close();
      process.exit(1);
    }

    // Test 4: Other V2 commands (ADD, REMOVE, TOGGLE)
    console.log('\n📝 Testing other V2 commands...');

    // ADD command
    await page.click('button:has-text("ADD Command")');
    await page.waitForTimeout(200);
    let hasHighlight = await page.evaluate(() => {
      return document.getElementById('test4-target').classList.contains('highlight');
    });
    if (hasHighlight) {
      console.log('✅ ADD command works');
    } else {
      console.log('❌ FAIL - ADD command failed');
      await browser.close();
      process.exit(1);
    }

    // REMOVE command
    await page.click('button:has-text("REMOVE Command")');
    await page.waitForTimeout(200);
    hasHighlight = await page.evaluate(() => {
      return document.getElementById('test4-target').classList.contains('highlight');
    });
    if (!hasHighlight) {
      console.log('✅ REMOVE command works');
    } else {
      console.log('❌ FAIL - REMOVE command failed');
      await browser.close();
      process.exit(1);
    }

    // TOGGLE command
    await page.click('button:has-text("TOGGLE Command")');
    await page.waitForTimeout(200);
    hasHighlight = await page.evaluate(() => {
      return document.getElementById('test4-target').classList.contains('highlight');
    });
    if (hasHighlight) {
      console.log('✅ TOGGLE command works');
    } else {
      console.log('❌ FAIL - TOGGLE command failed');
      await browser.close();
      process.exit(1);
    }

    // Check for errors
    if (errors.length > 0) {
      console.log('\n⚠️  Errors detected:');
      errors.forEach((err) => console.log(`   - ${err}`));
      await browser.close();
      process.exit(1);
    }

    // Success!
    console.log('\n✅ ALL TESTS PASSED');
    console.log('\n📊 Summary:');
    console.log('   - Bundle loaded successfully (RuntimeBase + V2 Commands)');
    console.log('   - PUT command (basic) working');
    console.log('   - PUT command with .innerHTML (memberExpression fix) working');
    console.log('   - ADD/REMOVE/TOGGLE commands working');
    console.log('   - Zero errors detected');

    await browser.close();
    process.exit(0);
  } catch (error) {
    console.log(`\n❌ TEST FAILED: ${error.message}`);
    await browser.close();
    process.exit(1);
  }
}

testExperimentalBundle();
