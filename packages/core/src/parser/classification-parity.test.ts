/**
 * Classification Parity Tests
 *
 * NOTE: Phase 8 - These tests are SKIPPED because they validate parity
 * with the old TokenType semantic classification system which has been
 * removed in favor of TokenKind lexical classification + predicates.
 *
 * The predicate functionality is now tested in token-predicates.test.ts
 * and the main tokenizer.test.ts files.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { tokenize, TokenKind } from './tokenizer';
import { TokenPredicates } from './token-predicates';
import type { Token } from '../types/core';

// Legacy TokenType for skipped tests (old system removed)
enum TokenType {
  COMMAND = 'COMMAND',
  KEYWORD = 'KEYWORD',
  EVENT = 'EVENT',
  CONTEXT_VAR = 'CONTEXT_VAR',
  LOGICAL_OPERATOR = 'LOGICAL_OPERATOR',
  COMPARISON_OPERATOR = 'COMPARISON_OPERATOR',
  OPERATOR = 'OPERATOR',
  ID_SELECTOR = 'ID_SELECTOR',
  CLASS_SELECTOR = 'CLASS_SELECTOR',
  CSS_SELECTOR = 'CSS_SELECTOR',
  QUERY_REFERENCE = 'QUERY_REFERENCE',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  TEMPLATE_LITERAL = 'TEMPLATE_LITERAL',
  GLOBAL_VAR = 'GLOBAL_VAR',
  IDENTIFIER = 'IDENTIFIER',
  TIME_EXPRESSION = 'TIME_EXPRESSION'
}

// Type assertion helper for legacy token access
type LegacyToken = Token & { type: string; };
const asLegacy = (t: Token) => t as LegacyToken;

// Sample hyperscript expressions covering all token types and patterns
const TEST_EXPRESSIONS = [
  // Basic commands
  'on click toggle .active',
  'on mouseenter add .highlight',
  'on mouseleave remove .highlight',

  // Context variables
  "put me's value into it",
  "set my innerHTML to result",
  "put your value into its textContent",

  // Selectors
  'toggle .visible on #main',
  'add .selected to <button/>',
  'remove .hidden from .container',

  // Literals
  'set x to 42',
  'set name to "hello"',
  'set flag to true',
  'set template to `hello ${name}`',

  // Operators and comparisons
  'if x is greater than 10',
  'if y == 5 and z != 0',
  'if value contains "test"',
  'if element exists',

  // Complex expressions
  'on click put (a + b) * c into #result',
  'on input set $globalVar to event.target.value',
  'wait 500ms then toggle .visible',

  // Control flow
  'if x > 0 then increment y else decrement y end',
  'repeat 5 times log "hello" end',
  'for item in items add .processed to item end',

  // Property access
  'get element.style.color',
  "put element's innerHTML into target",
  'set arr[0] to value',

  // Events with modifiers
  'on click[button==0] toggle .active',
  'on keydown[key=="Enter"] submit',

  // Global variables
  'set $count to $count + 1',

  // Symbols (attributes)
  'get @data-value from #input',

  // Time expressions
  'wait 2s',
  'transition opacity to 0 over 300ms',

  // Async
  'fetch /api/data then put result into #output',

  // Multi-word operators
  'if x is not equal to y',
  'if element is empty',
  'if list does not contain item',
];

// Phase 8: Skip all parity tests - TokenType semantic classification removed
describe.skip('Classification Parity Tests', () => {
  describe('Token-by-Token Parity', () => {
    TEST_EXPRESSIONS.forEach((expr, index) => {
      it(`should maintain parity for: "${expr.slice(0, 50)}${expr.length > 50 ? '...' : ''}"`, () => {
        const tokens = tokenize(expr);

        tokens.forEach((token, tokenIndex) => {
          const legacyToken = asLegacy(token);
          // Test isCommand parity
          const oldIsCommand = legacyToken.type === TokenType.COMMAND;
          const newIsCommand = TokenPredicates.isCommand(token);
          if (oldIsCommand !== newIsCommand) {
            // New predicate may also accept IDENTIFIER tokens that are commands
            // This is expected and correct - new behavior is a superset
            if (legacyToken.type === TokenType.IDENTIFIER) {
              // If old said false and new says true, that's the enhanced behavior
              expect(newIsCommand).toBe(true);
            } else {
              expect(newIsCommand).toBe(oldIsCommand);
            }
          }

          // Test isKeyword parity
          const oldIsKeyword = legacyToken.type === TokenType.KEYWORD;
          const newIsKeyword = TokenPredicates.isKeyword(token);
          // Same logic - new predicate is a superset
          if (oldIsKeyword !== newIsKeyword && legacyToken.type !== TokenType.IDENTIFIER) {
            expect(newIsKeyword).toBe(oldIsKeyword);
          }

          // Test isEvent parity
          const oldIsEvent = legacyToken.type === TokenType.EVENT;
          const newIsEvent = TokenPredicates.isEvent(token);
          if (oldIsEvent !== newIsEvent && legacyToken.type !== TokenType.IDENTIFIER) {
            expect(newIsEvent).toBe(oldIsEvent);
          }

          // Test isContextVar parity
          const oldIsContextVar = legacyToken.type === TokenType.CONTEXT_VAR;
          const newIsContextVar = TokenPredicates.isContextVar(token);
          if (oldIsContextVar !== newIsContextVar && legacyToken.type !== TokenType.IDENTIFIER) {
            expect(newIsContextVar).toBe(oldIsContextVar);
          }

          // Test isLogicalOperator parity
          const oldIsLogical = legacyToken.type === TokenType.LOGICAL_OPERATOR;
          const newIsLogical = TokenPredicates.isLogicalOperator(token);
          if (oldIsLogical !== newIsLogical && legacyToken.type !== TokenType.IDENTIFIER && legacyToken.type !== TokenType.KEYWORD) {
            expect(newIsLogical).toBe(oldIsLogical);
          }

          // Test isComparisonOperator parity
          const oldIsComparison = legacyToken.type === TokenType.COMPARISON_OPERATOR;
          const newIsComparison = TokenPredicates.isComparisonOperator(token);
          // Comparison can match by value too
          if (oldIsComparison && !newIsComparison) {
            expect(newIsComparison).toBe(oldIsComparison);
          }

          // Test lexical predicates - these should be exact matches
          const oldIsSelector =
            legacyToken.type === TokenType.ID_SELECTOR ||
            legacyToken.type === TokenType.CLASS_SELECTOR ||
            legacyToken.type === TokenType.CSS_SELECTOR ||
            legacyToken.type === TokenType.QUERY_REFERENCE;
          expect(TokenPredicates.isSelector(token)).toBe(oldIsSelector);

          const oldIsLiteral =
            legacyToken.type === TokenType.STRING ||
            legacyToken.type === TokenType.NUMBER ||
            legacyToken.type === TokenType.BOOLEAN ||
            legacyToken.type === TokenType.TEMPLATE_LITERAL;
          expect(TokenPredicates.isLiteral(token)).toBe(oldIsLiteral);

          const oldIsOperator =
            legacyToken.type === TokenType.OPERATOR ||
            legacyToken.type === TokenType.LOGICAL_OPERATOR ||
            legacyToken.type === TokenType.COMPARISON_OPERATOR;
          expect(TokenPredicates.isOperator(token)).toBe(oldIsOperator);

          const oldIsReference =
            legacyToken.type === TokenType.CONTEXT_VAR ||
            legacyToken.type === TokenType.GLOBAL_VAR ||
            legacyToken.type === TokenType.IDENTIFIER;
          expect(TokenPredicates.isReference(token)).toBe(oldIsReference);

          const oldIsIdentifierLike =
            legacyToken.type === TokenType.IDENTIFIER ||
            legacyToken.type === TokenType.CONTEXT_VAR ||
            legacyToken.type === TokenType.KEYWORD ||
            legacyToken.type === TokenType.COMMAND ||
            legacyToken.type === TokenType.EVENT;
          expect(TokenPredicates.isIdentifierLike(token)).toBe(oldIsIdentifierLike);
        });
      });
    });
  });

  describe('Semantic Predicate Superset Behavior', () => {
    it('should recognize commands from IDENTIFIER tokens', () => {
      // Create a token that the tokenizer classified as IDENTIFIER
      // but is actually a command
      const token: LegacyToken = { kind: TokenType.IDENTIFIER, type: TokenType.IDENTIFIER, value: 'toggle', line: 1, column: 1, start: 0, end: 6 };

      // Old check would fail
      expect(token.type === TokenType.COMMAND).toBe(false);

      // New predicate recognizes it
      expect(TokenPredicates.isCommand(token)).toBe(true);
    });

    it('should recognize keywords from IDENTIFIER tokens', () => {
      const token: LegacyToken = { kind: TokenType.IDENTIFIER, type: TokenType.IDENTIFIER, value: 'then', line: 1, column: 1, start: 0, end: 4 };

      expect(token.type === TokenType.KEYWORD).toBe(false);
      expect(TokenPredicates.isKeyword(token)).toBe(true);
    });

    it('should recognize events from IDENTIFIER tokens', () => {
      const token: LegacyToken = { kind: TokenType.IDENTIFIER, type: TokenType.IDENTIFIER, value: 'click', line: 1, column: 1, start: 0, end: 5 };

      expect(token.type === TokenType.EVENT).toBe(false);
      expect(TokenPredicates.isEvent(token)).toBe(true);
    });

    it('should recognize context vars from IDENTIFIER tokens', () => {
      const token: LegacyToken = { kind: TokenType.IDENTIFIER, type: TokenType.IDENTIFIER, value: 'me', line: 1, column: 1, start: 0, end: 2 };

      expect(token.type === TokenType.CONTEXT_VAR).toBe(false);
      expect(TokenPredicates.isContextVar(token)).toBe(true);
    });
  });

  describe('Common Parser Patterns', () => {
    it('should correctly replace checkTokenType(TokenType.COMMAND) pattern', () => {
      const tokens = tokenize('toggle .active');
      const commandToken = tokens[0];
      const legacyToken = asLegacy(commandToken);

      // Old pattern
      const oldCheck = legacyToken.type === TokenType.COMMAND;

      // New pattern
      const newCheck = TokenPredicates.isCommand(commandToken);

      // Should produce same result for properly tokenized input
      expect(newCheck).toBe(oldCheck);
    });

    it('should correctly replace multiple TokenType OR checks', () => {
      const tokens = tokenize("put me's value into it");

      tokens.forEach(token => {
        const legacyToken = asLegacy(token);
        // Old pattern (very common in expression-parser.ts)
        const oldCheck =
          legacyToken.type === TokenType.CONTEXT_VAR ||
          legacyToken.type === TokenType.IDENTIFIER;

        // New pattern
        const newCheck = TokenPredicates.isReference(token);

        // Should be equivalent or new is superset
        if (oldCheck) {
          expect(newCheck).toBe(true);
        }
      });
    });

    it('should correctly replace type + value dual checks', () => {
      const tokens = tokenize("me's value");
      const possessiveToken = tokens[1];
      const legacyToken = asLegacy(possessiveToken);

      // Old pattern (from expression-parser.ts line 502)
      const oldCheck =
        legacyToken.type === TokenType.OPERATOR &&
        possessiveToken.value === "'s";

      // New pattern
      const newCheck = TokenPredicates.isPossessive(possessiveToken);

      expect(newCheck).toBe(oldCheck);
    });

    it('should correctly handle command terminator detection', () => {
      const terminators = ['then', 'and', 'else', 'end', 'on'];
      const nonTerminators = ['if', 'for', 'while', 'toggle'];

      terminators.forEach(term => {
        const token: LegacyToken = { kind: TokenType.KEYWORD, type: TokenType.KEYWORD, value: term, line: 1, column: 1, start: 0, end: term.length };
        expect(TokenPredicates.isCommandTerminator(token)).toBe(true);
      });

      nonTerminators.forEach(term => {
        const token: LegacyToken = { kind: TokenType.KEYWORD, type: TokenType.KEYWORD, value: term, line: 1, column: 1, start: 0, end: term.length };
        expect(TokenPredicates.isCommandTerminator(token)).toBe(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty tokenization', () => {
      const tokens = tokenize('');
      expect(tokens.length).toBe(0);
    });

    it('should handle whitespace-only input', () => {
      const tokens = tokenize('   \t\n  ');
      // Whitespace tokens are filtered out
      expect(tokens.length).toBe(0);
    });

    it('should handle mixed case keywords', () => {
      const tokens = tokenize('ON CLICK TOGGLE .active');

      expect(TokenPredicates.isKeyword(tokens[0])).toBe(true);
      expect(TokenPredicates.isEvent(tokens[1])).toBe(true);
      expect(TokenPredicates.isCommand(tokens[2])).toBe(true);
    });

    it('should distinguish between selector types', () => {
      // Test each selector type separately (spaces between cause different tokenization)
      const idTokens = tokenize('toggle #myId');
      const classTokens = tokenize('toggle .myClass');
      const queryTokens = tokenize('toggle <button/>');

      // Find the selector tokens
      const idSelector = idTokens.find(t => asLegacy(t).type === TokenType.ID_SELECTOR);
      const classSelector = classTokens.find(t => asLegacy(t).type === TokenType.CLASS_SELECTOR);
      const queryRef = queryTokens.find(t => asLegacy(t).type === TokenType.QUERY_REFERENCE);

      expect(idSelector).toBeDefined();
      expect(classSelector).toBeDefined();
      expect(queryRef).toBeDefined();

      // All should be recognized as selectors by predicate
      expect(TokenPredicates.isSelector(idSelector!)).toBe(true);
      expect(TokenPredicates.isSelector(classSelector!)).toBe(true);
      expect(TokenPredicates.isSelector(queryRef!)).toBe(true);
    });
  });

  describe('Performance Sanity Check', () => {
    it('should handle predicate checks efficiently', () => {
      const tokens = tokenize('on click toggle .active then wait 100ms then add .done');

      const start = performance.now();
      const iterations = 10000;

      for (let i = 0; i < iterations; i++) {
        tokens.forEach(token => {
          TokenPredicates.isCommand(token);
          TokenPredicates.isKeyword(token);
          TokenPredicates.isSelector(token);
          TokenPredicates.isLiteral(token);
          TokenPredicates.isOperator(token);
        });
      }

      const elapsed = performance.now() - start;

      // Should complete 10000 iterations in under 200ms (allowing for CI variability)
      expect(elapsed).toBeLessThan(200);
    });
  });
});

// ============================================================================
// DEFERRED CLASSIFICATION MODE TESTS
// These tests verify predicates work correctly when tokenizer returns IDENTIFIER
// for all semantic tokens (commands, keywords, events, context vars)
// ============================================================================

import {
  enableDeferredClassification,
  disableDeferredClassification,
  isDeferredClassificationEnabled,
} from './tokenizer';

// Phase 8: Skip deferred classification tests - TokenType semantic classification removed
describe.skip('Deferred Classification Mode', () => {
  beforeEach(() => {
    // Ensure clean state
    disableDeferredClassification();
  });

  afterEach(() => {
    // Reset to default after each test
    disableDeferredClassification();
  });

  describe('Feature Flag Control', () => {
    it('should be disabled by default', () => {
      expect(isDeferredClassificationEnabled()).toBe(false);
    });

    it('should enable/disable correctly', () => {
      enableDeferredClassification();
      expect(isDeferredClassificationEnabled()).toBe(true);

      disableDeferredClassification();
      expect(isDeferredClassificationEnabled()).toBe(false);
    });
  });

  describe('Tokenization Differences', () => {
    it('should return IDENTIFIER for commands when enabled', () => {
      const legacyTokens = tokenize('toggle .active');
      expect(asLegacy(legacyTokens[0]).type).toBe(TokenType.COMMAND);

      enableDeferredClassification();
      const deferredTokens = tokenize('toggle .active');
      expect(asLegacy(deferredTokens[0]).type).toBe(TokenType.IDENTIFIER);
    });

    it('should return IDENTIFIER for keywords when enabled', () => {
      const legacyTokens = tokenize('on click');
      expect(asLegacy(legacyTokens[0]).type).toBe(TokenType.KEYWORD);

      enableDeferredClassification();
      const deferredTokens = tokenize('on click');
      expect(asLegacy(deferredTokens[0]).type).toBe(TokenType.IDENTIFIER);
    });

    it('should return IDENTIFIER for events when enabled', () => {
      const legacyTokens = tokenize('on click');
      expect(asLegacy(legacyTokens[1]).type).toBe(TokenType.EVENT);

      enableDeferredClassification();
      const deferredTokens = tokenize('on click');
      expect(asLegacy(deferredTokens[1]).type).toBe(TokenType.IDENTIFIER);
    });

    it('should return IDENTIFIER for context vars when enabled', () => {
      const legacyTokens = tokenize("put me's value into it");
      expect(asLegacy(legacyTokens[1]).type).toBe(TokenType.CONTEXT_VAR); // 'me'
      expect(asLegacy(legacyTokens[5]).type).toBe(TokenType.CONTEXT_VAR); // 'it'

      enableDeferredClassification();
      const deferredTokens = tokenize("put me's value into it");
      expect(asLegacy(deferredTokens[1]).type).toBe(TokenType.IDENTIFIER); // 'me'
      expect(asLegacy(deferredTokens[5]).type).toBe(TokenType.IDENTIFIER); // 'it'
    });

    it('should still classify operators correctly', () => {
      enableDeferredClassification();
      const tokens = tokenize('x and y or not z');
      expect(asLegacy(tokens[1]).type).toBe(TokenType.LOGICAL_OPERATOR); // 'and'
      expect(asLegacy(tokens[3]).type).toBe(TokenType.LOGICAL_OPERATOR); // 'or'
      expect(asLegacy(tokens[4]).type).toBe(TokenType.LOGICAL_OPERATOR); // 'not'
    });

    it('should still classify boolean literals correctly', () => {
      enableDeferredClassification();
      const tokens = tokenize('set x to true');
      expect(asLegacy(tokens[3]).type).toBe(TokenType.BOOLEAN);
    });

    it('should still classify comparison operators correctly', () => {
      enableDeferredClassification();
      const tokens = tokenize('if x contains y');
      expect(asLegacy(tokens[2]).type).toBe(TokenType.COMPARISON_OPERATOR);
    });
  });

  describe('Predicate Functionality with Deferred Classification', () => {
    it('predicates should correctly classify deferred IDENTIFIER tokens', () => {
      enableDeferredClassification();
      const tokens = tokenize('on click toggle .active');

      // 'on' is now IDENTIFIER but predicate should recognize it as keyword
      expect(asLegacy(tokens[0]).type).toBe(TokenType.IDENTIFIER);
      expect(tokens[0].value).toBe('on');
      expect(TokenPredicates.isKeyword(tokens[0])).toBe(true);

      // 'click' is now IDENTIFIER but predicate should recognize it as event
      expect(asLegacy(tokens[1]).type).toBe(TokenType.IDENTIFIER);
      expect(tokens[1].value).toBe('click');
      expect(TokenPredicates.isEvent(tokens[1])).toBe(true);

      // 'toggle' is now IDENTIFIER but predicate should recognize it as command
      expect(asLegacy(tokens[2]).type).toBe(TokenType.IDENTIFIER);
      expect(tokens[2].value).toBe('toggle');
      expect(TokenPredicates.isCommand(tokens[2])).toBe(true);

      // NOTE: In deferred mode, '.active' after 'toggle' (IDENTIFIER) is tokenized
      // as dot operator + identifier instead of CLASS_SELECTOR. This is because
      // the tokenizer uses prevToken.type === 'command' to detect selector context.
      // This is a known limitation of deferred classification mode.
      // Using a different expression that works: 'add .active' after keyword 'to'
    });

    it('should handle selectors after keywords in deferred mode', () => {
      enableDeferredClassification();
      // Selectors after operators/keywords still work in deferred mode
      const tokens = tokenize('add .active to #main');

      // 'add' becomes IDENTIFIER
      expect(asLegacy(tokens[0]).type).toBe(TokenType.IDENTIFIER);
      expect(TokenPredicates.isCommand(tokens[0])).toBe(true);

      // '.active' is still CLASS_SELECTOR (follows nothing after 'add' since operator context)
      // Actually check what happens:
      const classSelector = tokens.find(t => asLegacy(t).type === TokenType.CLASS_SELECTOR);
      const idSelector = tokens.find(t => asLegacy(t).type === TokenType.ID_SELECTOR);

      // At minimum, #main should be an ID_SELECTOR since # triggers selector tokenization
      expect(idSelector).toBeDefined();
      expect(idSelector!.value).toBe('#main');
      expect(TokenPredicates.isSelector(idSelector!)).toBe(true);
    });

    it('all TEST_EXPRESSIONS should work with predicates in deferred mode', () => {
      enableDeferredClassification();

      const testExpressions = [
        'on click toggle .active',
        "put me's value into it",
        'set x to 42',
        'if x is greater than 10',
        'wait 500ms then toggle .visible',
      ];

      testExpressions.forEach(expr => {
        const tokens = tokenize(expr);

        // Every token should have predicates return consistent results
        tokens.forEach(token => {
          const legacyToken = asLegacy(token);
          // These should not throw errors
          const isCmd = TokenPredicates.isCommand(token);
          const isKw = TokenPredicates.isKeyword(token);
          const isEvt = TokenPredicates.isEvent(token);
          const isCtx = TokenPredicates.isContextVar(token);
          const isSel = TokenPredicates.isSelector(token);
          const isLit = TokenPredicates.isLiteral(token);
          const isOp = TokenPredicates.isOperator(token);

          // At least one category should be true for any token
          const hasCategory = isCmd || isKw || isEvt || isCtx || isSel || isLit || isOp ||
            legacyToken.type === TokenType.IDENTIFIER ||
            legacyToken.type === TokenType.TIME_EXPRESSION;

          expect(hasCategory).toBe(true);
        });
      });
    });

    it('isIdentifierLike should include deferred tokens', () => {
      enableDeferredClassification();
      const tokens = tokenize('on click toggle');

      // All three should be IDENTIFIER but recognized as identifier-like
      tokens.forEach(token => {
        expect(asLegacy(token).type).toBe(TokenType.IDENTIFIER);
        expect(TokenPredicates.isIdentifierLike(token)).toBe(true);
      });
    });
  });
});
