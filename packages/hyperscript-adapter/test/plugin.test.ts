import { describe, it, expect, vi } from 'vitest';
import { hyperscriptI18n, preprocess } from '../src/plugin';

// Mock _hyperscript global
function createMockHyperscript() {
  const runtime = {
    getScript: vi.fn((elt: Element) => {
      return elt.getAttribute('_') || null;
    }),
  };
  return {
    internals: { runtime },
    config: {},
  };
}

describe('hyperscriptI18n plugin', () => {
  it('registers without error', () => {
    const hs = createMockHyperscript();
    const plugin = hyperscriptI18n();
    expect(() => plugin(hs)).not.toThrow();
  });

  it('passes through English (no data-lang)', () => {
    const hs = createMockHyperscript();
    hyperscriptI18n()(hs);

    const elt = document.createElement('button');
    elt.setAttribute('_', 'toggle .active');

    const result = hs.internals.runtime.getScript(elt);
    expect(result).toBe('toggle .active');
  });

  it('translates non-English with data-lang', () => {
    const hs = createMockHyperscript();
    hyperscriptI18n()(hs);

    const elt = document.createElement('button');
    elt.setAttribute('_', 'alternar .active');
    elt.setAttribute('data-lang', 'es');

    const result = hs.internals.runtime.getScript(elt);
    expect(result).toBe('toggle .active');
  });

  it('uses defaultLanguage when no data-lang', () => {
    const hs = createMockHyperscript();
    hyperscriptI18n({ defaultLanguage: 'es' })(hs);

    const elt = document.createElement('button');
    elt.setAttribute('_', 'alternar .active');

    const result = hs.internals.runtime.getScript(elt);
    expect(result).toBe('toggle .active');
  });

  it('returns null for elements without script', () => {
    const hs = createMockHyperscript();
    hyperscriptI18n()(hs);

    const elt = document.createElement('div');
    const result = hs.internals.runtime.getScript(elt);
    expect(result).toBe(null);
  });

  it('respects custom languageAttribute', () => {
    const hs = createMockHyperscript();
    hyperscriptI18n({ languageAttribute: 'data-hs-lang' })(hs);

    const elt = document.createElement('button');
    elt.setAttribute('_', 'alternar .active');
    elt.setAttribute('data-hs-lang', 'es');

    const result = hs.internals.runtime.getScript(elt);
    expect(result).toBe('toggle .active');
  });

  it('logs when debug is enabled', () => {
    const hs = createMockHyperscript();
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    hyperscriptI18n({ debug: true })(hs);

    const elt = document.createElement('button');
    elt.setAttribute('_', 'alternar .active');
    elt.setAttribute('data-lang', 'es');

    hs.internals.runtime.getScript(elt);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('[hyperscript-i18n]'),
    );
    consoleSpy.mockRestore();
  });
});

describe('preprocess (standalone)', () => {
  it('translates Spanish to English', () => {
    expect(preprocess('alternar .active', 'es')).toBe('toggle .active');
  });

  it('passes through English', () => {
    const result = preprocess('toggle .active', 'en');
    expect(result).toBe('toggle .active');
  });

  it('handles Japanese', () => {
    expect(preprocess('.active を 切り替え', 'ja')).toBe('toggle .active');
  });
});
