#!/usr/bin/env node
/**
 * Incremental Crash Test - Binary Search for Crashing Attribute
 *
 * Tests the cookbook page by incrementally enabling _hyperscript attributes
 * to identify which specific attribute causes the browser crash.
 */

import { chromium } from 'playwright';

const BASE_URL = 'http://127.0.0.1:3000/cookbook/crash-test-minimal.html';
const TIMEOUT = 10000; // 10 seconds per test

async function testLevel(level) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 Testing level ${level} (tests 1-${level} enabled)`);
    console.log(`${'='.repeat(60)}`);

    const url = `${BASE_URL}?max=${level}`;
    console.log(`📍 URL: ${url}`);

    // Capture console messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Capture errors
    const errors = [];
    page.on('pageerror', error => {
      errors.push(error.message);
      console.error(`❌ Page error: ${error.message}`);
    });

    // Attempt to load the page
    const startTime = Date.now();
    await page.goto(url, { waitUntil: 'load', timeout: TIMEOUT });
    const loadTime = Date.now() - startTime;

    // Wait a bit to ensure HyperFixi processing completes
    await page.waitForTimeout(2000);

    // Check if page is still responsive
    const isAlive = await page.evaluate(() => {
      return document.body !== null;
    });

    if (!isAlive) {
      console.log(`❌ CRASH DETECTED at level ${level}`);
      await browser.close();
      return { success: false, level, crashType: 'page-dead', loadTime, errors };
    }

    // Get console log from page
    const pageLog = await page.evaluate(() => {
      const consoleEl = document.getElementById('console');
      return consoleEl ? consoleEl.innerText : '';
    });

    console.log(`✅ Level ${level} PASSED (${loadTime}ms)`);
    console.log(`📊 Console messages: ${consoleMessages.length}`);
    console.log(`❌ Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log(`\n⚠️  Errors detected (but page didn't crash):`);
      errors.forEach(err => console.log(`  - ${err}`));
    }

    await browser.close();
    return { success: true, level, loadTime, errors, consoleMessages };

  } catch (error) {
    console.log(`❌ CRASH DETECTED at level ${level}`);
    console.log(`   Error: ${error.message}`);

    await browser.close();
    return { success: false, level, crashType: 'exception', error: error.message };
  }
}

async function binarySearch(min, max) {
  console.log(`\n🔍 Binary search: Testing range ${min}-${max}`);

  // Test max first - if it works, we're done
  const maxResult = await testLevel(max);
  if (maxResult.success) {
    console.log(`\n✅ All tests (1-${max}) passed!`);
    return { crashLevel: null, maxSafeLevel: max };
  }

  // Test min - if it fails, crash is at level min
  if (min === max) {
    console.log(`\n❌ Crash occurs at level ${min}`);
    return { crashLevel: min, maxSafeLevel: min - 1 };
  }

  const minResult = await testLevel(min);
  if (!minResult.success) {
    return { crashLevel: min, maxSafeLevel: min - 1 };
  }

  // Binary search between min and max
  const mid = Math.floor((min + max) / 2);

  if (mid === min) {
    // Only two levels left, test max
    const testResult = await testLevel(max);
    if (testResult.success) {
      return { crashLevel: null, maxSafeLevel: max };
    } else {
      return { crashLevel: max, maxSafeLevel: min };
    }
  }

  const midResult = await testLevel(mid);

  if (midResult.success) {
    // Crash is in upper half
    return binarySearch(mid + 1, max);
  } else {
    // Crash is in lower half
    return binarySearch(min, mid);
  }
}

async function linearSearch(maxLevel = 11) {
  console.log(`\n🔍 Linear search: Testing levels 0-${maxLevel}`);

  let lastSuccessLevel = 0;
  let crashLevel = null;

  for (let level = 0; level <= maxLevel; level++) {
    const result = await testLevel(level);

    if (!result.success) {
      crashLevel = level;
      console.log(`\n❌ CRASH DETECTED at level ${level}`);
      console.log(`✅ Last safe level: ${lastSuccessLevel}`);
      break;
    }

    lastSuccessLevel = level;
  }

  if (crashLevel === null) {
    console.log(`\n✅ All levels (0-${maxLevel}) passed!`);
  }

  return { crashLevel, maxSafeLevel: lastSuccessLevel };
}

// Main execution
(async () => {
  console.log('🚀 HyperFixi Crash Test - Incremental Attribute Loading');
  console.log('=' .repeat(70));

  const searchMethod = process.argv[2] || 'linear';

  let result;
  if (searchMethod === 'binary') {
    result = await binarySearch(1, 11);
  } else {
    result = await linearSearch(11);
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 FINAL RESULTS');
  console.log('='.repeat(70));

  if (result.crashLevel !== null) {
    console.log(`❌ Crash Level: ${result.crashLevel}`);
    console.log(`✅ Max Safe Level: ${result.maxSafeLevel}`);
    console.log(`\n🔍 The crash is caused by Test #${result.crashLevel}`);
    console.log(`   To investigate, load: ${BASE_URL}?max=${result.crashLevel}`);

    // Test definitions
    const tests = [
      'String Concatenation',
      'Indeterminate Checkbox (on load)',
      'Set Indeterminate on Click',
      'Transition & Remove',
      'Toggle Class',
      'Settle Command',
      'Keyup with If/Else & Trigger',
      'Table Filtering (show...when)',
      'Drag Start',
      'Drag & Drop (Multiple Events)',
      'Complex If/Else with Match'
    ];

    const crashingTest = tests[result.crashLevel - 1];
    console.log(`   Crashing test: "${crashingTest}"`);

    process.exit(1);
  } else {
    console.log(`✅ No crashes detected! All ${result.maxSafeLevel} tests passed.`);
    process.exit(0);
  }
})();
