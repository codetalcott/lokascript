#!/usr/bin/env node
/**
 * Generate Report
 *
 * Generates a human-readable markdown report from comparison data.
 * Run after compare-implementations.mjs to create the pattern catalog.
 *
 * Usage:
 *   node scripts/analysis/comparison/generate-report.mjs
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '../../..');
const OUTPUT_DIR = join(PROJECT_ROOT, 'analysis-output/comparison');
const REPORT_PATH = join(OUTPUT_DIR, 'comparison-report.json');

/**
 * Generate markdown report optimized for LLM agent processing
 * Uses structured sections with clear delimiters and actionable items
 */
function generateMarkdownReport(data) {
  const { summary, metrics, patterns } = data;

  return `# HyperFixi Code Pattern Optimization Report

<!-- LLM_PROCESSING_HINT: This report is structured for automated processing -->
<!-- SECTIONS: summary, targets, patterns, implementation, commands -->

Generated: ${new Date(data.timestamp).toLocaleString()}

## Executive Summary

| Metric | Value |
|--------|-------|
| Commands Compared | ${summary.commandComparison.matchedCommands} |
| Original Total | ${summary.commandComparison.originalTotal} lines |
| HyperFixi Total | ${summary.commandComparison.hyperfixiTotal} lines |
| Code Overhead | ${summary.commandComparison.overhead} lines (${summary.commandComparison.overheadPercent}%) |
| Code Ratio | ${summary.commandComparison.codeRatio}x |
| **Potential Savings** | **~${summary.potentialOptimizations.conservativeEstimate} lines** |

---

## High-ROI Optimization Targets

These commands have the highest code overhead compared to the original:

| Command | Original | HyperFixi | Ratio | Potential Savings |
|---------|----------|-----------|-------|-------------------|
${summary.topOffenders.map(c =>
  `| ${c.name} | ${c.original} | ${c.hyperfixi} | ${c.ratio}x | ~${c.savings} |`
).join('\n')}

### Priority Matrix

**HIGH PRIORITY** (>100 lines savings):
${summary.topOffenders.filter(c => c.savings > 100).map(c => `- \`${c.name}\`: ${c.original} → ${c.hyperfixi} lines (${c.ratio}x)`).join('\n') || '- None'}

**MEDIUM PRIORITY** (50-100 lines savings):
${summary.topOffenders.filter(c => c.savings >= 50 && c.savings <= 100).map(c => `- \`${c.name}\`: ${c.original} → ${c.hyperfixi} lines (${c.ratio}x)`).join('\n') || '- None'}

---

## Pattern Catalog

### Pattern 1: Inline Operation Objects

**Original Pattern** (from _hyperscript):
\`\`\`javascript
parser.addCommand("add", function (parser, runtime, tokens) {
  if (tokens.matchToken("add")) {
    var classRef = parser.parseElement("classRef", tokens);
    // ... parsing ...
    return {
      args: [toExpr, classRefs],
      op: function (context, to, classRefs) {
        runtime.forEach(classRefs, function (classRef) {
          runtime.implicitLoop(to, function (target) {
            target.classList.add(classRef.className);
          });
        });
        return runtime.findNext(this, context);
      },
    };
  }
});
\`\`\`

**Type-Safe Adaptation**:
\`\`\`typescript
interface CompactCommand<TInput, TOutput = void> {
  readonly name: string;
  parse(args: ASTNode[], ctx: ExecutionContext): Promise<TInput>;
  exec(input: TInput, ctx: TypedExecutionContext): Promise<TOutput>;
  meta?: CommandMetadata;
}

const addCommand: CompactCommand<AddInput> = {
  name: 'add',

  async parse(args, ctx) {
    const first = await evalFirst(args[0], ctx);
    if (isPlainObject(first)) {
      return { type: 'styles', styles: first, targets: await resolveTargets(args.slice(1), ctx) };
    }
    if (typeof first === 'string' && first.startsWith('@')) {
      const { name, value } = parseAttribute(first);
      return { type: 'attribute', name, value, targets: await resolveTargets(args.slice(1), ctx) };
    }
    return { type: 'classes', classes: parseClasses(first), targets: await resolveTargets(args.slice(1), ctx) };
  },

  async exec(input) {
    switch (input.type) {
      case 'classes':
        runtime.implicitLoop(input.targets, t => t.classList.add(...input.classes));
        break;
      case 'attribute':
        runtime.implicitLoop(input.targets, t => t.setAttribute(input.name, input.value));
        break;
      case 'styles':
        runtime.implicitLoop(input.targets, t => Object.assign(t.style, input.styles));
        break;
    }
  },
};
\`\`\`

**Estimated Savings**: 40-60 lines per command
**Type Safety**: ✅ Preserved (discriminated unions, exhaustive switch)

---

### Pattern 2: Implicit Loop Helper

**Original Pattern**:
\`\`\`javascript
runtime.implicitLoop(to, function (target) {
  target.classList.add(classRef.className);
});
\`\`\`

**Type-Safe Adaptation**:
\`\`\`typescript
function implicitLoop<T extends Element>(
  targets: T | T[] | NodeList | null,
  fn: (target: T) => void
): void {
  if (!targets) return;
  const elements = Array.isArray(targets) ? targets :
    targets instanceof NodeList ? Array.from(targets as NodeListOf<T>) : [targets];
  elements.forEach(fn);
}
\`\`\`

**Estimated Savings**: 5-10 lines per command
**Type Safety**: ✅ Preserved (generic constraint ensures type safety)

---

### Pattern 3: Args Array Mapping

**Original Pattern**:
\`\`\`javascript
return {
  args: [toExpr, classRefs, timeExpr],
  op: function (context, to, classes, time) {
    // Arguments are pre-evaluated and passed in order
  }
};
\`\`\`

**Type-Safe Adaptation**:
\`\`\`typescript
type CommandArgs<T extends unknown[]> = {
  args: T;
  exec: (...args: T) => void;
};

// Eliminates the need for separate parseInput method
// Args are evaluated automatically, matched to exec signature
\`\`\`

**Estimated Savings**: 10-20 lines per command
**Type Safety**: ✅ Preserved (tuple types ensure argument matching)

---

## Pattern Usage Statistics

| Pattern | Occurrences | Type-Safe | Estimated Savings |
|---------|-------------|-----------|-------------------|
${patterns.patterns.map(p =>
  `| ${p.name} | ${p.occurrences} | ${p.preservesTypeSafety ? '✅' : '❌'} | ${p.estimatedSavings} |`
).join('\n')}

---

<!-- BEGIN_ACTIONABLE_ITEMS -->
## Actionable Items for LLM Agents

### TASK_1: Create Compact Command Interface
\`\`\`yaml
type: implementation
priority: high
file: packages/core/src/commands/types/compact-command.ts
action: create
description: Define CompactCommand<TInput, TOutput> interface
dependencies: []
estimated_lines: 50
\`\`\`

### TASK_2: Implement Runtime Helpers
\`\`\`yaml
type: implementation
priority: high
file: packages/core/src/runtime/helpers.ts
action: create_or_modify
description: Add implicitLoop() and nullCheck() helpers
dependencies: [TASK_1]
estimated_lines: 30
\`\`\`

### TASK_3: Migrate High-ROI Commands
\`\`\`yaml
type: refactor
priority: high
commands_to_migrate:
${summary.topOffenders.slice(0, 5).map(c => `  - name: "${c.name}"
    current_file: packages/core/src/commands/**/${c.name}.ts
    current_lines: ${c.hyperfixi}
    target_lines: ${c.original + 20}
    estimated_savings: ${c.savings}`).join('\n')}
\`\`\`
<!-- END_ACTIONABLE_ITEMS -->

---

## Implementation Roadmap

### Phase 1: Create Compact Command Infrastructure

1. Define \`CompactCommand<TInput, TOutput>\` interface
2. Implement \`runtime.implicitLoop()\` helper
3. Create registration function for compact commands
4. Ensure compatibility with existing command system

### Phase 2: Migrate High-ROI Commands

Priority order based on savings potential:
${summary.topOffenders.slice(0, 5).map((c, i) => `${i + 1}. \`${c.name}\` (~${c.savings} lines savings)`).join('\n')}

