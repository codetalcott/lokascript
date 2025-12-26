/**
 * Language Coverage Matrix Tests
 *
 * Systematic testing of core commands across all priority languages.
 * This ensures consistent multilingual support and identifies coverage gaps.
 *
 * Test structure:
 * - Each priority language (11) × each core command (10) = 110 test cases
 * - Tests verify: tokenization, parsing success, correct command extraction
 */

import { describe, it, expect } from 'vitest';
import { parse, canParse, tokenize } from '../../src';
import {
  PRIORITY_LANGUAGES,
  CORE_COMMANDS,
  TEST_CASES,
  getTestCase,
  type PriorityLanguage,
  type CoreCommand,
} from './test-cases';

// =============================================================================
// Language Coverage Matrix
// =============================================================================

describe('Language Coverage Matrix', () => {
  // Test each language
  for (const lang of PRIORITY_LANGUAGES) {
    describe(`${lang.toUpperCase()} language`, () => {
      // Test each core command
      for (const cmd of CORE_COMMANDS) {
        const testCase = getTestCase(cmd, lang);

        it(`tokenizes "${cmd}" command: "${testCase}"`, () => {
          const stream = tokenize(testCase, lang);
          expect(stream.tokens.length).toBeGreaterThan(0);
        });

        it(`can parse "${cmd}" command: "${testCase}"`, () => {
          const result = canParse(testCase, lang);
          expect(result).toBe(true);
        });

        it(`parses "${cmd}" with correct action: "${testCase}"`, () => {
          const node = parse(testCase, lang);
          expect(node).toBeDefined();
          expect(node.action).toBe(cmd);
        });
      }
    });
  }
});

// =============================================================================
// Cross-Language Consistency Tests
// =============================================================================

describe('Cross-Language Consistency', () => {
  describe('Command normalization', () => {
    for (const cmd of CORE_COMMANDS) {
      it(`"${cmd}" normalizes consistently across all languages`, () => {
        const actions = new Set<string>();

        for (const lang of PRIORITY_LANGUAGES) {
          const testCase = getTestCase(cmd, lang);
          const canParseResult = canParse(testCase, lang);

          if (canParseResult) {
            const node = parse(testCase, lang);
            actions.add(node.action);
          }
        }

        // All parseable languages should normalize to the same action
        expect(actions.size).toBeLessThanOrEqual(1);
        if (actions.size === 1) {
          expect(actions.has(cmd)).toBe(true);
        }
      });
    }
  });

  describe('Tokenization produces valid tokens', () => {
    for (const lang of PRIORITY_LANGUAGES) {
      it(`${lang.toUpperCase()} tokenization produces keyword tokens`, () => {
        // Use toggle as a simple example
        const testCase = getTestCase('toggle', lang);
        const stream = tokenize(testCase, lang);

        // At least one token should be a keyword
        const hasKeyword = stream.tokens.some(
          t => t.type === 'keyword' || t.type === 'command'
        );
        expect(hasKeyword).toBe(true);
      });
    }
  });
});

// =============================================================================
// Coverage Summary
// =============================================================================

describe('Coverage Summary', () => {
  it('reports coverage statistics', () => {
    const stats = {
      totalTests: PRIORITY_LANGUAGES.length * CORE_COMMANDS.length,
      byLanguage: {} as Record<PriorityLanguage, { passed: number; failed: number }>,
      byCommand: {} as Record<CoreCommand, { passed: number; failed: number }>,
    };

    // Initialize counters
    for (const lang of PRIORITY_LANGUAGES) {
      stats.byLanguage[lang] = { passed: 0, failed: 0 };
    }
    for (const cmd of CORE_COMMANDS) {
      stats.byCommand[cmd] = { passed: 0, failed: 0 };
    }

    // Collect stats
    for (const lang of PRIORITY_LANGUAGES) {
      for (const cmd of CORE_COMMANDS) {
        const testCase = getTestCase(cmd, lang);
        try {
          const result = canParse(testCase, lang);
          if (result) {
            const node = parse(testCase, lang);
            if (node.action === cmd) {
              stats.byLanguage[lang].passed++;
              stats.byCommand[cmd].passed++;
            } else {
              stats.byLanguage[lang].failed++;
              stats.byCommand[cmd].failed++;
            }
          } else {
            stats.byLanguage[lang].failed++;
            stats.byCommand[cmd].failed++;
          }
        } catch {
          stats.byLanguage[lang].failed++;
          stats.byCommand[cmd].failed++;
        }
      }
    }

    // Log summary (visible in test output)
    console.log('\n=== Language Coverage Summary ===\n');
    console.log('By Language:');
    for (const lang of PRIORITY_LANGUAGES) {
      const { passed, failed } = stats.byLanguage[lang];
      const pct = Math.round((passed / (passed + failed)) * 100);
      console.log(`  ${lang.toUpperCase()}: ${passed}/${passed + failed} (${pct}%)`);
    }

    console.log('\nBy Command:');
    for (const cmd of CORE_COMMANDS) {
      const { passed, failed } = stats.byCommand[cmd];
      const pct = Math.round((passed / (passed + failed)) * 100);
      console.log(`  ${cmd}: ${passed}/${passed + failed} (${pct}%)`);
    }

    const totalPassed = Object.values(stats.byLanguage).reduce((sum, s) => sum + s.passed, 0);
    const totalFailed = Object.values(stats.byLanguage).reduce((sum, s) => sum + s.failed, 0);
    console.log(`\nTotal: ${totalPassed}/${totalPassed + totalFailed} (${Math.round((totalPassed / (totalPassed + totalFailed)) * 100)}%)`);

    // This test always passes - it's for reporting only
    expect(true).toBe(true);
  });
});
