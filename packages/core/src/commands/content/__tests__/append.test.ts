/**
 * Unit Tests for AppendCommand (Decorated Implementation)
 *
 * Tests the append command which adds content to the end of a string,
 * array, or HTML element. Covers all target resolution paths:
 * - No target (context.it fallback)
 * - CSS selector targets (#id, .class, [attr])
 * - Context references (me, it, you)
 * - Variable targets (string, array, new variable)
 * - Direct targets (Array, HTMLElement, other)
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AppendCommand } from '../append';
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

function createMockEvaluator(): ExpressionEvaluator {
  return {
    evaluate: async (node: ASTNode, _context: ExecutionContext) => {
      if (typeof node === 'object' && node !== null && 'value' in node) {
        return (node as any).value;
      }
      if (typeof node === 'object' && node !== null && 'name' in node) {
        return (node as any).name;
      }
      return node;
    },
  } as unknown as ExpressionEvaluator;
}

// ========== Tests ==========

describe('AppendCommand', () => {
  let command: AppendCommand;
  let context: ExecutionContext & TypedExecutionContext;
  let evaluator: ExpressionEvaluator;

  // Track elements appended to document.body for cleanup
  const elementsToCleanup: HTMLElement[] = [];

  beforeEach(() => {
    command = new AppendCommand();
    context = createMockContext();
    evaluator = createMockEvaluator();
  });

  afterEach(() => {
    for (const el of elementsToCleanup) {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }
    elementsToCleanup.length = 0;
  });

  // ========== 1. Metadata ==========

  describe('metadata', () => {
    it('should have correct command name', () => {
      expect(command.name).toBe('append');
    });

    it('should have a description containing "add content" or "end"', () => {
      const desc = command.metadata.description.toLowerCase();
      expect(desc.includes('add content') || desc.includes('end')).toBe(true);
    });

    it('should have syntax as an array', () => {
      expect(command.metadata.syntax).toBeInstanceOf(Array);
      expect(command.metadata.syntax.length).toBeGreaterThan(0);
    });

    it('should have usage examples', () => {
      expect(command.metadata.examples).toBeInstanceOf(Array);
      expect(command.metadata.examples.length).toBeGreaterThan(0);
    });

    it('should declare data-mutation and dom-mutation side effects', () => {
      expect(command.metadata.sideEffects).toContain('data-mutation');
      expect(command.metadata.sideEffects).toContain('dom-mutation');
    });
  });

  // ========== 2. parseInput ==========

  describe('parseInput', () => {
    it('should throw error when no arguments provided', async () => {
      await expect(
        command.parseInput({ args: [], modifiers: {} }, evaluator, context)
      ).rejects.toThrow('append requires content');
    });

    it('should parse content from first argument', async () => {
      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: 'Hello' } as any],
          modifiers: {},
        },
        evaluator,
        context
      );

      expect(input.content).toBe('Hello');
      expect(input.target).toBeUndefined();
    });

    it('should parse target from "to" modifier', async () => {
      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: 'World' } as any],
          modifiers: { to: { type: 'literal', value: 'greeting' } as any },
        },
        evaluator,
        context
      );

      expect(input.content).toBe('World');
      expect(input.target).toBe('greeting');
    });
  });

  // ========== 3. execute - no target (context.it) ==========

  describe('execute - no target (context.it)', () => {
    it('should set context.it when it is undefined', async () => {
      const output = await command.execute({ content: 'Hello' }, context);

      expect(context.it).toBe('Hello');
      expect(output.result).toBe('Hello');
    });

    it('should concatenate to existing context.it', async () => {
      Object.assign(context, { it: 'Hello' });

      const output = await command.execute({ content: ' World' }, context);

      expect(context.it).toBe('Hello World');
      expect(output.result).toBe('Hello World');
    });

    it('should return targetType "result"', async () => {
      const output = await command.execute({ content: 'test' }, context);

      expect(output.targetType).toBe('result');
    });
  });

  // ========== 4. execute - DOM element target ==========

  describe('execute - DOM element target', () => {
    it('should append to element innerHTML via CSS selector', async () => {
      const el = document.createElement('div');
      el.id = 'append-target';
      el.innerHTML = '<p>Existing</p>';
      document.body.appendChild(el);
      elementsToCleanup.push(el);

      const output = await command.execute(
        { content: '<span>New</span>', target: '#append-target' },
        context
      );

      expect(el.innerHTML).toBe('<p>Existing</p><span>New</span>');
      expect(output.targetType).toBe('element');
      expect(output.target).toBe(el);
    });

    it('should append to element innerHTML via context ref "me"', async () => {
      // context.me is an HTMLElement (div#test-element)
      (context.me as HTMLElement).innerHTML = 'Before';

      const output = await command.execute({ content: 'After', target: 'me' }, context);

      expect((context.me as HTMLElement).innerHTML).toBe('BeforeAfter');
      expect(output.targetType).toBe('element');
    });

    it('should return targetType "element" for DOM targets', async () => {
      const el = document.createElement('section');
      el.id = 'section-target';
      document.body.appendChild(el);
      elementsToCleanup.push(el);

      const output = await command.execute(
        { content: 'content', target: '#section-target' },
        context
      );

      expect(output.targetType).toBe('element');
      expect(output.result).toBe(el);
    });
  });

  // ========== 5. execute - variable target ==========

  describe('execute - variable target', () => {
    it('should append to existing string variable', async () => {
      context.locals.set('greeting', 'Hello');

      const output = await command.execute({ content: ' World', target: 'greeting' }, context);

      expect(context.locals.get('greeting')).toBe('Hello World');
      expect(output.result).toBe('Hello World');
      expect(output.targetType).toBe('variable');
    });

    it('should create new variable when undefined', async () => {
      const output = await command.execute({ content: 'NewValue', target: 'newVar' }, context);

      expect(context.locals.get('newVar')).toBe('NewValue');
      expect(output.result).toBe('NewValue');
      expect(output.targetType).toBe('variable');
    });

    it('should push to existing array variable', async () => {
      context.locals.set('items', [1, 2, 3]);

      const output = await command.execute({ content: 4, target: 'items' }, context);

      expect(context.locals.get('items')).toEqual([1, 2, 3, 4]);
      expect(output.targetType).toBe('array');
    });

    it('should return appropriate targetType for each variable type', async () => {
      // String variable
      context.locals.set('strVar', 'abc');
      const strOutput = await command.execute({ content: 'def', target: 'strVar' }, context);
      expect(strOutput.targetType).toBe('variable');

      // Array variable
      context.locals.set('arrVar', ['a']);
      const arrOutput = await command.execute({ content: 'b', target: 'arrVar' }, context);
      expect(arrOutput.targetType).toBe('array');
    });
  });

  // ========== 6. execute - direct targets ==========

  describe('execute - direct targets', () => {
    it('should push to Array target directly', async () => {
      const arr = ['a', 'b'];

      const output = await command.execute({ content: 'c', target: arr }, context);

      expect(arr).toEqual(['a', 'b', 'c']);
      expect(output.targetType).toBe('array');
      expect(output.result).toBe(arr);
    });

    it('should append to HTMLElement target directly', async () => {
      const el = document.createElement('div');
      el.innerHTML = '<b>Bold</b>';

      const output = await command.execute(
        { content: '<i>Italic</i>', target: el as any },
        context
      );

      expect(el.innerHTML).toBe('<b>Bold</b><i>Italic</i>');
      expect(output.targetType).toBe('element');
      expect(output.target).toBe(el);
    });

    it('should concatenate non-matching target as string and set context.it', async () => {
      const output = await command.execute({ content: ' suffix', target: 42 as any }, context);

      expect(output.result).toBe('42 suffix');
      expect(output.targetType).toBe('string');
      expect(context.it).toBe('42 suffix');
    });
  });

  // ========== 7. integration ==========

  describe('integration', () => {
    it('should end-to-end append to context.it via parseInput + execute', async () => {
      Object.assign(context, { it: 'Start' });

      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: 'End' } as any],
          modifiers: {},
        },
        evaluator,
        context
      );

      const output = await command.execute(input, context);

      expect(context.it).toBe('StartEnd');
      expect(output.result).toBe('StartEnd');
      expect(output.targetType).toBe('result');
    });

    it('should end-to-end append to variable via parseInput + execute', async () => {
      context.locals.set('msg', 'Hello');

      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: ', World!' } as any],
          modifiers: { to: { type: 'literal', value: 'msg' } as any },
        },
        evaluator,
        context
      );

      const output = await command.execute(input, context);

      expect(context.locals.get('msg')).toBe('Hello, World!');
      expect(output.result).toBe('Hello, World!');
      expect(output.targetType).toBe('variable');
      expect(output.target).toBe('msg');
    });
  });
});
