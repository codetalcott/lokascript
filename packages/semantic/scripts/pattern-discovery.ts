/**
 * Pattern Discovery & Validation
 *
 * Analyzes database examples to:
 * 1. Discover patterns not yet in registry
 * 2. Validate existing patterns parse correctly
 * 3. Categorize examples by complexity
 * 4. Track coverage gaps
 *
 * Usage: bun run scripts/pattern-discovery.ts [--db-path <path>] [--verbose]
 */

import { Database } from 'bun:sqlite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// MUST import all languages to register them
import '../src/languages/_all';
import '../src/patterns/index';

import { canParse, parse, getSupportedLanguages } from '../src/parser/semantic-parser';
import type { SemanticNode } from '../src/types';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DB_PATH = resolve(__dirname, '../../../../hyperscript-lsp/data/hyperscript.db');

// =============================================================================
// Complexity Classification
// =============================================================================

type ComplexityLevel =
  | 'simple-command'      // toggle .active
  | 'simple-event'        // on click toggle .active (single line)
  | 'chained-command'     // toggle .active then wait 1s
  | 'multi-line-event'    // on click\n  toggle .active
  | 'behavior-install'    // install Draggable
  | 'behavior-def'        // behavior Draggable...end
  | 'def-function'        // def myFunc()...end
  | 'complex';            // nested structures

interface ClassifiedExample {
  id: string;
  title: string;
  raw_code: string;
  complexity: ComplexityLevel;
  lineCount: number;
  commands: string[];      // Detected command keywords
  canParse: boolean;
  parseError?: string;
  semanticNode?: SemanticNode;
}

function classifyComplexity(code: string): ComplexityLevel {
  const lines = code.split('\n').filter(l => l.trim());
  const lineCount = lines.length;
  const trimmed = code.trim().toLowerCase();

  // Behavior definitions
  if (trimmed.startsWith('behavior ')) {
    return 'behavior-def';
  }

  // Function definitions
  if (trimmed.startsWith('def ')) {
    return 'def-function';
  }

  // Install command
  if (trimmed.startsWith('install ')) {
    return 'behavior-install';
  }

  // Event handlers
  if (trimmed.startsWith('on ')) {
    if (lineCount === 1) {
      if (trimmed.includes(' then ')) {
        return 'chained-command';
      }
      return 'simple-event';
    }
    return 'multi-line-event';
  }

  // Simple commands
  if (lineCount === 1) {
    if (trimmed.includes(' then ')) {
      return 'chained-command';
    }
    return 'simple-command';
  }

  return 'complex';
}

function extractCommands(code: string): string[] {
  const commandKeywords = [
    'toggle', 'add', 'remove', 'set', 'put', 'get', 'call', 'send', 'trigger',
    'fetch', 'go', 'take', 'hide', 'show', 'wait', 'log', 'throw', 'return',
    'halt', 'continue', 'repeat', 'for', 'if', 'unless', 'append', 'prepend',
    'increment', 'decrement', 'tell', 'make', 'clone', 'focus', 'blur',
    'swap', 'morph', 'measure', 'install', 'behavior', 'def', 'init', 'on'
  ];

  const found = new Set<string>();
  const lower = code.toLowerCase();

  for (const cmd of commandKeywords) {
    // Match word boundaries
    const regex = new RegExp(`\\b${cmd}\\b`, 'g');
    if (regex.test(lower)) {
      found.add(cmd);
    }
  }

  return Array.from(found);
}

// =============================================================================
// Discovery Analysis
// =============================================================================

interface DiscoveryResult {
  totalExamples: number;
  byComplexity: Record<ComplexityLevel, number>;
  parseable: number;
  notParseable: number;
  commandCoverage: Record<string, { total: number; parseable: number }>;
  gaps: string[];  // Commands/patterns not well covered
  examples: ClassifiedExample[];
}

