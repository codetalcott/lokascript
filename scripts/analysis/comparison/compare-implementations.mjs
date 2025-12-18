#!/usr/bin/env node
/**
 * Compare Implementations
 *
 * Main orchestrator for comparing HyperFixi with original _hyperscript.
 * Coordinates metrics extraction and pattern analysis, generates reports.
 *
 * Usage:
 *   node scripts/analysis/comparison/compare-implementations.mjs
 *   node scripts/analysis/comparison/compare-implementations.mjs --snapshot  # Save for tracking
 *   node scripts/analysis/comparison/compare-implementations.mjs --json      # JSON output only
 */

import { spawn } from 'child_process';
import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../../..');
const OUTPUT_DIR = join(PROJECT_ROOT, 'analysis-output/comparison');
const SNAPSHOTS_DIR = join(OUTPUT_DIR, 'snapshots');

/**
 * Run a script and capture JSON output
 */
async function runScript(scriptPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn('node', [scriptPath, '--json'], {
      cwd: PROJECT_ROOT,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', data => { stdout += data; });
    proc.stderr.on('data', data => { stderr += data; });

    proc.on('close', code => {
      if (code !== 0) {
        reject(new Error(`Script failed: ${stderr}`));
        return;
      }
      // The script outputs the path to JSON file
      const jsonPath = stdout.trim();
      resolve(jsonPath);
    });
  });
}

/**
 * Generate comparison summary
 */
function generateSummary(metrics, patterns) {
  const matchedCommands = metrics.comparison.filter(c => c.original && c.hyperfixi);
  const totalOriginalLines = matchedCommands.reduce((sum, c) => sum + c.original.lines, 0);
  const totalHyperfixiLines = matchedCommands.reduce((sum, c) => sum + c.hyperfixi.lines, 0);
  const totalPotentialSavings = matchedCommands.reduce((sum, c) => sum + (c.diff?.potentialSavings || 0), 0);

  // Calculate pattern-based savings
  const patternSavings = patterns.opportunities.reduce((sum, o) => sum + o.estimatedTotalSavings, 0);

  // Find top offenders
  const topOffenders = matchedCommands
    .filter(c => c.diff)
    .sort((a, b) => b.diff.potentialSavings - a.diff.potentialSavings)
    .slice(0, 10);

  return {
    commandComparison: {
      matchedCommands: matchedCommands.length,
      hyperfixiOnlyCommands: metrics.hyperfixi.totalCommands - matchedCommands.length,
      originalTotal: totalOriginalLines,
      hyperfixiTotal: totalHyperfixiLines,
      overhead: totalHyperfixiLines - totalOriginalLines,
      overheadPercent: Math.round((totalHyperfixiLines / totalOriginalLines - 1) * 100),
      codeRatio: Math.round((totalHyperfixiLines / totalOriginalLines) * 100) / 100,
    },
    potentialOptimizations: {
      metricBasedSavings: totalPotentialSavings,
      patternBasedSavings: patternSavings,
      conservativeEstimate: Math.min(totalPotentialSavings, patternSavings),
      optimisticEstimate: Math.max(totalPotentialSavings, patternSavings),
    },
    topOffenders: topOffenders.map(c => ({
      name: c.name,
      original: c.original.lines,
      hyperfixi: c.hyperfixi.lines,
      ratio: c.diff.ratio,
      savings: c.diff.potentialSavings,
    })),
    patterns: {
      totalFound: patterns.patterns.length,
      typeSafe: patterns.patterns.filter(p => p.preservesTypeSafety).length,
      highImpact: patterns.opportunities.filter(o => o.priority === 'HIGH').length,
    },
  };
}

/**
 * Print comparison report
 */
