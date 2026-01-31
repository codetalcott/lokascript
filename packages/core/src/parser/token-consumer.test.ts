/**
 * Test Suite for TokenConsumer
 *
 * Tests the helper class that provides common token consumption patterns
 * for command parsers (parseArgsUntilTerminator, consumeOptionalThe, etc.)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TokenConsumer, type ParserInterface } from './token-consumer';
import type { ASTNode, Token } from '../types/core';

/**
 * Create a mock ParserInterface (simpler than ParserContext)
 * that tracks position through a token array.
 */
function createMockParser(tokenValues: string[]): ParserInterface & { position: number } {
  const tokens: Token[] = tokenValues.map((value, i) => ({
    kind: 'identifier' as any,
    value,
    start: i * 5,
    end: i * 5 + value.length,
    line: 1,
    column: i * 5 + 1,
  }));

  let position = 0;

  const parser: ParserInterface & { position: number } = {
    get position() {
      return position;
    },
    set position(val: number) {
      position = val;
    },

    isAtEnd: vi.fn(() => position >= tokens.length),

    check: vi.fn((value: string) => {
      if (position >= tokens.length) return false;
      return tokens[position].value === value;
    }),

    checkTokenType: vi.fn(() => false),

    advance: vi.fn(() => {
      const token = tokens[position];
      position++;
      return token;
    }),

    peek: vi.fn(
      () => tokens[position] || { kind: 'eof', value: '', start: 0, end: 0, line: 1, column: 0 }
    ),

    parsePrimary: vi.fn(() => {
      const token = tokens[position];
      position++;
      return {
        type: 'identifier',
        name: token?.value ?? 'unknown',
        start: token?.start ?? 0,
        end: token?.end ?? 0,
        line: 1,
        column: 1,
      } as ASTNode;
    }),

    parseExpression: vi.fn(() => {
      const token = tokens[position];
      position++;
      return {
        type: 'expression',
        name: token?.value ?? 'unknown',
        start: token?.start ?? 0,
        end: token?.end ?? 0,
        line: 1,
        column: 1,
      } as unknown as ASTNode;
    }),

    isCommand: vi.fn((name: string) => {
      const commands = [
        'toggle',
        'add',
        'remove',
        'set',
        'put',
        'take',
        'increment',
        'decrement',
        'show',
        'hide',
        'log',
      ];
      return commands.includes(name);
    }),
  };

  return parser;
}