async function analyzeExamples(dbPath: string, verbose: boolean): Promise<DiscoveryResult> {
  const db = new Database(dbPath);

  interface ExampleRow {
    id: string;
    title: string;
    raw_code: string;
  }

  const examples = db.prepare(`
    SELECT id, title, raw_code FROM code_examples
  `).all() as ExampleRow[];

  const result: DiscoveryResult = {
    totalExamples: examples.length,
    byComplexity: {
      'simple-command': 0,
      'simple-event': 0,
      'chained-command': 0,
      'multi-line-event': 0,
      'behavior-install': 0,
      'behavior-def': 0,
      'def-function': 0,
      'complex': 0,
    },
    parseable: 0,
    notParseable: 0,
    commandCoverage: {},
    gaps: [],
    examples: [],
  };

  for (const row of examples) {
    const complexity = classifyComplexity(row.raw_code);
    const commands = extractCommands(row.raw_code);
    const lineCount = row.raw_code.split('\n').filter(l => l.trim()).length;

    result.byComplexity[complexity]++;

    // Track command coverage
    for (const cmd of commands) {
      if (!result.commandCoverage[cmd]) {
        result.commandCoverage[cmd] = { total: 0, parseable: 0 };
      }
      result.commandCoverage[cmd].total++;
    }

    // Try to parse
    let canParseIt = false;
    let parseError: string | undefined;
    let semanticNode: SemanticNode | undefined;

    // Extract parseable portion based on complexity
    let codeToParse = row.raw_code.trim();

    if (complexity === 'multi-line-event') {
      // Try first line only
      const firstLine = row.raw_code.split('\n')[0].trim();
      codeToParse = firstLine;
    } else if (complexity === 'behavior-def' || complexity === 'def-function' || complexity === 'complex') {
      // Skip these for now
      codeToParse = '';
    }

    if (codeToParse) {
      try {
        if (canParse(codeToParse, 'en')) {
          canParseIt = true;
          semanticNode = parse(codeToParse, 'en');
          result.parseable++;

          for (const cmd of commands) {
            result.commandCoverage[cmd].parseable++;
          }
        } else {
          result.notParseable++;
          parseError = 'canParse returned false';
        }
      } catch (e) {
        result.notParseable++;
        parseError = (e as Error).message;
      }
    } else {
      result.notParseable++;
      parseError = `Complexity level ${complexity} not yet supported`;
    }

    const classified: ClassifiedExample = {
      id: row.id,
      title: row.title,
      raw_code: row.raw_code,
      complexity,
      lineCount,
      commands,
      canParse: canParseIt,
      parseError,
      semanticNode,
    };

    result.examples.push(classified);

    if (verbose && !canParseIt) {
      console.log(`\n❌ ${row.title}`);
      console.log(`   Complexity: ${complexity}`);
      console.log(`   Commands: ${commands.join(', ')}`);
      console.log(`   Error: ${parseError}`);
      console.log(`   Code: ${row.raw_code.substring(0, 80)}...`);
    }
  }

  // Find gaps - commands with low parse success rate
  for (const [cmd, stats] of Object.entries(result.commandCoverage)) {
    const rate = stats.total > 0 ? stats.parseable / stats.total : 0;
    if (rate < 0.5 && stats.total >= 2) {
      result.gaps.push(`${cmd}: ${stats.parseable}/${stats.total} (${(rate * 100).toFixed(0)}%)`);
    }
  }

  db.close();
  return result;
}

// =============================================================================
// Validation: Test translations parse correctly
// =============================================================================

interface ValidationResult {
  language: string;
  total: number;
  parseSuccess: number;
  parseFailed: number;
  failures: Array<{ hyperscript: string; error: string }>;
}

