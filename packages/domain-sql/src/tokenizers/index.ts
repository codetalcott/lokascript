/**
 * SQL Tokenizers
 *
 * Language-specific tokenizers for SQL input. Each tokenizer extends
 * the framework's BaseTokenizer and uses the default generic extractors.
 */

import { BaseTokenizer, getDefaultExtractors } from '@lokascript/framework';
import type { TokenKind, KeywordEntry } from '@lokascript/framework';

// =============================================================================
// English SQL Tokenizer
// =============================================================================

const EN_KEYWORDS = new Set([
  'select',
  'insert',
  'update',
  'delete',
  'from',
  'into',
  'where',
  'set',
  'values',
  'and',
  'or',
  'not',
  'null',
  'true',
  'false',
]);

export class EnglishSQLTokenizer extends BaseTokenizer {
  readonly language = 'en';
  readonly direction = 'ltr' as const;

  constructor() {
    super();
    this.registerExtractors(getDefaultExtractors());
  }

  classifyToken(token: string): TokenKind {
    if (EN_KEYWORDS.has(token.toLowerCase())) return 'keyword';
    if (/^\d/.test(token)) return 'literal';
    if (/^['"]/.test(token)) return 'literal';
    if (['>', '<', '=', '>=', '<=', '!=', '==', '+', '-', '*', '/'].includes(token))
      return 'operator';
    return 'identifier';
  }
}

// =============================================================================
// Spanish SQL Tokenizer
// =============================================================================

const ES_KEYWORDS = new Set([
  'seleccionar',
  'insertar',
  'actualizar',
  'eliminar',
  'de',
  'en',
  'donde',
  'establecer',
  'valores',
  'y',
  'o',
  'no',
  'nulo',
  'verdadero',
  'falso',
]);

export class SpanishSQLTokenizer extends BaseTokenizer {
  readonly language = 'es';
  readonly direction = 'ltr' as const;

  constructor() {
    super();
    this.registerExtractors(getDefaultExtractors());
  }

  classifyToken(token: string): TokenKind {
    if (ES_KEYWORDS.has(token.toLowerCase())) return 'keyword';
    if (/^\d/.test(token)) return 'literal';
    if (/^['"]/.test(token)) return 'literal';
    if (['>', '<', '=', '>=', '<=', '!=', '==', '+', '-', '*', '/'].includes(token))
      return 'operator';
    return 'identifier';
  }
}

// =============================================================================
// Japanese SQL Tokenizer
// =============================================================================

const JA_KEYWORDS = new Set([
  '選択',
  '挿入',
  '更新',
  '削除',
  'から',
  'に',
  '条件',
  '設定',
  '値',
  'と',
  'または',
  'ない',
  'ヌル',
]);

const JA_KEYWORD_EXTRAS: KeywordEntry[] = [
  { native: '選択', normalized: 'select' },
  { native: '挿入', normalized: 'insert' },
  { native: '更新', normalized: 'update' },
  { native: '削除', normalized: 'delete' },
  { native: 'から', normalized: 'from' },
  { native: 'に', normalized: 'into' },
  { native: '条件', normalized: 'where' },
  { native: '設定', normalized: 'set' },
];

export class JapaneseSQLTokenizer extends BaseTokenizer {
  readonly language = 'ja';
  readonly direction = 'ltr' as const;

  constructor() {
    super();
    this.registerExtractors(getDefaultExtractors());
    this.initializeKeywordsFromProfile(
      {
        keywords: {
          select: { primary: '選択' },
          insert: { primary: '挿入' },
          update: { primary: '更新' },
          delete: { primary: '削除' },
        },
      },
      JA_KEYWORD_EXTRAS
    );
  }

  classifyToken(token: string): TokenKind {
    if (JA_KEYWORDS.has(token)) return 'keyword';
    if (this.isKeyword(token)) return 'keyword';
    if (/^\d/.test(token)) return 'literal';
    if (/^['"]/.test(token)) return 'literal';
    if (['>', '<', '=', '>=', '<=', '!=', '==', '+', '-', '*', '/'].includes(token))
      return 'operator';
    return 'identifier';
  }
}

// =============================================================================
// Arabic SQL Tokenizer
// =============================================================================

const AR_KEYWORDS = new Set([
  'اختر',
  'أدخل',
  'حدّث',
  'احذف',
  'من',
  'في',
  'حيث',
  'عيّن',
  'قيم',
  'و',
  'أو',
  'ليس',
  'فارغ',
]);

const AR_KEYWORD_EXTRAS: KeywordEntry[] = [
  { native: 'اختر', normalized: 'select' },
  { native: 'أدخل', normalized: 'insert' },
  { native: 'حدّث', normalized: 'update' },
  { native: 'احذف', normalized: 'delete' },
  { native: 'من', normalized: 'from' },
  { native: 'في', normalized: 'into' },
  { native: 'حيث', normalized: 'where' },
  { native: 'عيّن', normalized: 'set' },
];

export class ArabicSQLTokenizer extends BaseTokenizer {
  readonly language = 'ar';
  readonly direction = 'rtl' as const;

  constructor() {
    super();
    this.registerExtractors(getDefaultExtractors());
    this.initializeKeywordsFromProfile(
      {
        keywords: {
          select: { primary: 'اختر' },
          insert: { primary: 'أدخل' },
          update: { primary: 'حدّث' },
          delete: { primary: 'احذف' },
        },
      },
      AR_KEYWORD_EXTRAS
    );
  }

  classifyToken(token: string): TokenKind {
    if (AR_KEYWORDS.has(token)) return 'keyword';
    if (this.isKeyword(token)) return 'keyword';
    if (/^\d/.test(token)) return 'literal';
    if (/^['"]/.test(token)) return 'literal';
    if (['>', '<', '=', '>=', '<=', '!=', '==', '+', '-', '*', '/'].includes(token))
      return 'operator';
    return 'identifier';
  }
}

// =============================================================================
// Exports
// =============================================================================

export const englishTokenizer = new EnglishSQLTokenizer();
export const spanishTokenizer = new SpanishSQLTokenizer();
export const japaneseTokenizer = new JapaneseSQLTokenizer();
export const arabicTokenizer = new ArabicSQLTokenizer();