### Phase 3: Evaluate & Iterate

1. Measure actual bundle size reduction
2. Verify type safety is maintained
3. Update remaining commands if approach is successful

---

## Command Comparison Details

### Matched Commands (${summary.commandComparison.matchedCommands})

| Command | Original Lines | HyperFixi Lines | Diff | Ratio |
|---------|----------------|-----------------|------|-------|
${metrics.comparison.filter(c => c.original && c.hyperfixi).map(c =>
  `| ${c.name} | ${c.original.lines} | ${c.hyperfixi.lines} | ${c.diff.linesDiff > 0 ? '+' : ''}${c.diff.linesDiff} | ${c.diff.ratio}x |`
).join('\n')}

### HyperFixi-Only Commands (${summary.commandComparison.hyperfixiOnlyCommands})

These commands exist in HyperFixi but not in the original:

${metrics.hyperfixi.commands.filter(c =>
  !metrics.comparison.find(comp => comp.name === c.name && comp.original)
).slice(0, 10).map(c => `- \`${c.name}\` (${c.lines} lines) - ${c.file}`).join('\n')}

---

## Files Reference

- **Metrics Data**: \`analysis-output/comparison/command-metrics.json\`
- **Pattern Analysis**: \`analysis-output/comparison/pattern-analysis.json\`
- **Full Report**: \`analysis-output/comparison/comparison-report.json\`

## Next Steps

1. Review this report and prioritize optimization targets
2. Create proof-of-concept with compact pattern for one command
3. Measure bundle size impact
4. If successful, apply to remaining high-ROI commands

---

*Report generated by HyperFixi comparison tools*
`;
}

async function main() {
  // Check if comparison report exists
  if (!existsSync(REPORT_PATH)) {
    console.error('Comparison report not found. Run compare-implementations.mjs first.');
    console.error(`Expected: ${REPORT_PATH}`);
    process.exit(1);
  }

  // Load comparison data
  const data = JSON.parse(await readFile(REPORT_PATH, 'utf-8'));

  // Generate markdown report
  const markdown = generateMarkdownReport(data);

  // Write report
  const outputPath = join(OUTPUT_DIR, 'pattern-catalog.md');
  await writeFile(outputPath, markdown);

  console.log('═'.repeat(60));
  console.log('  PATTERN CATALOG GENERATED');
  console.log('═'.repeat(60));
  console.log(`\n  Output: ${outputPath}\n`);

  // Print summary
  console.log('Summary:');
  console.log(`  • ${data.summary.commandComparison.matchedCommands} commands compared`);
  console.log(`  • ${data.summary.commandComparison.codeRatio}x code overhead`);
  console.log(`  • ~${data.summary.potentialOptimizations.conservativeEstimate} lines potential savings`);
  console.log(`  • ${data.summary.patterns.totalFound} patterns identified\n`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
