/**
 * Unit tests for createSimpleTokenizer factory function.
 */

import { describe, it, expect } from 'vitest';
import { createSimpleTokenizer } from './base-tokenizer';
import type { SimpleTokenizerConfig } from './base-tokenizer';
import type { ValueExtractor, ExtractionResult } from '../../interfaces/value-extractor';

// =============================================================================
// Helpers
// =============================================================================

function makeTokenizer(overrides: Partial<SimpleTokenizerConfig> = {}) {
  return createSimpleTokenizer({
    language: 'en',
    keywords: ['select', 'from', 'where'],
    ...overrides,
  });
}

/** Collect all tokens from a tokenizer run as [value, kind] pairs */
function tokenize(input: string, config?: Partial<SimpleTokenizerConfig>) {
  const t = makeTokenizer(config);
  const stream = t.tokenize(input);
  const tokens: Array<{ value: string; kind: string }> = [];
  while (!stream.isAtEnd()) {
    const tok = stream.advance();
    tokens.push({ value: tok.value, kind: tok.kind });
  }
  return tokens;
}

// =============================================================================
// Tests
// =============================================================================

describe('createSimpleTokenizer', () => {
  // ---------------------------------------------------------------------------
  // Keyword classification
  // ---------------------------------------------------------------------------
  describe('keyword classification', () => {
    it('recognizes keywords case-insensitively by default', () => {
      const t = makeTokenizer();
      expect(t.classifyToken('select')).toBe('keyword');
      expect(t.classifyToken('SELECT')).toBe('keyword');
      expect(t.classifyToken('Select')).toBe('keyword');
    });

    it('recognizes keywords case-sensitively when caseInsensitive: false', () => {
      const t = makeTokenizer({ caseInsensitive: false });
      expect(t.classifyToken('select')).toBe('keyword');
      expect(t.classifyToken('SELECT')).toBe('identifier');
    });

    it('classifies non-keywords as identifier', () => {
      const t = makeTokenizer();
      expect(t.classifyToken('users')).toBe('identifier');
      expect(t.classifyToken('name')).toBe('identifier');
    });
  });

  // ---------------------------------------------------------------------------
  // Operator classification
  // ---------------------------------------------------------------------------
  describe('operator classification', () => {
    it('classifies operators when includeOperators: true', () => {
      const t = makeTokenizer({ includeOperators: true });
      expect(t.classifyToken('=')).toBe('operator');
      expect(t.classifyToken('+')).toBe('operator');
      expect(t.classifyToken('>')).toBe('operator');
    });

    it('classifies operators as identifier when includeOperators: false', () => {
      const t = makeTokenizer({ includeOperators: false });
      expect(t.classifyToken('=')).toBe('identifier');
      expect(t.classifyToken('+')).toBe('identifier');
    });

    it('classifies multi-char operators', () => {
      const t = makeTokenizer({ includeOperators: true });
      expect(t.classifyToken('>=')).toBe('operator');
      expect(t.classifyToken('!=')).toBe('operator');
      expect(t.classifyToken('==')).toBe('operator');
    });

    it('classifies broader operators from DEFAULT_OPERATORS', () => {
      const t = makeTokenizer({ includeOperators: true });
      expect(t.classifyToken('&&')).toBe('operator');
      expect(t.classifyToken('||')).toBe('operator');
      expect(t.classifyToken('%')).toBe('operator');
    });

    it('defaults includeOperators to false', () => {
      const t = makeTokenizer();
      expect(t.classifyToken('+')).toBe('identifier');
    });
  });

  // ---------------------------------------------------------------------------
  // Literal classification
  // ---------------------------------------------------------------------------
  describe('literal classification', () => {
    it('classifies digit-starting tokens as literal', () => {
      const t = makeTokenizer();
      expect(t.classifyToken('42')).toBe('literal');
      expect(t.classifyToken('3.14')).toBe('literal');
    });

    it('classifies quote-starting tokens as literal', () => {
      const t = makeTokenizer();
      expect(t.classifyToken("'hello'")).toBe('literal');
      expect(t.classifyToken('"world"')).toBe('literal');
    });
  });

  // ---------------------------------------------------------------------------
  // Full tokenization
  // ---------------------------------------------------------------------------
  describe('tokenization', () => {
    it('tokenizes simple input into keyword and identifier tokens', () => {
      const tokens = tokenize('select name from users');
      expect(tokens).toEqual([
        { value: 'select', kind: 'keyword' },
        { value: 'name', kind: 'identifier' },
        { value: 'from', kind: 'keyword' },
        { value: 'users', kind: 'identifier' },
      ]);
    });

    it('skips whitespace between tokens', () => {
      const tokens = tokenize('select   name');
      expect(tokens.map(t => t.value)).toEqual(['select', 'name']);
    });

    it('tokenizes string literals', () => {
      const tokens = tokenize("where 'hello'");
      const kinds = tokens.map(t => t.kind);
      expect(kinds).toContain('keyword'); // where
      expect(kinds).toContain('literal'); // 'hello'
    });

    it('tokenizes numbers', () => {
      const tokens = tokenize('select 42');
      expect(tokens[1]).toMatchObject({ value: '42', kind: 'literal' });
    });

    it('produces tokens with positions', () => {
      const t = makeTokenizer();
      const stream = t.tokenize('select name');
      const first = stream.advance();
      expect(first).toBeDefined();
      expect(first.position.start).toBe(0);
      expect(first.position.end).toBe(6);
    });
  });

  // ---------------------------------------------------------------------------
  // Profile-based keywords (non-Latin)
  // ---------------------------------------------------------------------------
  describe('profile-based keywords', () => {
    const jaConfig: Partial<SimpleTokenizerConfig> = {
      language: 'ja',
      keywords: ['選択', 'から', '条件'],
      keywordExtras: [
        { native: '選択', normalized: 'select' },
        { native: 'から', normalized: 'from' },
        { native: '条件', normalized: 'where' },
      ],
      keywordProfile: {
        keywords: {
          select: { primary: '選択' },
          from: { primary: 'から' },
          where: { primary: '条件' },
        },
      },
      caseInsensitive: false,
    };

    it('recognizes non-Latin keywords from config.keywords', () => {
      const t = makeTokenizer(jaConfig);
      expect(t.classifyToken('選択')).toBe('keyword');
      expect(t.classifyToken('から')).toBe('keyword');
    });

    it('recognizes keywords via profile path (isKeyword)', () => {
      // Create a tokenizer where a keyword is ONLY in the profile, not in keywords[]
      const t = makeTokenizer({
        language: 'ja',
        keywords: [], // empty — no fast-path keywords
        keywordProfile: {
          keywords: {
            select: { primary: '選択' },
          },
        },
        caseInsensitive: false,
      });
      expect(t.classifyToken('選択')).toBe('keyword');
    });

    it('classifies unknown tokens as identifier', () => {
      const t = makeTokenizer(jaConfig);
      expect(t.classifyToken('ユーザー')).toBe('identifier');
    });
  });

  // ---------------------------------------------------------------------------
  // Custom extractors
  // ---------------------------------------------------------------------------
  describe('custom extractors', () => {
    it('custom extractors take priority over defaults', () => {
      // Custom extractor that captures @-mentions
      const mentionExtractor: ValueExtractor = {
        name: 'mention',
        canExtract(input: string, pos: number) {
          return input[pos] === '@';
        },
        extract(input: string, pos: number): ExtractionResult | null {
          let end = pos + 1;
          while (end < input.length && /\w/.test(input[end])) end++;
          if (end === pos + 1) return null;
          return { value: input.slice(pos, end), length: end - pos };
        },
      };

      const tokens = tokenize('select @user', {
        customExtractors: [mentionExtractor],
      });

      expect(tokens[0]).toMatchObject({ value: 'select', kind: 'keyword' });
      // @user extracted by custom extractor before default identifier extractor
      expect(tokens[1]).toMatchObject({ value: '@user' });
    });
  });

  // ---------------------------------------------------------------------------
  // Direction
  // ---------------------------------------------------------------------------
  describe('direction', () => {
    it('defaults to ltr', () => {
      const t = makeTokenizer();
      expect(t.direction).toBe('ltr');
    });

    it('can be set to rtl', () => {
      const t = makeTokenizer({ direction: 'rtl' });
      expect(t.direction).toBe('rtl');
    });
  });

  // ---------------------------------------------------------------------------
  // Language property
  // ---------------------------------------------------------------------------
  describe('language', () => {
    it('exposes the configured language', () => {
      const t = makeTokenizer({ language: 'es' });
      expect(t.language).toBe('es');
    });
  });
});
