/**
 * Test Suite for ParserInterface
 *
 * Tests the isParserInterface type guard function.
 */

import { describe, it, expect } from 'vitest';
import { isParserInterface } from './parser-interface';

describe('isParserInterface', () => {
  it('should return true for a valid parser object', () => {
    const parser = {
      name: 'test-parser',
      parse: () => ({ type: 'Command', name: 'test' }),
    };

    expect(isParserInterface(parser)).toBe(true);
  });

  it('should return true when optional methods are present', () => {
    const parser = {
      name: 'full-parser',
      parse: () => ({ type: 'Command', name: 'test' }),
      parseCommands: () => [],
      supports: () => true,
      supportedCommands: ['toggle', 'add'],
    };

    expect(isParserInterface(parser)).toBe(true);
  });

  it('should return false when parse is missing', () => {
    const parser = {
      name: 'test-parser',
    };

    expect(isParserInterface(parser)).toBe(false);
  });

  it('should return false when parse is not a function', () => {
    const parser = {
      name: 'test-parser',
      parse: 'not-a-function',
    };

    expect(isParserInterface(parser)).toBe(false);
  });

  it('should return false when name is missing', () => {
    const parser = {
      parse: () => ({ type: 'Command', name: 'test' }),
    };

    expect(isParserInterface(parser)).toBe(false);
  });

  it('should return false when name is not a string', () => {
    const parser = {
      name: 42,
      parse: () => ({ type: 'Command', name: 'test' }),
    };

    expect(isParserInterface(parser)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isParserInterface(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isParserInterface(undefined)).toBe(false);
  });

  it('should return false for a string', () => {
    expect(isParserInterface('parser')).toBe(false);
  });

  it('should return false for a number', () => {
    expect(isParserInterface(42)).toBe(false);
  });

  it('should return false for an empty object', () => {
    expect(isParserInterface({})).toBe(false);
  });

  it('should return false for an array', () => {
    expect(isParserInterface([])).toBe(false);
  });

  it('should return true for name as empty string (still a string)', () => {
    const parser = {
      name: '',
      parse: () => ({ type: 'Command', name: 'test' }),
    };

    expect(isParserInterface(parser)).toBe(true);
  });
});
