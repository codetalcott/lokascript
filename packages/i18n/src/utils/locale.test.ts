import { describe, it, expect } from 'vitest';
import { parseLocale, getBestMatchingLocale, formatLocaleName } from './locale';

describe('parseLocale', () => {
  it('parses simple language codes', () => {
    const result = parseLocale('en');
    expect(result.language).toBe('en');
    expect(result.region).toBeUndefined();
    expect(result.script).toBeUndefined();
  });

  it('parses language-region codes', () => {
    const result = parseLocale('en-US');
    expect(result.language).toBe('en');
    expect(result.region).toBe('US');
    expect(result.script).toBeUndefined();
  });

  it('parses language-script-region codes', () => {
    const result = parseLocale('zh-Hans-CN');
    expect(result.language).toBe('zh');
    expect(result.script).toBe('Hans');
    expect(result.region).toBe('CN');
  });

  it('parses language-script without region', () => {
    const result = parseLocale('zh-Hans');
    expect(result.language).toBe('zh');
    expect(result.script).toBe('Hans');
    expect(result.region).toBeUndefined();
  });

  it('normalizes language to lowercase and region to uppercase', () => {
    const result = parseLocale('EN-us');
    expect(result.language).toBe('en');
    expect(result.region).toBe('US');
  });
});

describe('getBestMatchingLocale', () => {
  const available = ['en', 'fr', 'zh-Hans', 'zh-Hant', 'es'];

  it('returns exact match', () => {
    expect(getBestMatchingLocale('en', available)).toBe('en');
  });

  it('returns script match over language-only match', () => {
    expect(getBestMatchingLocale('zh-Hans-CN', available)).toBe('zh-Hans');
  });

  it('falls back to language-only match', () => {
    expect(getBestMatchingLocale('fr-CA', available)).toBe('fr');
  });

  it('returns null when no match', () => {
    expect(getBestMatchingLocale('de', available)).toBeNull();
  });

  it('prefers script match when available', () => {
    expect(getBestMatchingLocale('zh-Hant-TW', available)).toBe('zh-Hant');
  });
});

describe('formatLocaleName', () => {
  it('returns native name from grammar profile', () => {
    expect(formatLocaleName('ja')).toBe('日本語');
    expect(formatLocaleName('ko')).toBe('한국어');
    expect(formatLocaleName('es')).toBe('Español');
    expect(formatLocaleName('ar')).toBe('العربية');
    expect(formatLocaleName('en')).toBe('English');
  });

  it('returns locale code for unknown locales', () => {
    expect(formatLocaleName('xx')).toBe('xx');
    expect(formatLocaleName('unknown')).toBe('unknown');
  });

  it('covers all 22 supported languages', () => {
    const codes = [
      'en',
      'es',
      'ja',
      'ko',
      'zh',
      'fr',
      'de',
      'ar',
      'tr',
      'pt',
      'id',
      'qu',
      'sw',
      'bn',
      'it',
      'ru',
      'uk',
      'vi',
      'hi',
      'tl',
      'th',
      'pl',
    ];
    for (const code of codes) {
      const name = formatLocaleName(code);
      expect(name).not.toBe(code); // Should return a real name, not the code itself
    }
  });
});
