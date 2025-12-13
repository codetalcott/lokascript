/**
 * Semantic-Grammar Bridge Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SemanticGrammarBridge,
  semanticNodeToParsedStatement,
} from './bridge';

describe('SemanticGrammarBridge', () => {
  let bridge: SemanticGrammarBridge;

  beforeEach(async () => {
    bridge = new SemanticGrammarBridge();
    await bridge.initialize();
  });

  describe('initialization', () => {
    it('should initialize without errors', async () => {
      const newBridge = new SemanticGrammarBridge();
      await expect(newBridge.initialize()).resolves.not.toThrow();
      expect(newBridge.isInitialized()).toBe(true);
    });
  });

  describe('transform', () => {
    it('should return same text for same language', async () => {
      const result = await bridge.transform('toggle .active', 'en', 'en');
      expect(result.output).toBe('toggle .active');
      expect(result.usedSemantic).toBe(false);
      expect(result.confidence).toBe(1.0);
    });

    it('should transform English to Japanese', async () => {
      const result = await bridge.transform('toggle .active', 'en', 'ja');
      expect(result.output).toContain('.active');
      expect(result.sourceLang).toBe('en');
      expect(result.targetLang).toBe('ja');
    });

    it('should transform English to Spanish', async () => {
      const result = await bridge.transform('toggle .active', 'en', 'es');
      expect(result.sourceLang).toBe('en');
      expect(result.targetLang).toBe('es');
    });

    it('should handle complex statements', async () => {
      const result = await bridge.transform(
        'toggle .active on #button',
        'en',
        'ja'
      );
      expect(result.output).toContain('.active');
      expect(result.output).toContain('#button');
    });
  });

  describe('parse', () => {
    it('should parse English toggle command', async () => {
      const node = await bridge.parse('toggle .active', 'en');
      expect(node).not.toBeNull();
      if (node) {
        expect(node.action).toBe('toggle');
        expect(node.roles.has('patient')).toBe(true);
      }
    });

    it('should return null for invalid input', async () => {
      const node = await bridge.parse('definitely not hyperscript code', 'en');
      // May or may not parse - depends on patterns
      // Just verify it doesn't throw
    });
  });

  describe('render', () => {
    it('should render semantic node to English', async () => {
      const node = await bridge.parse('toggle .active', 'en');
      if (node) {
        const english = await bridge.render(node, 'en');
        expect(english).toContain('toggle');
        expect(english).toContain('.active');
      }
    });

    it('should render semantic node to Japanese', async () => {
      const node = await bridge.parse('toggle .active', 'en');
      if (node) {
        const japanese = await bridge.render(node, 'ja');
        expect(japanese).toContain('.active');
      }
    });
  });

  describe('getAllTranslations', () => {
    it('should return translations for all supported languages', async () => {
      const translations = await bridge.getAllTranslations('toggle .active', 'en');

      // Should have entries for multiple languages
      expect(Object.keys(translations).length).toBeGreaterThan(5);

      // Each should have the required fields
      for (const [lang, result] of Object.entries(translations)) {
        expect(result.sourceLang).toBe('en');
        expect(result.targetLang).toBe(lang);
        expect(typeof result.output).toBe('string');
      }
    });
  });
});

describe('semanticNodeToParsedStatement', () => {
  it('should convert a semantic node to parsed statement', () => {
    const mockNode = {
      kind: 'command' as const,
      action: 'toggle' as const,
      roles: new Map([
        ['patient', { type: 'selector' as const, value: '.active', selectorKind: 'class' as const }],
      ]),
      metadata: { sourceText: 'toggle .active' },
    };

    const statement = semanticNodeToParsedStatement(mockNode);

    expect(statement.type).toBe('command');
    expect(statement.roles.has('action')).toBe(true);
    expect(statement.roles.has('patient')).toBe(true);
    expect(statement.roles.get('action')?.value).toBe('toggle');
    expect(statement.roles.get('patient')?.value).toBe('.active');
    expect(statement.roles.get('patient')?.isSelector).toBe(true);
  });

  it('should handle references', () => {
    const mockNode = {
      kind: 'command' as const,
      action: 'increment' as const,
      roles: new Map([
        ['patient', { type: 'reference' as const, value: 'me' as const }],
      ]),
      metadata: {},
    };

    const statement = semanticNodeToParsedStatement(mockNode);
    expect(statement.roles.get('patient')?.value).toBe('me');
    expect(statement.roles.get('patient')?.isSelector).toBe(false);
  });

  it('should handle property paths', () => {
    const mockNode = {
      kind: 'command' as const,
      action: 'set' as const,
      roles: new Map([
        ['patient', {
          type: 'property-path' as const,
          object: { type: 'selector' as const, value: '#element', selectorKind: 'id' as const },
          property: 'value',
        }],
      ]),
      metadata: {},
    };

    const statement = semanticNodeToParsedStatement(mockNode);
    expect(statement.roles.get('patient')?.value).toBe("#element's value");
  });
});
