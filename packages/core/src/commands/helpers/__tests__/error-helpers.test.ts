import { describe, it, expect } from 'vitest';
import {
  missingArgument,
  invalidTarget,
  noTargetElements,
  invalidClassName,
  invalidAttributeName,
  invalidSelector,
  invalidUrl,
  invalidContext,
  operationFailed,
  parseError,
  executionError,
  unsupportedFeature,
  toError,
  throwValidation,
} from '../error-helpers';

describe('error-helpers', () => {
  describe('missingArgument', () => {
    it('should create error with correct message', () => {
      const error = missingArgument('toggle', 'target');
      expect(error.message).toContain('toggle');
      expect(error.message).toContain('target');
      expect(error.type).toBe('missing-argument');
      expect(error.code).toBeDefined();
    });

    it('should include suggestions', () => {
      const error = missingArgument('toggle', 'target');
      expect(error.suggestions).toBeDefined();
      expect(error.suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('invalidTarget', () => {
    it('should create error with selector', () => {
      const error = invalidTarget('toggle', '#missing');
      expect(error.message).toContain('toggle');
      expect(error.message).toContain('#missing');
      expect(error.type).toBe('runtime-error');
      expect(error.code).toBeDefined();
    });

    it('should include element resolution suggestions', () => {
      const error = invalidTarget('toggle', '#missing');
      expect(error.suggestions).toBeDefined();
      expect(error.suggestions.some((s: string) => s.includes('selector'))).toBe(true);
    });
  });

  describe('noTargetElements', () => {
    it('should create error for no targets', () => {
      const error = noTargetElements('toggle');
      expect(error.message).toContain('toggle');
      expect(error.message).toContain('No target elements');
      expect(error.type).toBe('missing-argument');
    });
  });

  describe('invalidClassName', () => {
    it('should create error with class name', () => {
      const error = invalidClassName('add', '123invalid');
      expect(error.message).toContain('add');
      expect(error.message).toContain('123invalid');
      expect(error.type).toBe('invalid-argument');
      expect(error.code).toBeDefined();
    });
  });

  describe('invalidAttributeName', () => {
    it('should create error with attribute name', () => {
      const error = invalidAttributeName('set', '123invalid');
      expect(error.message).toContain('set');
      expect(error.message).toContain('123invalid');
      expect(error.type).toBe('invalid-argument');
      expect(error.code).toBeDefined();
    });
  });

  describe('invalidSelector', () => {
    it('should create error with selector', () => {
      const error = invalidSelector('toggle', '[invalid');
      expect(error.message).toContain('toggle');
      expect(error.message).toContain('[invalid');
      expect(error.type).toBe('invalid-argument');
      expect(error.code).toBeDefined();
    });
  });

  describe('invalidUrl', () => {
    it('should create error with URL', () => {
      const error = invalidUrl('push-url', 'javascript:alert(1)');
      expect(error.message).toContain('push-url');
      expect(error.message).toContain('javascript:alert(1)');
      expect(error.type).toBe('invalid-argument');
      expect(error.code).toBeDefined();
    });
  });

  describe('invalidContext', () => {
    it('should create error for invalid context', () => {
      const error = invalidContext('toggle');
      expect(error.message).toContain('toggle');
      expect(error.message).toContain('Invalid execution context');
      expect(error.type).toBe('invalid-argument');
    });
  });

  describe('operationFailed', () => {
    it('should create error with operation name', () => {
      const error = operationFailed('add', 'add class');
      expect(error.message).toContain('add');
      expect(error.message).toContain('add class');
    });

    it('should include reason if provided', () => {
      const error = operationFailed('add', 'add class', 'element is readonly');
      expect(error.message).toContain('element is readonly');
    });

    it('should include operation suggestions', () => {
      const error = operationFailed('add', 'add class');
      expect(error.suggestions).toBeDefined();
      expect(error.suggestions.some((s: string) => s.includes('element'))).toBe(true);
    });
  });

  describe('parseError', () => {
    it('should create error with parsing details', () => {
      const error = parseError('toggle', 'unexpected token');
      expect(error.message).toContain('toggle');
      expect(error.message).toContain('unexpected token');
    });

    it('should include syntax suggestions', () => {
      const error = parseError('toggle', 'unexpected token');
      expect(error.suggestions).toBeDefined();
      expect(error.suggestions.some((s: string) => s.includes('syntax'))).toBe(true);
    });
  });

  describe('executionError', () => {
    it('should create execution error with cause', () => {
      const cause = new Error('underlying error');
      const error = executionError('toggle', 'operation failed', cause);
      expect(error.message).toContain('toggle');
      expect(error.message).toContain('operation failed');
      expect(error.cause).toBe(cause);
    });

    it('should create execution error without cause', () => {
      const error = executionError('toggle', 'operation failed');
      expect(error.message).toContain('toggle');
      expect(error.cause).toBeDefined();
    });

    it('should include context with suggestions', () => {
      const error = executionError('toggle', 'operation failed');
      expect(error.context).toBeDefined();
      expect(error.context?.suggestions).toBeDefined();
    });
  });

  describe('unsupportedFeature', () => {
    it('should create error with feature name', () => {
      const error = unsupportedFeature('toggle', 'custom-property');
      expect(error.message).toContain('toggle');
      expect(error.message).toContain('custom-property');
      expect(error.type).toBe('runtime-error'); // UNSUPPORTED code maps to runtime-error
      expect(error.code).toBeDefined();
    });

    it('should include browser compatibility suggestions', () => {
      const error = unsupportedFeature('toggle', 'feature');
      expect(error.suggestions).toBeDefined();
      expect(error.suggestions.some((s: string) => s.includes('browser'))).toBe(true);
    });
  });

  describe('toError', () => {
    it('should return Error as-is', () => {
      const err = new Error('test');
      expect(toError(err)).toBe(err);
    });

    it('should convert string to Error', () => {
      const err = toError('test error');
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('test error');
    });

    it('should convert object with message to Error', () => {
      const err = toError({ message: 'test error' });
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('test error');
    });

    it('should convert other values to Error', () => {
      const err = toError(42);
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('42');
    });

    it('should handle null', () => {
      const err = toError(null);
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('null');
    });
  });

  describe('throwValidation', () => {
    it('should throw an Error', () => {
      const validationError = missingArgument('toggle', 'target');
      expect(() => throwValidation(validationError)).toThrow();
    });

    it('should preserve error properties', () => {
      const validationError = missingArgument('toggle', 'target');
      try {
        throwValidation(validationError);
      } catch (err: any) {
        expect(err.message).toContain('toggle');
        expect(err.code).toBeDefined();
        expect(err.type).toBe('missing-argument');
        expect(err.suggestions).toBeDefined();
      }
    });
  });
});
