import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { resolveLanguage } from '../src/language-resolver';

// Minimal DOM mock for testing
function createElement(
  tag: string,
  attrs: Record<string, string> = {},
  parent?: Element,
): Element {
  const elt = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    elt.setAttribute(key, value);
  }
  if (parent) {
    parent.appendChild(elt);
  }
  return elt;
}

describe('resolveLanguage', () => {
  it('returns data-lang from element', () => {
    const elt = createElement('button', { 'data-lang': 'ja' });
    expect(resolveLanguage(elt)).toBe('ja');
  });

  it('normalizes BCP-47 tags', () => {
    const elt = createElement('button', { 'data-lang': 'zh-Hans' });
    expect(resolveLanguage(elt)).toBe('zh');
  });

  it('returns data-hyperscript-lang from element', () => {
    const elt = createElement('button', { 'data-hyperscript-lang': 'ko' });
    expect(resolveLanguage(elt)).toBe('ko');
  });

  it('prefers data-lang over data-hyperscript-lang', () => {
    const elt = createElement('button', {
      'data-lang': 'ja',
      'data-hyperscript-lang': 'ko',
    });
    expect(resolveLanguage(elt)).toBe('ja');
  });

  it('inherits data-hyperscript-lang from ancestor', () => {
    const container = createElement('div', { 'data-hyperscript-lang': 'es' });
    document.body.appendChild(container);
    const elt = createElement('button', {}, container);
    expect(resolveLanguage(elt)).toBe('es');
    document.body.removeChild(container);
  });

  it('returns null for English elements (no preprocessing needed)', () => {
    const elt = createElement('button', {});
    // No language attribute set, document.documentElement.lang is empty
    expect(resolveLanguage(elt)).toBe(null);
  });

  it('reads document lang attribute', () => {
    const original = document.documentElement.lang;
    document.documentElement.lang = 'fr';
    try {
      const elt = createElement('button', {});
      document.body.appendChild(elt);
      expect(resolveLanguage(elt)).toBe('fr');
      document.body.removeChild(elt);
    } finally {
      document.documentElement.lang = original;
    }
  });

  it('ignores document lang=en', () => {
    const original = document.documentElement.lang;
    document.documentElement.lang = 'en';
    try {
      const elt = createElement('button', {});
      expect(resolveLanguage(elt)).toBe(null);
    } finally {
      document.documentElement.lang = original;
    }
  });
});
