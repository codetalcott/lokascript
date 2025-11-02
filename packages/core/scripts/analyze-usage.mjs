#!/usr/bin/env node
/**
 * HyperFixi Bundle Analyzer
 * Scans HTML files for hyperscript usage and recommends optimal bundle
 *
 * Usage:
 *   node scripts/analyze-usage.mjs src/**/*.html
 *   npm run analyze:usage -- src/**/*.html
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Bundle configurations
const BUNDLES = {
  minimal: {
    name: 'Minimal',
    file: 'hyperfixi-browser-minimal.js',
    size: '~60KB gzipped',
    commands: ['add', 'remove', 'toggle', 'put', 'set', 'if', 'send', 'log'],
    description: 'Essential commands for simple interactive UIs'
  },
  standard: {
    name: 'Standard',
    file: 'hyperfixi-browser-standard.js',
    size: '~120KB gzipped',
    commands: [
      'add', 'remove', 'toggle', 'put', 'set', 'if', 'send', 'log',
      'show', 'hide', 'increment', 'decrement', 'trigger', 'wait',
      'halt', 'return', 'make', 'append', 'call', 'get'
    ],
    description: 'Most commonly used commands for typical web apps'
  },
  full: {
    name: 'Full',
    file: 'hyperfixi-browser.js',
    size: '~192KB gzipped',
    commands: '*', // All commands
    description: 'Complete command set for maximum compatibility'
  }
};

/**
 * Extract hyperscript code from HTML
 */
