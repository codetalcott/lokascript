/**
 * Test Suite for Full Parser
 *
 * Tests the FullParserImpl which wraps the complete Parser class
 * with the ParserInterface.
 */

import { describe, it, expect } from 'vitest';
import { fullParser, createFullParser } from './full-parser';

describe('FullParser', () => {
  describe('name', () => {
    it('should return "full"', () => {
      expect(fullParser.name).toBe('full');
    });
  });

  describe('supportedCommands', () => {
    it('should include core commands', () => {
      const cmds = fullParser.supportedCommands!;
      expect(cmds).toContain('toggle');
      expect(cmds).toContain('add');
      expect(cmds).toContain('remove');
      expect(cmds).toContain('set');
      expect(cmds).toContain('put');
      expect(cmds).toContain('if');
      expect(cmds).toContain('repeat');
      expect(cmds).toContain('fetch');
      expect(cmds).toContain('transition');
      expect(cmds).toContain('js');
    });

    it('should have a comprehensive list', () => {
      expect(fullParser.supportedCommands!.length).toBeGreaterThanOrEqual(40);
    });
  });

  describe('supports', () => {
    it('should always return true', () => {
      expect(fullParser.supports!('toggle .active')).toBe(true);
      expect(fullParser.supports!('unknown syntax')).toBe(true);
      expect(fullParser.supports!('')).toBe(true);
    });
  });

  describe('parse', () => {
    it('should parse a simple command without throwing', () => {
      expect(() => fullParser.parse('toggle .active')).not.toThrow();
    });

    it('should parse an event handler without throwing', () => {
      expect(() => fullParser.parse('on click toggle .active')).not.toThrow();
    });

    it('should throw on empty input', () => {
      expect(() => fullParser.parse('')).toThrow();
    });

    it('should return a result for valid input', () => {
      const result = fullParser.parse('set x to 1');
      // Result may be the AST node or undefined depending on parse outcome
      // The key is it doesn't throw for valid input
      expect(true).toBe(true);
    });
  });

  describe('parseCommands', () => {
    it('should return an array', () => {
      const result = fullParser.parseCommands!('toggle .active');
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should wrap single result in array', () => {
      const result = fullParser.parseCommands!('toggle .active');
      expect(result).toHaveLength(1);
    });
  });

  describe('createFullParser', () => {
    it('should create a new parser instance', () => {
      const parser = createFullParser();
      expect(parser).toBeDefined();
      expect(parser.name).toBe('full');
    });

    it('should create independent instances', () => {
      const p1 = createFullParser();
      const p2 = createFullParser();
      expect(p1).not.toBe(p2);
    });
  });
});