function printReport(summary, metrics, patterns) {
  console.log('\n' + '═'.repeat(80));
  console.log('  HYPERFIXI vs _HYPERSCRIPT: COMPREHENSIVE COMPARISON REPORT');
  console.log('═'.repeat(80));

  // Command comparison
  console.log('\n' + '─'.repeat(80));
  console.log('📊 COMMAND COMPARISON');
  console.log('─'.repeat(80));
  console.log(`  Matched commands:     ${summary.commandComparison.matchedCommands}`);
  console.log(`  HyperFixi-only:       ${summary.commandComparison.hyperfixiOnlyCommands}`);
  console.log(`  Original total:       ${summary.commandComparison.originalTotal} lines`);
  console.log(`  HyperFixi total:      ${summary.commandComparison.hyperfixiTotal} lines`);
  console.log(`  Code overhead:        ${summary.commandComparison.overhead} lines (${summary.commandComparison.overheadPercent}%)`);
  console.log(`  Code ratio:           ${summary.commandComparison.codeRatio}x`);

  // Top offenders
  console.log('\n' + '─'.repeat(80));
  console.log('🎯 TOP OPTIMIZATION TARGETS');
  console.log('─'.repeat(80));
  console.log('  ' + 'Command'.padEnd(15) + 'Original'.padStart(10) + 'HyperFixi'.padStart(11) + 'Ratio'.padStart(8) + 'Potential'.padStart(11));
  console.log('  ' + '─'.repeat(55));
  for (const cmd of summary.topOffenders) {
    console.log('  ' +
      cmd.name.padEnd(15) +
      String(cmd.original).padStart(10) +
      String(cmd.hyperfixi).padStart(11) +
      (cmd.ratio + 'x').padStart(8) +
      ('~' + cmd.savings).padStart(11)
    );
  }

  // Pattern analysis
  console.log('\n' + '─'.repeat(80));
  console.log('🔍 PATTERN ANALYSIS');
  console.log('─'.repeat(80));
  console.log(`  Patterns identified:  ${summary.patterns.totalFound}`);
  console.log(`  Type-safe patterns:   ${summary.patterns.typeSafe}`);
  console.log(`  High-impact:          ${summary.patterns.highImpact}`);

  console.log('\n  Key patterns from original _hyperscript:');
  for (const p of patterns.patterns.slice(0, 5)) {
    console.log(`    • ${p.name} (${p.occurrences} uses) - ${p.estimatedSavings}`);
  }

  // Optimization estimates
  console.log('\n' + '─'.repeat(80));
  console.log('💡 OPTIMIZATION POTENTIAL');
  console.log('─'.repeat(80));
  console.log(`  Conservative estimate: ~${summary.potentialOptimizations.conservativeEstimate} lines`);
  console.log(`  Optimistic estimate:   ~${summary.potentialOptimizations.optimisticEstimate} lines`);

  const reductionPercent = Math.round((summary.potentialOptimizations.conservativeEstimate / summary.commandComparison.hyperfixiTotal) * 100);
  console.log(`  Potential reduction:   ${reductionPercent}% of current code`);

  // Recommendations
  console.log('\n' + '─'.repeat(80));
  console.log('📋 RECOMMENDATIONS');
  console.log('─'.repeat(80));
  console.log('  1. HIGH PRIORITY: Refactor top 5 offenders using compact patterns');
  console.log('     - repeat, set, default, make, toggle');
  console.log('  2. MEDIUM PRIORITY: Adopt CompactCommand interface for new commands');
  console.log('  3. LOW PRIORITY: Migrate existing commands incrementally');
  console.log('\n  Type-safe compact pattern proposed in pattern-analysis.json');
}

/**
 * Save snapshot for progress tracking
 */
async function saveSnapshot(data) {
  await mkdir(SNAPSHOTS_DIR, { recursive: true });

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const snapshotPath = join(SNAPSHOTS_DIR, `comparison-${timestamp}.json`);

  await writeFile(snapshotPath, JSON.stringify(data, null, 2));
  return snapshotPath;
}

/**
 * Compare with previous snapshot
 */
async function compareWithPrevious(current) {
  if (!existsSync(SNAPSHOTS_DIR)) return null;

  const files = await readdir(SNAPSHOTS_DIR);
  const snapshots = files
    .filter(f => f.startsWith('comparison-') && f.endsWith('.json'))
    .sort()
    .reverse();

  if (snapshots.length < 2) return null;

  const previousPath = join(SNAPSHOTS_DIR, snapshots[1]);
  const previous = JSON.parse(await readFile(previousPath, 'utf-8'));

  return {
    previousDate: snapshots[1].replace('comparison-', '').replace('.json', ''),
    linesDelta: current.summary.commandComparison.hyperfixiTotal -
                previous.summary.commandComparison.hyperfixiTotal,
    savingsDelta: current.summary.potentialOptimizations.conservativeEstimate -
                  previous.summary.potentialOptimizations.conservativeEstimate,
  };
}

async function main() {
  const saveSnapshotFlag = process.argv.includes('--snapshot');
  const jsonOutput = process.argv.includes('--json');

  if (!jsonOutput) {
    console.log('Running comparison analysis...\n');
  }

  // Ensure output directory exists
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Run sub-analyses
  if (!jsonOutput) {
    console.log('  Extracting command metrics...');
  }
  const metricsPath = await runScript(join(__dirname, 'extract-command-metrics.mjs'));
  const metrics = JSON.parse(await readFile(metricsPath, 'utf-8'));

  if (!jsonOutput) {
    console.log('  Analyzing patterns...');
  }
  const patternsPath = await runScript(join(__dirname, 'pattern-analyzer.mjs'));
  const patterns = JSON.parse(await readFile(patternsPath, 'utf-8'));

  // Generate summary
  const summary = generateSummary(metrics, patterns);

  // Prepare full report
  const report = {
    timestamp: new Date().toISOString(),
    summary,
    metrics,
    patterns,
  };

  // Save combined report
  const reportPath = join(OUTPUT_DIR, 'comparison-report.json');
  await writeFile(reportPath, JSON.stringify(report, null, 2));

  // Handle snapshot
  let snapshotPath = null;
  let progress = null;

  if (saveSnapshotFlag) {
    snapshotPath = await saveSnapshot(report);
    progress = await compareWithPrevious(report);
  }

  // Output
  if (jsonOutput) {
    console.log(reportPath);
  } else {
    printReport(summary, metrics, patterns);

    if (snapshotPath) {
      console.log('\n' + '─'.repeat(80));
      console.log('📸 SNAPSHOT SAVED');
      console.log('─'.repeat(80));
      console.log(`  Path: ${snapshotPath}`);

      if (progress) {
        console.log(`\n  Progress since ${progress.previousDate}:`);
        console.log(`    Lines delta:   ${progress.linesDelta > 0 ? '+' : ''}${progress.linesDelta}`);
        console.log(`    Savings delta: ${progress.savingsDelta > 0 ? '+' : ''}${progress.savingsDelta}`);
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log(`  Full report: ${reportPath}`);
    console.log('═'.repeat(80) + '\n');
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
