#!/usr/bin/env node
/**
 * Comprehensive Pattern Test Runner
 *
 * Runs all generated pattern tests and produces detailed compatibility reports.
 * Auto-starts HTTP server if not already running on port 3000.
 */

import { chromium } from 'playwright';
import { readdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { spawn } from 'child_process';
import { createConnection } from 'net';

const PORT = 3000;
const BASE_URL = `http://127.0.0.1:${PORT}/cookbook/generated-tests/`;
const TEST_DIR = 'cookbook/generated-tests';
const RESULTS_DIR = 'test-results';
const TIMEOUT = 30000; // 30 seconds per page

let serverProcess = null;

/**
 * Check if a server is already running on the specified port
 */
async function isPortInUse(port) {
  return new Promise((resolve) => {
    const socket = createConnection({ port, host: '127.0.0.1' });
    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => {
      resolve(false);
    });
  });
}

/**
 * Start HTTP server and wait for it to be ready
 */
async function startServer() {
  console.log(`🚀 Starting HTTP server on port ${PORT}...`);

  serverProcess = spawn('npx', ['http-server', '.', '-p', String(PORT), '-c-1'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });

  // Wait for server to be ready
  let attempts = 0;
  const maxAttempts = 30;

  while (attempts < maxAttempts) {
    if (await isPortInUse(PORT)) {
      console.log(`✅ Server ready on port ${PORT}\n`);
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 200));
    attempts++;
  }

  throw new Error(`Server failed to start after ${maxAttempts * 200}ms`);
}

/**
 * Stop the server if we started it
 */
function stopServer() {
  if (serverProcess) {
    console.log('\n🛑 Stopping HTTP server...');
    serverProcess.kill('SIGTERM');
    serverProcess = null;
  }
}