async function validateTranslations(dbPath: string, verbose: boolean): Promise<ValidationResult[]> {
  const db = new Database(dbPath);
  const results: ValidationResult[] = [];

  for (const lang of getSupportedLanguages()) {
    interface TranslationRow {
      hyperscript: string;
    }

    const translations = db.prepare(`
      SELECT hyperscript FROM pattern_translations WHERE language = ?
    `).all(lang) as TranslationRow[];

    const result: ValidationResult = {
      language: lang,
      total: translations.length,
      parseSuccess: 0,
      parseFailed: 0,
      failures: [],
    };

    for (const row of translations) {
      try {
        if (canParse(row.hyperscript, lang)) {
          result.parseSuccess++;
        } else {
          result.parseFailed++;
          result.failures.push({
            hyperscript: row.hyperscript,
            error: 'canParse returned false'
          });
        }
      } catch (e) {
        result.parseFailed++;
        result.failures.push({
          hyperscript: row.hyperscript,
          error: (e as Error).message
        });
      }
    }

    results.push(result);

    if (verbose && result.parseFailed > 0) {
      console.log(`\n${lang}: ${result.parseSuccess}/${result.total} passed`);
      for (const f of result.failures.slice(0, 3)) {
        console.log(`  ❌ ${f.hyperscript.substring(0, 50)}...`);
        console.log(`     ${f.error}`);
      }
    }
  }

  db.close();
  return results;
}

// =============================================================================
// Main
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const validate = args.includes('--validate');

  let dbPath = DEFAULT_DB_PATH;
  const dbIdx = args.indexOf('--db-path');
  if (dbIdx >= 0 && args[dbIdx + 1]) {
    dbPath = resolve(args[dbIdx + 1]);
  }

  console.log('='.repeat(60));
  console.log('Pattern Discovery & Validation');
  console.log('='.repeat(60));
  console.log(`Database: ${dbPath}`);
  console.log('');

  // Discovery
  console.log('## Example Analysis');
  console.log('');

  const discovery = await analyzeExamples(dbPath, verbose);

  console.log('Complexity Distribution:');
  for (const [level, count] of Object.entries(discovery.byComplexity)) {
    if (count > 0) {
      console.log(`  ${level}: ${count}`);
    }
  }

  console.log('');
  console.log(`Parse Coverage: ${discovery.parseable}/${discovery.totalExamples} (${((discovery.parseable/discovery.totalExamples)*100).toFixed(0)}%)`);

  if (discovery.gaps.length > 0) {
    console.log('');
    console.log('Coverage Gaps (commands with <50% parse success):');
    for (const gap of discovery.gaps) {
      console.log(`  ⚠️  ${gap}`);
    }
  }

  // Validation
  if (validate) {
    console.log('');
    console.log('## Translation Validation');
    console.log('');

    const validations = await validateTranslations(dbPath, verbose);

    let allPassed = true;
    for (const v of validations) {
      const status = v.parseFailed === 0 ? '✅' : '⚠️';
      if (v.parseFailed > 0) allPassed = false;
      console.log(`${status} ${v.language}: ${v.parseSuccess}/${v.total}`);
    }

    if (!allPassed) {
      console.log('');
      console.log('Some translations failed validation - use --verbose for details');
    }
  }

  // Summary
  console.log('');
  console.log('='.repeat(60));
  console.log('Recommendations');
  console.log('='.repeat(60));

  const recommendations: string[] = [];

  // Based on complexity distribution
  if (discovery.byComplexity['chained-command'] > 0) {
    recommendations.push(`Add 'then' chaining support (${discovery.byComplexity['chained-command']} examples)`);
  }

  if (discovery.byComplexity['behavior-def'] + discovery.byComplexity['behavior-install'] > 0) {
    recommendations.push(`Add behavior template support (${discovery.byComplexity['behavior-def'] + discovery.byComplexity['behavior-install']} examples)`);
  }

  if (discovery.byComplexity['multi-line-event'] > discovery.parseable * 0.3) {
    recommendations.push(`Improve multi-line event handling (${discovery.byComplexity['multi-line-event']} examples)`);
  }

  // Based on gaps
  for (const gap of discovery.gaps.slice(0, 5)) {
    recommendations.push(`Improve pattern for: ${gap}`);
  }

  if (recommendations.length === 0) {
    console.log('✅ Good coverage! No major gaps detected.');
  } else {
    for (const rec of recommendations) {
      console.log(`• ${rec}`);
    }
  }
}

main().catch(console.error);
