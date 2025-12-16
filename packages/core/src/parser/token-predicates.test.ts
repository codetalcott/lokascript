/**
 * Token Predicates Tests
 * Validates that predicate functions correctly classify tokens
 */

import { describe, it, expect } from 'vitest';
import { tokenize, TokenType } from './tokenizer';
import {
  TokenPredicates,
  isCommand,
  isKeyword,
  isEvent,
  isContextVar,
  isLogicalOperator,
  isComparisonOperator,
  isIdentifierLike,
  isSelector,
  isLiteral,
  isOperator,
  isReference,
  isPossessive,
  isDot,
  isOpenBracket,
  isOpenParen,
  canStartExpression,
  isCommandTerminator,
  hasValue,
  hasValueIn,
} from './token-predicates';
import type { Token } from '../types/core';

// Helper to create a mock token
function createToken(type: TokenType, value: string): Token {
  return { type, value, line: 1, column: 1 };
}

describe('Token Predicates', () => {
  describe('Semantic Predicates', () => {
    describe('isCommand', () => {
      it('should return true for COMMAND token type', () => {
        const token = createToken(TokenType.COMMAND, 'toggle');
        expect(isCommand(token)).toBe(true);
      });

      it('should return true for IDENTIFIER that is a command', () => {
        const token = createToken(TokenType.IDENTIFIER, 'toggle');
        expect(isCommand(token)).toBe(true);
      });

      it('should return false for non-command IDENTIFIER', () => {
        const token = createToken(TokenType.IDENTIFIER, 'foo');
        expect(isCommand(token)).toBe(false);
      });

      it('should be case-insensitive', () => {
        const token = createToken(TokenType.IDENTIFIER, 'TOGGLE');
        expect(isCommand(token)).toBe(true);
      });

      it('should recognize all common commands', () => {
        const commands = ['add', 'remove', 'toggle', 'put', 'set', 'get', 'log', 'wait', 'fetch'];
        commands.forEach(cmd => {
          const token = createToken(TokenType.IDENTIFIER, cmd);
          expect(isCommand(token)).toBe(true);
        });
      });
    });

    describe('isKeyword', () => {
      it('should return true for KEYWORD token type', () => {
        const token = createToken(TokenType.KEYWORD, 'if');
        expect(isKeyword(token)).toBe(true);
      });

      it('should return true for IDENTIFIER that is a keyword', () => {
        const token = createToken(TokenType.IDENTIFIER, 'then');
        expect(isKeyword(token)).toBe(true);
      });

      it('should recognize common keywords', () => {
        const keywords = ['if', 'else', 'then', 'end', 'on', 'for', 'while', 'until'];
        keywords.forEach(kw => {
          const token = createToken(TokenType.IDENTIFIER, kw);
          expect(isKeyword(token)).toBe(true);
        });
      });
    });

    describe('isEvent', () => {
      it('should return true for EVENT token type', () => {
        const token = createToken(TokenType.EVENT, 'click');
        expect(isEvent(token)).toBe(true);
      });

      it('should return true for IDENTIFIER that is an event', () => {
        const token = createToken(TokenType.IDENTIFIER, 'click');
        expect(isEvent(token)).toBe(true);
      });

      it('should recognize common DOM events', () => {
        const events = ['click', 'mouseenter', 'mouseleave', 'focus', 'blur', 'input', 'change'];
        events.forEach(evt => {
          const token = createToken(TokenType.IDENTIFIER, evt);
          expect(isEvent(token)).toBe(true);
        });
      });
    });

    describe('isContextVar', () => {
      it('should return true for CONTEXT_VAR token type', () => {
        const token = createToken(TokenType.CONTEXT_VAR, 'me');
        expect(isContextVar(token)).toBe(true);
      });

      it('should return true for IDENTIFIER that is a context var', () => {
        const token = createToken(TokenType.IDENTIFIER, 'me');
        expect(isContextVar(token)).toBe(true);
      });

      it('should recognize all context variables', () => {
        const contextVars = ['me', 'it', 'you', 'result', 'my', 'its', 'your'];
        contextVars.forEach(cv => {
          const token = createToken(TokenType.IDENTIFIER, cv);
          expect(isContextVar(token)).toBe(true);
        });
      });
    });

    describe('isLogicalOperator', () => {
      it('should return true for LOGICAL_OPERATOR token type', () => {
        const token = createToken(TokenType.LOGICAL_OPERATOR, 'and');
        expect(isLogicalOperator(token)).toBe(true);
      });

      it('should recognize logical operators by value', () => {
        const ops = ['and', 'or', 'not', 'no'];
        ops.forEach(op => {
          const token = createToken(TokenType.IDENTIFIER, op);
          expect(isLogicalOperator(token)).toBe(true);
        });
      });
    });

    describe('isComparisonOperator', () => {
      it('should return true for COMPARISON_OPERATOR token type', () => {
        const token = createToken(TokenType.COMPARISON_OPERATOR, 'is');
        expect(isComparisonOperator(token)).toBe(true);
      });

      it('should recognize comparison operators by value', () => {
        const ops = ['==', '!=', '<', '>', '<=', '>=', 'is', 'contains', 'matches'];
        ops.forEach(op => {
          const token = createToken(TokenType.OPERATOR, op);
          expect(isComparisonOperator(token)).toBe(true);
        });
      });
    });
  });

  describe('Lexical Predicates', () => {
    describe('isIdentifierLike', () => {
      it('should return true for IDENTIFIER', () => {
        expect(isIdentifierLike(createToken(TokenType.IDENTIFIER, 'foo'))).toBe(true);
      });

      it('should return true for CONTEXT_VAR', () => {
        expect(isIdentifierLike(createToken(TokenType.CONTEXT_VAR, 'me'))).toBe(true);
      });

      it('should return true for KEYWORD', () => {
        expect(isIdentifierLike(createToken(TokenType.KEYWORD, 'if'))).toBe(true);
      });

      it('should return true for COMMAND', () => {
        expect(isIdentifierLike(createToken(TokenType.COMMAND, 'toggle'))).toBe(true);
      });

      it('should return true for EVENT', () => {
        expect(isIdentifierLike(createToken(TokenType.EVENT, 'click'))).toBe(true);
      });

      it('should return false for STRING', () => {
        expect(isIdentifierLike(createToken(TokenType.STRING, '"hello"'))).toBe(false);
      });
    });

    describe('isSelector', () => {
      it('should return true for ID_SELECTOR', () => {
        expect(isSelector(createToken(TokenType.ID_SELECTOR, '#myId'))).toBe(true);
      });

      it('should return true for CLASS_SELECTOR', () => {
        expect(isSelector(createToken(TokenType.CLASS_SELECTOR, '.myClass'))).toBe(true);
      });

      it('should return true for QUERY_REFERENCE', () => {
        expect(isSelector(createToken(TokenType.QUERY_REFERENCE, '<button/>'))).toBe(true);
      });

      it('should return false for IDENTIFIER', () => {
        expect(isSelector(createToken(TokenType.IDENTIFIER, 'foo'))).toBe(false);
      });
    });

    describe('isLiteral', () => {
      it('should return true for STRING', () => {
        expect(isLiteral(createToken(TokenType.STRING, '"hello"'))).toBe(true);
      });

      it('should return true for NUMBER', () => {
        expect(isLiteral(createToken(TokenType.NUMBER, '42'))).toBe(true);
      });

      it('should return true for BOOLEAN', () => {
        expect(isLiteral(createToken(TokenType.BOOLEAN, 'true'))).toBe(true);
      });

      it('should return true for TEMPLATE_LITERAL', () => {
        expect(isLiteral(createToken(TokenType.TEMPLATE_LITERAL, '`hello`'))).toBe(true);
      });

      it('should return false for IDENTIFIER', () => {
        expect(isLiteral(createToken(TokenType.IDENTIFIER, 'foo'))).toBe(false);
      });
    });

    describe('isOperator', () => {
      it('should return true for OPERATOR', () => {
        expect(isOperator(createToken(TokenType.OPERATOR, '+'))).toBe(true);
      });

      it('should return true for LOGICAL_OPERATOR', () => {
        expect(isOperator(createToken(TokenType.LOGICAL_OPERATOR, 'and'))).toBe(true);
      });

      it('should return true for COMPARISON_OPERATOR', () => {
        expect(isOperator(createToken(TokenType.COMPARISON_OPERATOR, '=='))).toBe(true);
      });

      it('should return false for IDENTIFIER', () => {
        expect(isOperator(createToken(TokenType.IDENTIFIER, 'foo'))).toBe(false);
      });
    });

    describe('isReference', () => {
      it('should return true for CONTEXT_VAR', () => {
        expect(isReference(createToken(TokenType.CONTEXT_VAR, 'me'))).toBe(true);
      });

      it('should return true for GLOBAL_VAR', () => {
        expect(isReference(createToken(TokenType.GLOBAL_VAR, '$foo'))).toBe(true);
      });

      it('should return true for IDENTIFIER', () => {
        expect(isReference(createToken(TokenType.IDENTIFIER, 'foo'))).toBe(true);
      });

      it('should return false for STRING', () => {
        expect(isReference(createToken(TokenType.STRING, '"hello"'))).toBe(false);
      });
    });
  });

  describe('Value Predicates', () => {
    describe('isPossessive', () => {
      it('should return true for possessive operator', () => {
        expect(isPossessive(createToken(TokenType.OPERATOR, "'s"))).toBe(true);
      });

      it('should return false for other operators', () => {
        expect(isPossessive(createToken(TokenType.OPERATOR, '+'))).toBe(false);
      });
    });

    describe('isDot', () => {
      it('should return true for dot operator', () => {
        expect(isDot(createToken(TokenType.OPERATOR, '.'))).toBe(true);
      });

      it('should return false for other operators', () => {
        expect(isDot(createToken(TokenType.OPERATOR, '+'))).toBe(false);
      });
    });

    describe('isOpenBracket', () => {
      it('should return true for opening bracket', () => {
        expect(isOpenBracket(createToken(TokenType.OPERATOR, '['))).toBe(true);
      });

      it('should return false for closing bracket', () => {
        expect(isOpenBracket(createToken(TokenType.OPERATOR, ']'))).toBe(false);
      });
    });

    describe('isOpenParen', () => {
      it('should return true for opening paren', () => {
        expect(isOpenParen(createToken(TokenType.OPERATOR, '('))).toBe(true);
      });

      it('should return false for closing paren', () => {
        expect(isOpenParen(createToken(TokenType.OPERATOR, ')'))).toBe(false);
      });
    });

    describe('hasValue', () => {
      it('should match exact value case-insensitively', () => {
        const token = createToken(TokenType.IDENTIFIER, 'Toggle');
        expect(hasValue(token, 'toggle')).toBe(true);
        expect(hasValue(token, 'TOGGLE')).toBe(true);
      });

      it('should return false for non-matching value', () => {
        const token = createToken(TokenType.IDENTIFIER, 'toggle');
        expect(hasValue(token, 'add')).toBe(false);
      });
    });

    describe('hasValueIn', () => {
      it('should match any value in list', () => {
        const token = createToken(TokenType.IDENTIFIER, 'toggle');
        expect(hasValueIn(token, ['add', 'toggle', 'remove'])).toBe(true);
      });

      it('should return false if not in list', () => {
        const token = createToken(TokenType.IDENTIFIER, 'toggle');
        expect(hasValueIn(token, ['add', 'remove'])).toBe(false);
      });
    });
  });

  describe('Compound Predicates', () => {
    describe('canStartExpression', () => {
      it('should return true for identifier-like tokens', () => {
        expect(canStartExpression(createToken(TokenType.IDENTIFIER, 'foo'))).toBe(true);
        expect(canStartExpression(createToken(TokenType.CONTEXT_VAR, 'me'))).toBe(true);
      });

      it('should return true for selectors', () => {
        expect(canStartExpression(createToken(TokenType.ID_SELECTOR, '#id'))).toBe(true);
        expect(canStartExpression(createToken(TokenType.CLASS_SELECTOR, '.class'))).toBe(true);
      });

      it('should return true for literals', () => {
        expect(canStartExpression(createToken(TokenType.STRING, '"hello"'))).toBe(true);
        expect(canStartExpression(createToken(TokenType.NUMBER, '42'))).toBe(true);
      });

      it('should return true for opening parens/brackets', () => {
        expect(canStartExpression(createToken(TokenType.OPERATOR, '('))).toBe(true);
        expect(canStartExpression(createToken(TokenType.OPERATOR, '['))).toBe(true);
      });

      it('should return true for unary operators', () => {
        expect(canStartExpression(createToken(TokenType.OPERATOR, '-'))).toBe(true);
        expect(canStartExpression(createToken(TokenType.OPERATOR, '!'))).toBe(true);
      });

      it('should return false for binary operators', () => {
        expect(canStartExpression(createToken(TokenType.OPERATOR, '+'))).toBe(true); // + can be unary
        expect(canStartExpression(createToken(TokenType.OPERATOR, '*'))).toBe(false);
      });
    });

    describe('isCommandTerminator', () => {
      it('should return true for terminator keywords', () => {
        const terminators = ['then', 'and', 'else', 'end', 'on'];
        terminators.forEach(term => {
          const token = createToken(TokenType.KEYWORD, term);
          expect(isCommandTerminator(token)).toBe(true);
        });
      });

      it('should be case-insensitive', () => {
        expect(isCommandTerminator(createToken(TokenType.KEYWORD, 'THEN'))).toBe(true);
      });

      it('should return false for non-terminators', () => {
        expect(isCommandTerminator(createToken(TokenType.KEYWORD, 'if'))).toBe(false);
      });
    });
  });

  describe('Integration with tokenize()', () => {
    it('should correctly classify tokens from real tokenization', () => {
      const tokens = tokenize('on click toggle .active');

      // 'on' should be keyword
      expect(isKeyword(tokens[0])).toBe(true);

      // 'click' should be event
      expect(isEvent(tokens[1])).toBe(true);

      // 'toggle' should be command
      expect(isCommand(tokens[2])).toBe(true);

      // '.active' should be selector
      expect(isSelector(tokens[3])).toBe(true);
    });

    it('should classify context variables correctly', () => {
      const tokens = tokenize("put me's value into it");

      expect(isContextVar(tokens[1])).toBe(true); // 'me'
      expect(isPossessive(tokens[2])).toBe(true); // "'s"
      expect(isContextVar(tokens[5])).toBe(true); // 'it'
    });

    it('should classify literals correctly', () => {
      const tokens = tokenize('set x to 42');

      expect(isCommand(tokens[0])).toBe(true); // 'set'
      expect(isLiteral(tokens[3])).toBe(true); // '42'
    });
  });

  describe('TokenPredicates namespace export', () => {
    it('should export all predicates via namespace', () => {
      expect(typeof TokenPredicates.isCommand).toBe('function');
      expect(typeof TokenPredicates.isKeyword).toBe('function');
      expect(typeof TokenPredicates.isIdentifierLike).toBe('function');
      expect(typeof TokenPredicates.isSelector).toBe('function');
      expect(typeof TokenPredicates.isLiteral).toBe('function');
      expect(typeof TokenPredicates.canStartExpression).toBe('function');
    });
  });
});
