/**
 * Tests for reference expressions
 * Covering me, you, it, CSS selectors, and element references
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createTestElement, createMockHyperscriptContext } from '../../test-setup.js';
import { referenceExpressions } from './index.js';
import type { ExecutionContext } from '../../types/core.js';

describe('Reference Expressions', () => {
  let context: ExecutionContext;
  let testElement: HTMLElement;
  let targetElement: HTMLElement;

  beforeEach(() => {
    // Create test DOM structure
    document.body.innerHTML = `
      <div id="container" class="test-container">
        <div id="source" class="source-element">Source</div>
        <div id="target" class="target-element">Target</div>
        <div class="shared-class">Item 1</div>
        <div class="shared-class">Item 2</div>
      </div>
    `;

    testElement = document.getElementById('source')!;
    targetElement = document.getElementById('target')!;

    // Create execution context
    context = createMockHyperscriptContext();
    context.me = testElement;
    context.you = targetElement;
    context.it = 'test-value';
    context.result = 'test-result';
  });

  describe('Core Reference Variables', () => {
    describe('me expression', () => {
      it('should return the current element', async () => {
        const result = await referenceExpressions.me.evaluate(context);
        expect(result).toBe(testElement);
      });

      it('should return null when no current element', async () => {
        context.me = null;
        const result = await referenceExpressions.me.evaluate(context);
        expect(result).toBeNull();
      });

      it('should validate without arguments', () => {
        const error = referenceExpressions.me.validate!([]);
        expect(error).toBeNull();
      });
    });

    describe('you expression', () => {
      it('should return the target element', async () => {
        const result = await referenceExpressions.you.evaluate(context);
        expect(result).toBe(targetElement);
      });

      it('should return null when no target element', async () => {
        context.you = null;
        const result = await referenceExpressions.you.evaluate(context);
        expect(result).toBeNull();
      });

      it('should validate without arguments', () => {
        const error = referenceExpressions.you.validate!([]);
        expect(error).toBeNull();
      });
    });

    describe('it expression', () => {
      it('should return the current result value', async () => {
        const result = await referenceExpressions.it.evaluate(context);
        expect(result).toBe('test-value');
      });

      it('should handle different data types', async () => {
        context.it = { key: 'value' };
        const result = await referenceExpressions.it.evaluate(context);
        expect(result).toEqual({ key: 'value' });
      });

      it('should return undefined when not set', async () => {
        context.it = undefined;
        const result = await referenceExpressions.it.evaluate(context);
        expect(result).toBeUndefined();
      });

      it('should validate without arguments', () => {
        const error = referenceExpressions.it.validate!([]);
        expect(error).toBeNull();
      });
    });

    describe('result expression', () => {
      it('should return the result value', async () => {
        const result = await referenceExpressions.result.evaluate(context);
        expect(result).toBe('test-result');
      });

      it('should validate without arguments', () => {
        const error = referenceExpressions.result.validate!([]);
        expect(error).toBeNull();
      });
    });
  });

  describe('CSS Selector Expressions', () => {
    describe('querySelector expression', () => {
      it('should find element by ID selector', async () => {
        const result = await referenceExpressions.querySelector.evaluate(context, '#target');
        expect(result).toBe(targetElement);
        expect(result?.id).toBe('target');
      });

      it('should find element by class selector', async () => {
        const result = await referenceExpressions.querySelector.evaluate(context, '.target-element');
        expect(result).toBe(targetElement);
      });

      it('should return null for non-existent selector', async () => {
        const result = await referenceExpressions.querySelector.evaluate(context, '#nonexistent');
        expect(result).toBeNull();
      });

      it('should search from document regardless of context.me', async () => {
        context.me = document.getElementById('container')!;
        const result = await referenceExpressions.querySelector.evaluate(context, '#target');
        expect(result).toBe(targetElement);
      });

      it('should search from document when context.me is null', async () => {
        context.me = null;
        const result = await referenceExpressions.querySelector.evaluate(context, '#target');
        expect(result).toBe(targetElement);
      });

      it('should validate selector argument', () => {
        expect(referenceExpressions.querySelector.validate!(['#test'])).toBeNull();
        expect(referenceExpressions.querySelector.validate!([])).toContain('exactly one argument');
        expect(referenceExpressions.querySelector.validate!(['#test', 'extra'])).toContain('exactly one argument');
        expect(referenceExpressions.querySelector.validate!([123])).toContain('must be a string');
      });

      it('should throw error for non-string selector', async () => {
        await expect(referenceExpressions.querySelector.evaluate(context, 123 as any))
          .rejects.toThrow('querySelector requires a string selector');
      });
    });

    describe('querySelectorAll expression', () => {
      it('should find all elements by class selector', async () => {
        const result = await referenceExpressions.querySelectorAll.evaluate(context, '.shared-class');
        expect(result).toHaveLength(2);
        expect(result[0].textContent).toBe('Item 1');
        expect(result[1].textContent).toBe('Item 2');
      });

      it('should return empty array for non-existent selector', async () => {
        const result = await referenceExpressions.querySelectorAll.evaluate(context, '.nonexistent');
        expect(result).toEqual([]);
      });

      it('should search from document and find all matching elements', async () => {
        const result = await referenceExpressions.querySelectorAll.evaluate(context, 'div');
        expect(result.length).toBeGreaterThan(0);
        // Should find at least the container and nested divs
        expect(result.some(el => el.id === 'container')).toBe(true);
      });

      it('should validate selector argument', () => {
        expect(referenceExpressions.querySelectorAll.validate!(['.test'])).toBeNull();
        expect(referenceExpressions.querySelectorAll.validate!([])).toContain('exactly one argument');
        expect(referenceExpressions.querySelectorAll.validate!(['.test', 'extra'])).toContain('exactly one argument');
        expect(referenceExpressions.querySelectorAll.validate!([123])).toContain('must be a string');
      });

      it('should throw error for non-string selector', async () => {
        await expect(referenceExpressions.querySelectorAll.evaluate(context, 123 as any))
          .rejects.toThrow('querySelectorAll requires a string selector');
      });
    });
  });

  describe('ID and Class Reference Expressions', () => {
    describe('getElementById expression', () => {
      it('should find element by ID', async () => {
        const result = await referenceExpressions.getElementById.evaluate(context, 'target');
        expect(result).toBe(targetElement);
        expect(result?.id).toBe('target');
      });

      it('should return null for non-existent ID', async () => {
        const result = await referenceExpressions.getElementById.evaluate(context, 'nonexistent');
        expect(result).toBeNull();
      });

      it('should validate ID argument', () => {
        expect(referenceExpressions.getElementById.validate!(['test'])).toBeNull();
        expect(referenceExpressions.getElementById.validate!([])).toContain('exactly one argument');
        expect(referenceExpressions.getElementById.validate!(['test', 'extra'])).toContain('exactly one argument');
        expect(referenceExpressions.getElementById.validate!([123])).toContain('must be a string');
      });

      it('should throw error for non-string ID', async () => {
        await expect(referenceExpressions.getElementById.evaluate(context, 123 as any))
          .rejects.toThrow('getElementById requires a string ID');
      });
    });

    describe('getElementsByClassName expression', () => {
      it('should find elements by class name', async () => {
        const result = await referenceExpressions.getElementsByClassName.evaluate(context, 'shared-class');
        expect(result).toHaveLength(2);
        expect(result[0].textContent).toBe('Item 1');
        expect(result[1].textContent).toBe('Item 2');
      });

      it('should return empty array for non-existent class', async () => {
        const result = await referenceExpressions.getElementsByClassName.evaluate(context, 'nonexistent');
        expect(result).toEqual([]);
      });

      it('should search from document and find all elements with class', async () => {
        const result = await referenceExpressions.getElementsByClassName.evaluate(context, 'shared-class');
        expect(result).toHaveLength(2);
        expect(result[0].textContent).toBe('Item 1');
        expect(result[1].textContent).toBe('Item 2');
      });

      it('should validate className argument', () => {
        expect(referenceExpressions.getElementsByClassName.validate!(['test'])).toBeNull();
        expect(referenceExpressions.getElementsByClassName.validate!([])).toContain('exactly one argument');
        expect(referenceExpressions.getElementsByClassName.validate!(['test', 'extra'])).toContain('exactly one argument');
        expect(referenceExpressions.getElementsByClassName.validate!([123])).toContain('must be a string');
      });

      it('should throw error for non-string className', async () => {
        await expect(referenceExpressions.getElementsByClassName.evaluate(context, 123 as any))
          .rejects.toThrow('getElementsByClassName requires a string class name');
      });
    });
  });

  describe('Traversal Expressions', () => {
    describe('closest expression', () => {
      it('should find closest matching ancestor', async () => {
        context.me = testElement;
        const result = await referenceExpressions.closest.evaluate(context, '#container');
        expect(result?.id).toBe('container');
      });

      it('should return null when no matching ancestor', async () => {
        context.me = testElement;
        const result = await referenceExpressions.closest.evaluate(context, '.nonexistent');
        expect(result).toBeNull();
      });

      it('should return null when context.me is null', async () => {
        context.me = null;
        const result = await referenceExpressions.closest.evaluate(context, '#container');
        expect(result).toBeNull();
      });

      it('should validate selector argument', () => {
        expect(referenceExpressions.closest.validate!(['#test'])).toBeNull();
        expect(referenceExpressions.closest.validate!([])).toContain('exactly one argument');
        expect(referenceExpressions.closest.validate!(['#test', 'extra'])).toContain('exactly one argument');
        expect(referenceExpressions.closest.validate!([123])).toContain('must be a string');
      });

      it('should throw error for non-string selector', async () => {
        await expect(referenceExpressions.closest.evaluate(context, 123 as any))
          .rejects.toThrow('closest requires a string selector');
      });
    });

    describe('parent expression', () => {
      it('should return parent element', async () => {
        context.me = testElement;
        const result = await referenceExpressions.parent.evaluate(context);
        expect(result?.id).toBe('container');
      });

      it('should return null when no parent', async () => {
        // Test with document.documentElement which has no parent element
        context.me = document.documentElement;
        const result = await referenceExpressions.parent.evaluate(context);
        expect(result).toBeNull();
      });

      it('should return null when context.me is null', async () => {
        context.me = null;
        const result = await referenceExpressions.parent.evaluate(context);
        expect(result).toBeNull();
      });

      it('should validate without arguments', () => {
        expect(referenceExpressions.parent.validate!()).toBeNull();
      });
    });
  });

  describe('Expression Metadata', () => {
    it('should have correct categories', () => {
      Object.values(referenceExpressions).forEach(expr => {
        expect(expr.category).toBe('Reference');
      });
    });

    it('should have correct evaluation types', () => {
      expect(referenceExpressions.me.evaluatesTo).toBe('Element');
      expect(referenceExpressions.you.evaluatesTo).toBe('Element');
      expect(referenceExpressions.it.evaluatesTo).toBe('Any');
      expect(referenceExpressions.result.evaluatesTo).toBe('Any');
      expect(referenceExpressions.querySelector.evaluatesTo).toBe('Element');
      expect(referenceExpressions.querySelectorAll.evaluatesTo).toBe('Array');
      expect(referenceExpressions.getElementById.evaluatesTo).toBe('Element');
      expect(referenceExpressions.getElementsByClassName.evaluatesTo).toBe('Array');
      expect(referenceExpressions.closest.evaluatesTo).toBe('Element');
      expect(referenceExpressions.parent.evaluatesTo).toBe('Element');
    });
  });
});