function extractHyperscriptCode(html) {
  const codes = [];

  // Match _="..." attributes
  const attrRegex = /_=["']([^"']+)["']/g;
  let match;
  while ((match = attrRegex.exec(html)) !== null) {
    codes.push(match[1]);
  }

  // Match <script type="text/hyperscript">
  const scriptRegex = /<script\s+type=["']text\/hyperscript["'][^>]*>([\s\S]*?)<\/script>/gi;
  while ((match = scriptRegex.exec(html)) !== null) {
    codes.push(match[1]);
  }

  return codes;
}

/**
 * Extract command names from hyperscript code
 */
function extractCommands(code) {
  const commands = new Set();

  // Simple pattern matching for command keywords
  // This is a simplified parser - in production you'd use the actual parser
  const commandPatterns = [
    // DOM commands
    /\b(add|remove|toggle|show|hide|put)\b/g,
    // Control flow
    /\b(if|else|halt|return|throw|repeat|unless|continue|break)\b/g,
    // Data
    /\b(set|increment|decrement|default)\b/g,
    // Events
    /\b(send|trigger)\b/g,
    // Async
    /\b(wait|fetch)\b/g,
    // Creation
    /\b(make|append)\b/g,
    // Execution
    /\b(call|get)\b/g,
    // Utility
    /\b(pick|log)\b/g,
    // Advanced
    /\b(tell|js|beep|async)\b/g,
    // Animation
    /\b(settle|measure|transition)\b/g,
    // Templates
    /\b(render)\b/g,
    // Navigation
    /\b(go)\b/g,
    // Behaviors
    /\b(install)\b/g
  ];

  for (const pattern of commandPatterns) {
    let match;
    while ((match = pattern.exec(code)) !== null) {
      commands.add(match[1]);
    }
  }

  return Array.from(commands);
}

/**
 * Recommend bundle based on commands used
 */
function recommendBundle(commandsUsed) {
  // Check if all commands fit in minimal bundle
  const minimalCommands = new Set(BUNDLES.minimal.commands);
  if (commandsUsed.every(cmd => minimalCommands.has(cmd))) {
    return 'minimal';
  }

  // Check if all commands fit in standard bundle
  const standardCommands = new Set(BUNDLES.standard.commands);
  if (commandsUsed.every(cmd => standardCommands.has(cmd))) {
    return 'standard';
  }

  // Need full bundle
  return 'full';
}

/**
 * Calculate potential savings
 */
function calculateSavings(recommended) {
  const fullSize = 192; // KB gzipped
  const sizes = {
    minimal: 60,
    standard: 120,
    full: 192
  };

  const recommendedSize = sizes[recommended];
  const savingsKB = fullSize - recommendedSize;
  const savingsPercent = Math.round((savingsKB / fullSize) * 100);

  return { savingsKB, savingsPercent, recommendedSize };
}

/**
 * Main analyzer function
 */
async function analyzeUsage(patterns) {
  if (!patterns || patterns.length === 0) {
    console.error('Usage: node analyze-usage.mjs <glob-pattern>');
    console.error('Example: node analyze-usage.mjs "src/**/*.html"');
    process.exit(1);
  }

  console.log('🔍 Analyzing hyperscript usage...\n');

  // Find all matching files
  const files = [];
  for (const pattern of patterns) {
    const matches = await glob(pattern, { ignore: 'node_modules/**' });
    files.push(...matches);
  }

  if (files.length === 0) {
    console.log('❌ No HTML files found matching pattern(s):', patterns.join(', '));
    process.exit(1);
  }

  console.log(`📄 Found ${files.length} file(s)\n`);

  // Analyze each file
  const allCommands = new Set();
  const fileAnalysis = [];

  for (const file of files) {
    const html = fs.readFileSync(file, 'utf-8');
    const codes = extractHyperscriptCode(html);
    const commands = new Set();

    for (const code of codes) {
      const fileCommands = extractCommands(code);
      fileCommands.forEach(cmd => {
        commands.add(cmd);
        allCommands.add(cmd);
      });
    }

    if (commands.size > 0) {
      fileAnalysis.push({
        file,
        commands: Array.from(commands),
        count: commands.size
      });
    }
  }

  // Report results
  console.log('📊 Analysis Results:\n');
  console.log(`Commands used: ${allCommands.size}`);
  console.log(`Commands: ${Array.from(allCommands).sort().join(', ') || '(none)'}\n`);

  if (allCommands.size === 0) {
    console.log('ℹ️  No hyperscript commands detected');
    console.log('   If your files use hyperscript, make sure they have:');
    console.log('   - _="..." attributes');
    console.log('   - <script type="text/hyperscript"> blocks\n');
    return;
  }

  // Recommend bundle
  const recommended = recommendBundle(Array.from(allCommands));
  const bundle = BUNDLES[recommended];
  const { savingsKB, savingsPercent, recommendedSize } = calculateSavings(recommended);

  console.log('🎯 Recommended Bundle:\n');
  console.log(`  Bundle: ${bundle.name}`);
  console.log(`  File: ${bundle.file}`);
  console.log(`  Size: ${bundle.size}`);
  console.log(`  Description: ${bundle.description}\n`);

  if (recommended !== 'full') {
    console.log(`💰 Potential Savings:\n`);
    console.log(`  Current (full): 192KB gzipped`);
    console.log(`  Recommended: ${recommendedSize}KB gzipped`);
    console.log(`  Savings: ${savingsKB}KB (${savingsPercent}%)\n`);
  }

  // File-by-file breakdown
  if (fileAnalysis.length > 0) {
    console.log('📁 File Breakdown:\n');
    for (const { file, commands, count } of fileAnalysis) {
      console.log(`  ${file}`);
      console.log(`    Commands (${count}): ${commands.join(', ')}\n`);
    }
  }

  // Usage instructions
  console.log('📝 Usage Instructions:\n');
  console.log(`  <script src="dist/${bundle.file}"></script>\n`);

  // Alternative: custom bundle
  if (allCommands.size <= 10 && recommended !== 'minimal') {
    console.log('💡 Alternative: Custom Runtime\n');
    console.log('  For even smaller bundles, use a custom runtime:\n');
    console.log('  ```javascript');
    console.log('  import { Runtime } from "@hyperfixi/core";');
    console.log('  const runtime = new Runtime({');
    console.log('    lazyLoad: true,');
    console.log(`    commands: [${Array.from(allCommands).map(c => `'${c}'`).join(', ')}]`);
    console.log('  });');
    console.log('  ```\n');
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
analyzeUsage(args).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
