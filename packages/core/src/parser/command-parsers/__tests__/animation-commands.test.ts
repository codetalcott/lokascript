/**
 * Test Suite for Animation Command Parsers
 *
 * Tests parseMeasureCommand and parseTransitionCommand using mock ParserContext.
 */

import { describe, it, expect, vi } from 'vitest';
import { parseMeasureCommand, parseTransitionCommand } from '../animation-commands';
import {
  createMockParserContext,
  createTokenStream,
  createToken,
} from '../../../__test-utils__/parser-context-mock';
import type { ParserContext, IdentifierNode } from '../../parser-types';

describe('Animation Command Parsers', () => {
  function createIdentifierNode(name: string): IdentifierNode {
    return {
      type: 'identifier',
      name,
      start: 0,
      end: name.length,
      line: 1,
      column: 0,
    };
  }

  describe('parseMeasureCommand', () => {
    it('should parse measure with just property', () => {
      const tokens = createTokenStream(['width']);
      const ctx = createMockParserContext(tokens, {
        checkIdentifierLike: vi.fn(() => true),
        parsePrimary: vi.fn(() => ({ type: 'identifier', name: 'width' })),
      });

      const result = parseMeasureCommand(ctx, createIdentifierNode('measure'));

      expect(result.name).toBe('measure');
      expect(result.arguments).toHaveLength(1);
    });

    it('should parse measure with target and property', () => {
      const tokens = createTokenStream(['#el', 'width']);
      const ctx = createMockParserContext(tokens, {
        checkAnySelector: vi.fn(() => true),
        checkIdentifierLike: vi.fn(() => true),
        parsePrimary: vi
          .fn()
          .mockReturnValueOnce({ type: 'selector', value: '#el' })
          .mockReturnValueOnce({ type: 'identifier', name: 'width' }),
      });

      const result = parseMeasureCommand(ctx, createIdentifierNode('measure'));

      expect(result.arguments).toHaveLength(2);
    });

    it('should parse measure with CSS property (*opacity)', () => {
      const tokens = createTokenStream(['#el', '*', 'opacity']);
      let pos = 0;
      const ctx = createMockParserContext(tokens, {
        checkAnySelector: vi.fn(() => pos === 0),
        checkIdentifierLike: vi.fn(() => pos === 2),
        match: vi.fn((val: string) => tokens[pos]?.value === val),
        advance: vi.fn(() => tokens[pos++]),
        parsePrimary: vi.fn(() => {
          const token = tokens[pos];
          pos++;
          return { type: 'selector', value: token?.value ?? '' };
        }),
      });

      const result = parseMeasureCommand(ctx, createIdentifierNode('measure'));

      expect(result.arguments).toHaveLength(2);
      // Second arg should be CSS property with *
      const cssArg = result.arguments[1] as any;
      expect(cssArg.name).toContain('*');
    });

    it('should parse measure with "and set" modifier', () => {
      const tokens = createTokenStream(['width', 'and', 'set', 'w']);
      let pos = 0;
      const ctx = createMockParserContext(tokens, {
        checkIdentifierLike: vi.fn(() => true),
        match: vi.fn((val: string) => tokens[pos]?.value === val),
        advance: vi.fn(() => tokens[pos++]),
        parsePrimary: vi.fn(() => ({ type: 'identifier', name: 'width' })),
      });

      const result = parseMeasureCommand(ctx, createIdentifierNode('measure'));

      expect(result.modifiers).toBeDefined();
      expect(result.modifiers!.set).toBeDefined();
    });
  });

  describe('parseTransitionCommand', () => {
    it('should parse transition with property and to value', () => {
      const tokens = createTokenStream(['opacity', 'to', '1']);
      let pos = 0;
      const ctx = createMockParserContext(tokens, {
        peek: vi.fn(() => tokens[pos]),
        check: vi.fn((val: string) => tokens[pos]?.value === val),
        checkIdentifierLike: vi.fn(() => pos === 0),
        advance: vi.fn(() => tokens[pos++]),
        parsePrimary: vi.fn(() => ({ type: 'literal', value: 1 })),
        getPosition: vi.fn(() => ({ start: 0, end: 10, line: 1, column: 0 })),
      });

      const result = parseTransitionCommand(ctx, createToken('transition'));

      expect(result.name).toBe('transition');
      expect(result.arguments).toHaveLength(1);
      expect(result.modifiers).toBeDefined();
      expect(result.modifiers!.to).toBeDefined();
    });

    it('should parse transition with * prefix CSS property', () => {
      const tokens = createTokenStream(['*', 'background-color', 'to', 'red']);
      let pos = 0;
      const ctx = createMockParserContext(tokens, {
        peek: vi.fn(() => tokens[pos]),
        check: vi.fn((val: string) => tokens[pos]?.value === val),
        checkIdentifierLike: vi.fn(() => pos === 1),
        advance: vi.fn(() => tokens[pos++]),
        isAtEnd: vi.fn(() => pos >= tokens.length),
        parsePrimary: vi.fn(() => ({ type: 'literal', value: 'red' })),
        getPosition: vi.fn(() => ({ start: 0, end: 10, line: 1, column: 0 })),
      });

      const result = parseTransitionCommand(ctx, createToken('transition'));

      const prop = result.arguments[0] as any;
      expect(prop.value).toContain('*');
    });

    it('should parse transition with hyphenated property', () => {
      const tokens = createTokenStream(['background', '-', 'color', 'to', 'red']);
      let pos = 0;
      const ctx = createMockParserContext(tokens, {
        peek: vi.fn(() => tokens[pos]),
        check: vi.fn((val: string) => tokens[pos]?.value === val),
        checkIdentifierLike: vi.fn(() => [0, 2].includes(pos)),
        advance: vi.fn(() => tokens[pos++]),
        isAtEnd: vi.fn(() => pos >= tokens.length),
        parsePrimary: vi.fn(() => ({ type: 'literal', value: 'red' })),
        getPosition: vi.fn(() => ({ start: 0, end: 10, line: 1, column: 0 })),
      });

      const result = parseTransitionCommand(ctx, createToken('transition'));

      const prop = result.arguments[0] as any;
      expect(prop.value).toBe('background-color');
    });

    it('should parse transition with over duration', () => {
      const tokens = createTokenStream(['opacity', 'to', '1', 'over', '2s']);
      let pos = 0;
      const ctx = createMockParserContext(tokens, {
        peek: vi.fn(() => tokens[pos]),
        check: vi.fn((val: string) => tokens[pos]?.value === val),
        checkIdentifierLike: vi.fn(() => pos === 0),
        advance: vi.fn(() => tokens[pos++]),
        parsePrimary: vi.fn(() => ({
          type: 'literal',
          value: pos === 3 ? 1 : pos === 5 ? 2000 : 0,
        })),
        getPosition: vi.fn(() => ({ start: 0, end: 10, line: 1, column: 0 })),
      });

      const result = parseTransitionCommand(ctx, createToken('transition'));

      expect(result.modifiers!.over).toBeDefined();
    });

    it('should parse transition with with timing function', () => {
      const tokens = createTokenStream(['opacity', 'to', '1', 'with', 'ease-in-out']);
      let pos = 0;
      const ctx = createMockParserContext(tokens, {
        peek: vi.fn(() => tokens[pos]),
        check: vi.fn((val: string) => tokens[pos]?.value === val),
        checkIdentifierLike: vi.fn(() => pos === 0),
        advance: vi.fn(() => tokens[pos++]),
        parsePrimary: vi.fn(() => ({ type: 'identifier', name: 'ease-in-out' })),
        getPosition: vi.fn(() => ({ start: 0, end: 10, line: 1, column: 0 })),
      });

      const result = parseTransitionCommand(ctx, createToken('transition'));

      expect(result.modifiers!.with).toBeDefined();
    });

    it('should throw if property is missing', () => {
      const tokens = createTokenStream(['to', '1']);
      let pos = 0;
      const ctx = createMockParserContext(tokens, {
        peek: vi.fn(() => tokens[pos]),
        check: vi.fn(() => false),
        checkIdentifierLike: vi.fn(() => false),
      });

      expect(() => parseTransitionCommand(ctx, createToken('transition'))).toThrow(
        'requires a CSS property'
      );
    });

    it('should throw if "to" keyword is missing', () => {
      const tokens = createTokenStream(['opacity', '1']);
      let pos = 0;
      const ctx = createMockParserContext(tokens, {
        peek: vi.fn(() => tokens[pos]),
        check: vi.fn((val: string) => (val === 'to' ? false : tokens[pos]?.value === val)),
        checkIdentifierLike: vi.fn(() => pos === 0),
        advance: vi.fn(() => tokens[pos++]),
        getPosition: vi.fn(() => ({ start: 0, end: 10, line: 1, column: 0 })),
      });

      expect(() => parseTransitionCommand(ctx, createToken('transition'))).toThrow(
        'Expected "to" keyword'
      );
    });
  });
});
