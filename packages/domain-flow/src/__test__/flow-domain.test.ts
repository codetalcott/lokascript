/**
 * FlowScript Domain Tests
 *
 * Validates the multilingual FlowScript DSL across 4 languages (EN, ES, JA, AR)
 * covering SVO, SOV, and VSO word orders.
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createFlowDSL, renderFlow, toFlowSpec } from '../index.js';
import type { MultilingualDSL } from '@lokascript/framework';
import { extractRoleValue } from '@lokascript/framework';
import type { FlowSpec } from '../types.js';
import { parseDuration } from '../generators/flow-generator.js';

describe('FlowScript Domain', () => {
  let flow: MultilingualDSL;

  beforeAll(() => {
    flow = createFlowDSL();
  });

  // ===========================================================================
  // Language Support
  // ===========================================================================

  describe('Language Support', () => {
    it('should support 4 languages', () => {
      const languages = flow.getSupportedLanguages();
      expect(languages).toContain('en');
      expect(languages).toContain('es');
      expect(languages).toContain('ja');
      expect(languages).toContain('ar');
      expect(languages).toHaveLength(4);
    });

    it('should reject unsupported language', () => {
      expect(() => flow.parse('fetch /api/users', 'de')).toThrow();
    });
  });

  // ===========================================================================
  // Duration Parsing
  // ===========================================================================

  describe('Duration Parsing', () => {
    it('should parse milliseconds', () => {
      expect(parseDuration('500ms')).toBe(500);
    });

    it('should parse seconds', () => {
      expect(parseDuration('5s')).toBe(5000);
    });

    it('should parse minutes', () => {
      expect(parseDuration('1m')).toBe(60000);
    });

    it('should parse hours', () => {
      expect(parseDuration('1h')).toBe(3600000);
    });

    it('should parse plain numbers as ms', () => {
      expect(parseDuration('1000')).toBe(1000);
    });
  });

  // ===========================================================================
  // English (SVO) — fetch
  // ===========================================================================

  describe('English — fetch', () => {
    it('should parse simple fetch', () => {
      const node = flow.parse('fetch /api/users', 'en');
      expect(node.action).toBe('fetch');
      expect(extractRoleValue(node, 'source')).toBe('/api/users');
    });

    it('should parse fetch with format', () => {
      const node = flow.parse('fetch /api/users as json', 'en');
      expect(node.action).toBe('fetch');
      expect(extractRoleValue(node, 'source')).toBe('/api/users');
      expect(extractRoleValue(node, 'style')).toBe('json');
    });

    it('should parse fetch with target', () => {
      const node = flow.parse('fetch /api/users as json into #user-list', 'en');
      expect(extractRoleValue(node, 'source')).toBe('/api/users');
      expect(extractRoleValue(node, 'style')).toBe('json');
      expect(extractRoleValue(node, 'destination')).toBe('#user-list');
    });

    it('should compile fetch to JS', () => {
      const result = flow.compile('fetch /api/users as json into #user-list', 'en');
      expect(result.ok).toBe(true);
      expect(result.code).toContain("fetch('/api/users')");
      expect(result.code).toContain('.json()');
      expect(result.code).toContain('#user-list');
    });

    it('should produce correct FlowSpec', () => {
      const node = flow.parse('fetch /api/users as json into #user-list', 'en');
      const spec = toFlowSpec(node, 'en');
      expect(spec.action).toBe('fetch');
      expect(spec.url).toBe('/api/users');
      expect(spec.responseFormat).toBe('json');
      expect(spec.target).toBe('#user-list');
      expect(spec.method).toBe('GET');
    });
  });

  // ===========================================================================
  // English (SVO) — poll
  // ===========================================================================

  describe('English — poll', () => {
    it('should parse poll with interval', () => {
      const node = flow.parse('poll /api/status every 5s', 'en');
      expect(node.action).toBe('poll');
      expect(extractRoleValue(node, 'source')).toBe('/api/status');
      expect(extractRoleValue(node, 'duration')).toBe('5s');
    });

    it('should parse poll with target', () => {
      const node = flow.parse('poll /api/status every 5s into #dashboard', 'en');
      expect(extractRoleValue(node, 'destination')).toBe('#dashboard');
    });

    it('should compile poll to JS with setInterval', () => {
      const result = flow.compile('poll /api/status every 5s into #dashboard', 'en');
      expect(result.ok).toBe(true);
      expect(result.code).toContain('setInterval');
      expect(result.code).toContain("fetch('/api/status')");
      expect(result.code).toContain('5000');
      expect(result.code).toContain('#dashboard');
    });

    it('should produce correct FlowSpec for poll', () => {
      const node = flow.parse('poll /api/status every 5s into #dashboard', 'en');
      const spec = toFlowSpec(node, 'en');
      expect(spec.action).toBe('poll');
      expect(spec.url).toBe('/api/status');
      expect(spec.intervalMs).toBe(5000);
      expect(spec.target).toBe('#dashboard');
    });
  });

  // ===========================================================================
  // English (SVO) — stream
  // ===========================================================================

  describe('English — stream', () => {
    it('should parse stream', () => {
      const node = flow.parse('stream /api/events as sse into #event-log', 'en');
      expect(node.action).toBe('stream');
      expect(extractRoleValue(node, 'source')).toBe('/api/events');
      expect(extractRoleValue(node, 'style')).toBe('sse');
      expect(extractRoleValue(node, 'destination')).toBe('#event-log');
    });

    it('should compile stream to EventSource', () => {
      const result = flow.compile('stream /api/events as sse into #event-log', 'en');
      expect(result.ok).toBe(true);
      expect(result.code).toContain('EventSource');
      expect(result.code).toContain('/api/events');
      expect(result.code).toContain('#event-log');
    });

    it('should produce sse responseFormat in FlowSpec', () => {
      const node = flow.parse('stream /api/events as sse', 'en');
      const spec = toFlowSpec(node, 'en');
      expect(spec.responseFormat).toBe('sse');
    });
  });

  // ===========================================================================
  // English (SVO) — submit
  // ===========================================================================

  describe('English — submit', () => {
    it('should parse submit', () => {
      const node = flow.parse('submit #checkout to /api/order as json', 'en');
      expect(node.action).toBe('submit');
      expect(extractRoleValue(node, 'patient')).toBe('#checkout');
      expect(extractRoleValue(node, 'destination')).toBe('/api/order');
      expect(extractRoleValue(node, 'style')).toBe('json');
    });

    it('should compile submit to POST fetch', () => {
      const result = flow.compile('submit #checkout to /api/order as json', 'en');
      expect(result.ok).toBe(true);
      expect(result.code).toContain("method: 'POST'");
      expect(result.code).toContain('/api/order');
      expect(result.code).toContain('application/json');
    });

    it('should produce POST method in FlowSpec', () => {
      const node = flow.parse('submit #checkout to /api/order', 'en');
      const spec = toFlowSpec(node, 'en');
      expect(spec.method).toBe('POST');
      expect(spec.formSelector).toBe('#checkout');
    });
  });

  // ===========================================================================
  // English (SVO) — transform
  // ===========================================================================

  describe('English — transform', () => {
    it('should parse transform', () => {
      const node = flow.parse('transform data with uppercase', 'en');
      expect(node.action).toBe('transform');
      expect(extractRoleValue(node, 'patient')).toBe('data');
      expect(extractRoleValue(node, 'instrument')).toBe('uppercase');
    });

    it('should compile transform to function call', () => {
      const result = flow.compile('transform data with uppercase', 'en');
      expect(result.ok).toBe(true);
      expect(result.code).toContain('uppercase');
      expect(result.code).toContain('data');
    });
  });

  // ===========================================================================
  // Spanish (SVO)
  // ===========================================================================

  describe('Spanish (SVO)', () => {
    it('should parse fetch in Spanish', () => {
      const node = flow.parse('obtener /api/users como json en #user-list', 'es');
      expect(node.action).toBe('fetch');
      expect(extractRoleValue(node, 'source')).toBe('/api/users');
      expect(extractRoleValue(node, 'style')).toBe('json');
      expect(extractRoleValue(node, 'destination')).toBe('#user-list');
    });

    it('should parse poll in Spanish', () => {
      const node = flow.parse('sondear /api/status cada 5s', 'es');
      expect(node.action).toBe('poll');
      expect(extractRoleValue(node, 'source')).toBe('/api/status');
      expect(extractRoleValue(node, 'duration')).toBe('5s');
    });

    it('should parse submit in Spanish', () => {
      const node = flow.parse('enviar #checkout a /api/order como json', 'es');
      expect(node.action).toBe('submit');
      expect(extractRoleValue(node, 'patient')).toBe('#checkout');
      expect(extractRoleValue(node, 'destination')).toBe('/api/order');
    });

    it('should compile Spanish fetch to same JS as English', () => {
      const enResult = flow.compile('fetch /api/users as json into #user-list', 'en');
      const esResult = flow.compile('obtener /api/users como json en #user-list', 'es');
      expect(enResult.ok).toBe(true);
      expect(esResult.ok).toBe(true);
      // Same JS output regardless of source language
      expect(enResult.code).toBe(esResult.code);
    });
  });

  // ===========================================================================
  // Japanese (SOV)
  // ===========================================================================

  describe('Japanese (SOV)', () => {
    it('should parse fetch in Japanese SOV order', () => {
      const node = flow.parse('/api/users json で 取得', 'ja');
      expect(node.action).toBe('fetch');
      expect(extractRoleValue(node, 'source')).toBe('/api/users');
      expect(extractRoleValue(node, 'style')).toBe('json');
    });

    it('should parse poll in Japanese', () => {
      const node = flow.parse('/api/status 5s ごとに ポーリング', 'ja');
      expect(node.action).toBe('poll');
      expect(extractRoleValue(node, 'source')).toBe('/api/status');
      expect(extractRoleValue(node, 'duration')).toBe('5s');
    });

    it('should produce same FlowSpec as English', () => {
      const enNode = flow.parse('fetch /api/users as json', 'en');
      const jaNode = flow.parse('/api/users json で 取得', 'ja');
      const enSpec = toFlowSpec(enNode, 'en');
      const jaSpec = toFlowSpec(jaNode, 'ja');
      expect(enSpec.action).toBe(jaSpec.action);
      expect(enSpec.url).toBe(jaSpec.url);
      expect(enSpec.responseFormat).toBe(jaSpec.responseFormat);
    });
  });

  // ===========================================================================
  // Arabic (VSO)
  // ===========================================================================

  describe('Arabic (VSO)', () => {
    it('should parse fetch in Arabic VSO order', () => {
      const node = flow.parse('جلب /api/users ك json في #user-list', 'ar');
      expect(node.action).toBe('fetch');
      expect(extractRoleValue(node, 'source')).toBe('/api/users');
      expect(extractRoleValue(node, 'style')).toBe('json');
      expect(extractRoleValue(node, 'destination')).toBe('#user-list');
    });

    it('should parse stream in Arabic', () => {
      const node = flow.parse('بث /api/events ك sse في #event-log', 'ar');
      expect(node.action).toBe('stream');
      expect(extractRoleValue(node, 'source')).toBe('/api/events');
    });

    it('should produce same FlowSpec as English', () => {
      const enNode = flow.parse('fetch /api/users as json into #user-list', 'en');
      const arNode = flow.parse('جلب /api/users ك json في #user-list', 'ar');
      const enSpec = toFlowSpec(enNode, 'en');
      const arSpec = toFlowSpec(arNode, 'ar');
      expect(enSpec.action).toBe(arSpec.action);
      expect(enSpec.url).toBe(arSpec.url);
      expect(enSpec.responseFormat).toBe(arSpec.responseFormat);
      expect(enSpec.target).toBe(arSpec.target);
    });
  });

  // ===========================================================================
  // Validation / Error Handling
  // ===========================================================================

  describe('Validation', () => {
    it('should validate correct fetch syntax', () => {
      const result = flow.validate('fetch /api/users as json', 'en');
      expect(result.valid).toBe(true);
    });

    it('should return ok=false for invalid input', () => {
      const result = flow.compile('gobbledygook nonsense', 'en');
      expect(result.ok).toBe(false);
    });

    it('should handle URLs with path params', () => {
      const node = flow.parse('fetch /api/users/{id}', 'en');
      expect(extractRoleValue(node, 'source')).toBe('/api/users/{id}');
    });

    it('should handle URLs with query params', () => {
      const node = flow.parse('fetch /api/search?q=hello', 'en');
      expect(extractRoleValue(node, 'source')).toBe('/api/search?q=hello');
    });
  });

  // ===========================================================================
  // Natural Language Renderer
  // ===========================================================================

  describe('Renderer', () => {
    it('should render fetch to English', () => {
      const node = flow.parse('fetch /api/users as json into #user-list', 'en');
      const rendered = renderFlow(node, 'en');
      expect(rendered).toContain('fetch');
      expect(rendered).toContain('/api/users');
      expect(rendered).toContain('json');
      expect(rendered).toContain('#user-list');
    });

    it('should render fetch to Japanese SOV', () => {
      const node = flow.parse('fetch /api/users as json', 'en');
      const rendered = renderFlow(node, 'ja');
      expect(rendered).toContain('取得');
      expect(rendered).toContain('/api/users');
    });

    it('should render poll to Spanish', () => {
      const node = flow.parse('poll /api/status every 5s into #dashboard', 'en');
      const rendered = renderFlow(node, 'es');
      expect(rendered).toContain('sondear');
      expect(rendered).toContain('cada');
    });

    it('should render fetch to Arabic VSO', () => {
      const node = flow.parse('fetch /api/users as json into #user-list', 'en');
      const rendered = renderFlow(node, 'ar');
      expect(rendered).toContain('جلب');
      expect(rendered).toContain('/api/users');
      expect(rendered).toContain('ك');
      expect(rendered).toContain('في');
    });

    it('should render submit to Arabic VSO', () => {
      const node = flow.parse('submit #checkout to /api/order as json', 'en');
      const rendered = renderFlow(node, 'ar');
      expect(rendered).toContain('أرسل');
      expect(rendered).toContain('إلى');
      expect(rendered).toContain('/api/order');
    });

    it('should render transform to Arabic', () => {
      const node = flow.parse('transform data with uppercase', 'en');
      const rendered = renderFlow(node, 'ar');
      expect(rendered).toContain('حوّل');
      expect(rendered).toContain('ب');
    });

    it('should render stream to Arabic VSO', () => {
      const node = flow.parse('stream /api/events as sse into #event-log', 'en');
      const rendered = renderFlow(node, 'ar');
      expect(rendered).toContain('بث');
      expect(rendered).toContain('/api/events');
    });

    it('should round-trip Arabic render through parser', () => {
      const enNode = flow.parse('fetch /api/users as json into #user-list', 'en');
      const arText = renderFlow(enNode, 'ar');
      const arNode = flow.parse(arText, 'ar');
      expect(arNode.action).toBe('fetch');
      expect(extractRoleValue(arNode, 'source')).toBe('/api/users');
      expect(extractRoleValue(arNode, 'style')).toBe('json');
      expect(extractRoleValue(arNode, 'destination')).toBe('#user-list');
    });
  });

  // ===========================================================================
  // Poll with Format
  // ===========================================================================

  describe('Poll with responseFormat', () => {
    it('should compile poll with json format', () => {
      const result = flow.compile('poll /api/status every 5s as json into #dashboard', 'en');
      expect(result.ok).toBe(true);
      expect(result.code).toContain('.json()');
      expect(result.code).toContain('JSON.stringify');
    });

    it('should compile poll without format as text', () => {
      const result = flow.compile('poll /api/status every 5s into #dashboard', 'en');
      expect(result.ok).toBe(true);
      expect(result.code).toContain('.text()');
      expect(result.code).not.toContain('.json()');
    });
  });
});
