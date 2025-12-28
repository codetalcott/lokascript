/**
 * PropertyTarget Utility Tests
 *
 * Tests for the shared 'x of y' pattern handling primitive.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  PropertyTarget,
  PropertyOfExpressionNode,
  PROPERTY_OF_PATTERN,
  isPropertyOfExpressionNode,
  isPossessiveExpressionNode,
  isPropertyTargetString,
  parsePropertyTargetString,
  resolvePropertyTargetFromString,
  resolvePropertyTargetFromNode,
  resolvePropertyTargetFromPossessive,
  readPropertyTarget,
  writePropertyTarget,
  togglePropertyTarget,
  isBooleanProperty,
} from '../property-target';

// ============================================================================
// Test Utilities
// ============================================================================

import type { ExecutionContext } from '../../../types/base-types';

function createMockContext(me?: HTMLElement, it?: unknown, you?: HTMLElement): ExecutionContext {
  return {
    me: me ?? null,
    it,
    you: you ?? null,
    result: undefined,
    globals: new Map<string, unknown>(),
    locals: new Map<string, unknown>(),
  } as ExecutionContext;
}

function createMockEvaluator() {
  return {
    evaluate: async (node: unknown, _context: unknown) => {
      const n = node as Record<string, unknown>;
      // Handle ID selector nodes
      if (n.type === 'idSelector' || n.type === 'selector') {
        const selector = (n.value || n.selector) as string;
        return document.querySelector(selector);
      }
      // Handle identifier nodes (me, it, you)
      if (n.type === 'identifier') {
        const name = n.name as string;
        if (name === 'me') return (_context as { me?: unknown }).me;
        if (name === 'it') return (_context as { it?: unknown }).it;
        if (name === 'you') return (_context as { you?: unknown }).you;
      }
      // Return node value directly for testing
      return n.value;
    },
  };
}

// ============================================================================
// Detection Function Tests
// ============================================================================

describe('PropertyTarget Detection', () => {
  describe('isPropertyOfExpressionNode', () => {
    it('should return true for valid propertyOfExpression nodes', () => {
      const node: PropertyOfExpressionNode = {
        type: 'propertyOfExpression',
        property: { type: 'identifier', name: 'innerHTML' },
        target: { type: 'idSelector', value: '#target' } as any,
      };
      expect(isPropertyOfExpressionNode(node)).toBe(true);
    });

    it('should return false for non-propertyOfExpression nodes', () => {
      expect(isPropertyOfExpressionNode({ type: 'identifier', name: 'foo' })).toBe(false);
      expect(isPropertyOfExpressionNode({ type: 'literal', value: 'bar' })).toBe(false);
      expect(isPropertyOfExpressionNode(null)).toBe(false);
      expect(isPropertyOfExpressionNode(undefined)).toBe(false);
      expect(isPropertyOfExpressionNode('string')).toBe(false);
    });

    it('should return false if property is missing', () => {
      expect(isPropertyOfExpressionNode({ type: 'propertyOfExpression', target: {} })).toBe(false);
    });
  });

  describe('isPossessiveExpressionNode', () => {
    it('should return true for possessiveExpression nodes', () => {
      expect(isPossessiveExpressionNode({ type: 'possessiveExpression' })).toBe(true);
    });

    it('should return true for non-computed memberExpression nodes', () => {
      expect(isPossessiveExpressionNode({ type: 'memberExpression', computed: false })).toBe(true);
    });

    it('should return false for computed memberExpression nodes', () => {
      expect(isPossessiveExpressionNode({ type: 'memberExpression', computed: true })).toBe(false);
    });

    it('should return false for other node types', () => {
      expect(isPossessiveExpressionNode({ type: 'identifier' })).toBe(false);
      expect(isPossessiveExpressionNode(null)).toBe(false);
    });
  });

  describe('isPropertyTargetString', () => {
    it('should return true for "the X of Y" strings', () => {
      expect(isPropertyTargetString('the innerHTML of #target')).toBe(true);
      expect(isPropertyTargetString('the value of me')).toBe(true);
      expect(isPropertyTargetString('the textContent of it')).toBe(true);
      expect(isPropertyTargetString('THE innerHTML OF #target')).toBe(true); // case insensitive
    });

    it('should return false for non-matching strings', () => {
      expect(isPropertyTargetString('innerHTML')).toBe(false);
      expect(isPropertyTargetString('the innerHTML')).toBe(false); // missing "of Y"
      expect(isPropertyTargetString('set x to y')).toBe(false);
      expect(isPropertyTargetString('')).toBe(false);
    });

    it('should return false for non-strings', () => {
      expect(isPropertyTargetString(123)).toBe(false);
      expect(isPropertyTargetString(null)).toBe(false);
      expect(isPropertyTargetString(undefined)).toBe(false);
      expect(isPropertyTargetString({})).toBe(false);
    });
  });

  describe('parsePropertyTargetString', () => {
    it('should parse valid "the X of Y" strings', () => {
      expect(parsePropertyTargetString('the innerHTML of #target')).toEqual({
        property: 'innerHTML',
        targetExpr: '#target',
      });

      expect(parsePropertyTargetString('the value of me')).toEqual({
        property: 'value',
        targetExpr: 'me',
      });

      expect(parsePropertyTargetString('the textContent of .my-class')).toEqual({
        property: 'textContent',
        targetExpr: '.my-class',
      });
    });

    it('should handle case insensitivity', () => {
      expect(parsePropertyTargetString('THE innerHTML OF #target')).toEqual({
        property: 'innerHTML',
        targetExpr: '#target',
      });
    });

    it('should return null for invalid strings', () => {
      expect(parsePropertyTargetString('innerHTML of #target')).toBe(null); // missing "the"
      expect(parsePropertyTargetString('the innerHTML')).toBe(null); // missing "of Y"
      expect(parsePropertyTargetString('foo bar')).toBe(null);
    });
  });
});

// ============================================================================
// Resolution Function Tests
// ============================================================================

describe('PropertyTarget Resolution', () => {
  let testElement: HTMLElement;

  beforeEach(() => {
    testElement = document.createElement('div');
    testElement.id = 'test-target';
    testElement.textContent = 'initial content';
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    if (testElement.parentNode) {
      document.body.removeChild(testElement);
    }
  });

  describe('resolvePropertyTargetFromString', () => {
    it('should resolve "the X of #id" pattern', () => {
      const context = createMockContext();
      const result = resolvePropertyTargetFromString('the innerHTML of #test-target', context);

      expect(result).not.toBeNull();
      expect(result!.element).toBe(testElement);
      expect(result!.property).toBe('innerHTML');
    });

    it('should resolve "the X of me" pattern', () => {
      const context = createMockContext(testElement);
      const result = resolvePropertyTargetFromString('the textContent of me', context);

      expect(result).not.toBeNull();
      expect(result!.element).toBe(testElement);
      expect(result!.property).toBe('textContent');
    });

    it('should resolve "the X of it" pattern', () => {
      const context = createMockContext(undefined, testElement);
      const result = resolvePropertyTargetFromString('the value of it', context);

      expect(result).not.toBeNull();
      expect(result!.element).toBe(testElement);
      expect(result!.property).toBe('value');
    });

    it('should return null for invalid selector', () => {
      const context = createMockContext();
      const result = resolvePropertyTargetFromString('the innerHTML of #nonexistent', context);
      expect(result).toBeNull();
    });

    it('should return null for invalid pattern', () => {
      const context = createMockContext();
      const result = resolvePropertyTargetFromString('not a valid pattern', context);
      expect(result).toBeNull();
    });
  });

  describe('resolvePropertyTargetFromNode', () => {
    it('should resolve propertyOfExpression nodes', async () => {
      const node: PropertyOfExpressionNode = {
        type: 'propertyOfExpression',
        property: { type: 'identifier', name: 'innerHTML' },
        target: { type: 'idSelector', value: '#test-target' } as any,
      };

      const evaluator = createMockEvaluator();
      const context = createMockContext();

      const result = await resolvePropertyTargetFromNode(node, evaluator as any, context);

      expect(result).not.toBeNull();
      expect(result!.element).toBe(testElement);
      expect(result!.property).toBe('innerHTML');
    });

    it('should handle array results (take first element)', async () => {
      const node: PropertyOfExpressionNode = {
        type: 'propertyOfExpression',
        property: { type: 'identifier', name: 'textContent' },
        target: { type: 'selector', value: 'div' } as any,
      };

      // Mock evaluator returns array
      const evaluator = {
        evaluate: async () => [testElement],
      };
      const context = createMockContext();

      const result = await resolvePropertyTargetFromNode(node, evaluator as any, context);

      expect(result).not.toBeNull();
      expect(result!.element).toBe(testElement);
    });

    it('should return null for non-element targets', async () => {
      const node: PropertyOfExpressionNode = {
        type: 'propertyOfExpression',
        property: { type: 'identifier', name: 'innerHTML' },
        target: { type: 'literal', value: 'not an element' } as any,
      };

      const evaluator = createMockEvaluator();
      const context = createMockContext();

      const result = await resolvePropertyTargetFromNode(node, evaluator as any, context);
      expect(result).toBeNull();
    });
  });
});

// ============================================================================
// PropertyTarget Operations Tests
// ============================================================================

describe('PropertyTarget Operations', () => {
  let testElement: HTMLElement;
  let target: PropertyTarget;

  beforeEach(() => {
    testElement = document.createElement('div');
    testElement.id = 'test-el';
    testElement.textContent = 'initial';
    document.body.appendChild(testElement);
  });

  afterEach(() => {
    if (testElement.parentNode) {
      document.body.removeChild(testElement);
    }
  });

  describe('readPropertyTarget', () => {
    it('should read textContent', () => {
      target = { element: testElement, property: 'textContent' };
      expect(readPropertyTarget(target)).toBe('initial');
    });

    it('should read innerHTML', () => {
      testElement.innerHTML = '<span>test</span>';
      target = { element: testElement, property: 'innerHTML' };
      expect(readPropertyTarget(target)).toBe('<span>test</span>');
    });

    it('should read id', () => {
      target = { element: testElement, property: 'id' };
      expect(readPropertyTarget(target)).toBe('test-el');
    });
  });

  describe('writePropertyTarget', () => {
    it('should write textContent', () => {
      target = { element: testElement, property: 'textContent' };
      writePropertyTarget(target, 'new content');
      expect(testElement.textContent).toBe('new content');
    });

    it('should write innerHTML', () => {
      target = { element: testElement, property: 'innerHTML' };
      writePropertyTarget(target, '<strong>bold</strong>');
      expect(testElement.innerHTML).toBe('<strong>bold</strong>');
    });

    it('should write id', () => {
      target = { element: testElement, property: 'id' };
      writePropertyTarget(target, 'new-id');
      expect(testElement.id).toBe('new-id');
    });
  });

  describe('togglePropertyTarget', () => {
    it('should toggle hidden property', () => {
      target = { element: testElement, property: 'hidden' };

      expect(testElement.hidden).toBe(false);

      const result1 = togglePropertyTarget(target);
      expect(result1).toBe(true);
      expect(testElement.hidden).toBe(true);

      const result2 = togglePropertyTarget(target);
      expect(result2).toBe(false);
      expect(testElement.hidden).toBe(false);
    });

    it('should toggle disabled on button', () => {
      const button = document.createElement('button');
      document.body.appendChild(button);

      target = { element: button, property: 'disabled' };

      expect(button.disabled).toBe(false);

      togglePropertyTarget(target);
      expect(button.disabled).toBe(true);

      togglePropertyTarget(target);
      expect(button.disabled).toBe(false);

      document.body.removeChild(button);
    });

    it('should toggle checked on checkbox', () => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      document.body.appendChild(checkbox);

      target = { element: checkbox, property: 'checked' };

      expect(checkbox.checked).toBe(false);

      togglePropertyTarget(target);
      expect(checkbox.checked).toBe(true);

      togglePropertyTarget(target);
      expect(checkbox.checked).toBe(false);

      document.body.removeChild(checkbox);
    });
  });
});

// ============================================================================
// isBooleanProperty Tests
// ============================================================================

describe('isBooleanProperty', () => {
  it('should return true for known boolean properties', () => {
    expect(isBooleanProperty('disabled')).toBe(true);
    expect(isBooleanProperty('checked')).toBe(true);
    expect(isBooleanProperty('hidden')).toBe(true);
    expect(isBooleanProperty('readOnly')).toBe(true);
    expect(isBooleanProperty('required')).toBe(true);
    expect(isBooleanProperty('multiple')).toBe(true);
    expect(isBooleanProperty('selected')).toBe(true);
    expect(isBooleanProperty('autofocus')).toBe(true);
    expect(isBooleanProperty('open')).toBe(true);
  });

  it('should handle case variations', () => {
    expect(isBooleanProperty('DISABLED')).toBe(true);
    expect(isBooleanProperty('Checked')).toBe(true);
    expect(isBooleanProperty('HIDDEN')).toBe(true);
  });

  it('should return false for non-boolean properties', () => {
    expect(isBooleanProperty('textContent')).toBe(false);
    expect(isBooleanProperty('innerHTML')).toBe(false);
    expect(isBooleanProperty('value')).toBe(false);
    expect(isBooleanProperty('id')).toBe(false);
    expect(isBooleanProperty('className')).toBe(false);
    expect(isBooleanProperty('style')).toBe(false);
  });
});

// ============================================================================
// Regex Pattern Tests
// ============================================================================

describe('PROPERTY_OF_PATTERN', () => {
  it('should match valid patterns', () => {
    expect(PROPERTY_OF_PATTERN.test('the innerHTML of #target')).toBe(true);
    expect(PROPERTY_OF_PATTERN.test('the value of me')).toBe(true);
    expect(PROPERTY_OF_PATTERN.test('THE textContent OF it')).toBe(true);
    expect(PROPERTY_OF_PATTERN.test('the title of .my-class')).toBe(true);
  });

  it('should not match invalid patterns', () => {
    expect(PROPERTY_OF_PATTERN.test('innerHTML of #target')).toBe(false); // missing "the"
    expect(PROPERTY_OF_PATTERN.test('the innerHTML')).toBe(false); // missing "of Y"
    expect(PROPERTY_OF_PATTERN.test('innerHTML')).toBe(false);
    expect(PROPERTY_OF_PATTERN.test('')).toBe(false);
  });

  it('should capture property and target correctly', () => {
    const match = 'the innerHTML of #my-element'.match(PROPERTY_OF_PATTERN);
    expect(match).not.toBeNull();
    expect(match![1]).toBe('innerHTML');
    expect(match![2]).toBe('#my-element');
  });
});
