/**
 * Tests for property expressions
 * Covering possessive syntax, attribute access, and property references
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestElement, createMockHyperscriptContext } from '../../test-setup';
import { 
  propertyExpressions, 
  getElementProperty, 
  isDataAttribute, 
  isAriaAttribute 
} from './index';
import type { ExecutionContext } from '../../types/core';

describe('Property Expressions', () => {
  let context: ExecutionContext;
  let testElement: HTMLElement;

  beforeEach(() => {
    context = createMockHyperscriptContext();
    
    // Create a test element with various properties and attributes
    testElement = createTestElement(`
      <div 
        id="test-element" 
        class="test-class another-class"
        data-value="test-data"
        aria-label="Test Label"
        title="Test Title"
        style="color: red; font-size: 14px;"
      >
        Test Content
      </div>
    `);
    
    context.me = testElement;
    context.it = { name: 'test', count: 42 };
    context.you = testElement;
  });

  describe('Possessive Expressions', () => {
    describe('possessive expression', () => {
      it('should get element properties', async () => {
        const result = await propertyExpressions.possessive.evaluate(context, testElement, 'id');
        expect(result).toBe('test-element');
      });

      it('should get object properties', async () => {
        const obj = { name: 'test', value: 123 };
        expect(await propertyExpressions.possessive.evaluate(context, obj, 'name')).toBe('test');
        expect(await propertyExpressions.possessive.evaluate(context, obj, 'value')).toBe(123);
      });

      it('should handle DOM element attributes', async () => {
        const result = await propertyExpressions.possessive.evaluate(context, testElement, 'data-value');
        expect(result).toBe('test-data');
      });

      it('should handle special DOM properties', async () => {
        expect(await propertyExpressions.possessive.evaluate(context, testElement, 'className')).toBe('test-class another-class');
        expect(await propertyExpressions.possessive.evaluate(context, testElement, 'tagName')).toBe('div');
        expect(await propertyExpressions.possessive.evaluate(context, testElement, 'innerText')).toBe('Test Content');
      });

      it('should handle null/undefined element', async () => {
        const result = await propertyExpressions.possessive.evaluate(context, null, 'property');
        expect(result).toBeUndefined();
      });

      it('should throw error for non-string property', async () => {
        await expect(propertyExpressions.possessive.evaluate(context, testElement, 123 as any))
          .rejects.toThrow('Property name must be a string');
      });

      it('should validate arguments', () => {
        expect(propertyExpressions.possessive.validate!([testElement, 'property'])).toBeNull();
        expect(propertyExpressions.possessive.validate!([testElement])).toContain('exactly two arguments');
        expect(propertyExpressions.possessive.validate!([testElement, 'property', 'extra'])).toContain('exactly two arguments');
        expect(propertyExpressions.possessive.validate!([testElement, 123])).toContain('must be a string');
      });
    });

    describe('my expression', () => {
      it('should get properties from context.me', async () => {
        const result = await propertyExpressions.my.evaluate(context, 'id');
        expect(result).toBe('test-element');
      });

      it('should get attributes from context.me', async () => {
        const result = await propertyExpressions.my.evaluate(context, 'data-value');
        expect(result).toBe('test-data');
      });

      it('should return undefined when context.me is null', async () => {
        context.me = null;
        const result = await propertyExpressions.my.evaluate(context, 'id');
        expect(result).toBeUndefined();
      });

      it('should throw error for non-string property', async () => {
        await expect(propertyExpressions.my.evaluate(context, 123 as any))
          .rejects.toThrow('Property name must be a string');
      });

      it('should validate arguments', () => {
        expect(propertyExpressions.my.validate!(['property'])).toBeNull();
        expect(propertyExpressions.my.validate!([])).toContain('exactly one argument');
        expect(propertyExpressions.my.validate!(['property', 'extra'])).toContain('exactly one argument');
        expect(propertyExpressions.my.validate!([123])).toContain('must be a string');
      });
    });

    describe('its expression', () => {
      it('should get properties from context.it object', async () => {
        expect(await propertyExpressions.its.evaluate(context, 'name')).toBe('test');
        expect(await propertyExpressions.its.evaluate(context, 'count')).toBe(42);
      });

      it('should handle context.it as DOM element', async () => {
        context.it = testElement;
        const result = await propertyExpressions.its.evaluate(context, 'id');
        expect(result).toBe('test-element');
      });

      it('should return undefined when context.it is null', async () => {
        context.it = null;
        const result = await propertyExpressions.its.evaluate(context, 'name');
        expect(result).toBeUndefined();
      });

      it('should handle primitive values', async () => {
        context.it = 'hello';
        const result = await propertyExpressions.its.evaluate(context, 'length');
        expect(result).toBe(5);
      });

      it('should throw error for non-string property', async () => {
        await expect(propertyExpressions.its.evaluate(context, 123 as any))
          .rejects.toThrow('Property name must be a string');
      });

      it('should validate arguments', () => {
        expect(propertyExpressions.its.validate!(['property'])).toBeNull();
        expect(propertyExpressions.its.validate!([])).toContain('exactly one argument');
        expect(propertyExpressions.its.validate!(['property', 'extra'])).toContain('exactly one argument');
        expect(propertyExpressions.its.validate!([123])).toContain('must be a string');
      });
    });

    describe('your expression', () => {
      it('should get properties from context.you', async () => {
        const result = await propertyExpressions.your.evaluate(context, 'id');
        expect(result).toBe('test-element');
      });

      it('should return undefined when context.you is null', async () => {
        context.you = null;
        const result = await propertyExpressions.your.evaluate(context, 'id');
        expect(result).toBeUndefined();
      });

      it('should throw error for non-string property', async () => {
        await expect(propertyExpressions.your.evaluate(context, 123 as any))
          .rejects.toThrow('Property name must be a string');
      });

      it('should validate arguments', () => {
        expect(propertyExpressions.your.validate!(['property'])).toBeNull();
        expect(propertyExpressions.your.validate!([])).toContain('exactly one argument');
        expect(propertyExpressions.your.validate!(['property', 'extra'])).toContain('exactly one argument');
        expect(propertyExpressions.your.validate!([123])).toContain('must be a string');
      });
    });
  });

  describe('Of Expression', () => {
    it('should work as reverse property access', async () => {
      const obj = { location: { href: 'https://example.com' } };
      const result = await propertyExpressions.of.evaluate(context, 'location', obj);
      expect(result).toEqual({ href: 'https://example.com' });
    });

    it('should work with DOM elements', async () => {
      const result = await propertyExpressions.of.evaluate(context, 'id', testElement);
      expect(result).toBe('test-element');
    });

    it('should handle null object', async () => {
      const result = await propertyExpressions.of.evaluate(context, 'property', null);
      expect(result).toBeUndefined();
    });

    it('should throw error for non-string property', async () => {
      await expect(propertyExpressions.of.evaluate(context, 123 as any, {}))
        .rejects.toThrow('Property name must be a string');
    });

    it('should validate arguments', () => {
      expect(propertyExpressions.of.validate!(['property', {}])).toBeNull();
      expect(propertyExpressions.of.validate!(['property'])).toContain('exactly two arguments');
      expect(propertyExpressions.of.validate!(['property', {}, 'extra'])).toContain('exactly two arguments');
      expect(propertyExpressions.of.validate!([123, {}])).toContain('must be a string');
    });
  });

  describe('Attribute Expressions', () => {
    describe('attribute expression', () => {
      it('should get attribute from context.me', async () => {
        const result = await propertyExpressions.attribute.evaluate(context, 'data-value');
        expect(result).toBe('test-data');
      });

      it('should get attribute from specified element', async () => {
        const otherElement = createTestElement('<span custom-attr="custom-value">Test</span>');
        const result = await propertyExpressions.attribute.evaluate(context, 'custom-attr', otherElement);
        expect(result).toBe('custom-value');
      });

      it('should return null for non-existent attribute', async () => {
        const result = await propertyExpressions.attribute.evaluate(context, 'non-existent');
        expect(result).toBeNull();
      });

      it('should return null when element is null', async () => {
        context.me = null;
        const result = await propertyExpressions.attribute.evaluate(context, 'data-value');
        expect(result).toBeNull();
      });

      it('should throw error for non-string attribute name', async () => {
        await expect(propertyExpressions.attribute.evaluate(context, 123 as any))
          .rejects.toThrow('Attribute name must be a string');
      });

      it('should validate arguments', () => {
        expect(propertyExpressions.attribute.validate!(['attr'])).toBeNull();
        expect(propertyExpressions.attribute.validate!(['attr', testElement])).toBeNull();
        expect(propertyExpressions.attribute.validate!([])).toContain('1-2 arguments');
        expect(propertyExpressions.attribute.validate!(['attr', testElement, 'extra'])).toContain('1-2 arguments');
        expect(propertyExpressions.attribute.validate!([123])).toContain('must be a string');
        expect(propertyExpressions.attribute.validate!(['attr', 'not-element'])).toContain('must be an Element');
      });
    });

    describe('attributeWithValue expression', () => {
      it('should check if attribute has expected value', async () => {
        expect(await propertyExpressions.attributeWithValue.evaluate(context, 'data-value', 'test-data')).toBe(true);
        expect(await propertyExpressions.attributeWithValue.evaluate(context, 'data-value', 'wrong-value')).toBe(false);
      });

      it('should work with specified element', async () => {
        const otherElement = createTestElement('<span test-attr="expected">Test</span>');
        const result = await propertyExpressions.attributeWithValue.evaluate(context, 'test-attr', 'expected', otherElement);
        expect(result).toBe(true);
      });

      it('should return false for non-existent attribute', async () => {
        const result = await propertyExpressions.attributeWithValue.evaluate(context, 'non-existent', 'value');
        expect(result).toBe(false);
      });

      it('should return false when element is null', async () => {
        context.me = null;
        const result = await propertyExpressions.attributeWithValue.evaluate(context, 'data-value', 'test-data');
        expect(result).toBe(false);
      });

      it('should throw error for non-string parameters', async () => {
        await expect(propertyExpressions.attributeWithValue.evaluate(context, 123 as any, 'value'))
          .rejects.toThrow('Attribute name must be a string');
        await expect(propertyExpressions.attributeWithValue.evaluate(context, 'attr', 123 as any))
          .rejects.toThrow('Expected value must be a string');
      });

      it('should validate arguments', () => {
        expect(propertyExpressions.attributeWithValue.validate!(['attr', 'value'])).toBeNull();
        expect(propertyExpressions.attributeWithValue.validate!(['attr', 'value', testElement])).toBeNull();
        expect(propertyExpressions.attributeWithValue.validate!(['attr'])).toContain('2-3 arguments');
        expect(propertyExpressions.attributeWithValue.validate!(['attr', 'value', testElement, 'extra'])).toContain('2-3 arguments');
        expect(propertyExpressions.attributeWithValue.validate!([123, 'value'])).toContain('attribute name must be a string');
        expect(propertyExpressions.attributeWithValue.validate!(['attr', 123])).toContain('expected value must be a string');
        expect(propertyExpressions.attributeWithValue.validate!(['attr', 'value', 'not-element'])).toContain('must be an Element');
      });
    });
  });

  describe('Reference Expressions', () => {
    beforeEach(() => {
      // Create test DOM structure
      document.body.innerHTML = `
        <div class="test-class">Item 1</div>
        <div class="test-class">Item 2</div>
        <div id="unique-id">Unique Item</div>
        <span class="other-class">Other</span>
      `;
    });

    describe('classReference expression', () => {
      it('should get all elements with class', async () => {
        const result = await propertyExpressions.classReference.evaluate(context, 'test-class');
        expect(result).toHaveLength(2);
        expect(result[0].textContent).toBe('Item 1');
        expect(result[1].textContent).toBe('Item 2');
      });

      it('should handle class with leading dot', async () => {
        const result = await propertyExpressions.classReference.evaluate(context, '.test-class');
        expect(result).toHaveLength(2);
      });

      it('should return empty array for non-existent class', async () => {
        const result = await propertyExpressions.classReference.evaluate(context, 'non-existent');
        expect(result).toEqual([]);
      });

      it('should throw error for non-string class name', async () => {
        await expect(propertyExpressions.classReference.evaluate(context, 123 as any))
          .rejects.toThrow('Class name must be a string');
      });

      it('should validate arguments', () => {
        expect(propertyExpressions.classReference.validate!(['class-name'])).toBeNull();
        expect(propertyExpressions.classReference.validate!([])).toContain('exactly one argument');
        expect(propertyExpressions.classReference.validate!(['class', 'extra'])).toContain('exactly one argument');
        expect(propertyExpressions.classReference.validate!([123])).toContain('must be a string');
      });
    });

    describe('idReference expression', () => {
      it('should get element by ID', async () => {
        const result = await propertyExpressions.idReference.evaluate(context, 'unique-id');
        expect(result?.textContent).toBe('Unique Item');
        expect(result?.id).toBe('unique-id');
      });

      it('should handle ID with leading hash', async () => {
        const result = await propertyExpressions.idReference.evaluate(context, '#unique-id');
        expect(result?.id).toBe('unique-id');
      });

      it('should return null for non-existent ID', async () => {
        const result = await propertyExpressions.idReference.evaluate(context, 'non-existent');
        expect(result).toBeNull();
      });

      it('should throw error for non-string ID', async () => {
        await expect(propertyExpressions.idReference.evaluate(context, 123 as any))
          .rejects.toThrow('ID value must be a string');
      });

      it('should validate arguments', () => {
        expect(propertyExpressions.idReference.validate!(['id-value'])).toBeNull();
        expect(propertyExpressions.idReference.validate!([])).toContain('exactly one argument');
        expect(propertyExpressions.idReference.validate!(['id', 'extra'])).toContain('exactly one argument');
        expect(propertyExpressions.idReference.validate!([123])).toContain('must be a string');
      });
    });
  });

  describe('Helper Functions', () => {
    describe('getElementProperty', () => {
      it('should get standard DOM properties', () => {
        expect(getElementProperty(testElement, 'id')).toBe('test-element');
        expect(getElementProperty(testElement, 'className')).toBe('test-class another-class');
        expect(getElementProperty(testElement, 'tagName')).toBe('div');
        expect(getElementProperty(testElement, 'innerText')).toBe('Test Content');
      });

      it('should get attributes', () => {
        expect(getElementProperty(testElement, 'data-value')).toBe('test-data');
        expect(getElementProperty(testElement, 'aria-label')).toBe('Test Label');
        expect(getElementProperty(testElement, 'title')).toBe('Test Title');
      });

      it('should get computed style', () => {
        const style = getElementProperty(testElement, 'style');
        expect(style).toBeInstanceOf(CSSStyleDeclaration);
      });

      it('should get DOM tree navigation properties', () => {
        const children = getElementProperty(testElement, 'children');
        expect(Array.isArray(children)).toBe(true);
        
        const parent = getElementProperty(testElement, 'parent');
        expect(parent).toBeInstanceOf(Element);
      });

      it('should fallback to regular property access', () => {
        // Add a custom property
        (testElement as any).customProperty = 'custom-value';
        expect(getElementProperty(testElement, 'customProperty')).toBe('custom-value');
      });
    });

    describe('isDataAttribute', () => {
      it('should identify data attributes', () => {
        expect(isDataAttribute('data-value')).toBe(true);
        expect(isDataAttribute('data')).toBe(true);
        expect(isDataAttribute('dataValue')).toBe(false);
        expect(isDataAttribute('value')).toBe(false);
      });
    });

    describe('isAriaAttribute', () => {
      it('should identify aria attributes', () => {
        expect(isAriaAttribute('aria-label')).toBe(true);
        expect(isAriaAttribute('aria')).toBe(true);
        expect(isAriaAttribute('ariaLabel')).toBe(false);
        expect(isAriaAttribute('label')).toBe(false);
      });
    });
  });

  describe('Expression Metadata', () => {
    it('should have correct categories', () => {
      Object.values(propertyExpressions).forEach(expr => {
        expect(expr.category).toBe('Reference');
      });
    });

    it('should have appropriate evaluation types', () => {
      expect(propertyExpressions.possessive.evaluatesTo).toBe('Any');
      expect(propertyExpressions.my.evaluatesTo).toBe('Any');
      expect(propertyExpressions.its.evaluatesTo).toBe('Any');
      expect(propertyExpressions.your.evaluatesTo).toBe('Any');
      expect(propertyExpressions.of.evaluatesTo).toBe('Any');
      expect(propertyExpressions.attribute.evaluatesTo).toBe('String');
      expect(propertyExpressions.attributeWithValue.evaluatesTo).toBe('Boolean');
      expect(propertyExpressions.classReference.evaluatesTo).toBe('Array');
      expect(propertyExpressions.idReference.evaluatesTo).toBe('Element');
    });

    it('should have correct operator definitions', () => {
      expect(propertyExpressions.possessive.operators).toContain("'s");
      expect(propertyExpressions.my.operators).toContain('my');
      expect(propertyExpressions.its.operators).toContain('its');
      expect(propertyExpressions.your.operators).toContain('your');
      expect(propertyExpressions.of.operators).toContain('of');
      expect(propertyExpressions.attribute.operators).toContain('@');
      expect(propertyExpressions.attributeWithValue.operators).toContain('@=');
      expect(propertyExpressions.classReference.operators).toContain('.');
      expect(propertyExpressions.idReference.operators).toContain('#');
    });
  });
});