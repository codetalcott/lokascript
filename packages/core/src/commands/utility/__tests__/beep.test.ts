/**
 * Unit Tests for BeepCommand (Decorated Implementation)
 *
 * Tests debug output for expressions with type information.
 * Covers metadata, parseInput, execute (context debug + expression debug),
 * type detection, representation formatting, and end-to-end integration.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BeepCommand } from '../beep';
import type { ExecutionContext, TypedExecutionContext } from '../../../types/core';
import type { ASTNode } from '../../../types/base-types';
import type { ExpressionEvaluator } from '../../../core/expression-evaluator';

// ========== Test Utilities ==========

function createMockContext(
  overrides?: Partial<TypedExecutionContext>
): ExecutionContext & TypedExecutionContext {
  return {
    me: document.createElement('div'),
    you: null,
    it: undefined,
    result: undefined,
    locals: new Map(),
    globals: new Map(),
    variables: new Map(),
    target: document.createElement('div'),
    detail: undefined,
    ...overrides,
  } as unknown as ExecutionContext & TypedExecutionContext;
}

function createMockEvaluator() {
  return {
    evaluate: async (node: ASTNode, _context: ExecutionContext) => {
      if (typeof node === 'object' && node !== null && 'value' in node) {
        return (node as unknown as { value: unknown }).value;
      }
      return node;
    },
  } as unknown as ExpressionEvaluator;
}

// ========== Tests ==========

describe('BeepCommand', () => {
  let command: BeepCommand;
  let consoleGroupSpy: ReturnType<typeof vi.spyOn>;
  let consoleGroupEndSpy: ReturnType<typeof vi.spyOn>;
  let consoleLogSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    command = new BeepCommand();
    consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleGroupSpy.mockRestore();
    consoleGroupEndSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  // ===========================================================================
  // 1. Metadata
  // ===========================================================================

  describe('metadata', () => {
    it('should have name "beep"', () => {
      expect(command.name).toBe('beep');
    });

    it('should have a description containing "debug"', () => {
      expect(command.metadata).toBeDefined();
      expect(command.metadata.description.toLowerCase()).toContain('debug');
    });

    it('should have a syntax array', () => {
      const syntax = command.metadata.syntax;
      const syntaxArray = Array.isArray(syntax) ? syntax : [syntax];
      expect(syntaxArray.length).toBeGreaterThan(0);
    });

    it('should have examples', () => {
      expect(command.metadata.examples).toBeInstanceOf(Array);
      expect(command.metadata.examples.length).toBeGreaterThan(0);
    });

    it('should declare console-output and debugging side effects', () => {
      expect(command.metadata.sideEffects).toBeDefined();
      expect(command.metadata.sideEffects).toContain('console-output');
      expect(command.metadata.sideEffects).toContain('debugging');
    });
  });

  // ===========================================================================
  // 2. parseInput
  // ===========================================================================

  describe('parseInput', () => {
    it('should return empty expressions array when no args provided', async () => {
      const context = createMockContext();
      const evaluator = createMockEvaluator();

      const input = await command.parseInput({ args: [], modifiers: {} }, evaluator, context);

      expect(input.expressions).toEqual([]);
    });

    it('should evaluate and return a single arg', async () => {
      const context = createMockContext();
      const evaluator = {
        evaluate: async () => 'hello',
      } as unknown as ExpressionEvaluator;

      const input = await command.parseInput(
        { args: [{ type: 'literal', value: 'hello' }], modifiers: {} },
        evaluator,
        context
      );

      expect(input.expressions).toEqual(['hello']);
    });

    it('should evaluate and return multiple args', async () => {
      const context = createMockContext();
      let callCount = 0;
      const valuesToReturn = ['first', 42, true];
      const evaluator = {
        evaluate: async () => valuesToReturn[callCount++],
      } as unknown as ExpressionEvaluator;

      const input = await command.parseInput(
        {
          args: [
            { type: 'literal', value: 'first' },
            { type: 'literal', value: 42 },
            { type: 'literal', value: true },
          ],
          modifiers: {},
        },
        evaluator,
        context
      );

      expect(input.expressions).toEqual(['first', 42, true]);
    });
  });

  // ===========================================================================
  // 3. execute - no expressions (context debug)
  // ===========================================================================

  describe('execute - no expressions (context debug)', () => {
    it('should call console.group with the context debug label', async () => {
      const context = createMockContext();

      await command.execute({ expressions: [] }, context);

      expect(consoleGroupSpy).toHaveBeenCalledWith(expect.stringContaining('Context Debug'));
    });

    it('should log context properties (me, it, you, locals, globals, variables)', async () => {
      const meEl = document.createElement('span');
      const context = createMockContext({
        me: meEl,
        it: 'someValue',
        you: null,
        locals: new Map([['x', 1]]),
        globals: new Map([['g', 2]]),
        variables: new Map([['v', 3]]),
      } as unknown as Partial<TypedExecutionContext>);

      await command.execute({ expressions: [] }, context);

      expect(consoleLogSpy).toHaveBeenCalledWith('me:', meEl);
      expect(consoleLogSpy).toHaveBeenCalledWith('it:', 'someValue');
      expect(consoleLogSpy).toHaveBeenCalledWith('you:', null);
      expect(consoleLogSpy).toHaveBeenCalledWith('locals:', context.locals);
      expect(consoleLogSpy).toHaveBeenCalledWith('globals:', context.globals);
      expect(consoleLogSpy).toHaveBeenCalledWith('variables:', context.variables);
    });

    it('should return expressionCount 0 with debugged true and empty outputs', async () => {
      const context = createMockContext();

      const result = await command.execute({ expressions: [] }, context);

      expect(result).toEqual({
        expressionCount: 0,
        debugged: true,
        outputs: [],
      });
    });
  });

  // ===========================================================================
  // 4. execute - with expressions
  // ===========================================================================

  describe('execute - with expressions', () => {
    it('should call console.group with the beep debug label', async () => {
      const context = createMockContext();

      await command.execute({ expressions: ['test'] }, context);

      expect(consoleGroupSpy).toHaveBeenCalledWith(expect.stringContaining('beep'));
    });

    it('should return outputs array with correct length', async () => {
      const context = createMockContext();

      const result = await command.execute({ expressions: [1, 'two', null] }, context);

      expect(result.outputs).toHaveLength(3);
      expect(result.expressionCount).toBe(3);
    });

    it('should produce outputs with value, type, and representation for each expression', async () => {
      const context = createMockContext();

      const result = await command.execute({ expressions: [42] }, context);

      expect(result.outputs[0]).toHaveProperty('value', 42);
      expect(result.outputs[0]).toHaveProperty('type', 'number');
      expect(result.outputs[0]).toHaveProperty('representation', '42');
    });

    it('should call console.groupEnd after logging expressions', async () => {
      const context = createMockContext();

      await command.execute({ expressions: ['a', 'b'] }, context);

      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });
  });

  // ===========================================================================
  // 5. execute - type detection
  // ===========================================================================

  describe('execute - type detection', () => {
    async function getTypeFor(value: unknown): Promise<string> {
      const context = createMockContext();
      const result = await command.execute({ expressions: [value] }, context);
      return result.outputs[0].type;
    }

    it('should detect null', async () => {
      expect(await getTypeFor(null)).toBe('null');
    });

    it('should detect undefined', async () => {
      expect(await getTypeFor(undefined)).toBe('undefined');
    });

    it('should detect array', async () => {
      expect(await getTypeFor([1, 2, 3])).toBe('array');
    });

    it('should detect HTMLElement', async () => {
      const el = document.createElement('div');
      expect(await getTypeFor(el)).toBe('HTMLElement');
    });

    it('should detect Error', async () => {
      expect(await getTypeFor(new Error('oops'))).toBe('Error');
    });

    it('should detect Date', async () => {
      expect(await getTypeFor(new Date())).toBe('Date');
    });

    it('should detect RegExp', async () => {
      expect(await getTypeFor(/abc/)).toBe('RegExp');
    });

    it('should detect string via typeof', async () => {
      expect(await getTypeFor('hello')).toBe('string');
    });

    it('should detect number via typeof', async () => {
      expect(await getTypeFor(99)).toBe('number');
    });

    it('should detect plain object via typeof', async () => {
      expect(await getTypeFor({ a: 1 })).toBe('object');
    });
  });

  // ===========================================================================
  // 6. execute - representation
  // ===========================================================================

  describe('execute - representation', () => {
    async function getRepresentationFor(value: unknown): Promise<string> {
      const context = createMockContext();
      const result = await command.execute({ expressions: [value] }, context);
      return result.outputs[0].representation;
    }

    it('should represent null as "null"', async () => {
      expect(await getRepresentationFor(null)).toBe('null');
    });

    it('should represent undefined as "undefined"', async () => {
      expect(await getRepresentationFor(undefined)).toBe('undefined');
    });

    it('should represent array with preview of first 3 items and ellipsis if longer', async () => {
      const shortArray = [1, 2];
      const shortRepr = await getRepresentationFor(shortArray);
      expect(shortRepr).toBe('Array(2) [1, 2]');

      const longArray = [10, 20, 30, 40, 50];
      const longRepr = await getRepresentationFor(longArray);
      expect(longRepr).toBe('Array(5) [10, 20, 30...]');
    });

    it('should represent HTMLElement with tag, id, and classes', async () => {
      const el = document.createElement('button');
      el.id = 'submit';
      el.className = 'btn primary';

      const repr = await getRepresentationFor(el);
      expect(repr).toBe('<button#submit.btn.primary/>');
    });

    it('should represent Error with its message', async () => {
      const err = new Error('something went wrong');
      const repr = await getRepresentationFor(err);
      expect(repr).toBe('Error: something went wrong');
    });

    it('should truncate strings longer than 50 characters', async () => {
      const short = 'hello';
      expect(await getRepresentationFor(short)).toBe('"hello"');

      const long = 'a'.repeat(60);
      const repr = await getRepresentationFor(long);
      expect(repr).toBe(`"${'a'.repeat(47)}..."`);
      expect(repr.length).toBeLessThanOrEqual(52); // 47 chars + "..." + 2 quotes
    });

    it('should represent object with preview of first 3 keys and ellipsis if more', async () => {
      const small = { x: 1, y: 2 };
      expect(await getRepresentationFor(small)).toBe('Object {x, y}');

      const large = { a: 1, b: 2, c: 3, d: 4 };
      expect(await getRepresentationFor(large)).toBe('Object {a, b, c...}');
    });
  });

  // ===========================================================================
  // 7. Integration
  // ===========================================================================

  describe('integration', () => {
    it('should parse and execute a single expression end-to-end', async () => {
      const context = createMockContext();
      const evaluator = {
        evaluate: async () => 42,
      } as unknown as ExpressionEvaluator;

      // Parse
      const input = await command.parseInput(
        { args: [{ type: 'literal', value: 42 }], modifiers: {} },
        evaluator,
        context
      );

      expect(input.expressions).toEqual([42]);

      // Execute
      const result = await command.execute(input, context);

      expect(result.debugged).toBe(true);
      expect(result.expressionCount).toBe(1);
      expect(result.outputs).toHaveLength(1);
      expect(result.outputs[0]).toEqual({
        value: 42,
        type: 'number',
        representation: '42',
      });

      // Console calls
      expect(consoleGroupSpy).toHaveBeenCalledWith(expect.stringContaining('beep'));
      expect(consoleLogSpy).toHaveBeenCalledWith('Value:', 42);
      expect(consoleLogSpy).toHaveBeenCalledWith('Type:', 'number');
      expect(consoleLogSpy).toHaveBeenCalledWith('Representation:', '42');
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });

    it('should parse and execute with no expressions (context debug) end-to-end', async () => {
      const context = createMockContext();
      const evaluator = createMockEvaluator();

      // Parse with no args
      const input = await command.parseInput({ args: [], modifiers: {} }, evaluator, context);

      expect(input.expressions).toEqual([]);

      // Execute
      const result = await command.execute(input, context);

      expect(result.debugged).toBe(true);
      expect(result.expressionCount).toBe(0);
      expect(result.outputs).toEqual([]);

      // Should have used context debug path
      expect(consoleGroupSpy).toHaveBeenCalledWith(expect.stringContaining('Context Debug'));
      expect(consoleLogSpy).toHaveBeenCalledWith('me:', context.me);
      expect(consoleGroupEndSpy).toHaveBeenCalled();
    });
  });
});