describe('TokenConsumer', () => {
  describe('constructor', () => {
    it('should store the parser reference', () => {
      const parser = createMockParser([]);
      const consumer = new TokenConsumer(parser);
      // Consumer exists and can call methods without error
      expect(consumer).toBeDefined();
    });
  });

  describe('parseArgsUntilTerminator', () => {
    it('should parse arguments until end of input', () => {
      const parser = createMockParser(['foo', 'bar']);
      const consumer = new TokenConsumer(parser);

      const args = consumer.parseArgsUntilTerminator();

      expect(args).toHaveLength(2);
      expect(parser.parsePrimary).toHaveBeenCalledTimes(2);
    });

    it('should stop at default terminators (then)', () => {
      const parser = createMockParser(['foo', 'then', 'bar']);
      const consumer = new TokenConsumer(parser);

      const args = consumer.parseArgsUntilTerminator();

      expect(args).toHaveLength(1);
      expect((args[0] as any).name).toBe('foo');
    });

    it('should stop at default terminators (and)', () => {
      const parser = createMockParser(['foo', 'and', 'bar']);
      const consumer = new TokenConsumer(parser);

      const args = consumer.parseArgsUntilTerminator();

      expect(args).toHaveLength(1);
    });

    it('should stop at default terminators (else)', () => {
      const parser = createMockParser(['foo', 'else', 'bar']);
      const consumer = new TokenConsumer(parser);

      const args = consumer.parseArgsUntilTerminator();

      expect(args).toHaveLength(1);
    });

    it('should stop at default terminators (end)', () => {
      const parser = createMockParser(['foo', 'end']);
      const consumer = new TokenConsumer(parser);

      const args = consumer.parseArgsUntilTerminator();

      expect(args).toHaveLength(1);
    });

    it('should stop at default terminators (on)', () => {
      const parser = createMockParser(['foo', 'on', 'click']);
      const consumer = new TokenConsumer(parser);

      const args = consumer.parseArgsUntilTerminator();

      expect(args).toHaveLength(1);
    });

    it('should stop at additional terminators', () => {
      const parser = createMockParser(['foo', 'to', 'bar']);
      const consumer = new TokenConsumer(parser);

      const args = consumer.parseArgsUntilTerminator({
        additionalTerminators: ['to', 'from'],
      });

      expect(args).toHaveLength(1);
      expect((args[0] as any).name).toBe('foo');
    });

    it('should use parseExpression when allowExpressions is true', () => {
      const parser = createMockParser(['foo']);
      const consumer = new TokenConsumer(parser);

      const args = consumer.parseArgsUntilTerminator({
        allowExpressions: true,
      });

      expect(args).toHaveLength(1);
      expect(parser.parseExpression).toHaveBeenCalledTimes(1);
      expect(parser.parsePrimary).not.toHaveBeenCalled();
    });

    it('should use parsePrimary by default', () => {
      const parser = createMockParser(['foo']);
      const consumer = new TokenConsumer(parser);

      const args = consumer.parseArgsUntilTerminator();

      expect(parser.parsePrimary).toHaveBeenCalledTimes(1);
      expect(parser.parseExpression).not.toHaveBeenCalled();
    });

    it('should stop at command tokens when stopAtCommands is true (default)', () => {
      const parser = createMockParser(['foo', 'toggle', '.active']);
      const consumer = new TokenConsumer(parser);

      const args = consumer.parseArgsUntilTerminator();

      expect(args).toHaveLength(1);
      expect((args[0] as any).name).toBe('foo');
    });

    it('should not stop at command tokens when stopAtCommands is false', () => {
      const parser = createMockParser(['foo', 'toggle']);
      const consumer = new TokenConsumer(parser);

      const args = consumer.parseArgsUntilTerminator({
        stopAtCommands: false,
      });

      expect(args).toHaveLength(2);
    });

    it('should stop when custom stopWhen predicate returns true', () => {
      const parser = createMockParser(['foo', 'bar', 'baz']);
      const consumer = new TokenConsumer(parser);

      const args = consumer.parseArgsUntilTerminator({
        stopWhen: p => p.peek().value === 'bar',
      });

      expect(args).toHaveLength(1);
      expect((args[0] as any).name).toBe('foo');
    });

    it('should return empty array when immediately at terminator', () => {
      const parser = createMockParser(['then', 'foo']);
      const consumer = new TokenConsumer(parser);

      const args = consumer.parseArgsUntilTerminator();

      expect(args).toHaveLength(0);
    });

    it('should return empty array for empty input', () => {
      const parser = createMockParser([]);
      const consumer = new TokenConsumer(parser);

      const args = consumer.parseArgsUntilTerminator();

      expect(args).toHaveLength(0);
    });
  });

  describe('consumeOptionalThe', () => {
    it('should consume "the" and return true', () => {
      const parser = createMockParser(['the', 'element']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.consumeOptionalThe();

      expect(result).toBe(true);
      expect(parser.advance).toHaveBeenCalledTimes(1);
    });

    it('should return false when current token is not "the"', () => {
      const parser = createMockParser(['element']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.consumeOptionalThe();

      expect(result).toBe(false);
      expect(parser.advance).not.toHaveBeenCalled();
    });
  });

  describe('consumeOptionalArticle', () => {
    it('should consume "a" and return "a"', () => {
      const parser = createMockParser(['a', 'request']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.consumeOptionalArticle();

      expect(result).toBe('a');
      expect(parser.advance).toHaveBeenCalledTimes(1);
    });

    it('should consume "an" and return "an"', () => {
      const parser = createMockParser(['an', 'element']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.consumeOptionalArticle();

      expect(result).toBe('an');
      expect(parser.advance).toHaveBeenCalledTimes(1);
    });

    it('should return null when no article present', () => {
      const parser = createMockParser(['element']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.consumeOptionalArticle();

      expect(result).toBeNull();
      expect(parser.advance).not.toHaveBeenCalled();
    });
  });

  describe('parsePrepositionTarget', () => {
    it('should parse preposition and target', () => {
      const parser = createMockParser(['to', 'element']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.parsePrepositionTarget('to');

      expect(result).not.toBeNull();
      expect(result!.preposition).toBe('to');
      expect(result!.target).toBeDefined();
      expect(parser.advance).toHaveBeenCalledTimes(1); // consumes preposition
      expect(parser.parsePrimary).toHaveBeenCalledTimes(1); // parses target
    });

    it('should return null when preposition not found', () => {
      const parser = createMockParser(['from', 'element']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.parsePrepositionTarget('to');

      expect(result).toBeNull();
      expect(parser.advance).not.toHaveBeenCalled();
    });

    it('should use parseExpression when flag is true', () => {
      const parser = createMockParser(['to', 'element']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.parsePrepositionTarget('to', true);

      expect(result).not.toBeNull();
      expect(parser.parseExpression).toHaveBeenCalledTimes(1);
      expect(parser.parsePrimary).not.toHaveBeenCalled();
    });

    it('should use parsePrimary by default', () => {
      const parser = createMockParser(['to', 'element']);
      const consumer = new TokenConsumer(parser);

      consumer.parsePrepositionTarget('to');

      expect(parser.parsePrimary).toHaveBeenCalledTimes(1);
    });
  });

  describe('parseOptionalModifiers', () => {
    it('should parse single modifier', () => {
      const parser = createMockParser(['with', 'options']);
      const consumer = new TokenConsumer(parser);

      const modifiers = consumer.parseOptionalModifiers({ with: false });

      expect(modifiers).toHaveProperty('with');
      expect(parser.parsePrimary).toHaveBeenCalledTimes(1);
    });

    it('should parse multiple modifiers', () => {
      const parser = createMockParser(['with', 'options', 'as', 'json']);
      const consumer = new TokenConsumer(parser);

      const modifiers = consumer.parseOptionalModifiers({
        with: false,
        as: false,
      });

      expect(Object.keys(modifiers)).toHaveLength(2);
      expect(modifiers).toHaveProperty('with');
      expect(modifiers).toHaveProperty('as');
    });

    it('should return empty object when no modifiers found', () => {
      const parser = createMockParser(['foo', 'bar']);
      const consumer = new TokenConsumer(parser);

      const modifiers = consumer.parseOptionalModifiers({ with: false, as: false });

      expect(Object.keys(modifiers)).toHaveLength(0);
    });

    it('should stop when no more prepositions match', () => {
      const parser = createMockParser(['with', 'options', 'foo']);
      const consumer = new TokenConsumer(parser);

      const modifiers = consumer.parseOptionalModifiers({
        with: false,
        as: false,
      });

      expect(Object.keys(modifiers)).toHaveLength(1);
      expect(modifiers).toHaveProperty('with');
    });

    it('should stop at end of input', () => {
      const parser = createMockParser([]);
      const consumer = new TokenConsumer(parser);

      const modifiers = consumer.parseOptionalModifiers({ with: false });

      expect(Object.keys(modifiers)).toHaveLength(0);
    });
  });

  describe('isAtCommandSeparator', () => {
    it('should return true at end of input', () => {
      const parser = createMockParser([]);
      const consumer = new TokenConsumer(parser);

      expect(consumer.isAtCommandSeparator()).toBe(true);
    });

    it('should return true at "then"', () => {
      const parser = createMockParser(['then', 'add']);
      const consumer = new TokenConsumer(parser);

      expect(consumer.isAtCommandSeparator()).toBe(true);
    });

    it('should return true at "and"', () => {
      const parser = createMockParser(['and', 'add']);
      const consumer = new TokenConsumer(parser);

      expect(consumer.isAtCommandSeparator()).toBe(true);
    });

    it('should return true at "end"', () => {
      const parser = createMockParser(['end']);
      const consumer = new TokenConsumer(parser);

      expect(consumer.isAtCommandSeparator()).toBe(true);
    });

    it('should return false for regular tokens', () => {
      const parser = createMockParser(['foo', 'bar']);
      const consumer = new TokenConsumer(parser);

      expect(consumer.isAtCommandSeparator()).toBe(false);
    });
  });

  describe('consumeOptionalSeparator', () => {
    it('should consume "then" and return "then"', () => {
      const parser = createMockParser(['then', 'add']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.consumeOptionalSeparator();

      expect(result).toBe('then');
      expect(parser.advance).toHaveBeenCalledTimes(1);
    });

    it('should consume "and" and return "and"', () => {
      const parser = createMockParser(['and', 'add']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.consumeOptionalSeparator();

      expect(result).toBe('and');
      expect(parser.advance).toHaveBeenCalledTimes(1);
    });

    it('should return null when no separator present', () => {
      const parser = createMockParser(['foo']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.consumeOptionalSeparator();

      expect(result).toBeNull();
      expect(parser.advance).not.toHaveBeenCalled();
    });

    it('should not consume "end"', () => {
      const parser = createMockParser(['end']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.consumeOptionalSeparator();

      expect(result).toBeNull();
      expect(parser.advance).not.toHaveBeenCalled();
    });
  });

  describe('tryParseKeywordPhrase', () => {
    it('should match a full keyword phrase', () => {
      const parser = createMockParser(['at', 'start', 'of']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.tryParseKeywordPhrase(['at', 'start', 'of']);

      expect(result).toBe('at start of');
      expect(parser.advance).toHaveBeenCalledTimes(3);
    });

    it('should return null on partial mismatch', () => {
      const parser = createMockParser(['at', 'end', 'of']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.tryParseKeywordPhrase(['at', 'start', 'of']);

      // Matches 'at' then fails on 'end' != 'start'
      expect(result).toBeNull();
    });

    it('should return null when first keyword does not match', () => {
      const parser = createMockParser(['in', 'start', 'of']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.tryParseKeywordPhrase(['at', 'start', 'of']);

      expect(result).toBeNull();
      expect(parser.advance).not.toHaveBeenCalled();
    });

    it('should handle empty keywords array', () => {
      const parser = createMockParser(['foo']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.tryParseKeywordPhrase([]);

      expect(result).toBe('');
    });

    it('should handle single keyword', () => {
      const parser = createMockParser(['to']);
      const consumer = new TokenConsumer(parser);

      const result = consumer.tryParseKeywordPhrase(['to']);

      expect(result).toBe('to');
      expect(parser.advance).toHaveBeenCalledTimes(1);
    });
  });
});