async function runAllPatternTests() {
  console.log('🧪 Running comprehensive pattern test suite...\n');

  // Check if server is already running
  const serverAlreadyRunning = await isPortInUse(PORT);

  if (serverAlreadyRunning) {
    console.log(`✅ Server already running on port ${PORT}\n`);
  } else {
    await startServer();
  }

  // Check if test directory exists
  if (!existsSync(TEST_DIR)) {
    console.error(`❌ Error: Test directory not found at ${TEST_DIR}`);
    console.error('   Run: npm run patterns:generate first');
    stopServer();
    process.exit(1);
  }

  // Get all test files
  const files = await readdir(TEST_DIR);
  const testFiles = files.filter(f => f.startsWith('test-') && f.endsWith('.html'));

  if (testFiles.length === 0) {
    console.error('❌ No test files found. Generate them first with:');
    console.error('   npm run patterns:generate');
    stopServer();
    process.exit(1);
  }

  console.log(`📂 Found ${testFiles.length} test files\n`);

  const browser = await chromium.launch({ headless: true });
  const allResults = {
    startTime: new Date().toISOString(),
    testFiles: [],
    summary: {
      totalFiles: testFiles.length,
      totalPatterns: 0,
      passedPatterns: 0,
      failedPatterns: 0,
      unknownPatterns: 0,
      errors: []
    }
  };

  // Run each test file
  for (const testFile of testFiles) {
    console.log(`📝 Testing: ${testFile}...`);

    try {
      const result = await runTestFile(browser, testFile);
      allResults.testFiles.push(result);

      // Update summary
      allResults.summary.totalPatterns += result.total;
      allResults.summary.passedPatterns += result.passed;
      allResults.summary.failedPatterns += result.failed;
      allResults.summary.unknownPatterns += result.unknown;

      console.log(`   ✅ Passed: ${result.passed}/${result.total} (${result.passPercent}%)`);
      if (result.failed > 0) {
        console.log(`   ❌ Failed: ${result.failed}`);
      }
      if (result.unknown > 0) {
        console.log(`   ❓ Unknown: ${result.unknown}`);
      }
      console.log();

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}\n`);
      allResults.summary.errors.push({
        file: testFile,
        error: error.message
      });
    }
  }

  await browser.close();

  // Calculate overall stats
  const totalPatterns = allResults.summary.totalPatterns;
  const passedPatterns = allResults.summary.passedPatterns;
  const failedPatterns = allResults.summary.failedPatterns;
  const unknownPatterns = allResults.summary.unknownPatterns;
  const overallPercent = totalPatterns > 0
    ? Math.round((passedPatterns / totalPatterns) * 100)
    : 0;

  allResults.summary.overallPercent = overallPercent;
  allResults.endTime = new Date().toISOString();

  // Print final summary
  console.log('='.repeat(70));
  console.log(' COMPREHENSIVE PATTERN TEST RESULTS');
  console.log('='.repeat(70));
  console.log(`📊 Total patterns tested: ${totalPatterns}`);
  console.log(`✅ Passed: ${passedPatterns} (${overallPercent}%)`);
  console.log(`❌ Failed: ${failedPatterns} (${Math.round((failedPatterns / totalPatterns) * 100)}%)`);
  console.log(`❓ Unknown: ${unknownPatterns} (${Math.round((unknownPatterns / totalPatterns) * 100)}%)`);
  console.log('='.repeat(70));

  // List failed patterns by category
  if (failedPatterns > 0) {
    console.log('\n❌ FAILED PATTERNS BY CATEGORY:\n');
    for (const fileResult of allResults.testFiles) {
      if (fileResult.failedPatterns.length > 0) {
        console.log(`${fileResult.file}:`);
        fileResult.failedPatterns.forEach(p => {
          console.log(`  - ${p.syntax}`);
        });
        console.log();
      }
    }
  }

  // List unknown patterns
  if (unknownPatterns > 0) {
    console.log('\n❓ PATTERNS WITH UNKNOWN STATUS:\n');
    for (const fileResult of allResults.testFiles) {
      if (fileResult.unknownPatterns.length > 0) {
        console.log(`${fileResult.file}:`);
        fileResult.unknownPatterns.forEach(p => {
          console.log(`  - ${p.syntax}`);
        });
        console.log();
      }
    }
  }

  // Save detailed results
  if (!existsSync(RESULTS_DIR)) {
    await writeFile(`${RESULTS_DIR}/.gitkeep`, '');
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const jsonFile = `${RESULTS_DIR}/pattern-test-results-${timestamp}.json`;
  const mdFile = `${RESULTS_DIR}/pattern-test-results-${timestamp}.md`;

  await writeFile(jsonFile, JSON.stringify(allResults, null, 2));
  console.log(`\n💾 Detailed results saved to: ${jsonFile}`);

  // Generate markdown report
  const markdown = generateMarkdownReport(allResults);
  await writeFile(mdFile, markdown);
  console.log(`📝 Markdown report saved to: ${mdFile}`);

  console.log('='.repeat(70));

  // Stop server if we started it
  stopServer();

  // Exit with appropriate code
  process.exit(failedPatterns > 0 ? 1 : 0);
}

async function runTestFile(browser, testFile) {
  const page = await browser.newPage();
  const url = `${BASE_URL}${testFile}`;

  const errors = [];
  const compilationErrors = [];

  // Capture errors
  page.on('pageerror', error => {
    errors.push(error.message);
  });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('ParseError') || text.includes('compilation failed')) {
      compilationErrors.push(text);
    }
  });

  try {
    await page.goto(url, { waitUntil: 'load', timeout: TIMEOUT });
    await page.waitForTimeout(5000); // Wait for HyperFixi to load and validate (increased from 2000ms)

    // Extract results from page
    const results = await page.evaluate(() => {
      const totalEl = document.getElementById('total');
      const passedEl = document.getElementById('passed');
      const failedEl = document.getElementById('failed');
      const unknownEl = document.getElementById('unknown');

      const patterns = [];
      document.querySelectorAll('.pattern').forEach((el, index) => {
        const statusEl = el.querySelector('.status');
        const syntaxEl = el.querySelector('.pattern-syntax');
        const descEl = el.querySelector('h3');

        patterns.push({
          index: index + 1,
          description: descEl?.textContent || 'Unknown',
          syntax: syntaxEl?.textContent?.trim() || 'Unknown',
          status: statusEl?.textContent || 'UNKNOWN',
          passed: statusEl?.classList.contains('pass') || false,
          failed: statusEl?.classList.contains('fail') || false,
          unknown: statusEl?.classList.contains('unknown') || false
        });
      });

      return {
        total: parseInt(totalEl?.textContent || '0'),
        passed: parseInt(passedEl?.textContent || '0'),
        failed: parseInt(failedEl?.textContent || '0'),
        unknown: parseInt(unknownEl?.textContent || '0'),
        patterns
      };
    });

    await page.close();

    return {
      file: testFile,
      url,
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      unknown: results.unknown,
      passPercent: results.total > 0
        ? Math.round((results.passed / results.total) * 100)
        : 0,
      passedPatterns: results.patterns.filter(p => p.passed),
      failedPatterns: results.patterns.filter(p => p.failed),
      unknownPatterns: results.patterns.filter(p => p.unknown),
      errors,
      compilationErrors
    };

  } catch (error) {
    await page.close();
    throw new Error(`Failed to test ${testFile}: ${error.message}`);
  }
}

function generateMarkdownReport(results) {
  const { summary, testFiles } = results;

  let md = `# HyperFixi Pattern Compatibility Report

**Generated:** ${new Date(results.startTime).toLocaleString()}
**Duration:** ${Math.round((new Date(results.endTime) - new Date(results.startTime)) / 1000)}s

## Executive Summary

| Metric | Count | Percentage |
|--------|-------|------------|
| **Total Patterns** | ${summary.totalPatterns} | 100% |
| **✅ Passed** | ${summary.passedPatterns} | ${summary.overallPercent}% |
| **❌ Failed** | ${summary.failedPatterns} | ${Math.round((summary.failedPatterns / summary.totalPatterns) * 100)}% |
| **❓ Unknown** | ${summary.unknownPatterns} | ${Math.round((summary.unknownPatterns / summary.totalPatterns) * 100)}% |

## Results by Category

| Category | Total | Passed | Failed | Unknown | Pass % |
|----------|-------|--------|--------|---------|--------|
`;

  for (const fileResult of testFiles) {
    const category = fileResult.file.replace('test-', '').replace('.html', '');
    md += `| ${category} | ${fileResult.total} | ${fileResult.passed} | ${fileResult.failed} | ${fileResult.unknown} | ${fileResult.passPercent}% |\n`;
  }

  if (summary.failedPatterns > 0) {
    md += `\n## ❌ Failed Patterns\n\n`;
    for (const fileResult of testFiles) {
      if (fileResult.failedPatterns.length > 0) {
        md += `### ${fileResult.file}\n\n`;
        fileResult.failedPatterns.forEach(p => {
          md += `- **Pattern ${p.index}:** ${p.description}\n`;
          md += `  \`\`\`hyperscript\n  ${p.syntax}\n  \`\`\`\n\n`;
        });
      }
    }
  }

  if (summary.unknownPatterns > 0) {
    md += `\n## ❓ Patterns Needing Investigation\n\n`;
    for (const fileResult of testFiles) {
      if (fileResult.unknownPatterns.length > 0) {
        md += `### ${fileResult.file}\n\n`;
        fileResult.unknownPatterns.forEach(p => {
          md += `- **Pattern ${p.index}:** ${p.description}\n`;
          md += `  \`\`\`hyperscript\n  ${p.syntax}\n  \`\`\`\n\n`;
        });
      }
    }
  }

  md += `\n## Next Steps

1. Investigate failed patterns to identify root causes
2. Verify unknown patterns with manual testing
3. Prioritize implementation of missing features
4. Re-run tests after fixes to track progress

---

*Generated by HyperFixi Pattern Test Suite*
`;

  return md;
}

// Handle cleanup on unexpected exit
process.on('SIGINT', () => {
  stopServer();
  process.exit(130);
});
process.on('SIGTERM', () => {
  stopServer();
  process.exit(143);
});

// Run tests
runAllPatternTests().catch(error => {
  console.error('❌ Fatal error:', error);
  stopServer();
  process.exit(1);
});
