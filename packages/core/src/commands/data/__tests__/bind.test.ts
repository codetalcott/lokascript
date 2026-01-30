/**
 * Unit Tests for BindCommand (Decorated Implementation)
 *
 * Comprehensive coverage of all bind command behaviors:
 * - Two-way data binding between variables and DOM elements
 * - Direction control: to (element->variable), from (variable->element), bidirectional
 * - Event listener setup for input/change events based on property type
 * - MutationObserver for attribute/textContent/innerHTML bindings
 * - Module-level utility functions: unbind, unbindVariable, getActiveBindings
 * - Binding lifecycle management and cleanup
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { BindCommand, unbind, unbindVariable, getActiveBindings } from '../bind';
import type { ExecutionContext, TypedExecutionContext } from '../../../types/core';
import type { ASTNode } from '../../../types/base-types';
import type { ExpressionEvaluator } from '../../../core/expression-evaluator';

// ========== Test Utilities ==========

function createMockContext(
  overrides: Partial<ExecutionContext> = {}
): ExecutionContext & TypedExecutionContext {
  const meElement = document.createElement('input');
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

function createMockEvaluator(overrides?: Partial<ExpressionEvaluator>): ExpressionEvaluator {
  return {
    evaluate: async (node: ASTNode, _context: ExecutionContext) => {
      if (typeof node === 'object' && node !== null && 'value' in node) {
        return (node as any).value;
      }
      return node;
    },
    ...overrides,
  } as ExpressionEvaluator;
}

/**
 * Clean up all active bindings between tests to prevent cross-test pollution.
 * The activeBindings Map is module-global, so each test must leave it empty.
 */
function cleanupAllBindings(): void {
  const bindings = getActiveBindings();
  for (const binding of bindings) {
    unbind(binding.id);
  }
}

// ========== Tests ==========

