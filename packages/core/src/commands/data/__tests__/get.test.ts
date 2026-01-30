/**
 * Unit Tests for GetCommand (Standalone V2)
 *
 * Comprehensive coverage of get command behaviors:
 * - Evaluates expression and stores in context.it / context.result
 * - Unwraps single-element NodeList/Array
 * - Returns { value } output
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { GetCommand } from '../get';
import type { ExecutionContext, TypedExecutionContext } from '../../../types/core';
import type { ASTNode } from '../../../types/base-types';
import type { ExpressionEvaluator } from '../../../core/expression-evaluator';

// ========== Test Utilities ==========

function createMockContext(
  overrides: Partial<ExecutionContext> = {}
): ExecutionContext & TypedExecutionContext {
  const meElement = document.createElement('div');
  meElement.id = 'test-element';

  return {
    me: meElement,
    you: undefined,
    it: undefined,
    result: undefined,
    locals: new Map(),
    globals: new Map(),
    target: meElement,
    detail: undefined,
    ...overrides,
  } as unknown as ExecutionContext & TypedExecutionContext;
}

function createMockEvaluator() {
  return {
    evaluate: async (node: ASTNode, _context: ExecutionContext) => {
      if (typeof node === 'object' && node !== null && 'value' in node) {
        return (node as any).value;
      }
      return node;
    },
  } as ExpressionEvaluator;
}

// ========== Tests ==========

describe('GetCommand (Standalone V2)', () => {
  let command: GetCommand;
  let context: ExecutionContext & TypedExecutionContext;
  let evaluator: ExpressionEvaluator;

  beforeEach(() => {
    command = new GetCommand();
    context = createMockContext();
    evaluator = createMockEvaluator();
  });

  describe('metadata', () => {
    it('should have correct command name', () => {
      expect(command.name).toBe('get');
    });

    it('should have metadata with description containing evaluate', () => {
      expect(command.metadata).toBeDefined();
      expect(command.metadata.description.toLowerCase()).toContain('evaluate');
    });

    it('should have syntax defined', () => {
      expect(command.metadata.syntax).toBeDefined();
      expect(command.metadata.syntax).toBe('get <expression>');
    });

    it('should have usage examples', () => {
      expect(command.metadata.examples).toBeInstanceOf(Array);
      expect(command.metadata.examples.length).toBeGreaterThan(0);
      expect(command.metadata.examples).toContain('get #my-dialog');
      expect(command.metadata.examples).toContain('get <button/>');
      expect(command.metadata.examples).toContain('get me.parentElement');
    });

    it('should have correct side effects', () => {
      expect(command.metadata.sideEffects).toContain('context-mutation');
    });
  });

  describe('parseInput', () => {
    it('should throw error when no arguments provided', async () => {
      await expect(
        command.parseInput({ args: [], modifiers: {} }, evaluator, context)
      ).rejects.toThrow('get command requires an expression argument');
    });

    it('should parse a single expression argument', async () => {
      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: 'hello' } as any],
          modifiers: {},
        },
        evaluator,
        context
      );

      expect(input).toEqual({ value: 'hello' });
    });

    it('should unwrap single-element array', async () => {
      const element = document.createElement('span');
      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: [element] } as any],
          modifiers: {},
        },
        evaluator,
        context
      );

      expect(input.value).toBe(element);
    });

    it('should unwrap single-element NodeList', async () => {
      // Create a container with a single child to produce a NodeList with length 1
      const container = document.createElement('div');
      const child = document.createElement('p');
      child.className = 'target';
      container.appendChild(child);
      document.body.appendChild(container);

      const nodeList = container.querySelectorAll('.target');
      expect(nodeList.length).toBe(1);

      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: nodeList } as any],
          modifiers: {},
        },
        evaluator,
        context
      );

      expect(input.value).toBe(child);

      // Cleanup
      document.body.removeChild(container);
    });

    it('should preserve multi-element array as-is', async () => {
      const el1 = document.createElement('div');
      const el2 = document.createElement('div');
      const arr = [el1, el2];

      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: arr } as any],
          modifiers: {},
        },
        evaluator,
        context
      );

      expect(input.value).toBe(arr);
      expect(Array.isArray(input.value)).toBe(true);
      expect((input.value as Element[]).length).toBe(2);
    });

    it('should preserve multi-element NodeList as-is', async () => {
      const container = document.createElement('div');
      const child1 = document.createElement('p');
      const child2 = document.createElement('p');
      child1.className = 'multi';
      child2.className = 'multi';
      container.appendChild(child1);
      container.appendChild(child2);
      document.body.appendChild(container);

      const nodeList = container.querySelectorAll('.multi');
      expect(nodeList.length).toBe(2);

      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: nodeList } as any],
          modifiers: {},
        },
        evaluator,
        context
      );

      expect(input.value).toBe(nodeList);
      expect(input.value).toBeInstanceOf(NodeList);

      // Cleanup
      document.body.removeChild(container);
    });
  });

  describe('execute', () => {
    it('should store value in context.it', () => {
      const result = command.execute({ value: 42 }, context);

      expect(context.it).toBe(42);
      expect(result).toEqual({ value: 42 });
    });

    it('should store value in context.result', () => {
      command.execute({ value: 'test-value' }, context);

      expect(context.result).toBe('test-value');
    });

    it('should return an object with value property', () => {
      const result = command.execute({ value: 'hello' }, context);

      expect(result).toEqual({ value: 'hello' });
    });

    it('should handle null value', () => {
      const result = command.execute({ value: null }, context);

      expect(context.it).toBeNull();
      expect(context.result).toBeNull();
      expect(result).toEqual({ value: null });
    });

    it('should handle undefined value', () => {
      const result = command.execute({ value: undefined }, context);

      expect(context.it).toBeUndefined();
      expect(context.result).toBeUndefined();
      expect(result).toEqual({ value: undefined });
    });

    it('should handle DOM element value', () => {
      const element = document.createElement('button');
      element.id = 'my-button';

      const result = command.execute({ value: element }, context);

      expect(context.it).toBe(element);
      expect(context.result).toBe(element);
      expect(result).toEqual({ value: element });
    });

    it('should handle numeric value', () => {
      const result = command.execute({ value: 3.14 }, context);

      expect(context.it).toBe(3.14);
      expect(context.result).toBe(3.14);
      expect(result).toEqual({ value: 3.14 });
    });

    it('should handle object value', () => {
      const obj = { key: 'data', nested: { a: 1 } };
      const result = command.execute({ value: obj }, context);

      expect(context.it).toBe(obj);
      expect(context.result).toBe(obj);
      expect(result).toEqual({ value: obj });
    });
  });

  describe('validate', () => {
    it('should return true for valid input with value property', () => {
      expect(command.validate({ value: 'hello' })).toBe(true);
    });

    it('should return true for input with null value', () => {
      expect(command.validate({ value: null })).toBe(true);
    });

    it('should return true for input with undefined value', () => {
      expect(command.validate({ value: undefined })).toBe(true);
    });

    it('should return false for null input', () => {
      expect(command.validate(null)).toBe(false);
    });

    it('should return false for undefined input', () => {
      expect(command.validate(undefined)).toBe(false);
    });

    it('should return false for non-object input', () => {
      expect(command.validate('string')).toBe(false);
      expect(command.validate(42)).toBe(false);
      expect(command.validate(true)).toBe(false);
    });

    it('should return false for object missing value property', () => {
      expect(command.validate({ other: 'prop' })).toBe(false);
      expect(command.validate({})).toBe(false);
    });
  });

  describe('integration', () => {
    it('should work end-to-end: parse expression and store in context', async () => {
      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: 'resolved-value' } as any],
          modifiers: {},
        },
        evaluator,
        context
      );

      expect(command.validate(input)).toBe(true);

      const result = command.execute(input, context);

      expect(result).toEqual({ value: 'resolved-value' });
      expect(context.it).toBe('resolved-value');
      expect(context.result).toBe('resolved-value');
    });

    it('should work end-to-end with DOM element and unwrapping', async () => {
      const dialog = document.createElement('dialog');
      dialog.id = 'my-dialog';

      // Single-element array gets unwrapped
      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: [dialog] } as any],
          modifiers: {},
        },
        evaluator,
        context
      );

      expect(command.validate(input)).toBe(true);

      const result = command.execute(input, context);

      expect(result).toEqual({ value: dialog });
      expect(context.it).toBe(dialog);
      expect(context.result).toBe(dialog);
    });

    it('should work end-to-end with numeric expression', async () => {
      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: 99 } as any],
          modifiers: {},
        },
        evaluator,
        context
      );

      expect(command.validate(input)).toBe(true);

      const result = command.execute(input, context);

      expect(result).toEqual({ value: 99 });
      expect(context.it).toBe(99);
      expect(context.result).toBe(99);
    });
  });
});
