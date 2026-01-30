/**
 * Unit Tests for Condition Helpers
 *
 * Tests the shared utilities for condition evaluation used by control flow commands.
 * Critical helper affecting: if, unless, repeat commands
 */

import { describe, it, expect } from 'vitest';
import { evaluateCondition, isTruthy } from '../condition-helpers';
import type { ExecutionContext } from '../../../types/core';

// ========== Test Utilities ==========

function createMockContext(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  const meElement = document.createElement('div');

  return {
    me: meElement,
    you: undefined,
    it: undefined,
    result: undefined,
    locals: new Map(),
    globals: new Map(),
    variables: new Map(),
    target: meElement,
    detail: undefined,
    ...overrides,
  } as ExecutionContext;
}

// ========== Tests ==========

describe('Condition Helpers', () => {
  describe('evaluateCondition', () => {
    describe('boolean conditions', () => {
      it('should return true for boolean true', () => {
        const context = createMockContext();

        expect(evaluateCondition(true, context)).toBe(true);
      });

      it('should return false for boolean false', () => {
        const context = createMockContext();

        expect(evaluateCondition(false, context)).toBe(false);
      });
    });

    describe('function conditions', () => {
      it('should return true for functions (truthy without calling)', () => {
        const context = createMockContext();
        const func = () => false; // Return value doesn't matter

        expect(evaluateCondition(func, context)).toBe(true);
      });

      it('should return true for arrow functions', () => {
        const context = createMockContext();
        const arrowFunc = () => {};

        expect(evaluateCondition(arrowFunc, context)).toBe(true);
      });
    });

    describe('Promise conditions', () => {
      it('should throw error for Promise (must be awaited)', () => {
        const context = createMockContext();
        const promise = Promise.resolve(true);

        expect(() => evaluateCondition(promise, context)).toThrow(
          'Condition must be awaited - use await in the condition expression'
        );
      });

      it('should throw error for rejected Promise', () => {
        const context = createMockContext();
        const rejectedPromise = Promise.reject(new Error('test'));

        // Catch the rejection to prevent unhandled rejection error
        rejectedPromise.catch(() => {});

        expect(() => evaluateCondition(rejectedPromise, context)).toThrow(
          'Condition must be awaited - use await in the condition expression'
        );
      });
    });

    describe('numeric conditions', () => {
      it('should return false for zero', () => {
        const context = createMockContext();

        expect(evaluateCondition(0, context)).toBe(false);
      });

      it('should return true for positive numbers', () => {
        const context = createMockContext();

        expect(evaluateCondition(42, context)).toBe(true);
        expect(evaluateCondition(1, context)).toBe(true);
        expect(evaluateCondition(3.14, context)).toBe(true);
      });

      it('should return true for negative numbers', () => {
        const context = createMockContext();

        expect(evaluateCondition(-1, context)).toBe(true);
        expect(evaluateCondition(-42, context)).toBe(true);
      });
    });

    describe('context reference conditions', () => {
      it('should return true when "me" has element', () => {
        const context = createMockContext();

        expect(evaluateCondition('me', context)).toBe(true);
      });

      it('should return false when "me" is null', () => {
        const context = createMockContext({ me: null });

        expect(evaluateCondition('me', context)).toBe(false);
      });

      it('should return false when "me" is undefined', () => {
        const context = createMockContext({ me: undefined });

        expect(evaluateCondition('me', context)).toBe(false);
      });

      it('should return true when "it" has value', () => {
        const context = createMockContext({ it: 42 });

        expect(evaluateCondition('it', context)).toBe(true);
      });

      it('should return false when "it" is undefined', () => {
        const context = createMockContext({ it: undefined });

        expect(evaluateCondition('it', context)).toBe(false);
      });

      it('should return true when "you" has element', () => {
        const youElement = document.createElement('span');
        const context = createMockContext({ you: youElement });

        expect(evaluateCondition('you', context)).toBe(true);
      });

      it('should return false when "you" is undefined', () => {
        const context = createMockContext({ you: undefined });

        expect(evaluateCondition('you', context)).toBe(false);
      });
    });

    describe('variable conditions', () => {
      it('should return true for truthy variable in locals', () => {
        const context = createMockContext();
        context.locals.set('isActive', true);

        expect(evaluateCondition('isActive', context)).toBe(true);
      });

      it('should return false for falsy variable in locals', () => {
        const context = createMockContext();
        context.locals.set('count', 0);

        expect(evaluateCondition('count', context)).toBe(false);
      });

      it('should return true for truthy variable in globals', () => {
        const context = createMockContext();
        context.globals.set('total', 100);

        expect(evaluateCondition('total', context)).toBe(true);
      });

      it('should return false for falsy variable in globals', () => {
        const context = createMockContext();
        context.globals.set('isEmpty', false);

        expect(evaluateCondition('isEmpty', context)).toBe(false);
      });

      it('should return true for undefined variable (non-empty string is truthy)', () => {
        const context = createMockContext();

        // Variable doesn't exist, so string "nonExistent" itself is truthy
        expect(evaluateCondition('nonExistent', context)).toBe(true);
      });

      it('should return false for empty string variable value', () => {
        const context = createMockContext();
        context.locals.set('emptyStr', '');

        expect(evaluateCondition('emptyStr', context)).toBe(false);
      });

      it('should return true for non-empty string variable value', () => {
        const context = createMockContext();
        context.locals.set('message', 'hello');

        expect(evaluateCondition('message', context)).toBe(true);
      });

      it('should return false for null variable value', () => {
        const context = createMockContext();
        context.locals.set('nullValue', null);

        expect(evaluateCondition('nullValue', context)).toBe(false);
      });
    });

    describe('object and array conditions', () => {
      it('should return true for objects', () => {
        const context = createMockContext();

        expect(evaluateCondition({ key: 'value' }, context)).toBe(true);
      });

      it('should return true for arrays', () => {
        const context = createMockContext();

        expect(evaluateCondition([1, 2, 3], context)).toBe(true);
      });

      it('should return true for empty arrays', () => {
        const context = createMockContext();

        expect(evaluateCondition([], context)).toBe(true);
      });
    });

    describe('special string conditions', () => {
      it('should handle empty string as falsy', () => {
        const context = createMockContext();

        expect(evaluateCondition('', context)).toBe(false);
      });

      it('should handle non-empty literal string as truthy', () => {
        const context = createMockContext();

        // String that is not a context reference or variable
        expect(evaluateCondition('literal', context)).toBe(true);
      });
    });
  });

  describe('isTruthy', () => {
    describe('basic truthiness check', () => {
      it('should return true for truthy values', () => {
        expect(isTruthy(true)).toBe(true);
        expect(isTruthy(1)).toBe(true);
        expect(isTruthy('string')).toBe(true);
        expect(isTruthy({})).toBe(true);
        expect(isTruthy([])).toBe(true);
      });

      it('should return false for falsy values', () => {
        expect(isTruthy(false)).toBe(false);
        expect(isTruthy(0)).toBe(false);
        expect(isTruthy('')).toBe(false);
        expect(isTruthy(null)).toBe(false);
        expect(isTruthy(undefined)).toBe(false);
        expect(isTruthy(NaN)).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should return true for functions', () => {
        expect(isTruthy(() => {})).toBe(true);
      });

      it('should return true for Promises', () => {
        expect(isTruthy(Promise.resolve())).toBe(true);
      });

      it('should return true for negative numbers', () => {
        expect(isTruthy(-1)).toBe(true);
      });
    });
  });
});