describe('BindCommand (Decorated Implementation)', () => {
  let command: BindCommand;
  let context: ExecutionContext & TypedExecutionContext;
  let evaluator: ExpressionEvaluator;

  beforeEach(() => {
    command = new BindCommand();
    context = createMockContext();
    evaluator = createMockEvaluator();
  });

  afterEach(() => {
    cleanupAllBindings();
  });

  // ========== 1. Metadata ==========

  describe('metadata', () => {
    it('should have correct command name', () => {
      expect(command.name).toBe('bind');
    });

    it('should have metadata with description containing "binding"', () => {
      expect(command.metadata).toBeDefined();
      expect(command.metadata.description.toLowerCase()).toContain('binding');
    });

    it('should have syntax examples', () => {
      expect(command.metadata.syntax).toBeInstanceOf(Array);
      expect((command.metadata.syntax as string[]).length).toBeGreaterThan(0);
    });

    it('should have usage examples', () => {
      expect(command.metadata.examples).toBeInstanceOf(Array);
      expect(command.metadata.examples.some(ex => ex.includes('bind'))).toBe(true);
    });

    it('should have correct side effects', () => {
      expect(command.metadata.sideEffects).toContain('data-binding');
      expect(command.metadata.sideEffects).toContain('event-listeners');
      expect(command.metadata.sideEffects).toContain('dom-observation');
    });
  });

  // ========== 2. parseInput ==========

  describe('parseInput', () => {
    it('should throw error when no arguments provided', async () => {
      await expect(
        command.parseInput({ args: [], modifiers: {} }, evaluator, context)
      ).rejects.toThrow('requires a variable name');
    });

    it('should parse variable name and strip : prefix', async () => {
      const targetElement = document.createElement('input');
      document.body.appendChild(targetElement);
      targetElement.id = 'bind-target';

      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: ':username' } as any],
          modifiers: { to: { type: 'literal', value: '#bind-target' } as any },
        },
        evaluator,
        context
      );

      expect(input.variable).toBe('username');
      document.body.removeChild(targetElement);
    });

    it('should detect direction from modifiers', async () => {
      const targetElement = document.createElement('input');
      document.body.appendChild(targetElement);
      targetElement.id = 'dir-target';

      // Test 'to' direction (default when to modifier present)
      const inputTo = await command.parseInput(
        {
          args: [{ type: 'literal', value: ':myvar' } as any],
          modifiers: { to: { type: 'literal', value: '#dir-target' } as any },
        },
        evaluator,
        context
      );
      expect(inputTo.direction).toBe('to');

      // Test 'from' direction
      const inputFrom = await command.parseInput(
        {
          args: [{ type: 'literal', value: ':myvar' } as any],
          modifiers: { from: { type: 'literal', value: '#dir-target' } as any },
        },
        evaluator,
        context
      );
      expect(inputFrom.direction).toBe('from');

      // Test 'bidirectional'
      const inputBidi = await command.parseInput(
        {
          args: [{ type: 'literal', value: ':myvar' } as any],
          modifiers: {
            to: { type: 'literal', value: '#dir-target' } as any,
            bidirectional: { type: 'literal', value: true } as any,
          },
        },
        evaluator,
        context
      );
      expect(inputBidi.direction).toBe('bidirectional');

      document.body.removeChild(targetElement);
    });

    it('should resolve target element from CSS selector', async () => {
      const targetElement = document.createElement('input');
      document.body.appendChild(targetElement);
      targetElement.id = 'resolve-target';

      const resolverEvaluator = createMockEvaluator({
        evaluate: async (node: ASTNode, _ctx: ExecutionContext) => {
          if (typeof node === 'object' && node !== null && 'value' in node) {
            return (node as any).value;
          }
          return node;
        },
      });

      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: ':myvar' } as any],
          modifiers: { to: { type: 'literal', value: '#resolve-target' } as any },
        },
        resolverEvaluator,
        context
      );

      expect(input.target).toBe(targetElement);
      document.body.removeChild(targetElement);
    });

    it('should default property to "value"', async () => {
      const targetElement = document.createElement('input');
      document.body.appendChild(targetElement);
      targetElement.id = 'prop-target';

      // Provide an element directly via the (raw as any).target path
      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: ':myvar' } as any],
          modifiers: {},
          target: targetElement,
          property: undefined,
        } as any,
        evaluator,
        context
      );

      expect(input.property).toBe('value');
      document.body.removeChild(targetElement);
    });
  });

  // ========== 3. execute - binding creation ==========

  describe('execute - binding creation', () => {
    it('should return success:true with a bindingId', async () => {
      const element = document.createElement('input');

      const result = await command.execute(
        { variable: 'username', target: element, property: 'value', direction: 'to' },
        context
      );

      expect(result.success).toBe(true);
      expect(result.bindingId).toBeDefined();
      expect(result.bindingId).toMatch(/^bind-/);
    });

    it('should dispatch bind:created event on context.me', async () => {
      const element = document.createElement('input');
      const meElement = context.me as HTMLElement;
      const eventSpy = vi.fn();
      meElement.addEventListener('bind:created', eventSpy);

      await command.execute(
        { variable: 'username', target: element, property: 'value', direction: 'to' },
        context
      );

      expect(eventSpy).toHaveBeenCalledTimes(1);
      const event = eventSpy.mock.calls[0][0] as CustomEvent;
      expect(event.detail.variable).toBe('username');
      expect(event.detail.direction).toBe('to');
      expect(event.detail.bindingId).toMatch(/^bind-/);

      meElement.removeEventListener('bind:created', eventSpy);
    });

    it('should store binding in activeBindings', async () => {
      const element = document.createElement('input');
      const beforeCount = getActiveBindings().length;

      const result = await command.execute(
        { variable: 'counter', target: element, property: 'value', direction: 'to' },
        context
      );

      const afterCount = getActiveBindings().length;
      expect(afterCount).toBe(beforeCount + 1);

      const binding = getActiveBindings().find(b => b.id === result.bindingId);
      expect(binding).toBeDefined();
      expect(binding!.variable).toBe('counter');
      expect(binding!.direction).toBe('to');
    });

    it('should map property to correct event type (value->input, checked->change)', async () => {
      // Test that value property binds to 'input' event
      const inputEl = document.createElement('input');
      const inputSpy = vi.fn();
      inputEl.addEventListener('input', inputSpy);

      await command.execute(
        { variable: 'val', target: inputEl, property: 'value', direction: 'to' },
        context
      );

      inputEl.value = 'changed';
      inputEl.dispatchEvent(new Event('input'));
      // The handler itself is invoked, which proves 'input' event is listened to
      expect(context.locals.get('val')).toBeDefined();

      inputEl.removeEventListener('input', inputSpy);

      // Test that checked property binds to 'change' event
      cleanupAllBindings();
      const checkboxEl = document.createElement('input');
      checkboxEl.type = 'checkbox';
      const context2 = createMockContext();

      await command.execute(
        { variable: 'isChecked', target: checkboxEl, property: 'checked', direction: 'to' },
        context2
      );

      (checkboxEl as HTMLInputElement).checked = true;
      checkboxEl.dispatchEvent(new Event('change'));
      expect(context2.locals.get('isChecked')).toBe(true);
    });
  });

  // ========== 4. execute - 'to' direction ==========

  describe('execute - "to" direction', () => {
    it('should update variable when element value changes via input event', async () => {
      const element = document.createElement('input') as HTMLInputElement;

      await command.execute(
        { variable: 'text', target: element, property: 'value', direction: 'to' },
        context
      );

      // Simulate user typing
      element.value = 'hello world';
      element.dispatchEvent(new Event('input'));

      expect(context.locals.get('text')).toBe('hello world');
    });

    it('should perform initial sync for "to" direction', async () => {
      const element = document.createElement('input') as HTMLInputElement;
      element.value = 'initial-value';

      await command.execute(
        { variable: 'synced', target: element, property: 'value', direction: 'to' },
        context
      );

      // Initial sync should have read the current element value into the variable
      expect(context.locals.get('synced')).toBe('initial-value');
    });

    it('should dispatch variable:change custom event when element changes', async () => {
      const element = document.createElement('input') as HTMLInputElement;
      const eventSpy = vi.fn();
      element.addEventListener('variable:myvar:change', eventSpy);

      await command.execute(
        { variable: 'myvar', target: element, property: 'value', direction: 'to' },
        context
      );

      // Trigger element change (after initial sync)
      element.value = 'updated';
      element.dispatchEvent(new Event('input'));

      // The event should fire: once for initial sync + once for the manual dispatch
      // Initial sync calls updateVariable() which dispatches the event
      // Manual input also dispatches
      expect(eventSpy).toHaveBeenCalled();
      const lastCall = eventSpy.mock.calls[eventSpy.mock.calls.length - 1][0] as CustomEvent;
      expect(lastCall.detail.value).toBe('updated');
      expect(lastCall.detail.originElement).toBe(element);

      element.removeEventListener('variable:myvar:change', eventSpy);
    });
  });

  // ========== 5. execute - 'from' direction ==========

  describe('execute - "from" direction', () => {
    it('should update element when variable:change event is dispatched', async () => {
      const element = document.createElement('input') as HTMLInputElement;

      await command.execute(
        { variable: 'source', target: element, property: 'value', direction: 'from' },
        context
      );

      // Simulate variable change event (as if another binding or code dispatched it)
      const changeEvent = new CustomEvent('variable:source:change', {
        detail: { value: 'from-variable', source: 'variable' },
        bubbles: true,
      });
      element.dispatchEvent(changeEvent);

      expect(element.value).toBe('from-variable');
    });

    it('should perform initial sync from variable value', async () => {
      const element = document.createElement('input') as HTMLInputElement;
      element.value = '';
      context.locals.set('preloaded', 'pre-existing-value');

      await command.execute(
        { variable: 'preloaded', target: element, property: 'value', direction: 'from' },
        context
      );

      // The element should have been updated to the variable's current value
      expect(element.value).toBe('pre-existing-value');
    });
  });

  // ========== 6. execute - bidirectional ==========

  describe('execute - bidirectional', () => {
    it('should handle both directions', async () => {
      const element = document.createElement('input') as HTMLInputElement;
      context.locals.set('bidi', 'initial');

      await command.execute(
        { variable: 'bidi', target: element, property: 'value', direction: 'bidirectional' },
        context
      );

      // Initial sync from variable -> element (from direction does this)
      expect(element.value).toBe('initial');

      // Element -> variable (to direction): simulate user input
      element.value = 'user-typed';
      element.dispatchEvent(new Event('input'));
      expect(context.locals.get('bidi')).toBe('user-typed');

      // Variable -> element (from direction): simulate variable change from another source
      const externalEvent = new CustomEvent('variable:bidi:change', {
        detail: { value: 'external-update', source: 'variable', originElement: null },
        bubbles: true,
      });
      element.dispatchEvent(externalEvent);
      expect(element.value).toBe('external-update');
    });

    it('should prevent update loops via originElement check', async () => {
      const element = document.createElement('input') as HTMLInputElement;

      await command.execute(
        { variable: 'looptest', target: element, property: 'value', direction: 'bidirectional' },
        context
      );

      // When the element itself is the origin, the 'from' handler should skip the update.
      // Set element value, then dispatch variable:change with originElement === element.
      element.value = 'original';
      const selfOriginEvent = new CustomEvent('variable:looptest:change', {
        detail: { value: 'should-not-apply', source: 'variable', originElement: element },
        bubbles: true,
      });
      element.dispatchEvent(selfOriginEvent);

      // Element value should NOT be changed because originElement matches
      expect(element.value).toBe('original');
    });
  });

  // ========== 7. Utility functions ==========

  describe('utility functions', () => {
    it('unbind should remove a specific binding and call cleanup', async () => {
      const element = document.createElement('input') as HTMLInputElement;

      const result = await command.execute(
        { variable: 'cleanup1', target: element, property: 'value', direction: 'to' },
        context
      );

      expect(getActiveBindings().some(b => b.id === result.bindingId)).toBe(true);

      const removed = unbind(result.bindingId);
      expect(removed).toBe(true);
      expect(getActiveBindings().some(b => b.id === result.bindingId)).toBe(false);

      // After unbind, the event listener should be removed.
      // Changing the element should NOT update the variable anymore.
      context.locals.delete('cleanup1');
      element.value = 'after-unbind';
      element.dispatchEvent(new Event('input'));
      expect(context.locals.has('cleanup1')).toBe(false);
    });

    it('unbindVariable should remove all bindings for a variable', async () => {
      const el1 = document.createElement('input') as HTMLInputElement;
      const el2 = document.createElement('input') as HTMLInputElement;

      await command.execute(
        { variable: 'shared', target: el1, property: 'value', direction: 'to' },
        context
      );
      await command.execute(
        { variable: 'shared', target: el2, property: 'value', direction: 'from' },
        context
      );

      // Also create a binding for a different variable
      await command.execute(
        { variable: 'other', target: el1, property: 'value', direction: 'to' },
        context
      );

      const countBefore = getActiveBindings().length;
      expect(countBefore).toBe(3);

      const removed = unbindVariable('shared');
      expect(removed).toBe(2);
      expect(getActiveBindings().length).toBe(1);
      expect(getActiveBindings()[0].variable).toBe('other');
    });

    it('getActiveBindings should return all active bindings', async () => {
      const el = document.createElement('input');

      expect(getActiveBindings()).toEqual([]);

      await command.execute(
        { variable: 'a', target: el, property: 'value', direction: 'to' },
        context
      );
      await command.execute(
        { variable: 'b', target: el, property: 'value', direction: 'from' },
        context
      );

      const bindings = getActiveBindings();
      expect(bindings).toHaveLength(2);
      expect(bindings.map(b => b.variable).sort()).toEqual(['a', 'b']);
    });

    it('unbind should return false for nonexistent bindingId', () => {
      const result = unbind('nonexistent-id');
      expect(result).toBe(false);
    });
  });

  // ========== 8. Integration ==========

  describe('integration', () => {
    it('end-to-end "to" binding: parse, execute, trigger, verify', async () => {
      const targetElement = document.createElement('input') as HTMLInputElement;
      document.body.appendChild(targetElement);
      targetElement.id = 'e2e-to-target';
      targetElement.value = 'start';

      // Use an evaluator that handles our mock nodes
      const e2eEvaluator = createMockEvaluator({
        evaluate: async (node: ASTNode, _ctx: ExecutionContext) => {
          if (typeof node === 'object' && node !== null && 'value' in node) {
            return (node as any).value;
          }
          return node;
        },
      });

      // Step 1: parseInput
      const input = await command.parseInput(
        {
          args: [{ type: 'literal', value: ':name' } as any],
          modifiers: { to: { type: 'literal', value: '#e2e-to-target' } as any },
        },
        e2eEvaluator,
        context
      );

      expect(input.variable).toBe('name');
      expect(input.target).toBe(targetElement);
      expect(input.property).toBe('value');
      expect(input.direction).toBe('to');

      // Step 2: execute
      const result = await command.execute(input, context);
      expect(result.success).toBe(true);

      // Step 3: initial sync should have pulled element value into variable
      expect(context.locals.get('name')).toBe('start');

      // Step 4: simulate user input
      targetElement.value = 'updated-name';
      targetElement.dispatchEvent(new Event('input'));
      expect(context.locals.get('name')).toBe('updated-name');

      // Step 5: cleanup
      unbind(result.bindingId);
      targetElement.value = 'after-unbind';
      targetElement.dispatchEvent(new Event('input'));
      // Variable should not update after unbind
      expect(context.locals.get('name')).toBe('updated-name');

      document.body.removeChild(targetElement);
    });

    it('end-to-end bidirectional binding', async () => {
      const targetElement = document.createElement('input') as HTMLInputElement;
      document.body.appendChild(targetElement);
      targetElement.id = 'e2e-bidi-target';

      // Pre-set a variable value
      context.locals.set('bidiVar', 'preset');

      // Direct execute with known input (bypass parseInput for simplicity)
      const result = await command.execute(
        {
          variable: 'bidiVar',
          target: targetElement,
          property: 'value',
          direction: 'bidirectional',
        },
        context
      );

      expect(result.success).toBe(true);

      // Initial sync: variable -> element
      expect(targetElement.value).toBe('preset');

      // User types: element -> variable
      targetElement.value = 'user-input';
      targetElement.dispatchEvent(new Event('input'));
      expect(context.locals.get('bidiVar')).toBe('user-input');

      // External update: variable -> element (via event from different origin)
      const externalEl = document.createElement('span');
      const externalEvent = new CustomEvent('variable:bidiVar:change', {
        detail: { value: 'external', source: 'variable', originElement: externalEl },
        bubbles: true,
      });
      targetElement.dispatchEvent(externalEvent);
      expect(targetElement.value).toBe('external');

      // Cleanup
      unbind(result.bindingId);
      document.body.removeChild(targetElement);
    });
  });
});
