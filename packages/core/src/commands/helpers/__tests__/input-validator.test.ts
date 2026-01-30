import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateTargetArray,
  isValidTargetArray,
  validateStringArray,
  isValidStringArray,
  validateTypeDiscriminator,
  isValidType,
  validateDefined,
  isDefined,
  validateNonEmptyString,
  isNonEmptyString,
  combineValidations,
  createValidator,
} from '../input-validator';

describe('input-validator', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
  });

  describe('validateTargetArray', () => {
    it('should validate non-empty array of HTMLElements', () => {
      const result = validateTargetArray([element], 'toggle');
      expect(result.valid).toBe(true);
    });

    it('should reject empty array', () => {
      const result = validateTargetArray([], 'toggle');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('no targets specified');
    });

    it('should reject non-array', () => {
      const result = validateTargetArray('not-array' as any, 'toggle');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be an array');
    });

    it('should reject array with non-HTMLElement', () => {
      const result = validateTargetArray([element, 'not-element'], 'toggle');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be HTMLElements');
    });

    it('should use default command name', () => {
      const result = validateTargetArray([]);
      expect(result.error).toContain('command:');
    });
  });

  describe('isValidTargetArray', () => {
    it('should return true for valid array', () => {
      expect(isValidTargetArray([element])).toBe(true);
    });

    it('should return false for empty array', () => {
      expect(isValidTargetArray([])).toBe(false);
    });

    it('should return false for array with non-HTMLElement', () => {
      expect(isValidTargetArray([element, 'not-element'])).toBe(false);
    });
  });

  describe('validateStringArray', () => {
    it('should validate array of non-empty strings', () => {
      const result = validateStringArray(['a', 'b'], 'classes');
      expect(result.valid).toBe(true);
    });

    it('should reject empty array when minLength is 1', () => {
      const result = validateStringArray([], 'classes', 1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 1 item');
    });

    it('should reject array with non-string', () => {
      const result = validateStringArray(['a', 42], 'classes');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be strings');
    });

    it('should reject array with empty strings', () => {
      const result = validateStringArray(['a', ''], 'classes');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty strings');
    });

    it('should check minimum length', () => {
      const result = validateStringArray(['a'], 'classes', 2);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 2 items');
    });
  });

  describe('isValidStringArray', () => {
    it('should return true for valid array', () => {
      expect(isValidStringArray(['a', 'b'])).toBe(true);
    });

    it('should return false for empty array', () => {
      expect(isValidStringArray([])).toBe(false);
    });

    it('should return false for array with empty string', () => {
      expect(isValidStringArray(['a', ''])).toBe(false);
    });

    it('should check minimum length', () => {
      expect(isValidStringArray(['a'], 2)).toBe(false);
      expect(isValidStringArray(['a', 'b'], 2)).toBe(true);
    });
  });

  describe('validateTypeDiscriminator', () => {
    it('should validate allowed type', () => {
      const result = validateTypeDiscriminator('classes', ['classes', 'attribute'] as const, 'add');
      expect(result.valid).toBe(true);
    });

    it('should reject non-string type', () => {
      const result = validateTypeDiscriminator(42, ['classes'] as const, 'add');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('type must be a string');
    });

    it('should reject invalid type', () => {
      const result = validateTypeDiscriminator('invalid', ['classes', 'attribute'] as const, 'add');
      expect(result.valid).toBe(false);
      expect(result.error).toContain("invalid type 'invalid'");
      expect(result.error).toContain('classes, attribute');
    });
  });

  describe('isValidType', () => {
    it('should return true for valid type', () => {
      expect(isValidType('classes', ['classes', 'attribute'] as const)).toBe(true);
    });

    it('should return false for invalid type', () => {
      expect(isValidType('invalid', ['classes', 'attribute'] as const)).toBe(false);
    });

    it('should return false for non-string', () => {
      expect(isValidType(42, ['classes'] as const)).toBe(false);
    });
  });

  describe('validateDefined', () => {
    it('should accept defined values', () => {
      expect(validateDefined('value', 'field').valid).toBe(true);
      expect(validateDefined(0, 'field').valid).toBe(true);
      expect(validateDefined('', 'field').valid).toBe(true);
    });

    it('should reject null', () => {
      const result = validateDefined(null, 'field');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('field is required');
    });

    it('should reject undefined', () => {
      const result = validateDefined(undefined, 'field');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('field is required');
    });
  });

  describe('isDefined', () => {
    it('should return true for defined values', () => {
      expect(isDefined('value')).toBe(true);
      expect(isDefined(0)).toBe(true);
      expect(isDefined('')).toBe(true);
    });

    it('should return false for null or undefined', () => {
      expect(isDefined(null)).toBe(false);
      expect(isDefined(undefined)).toBe(false);
    });
  });

  describe('validateNonEmptyString', () => {
    it('should accept non-empty strings', () => {
      expect(validateNonEmptyString('value', 'field').valid).toBe(true);
    });

    it('should reject non-string', () => {
      const result = validateNonEmptyString(42, 'field');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be a string');
    });

    it('should reject empty string', () => {
      const result = validateNonEmptyString('', 'field');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });

    it('should reject whitespace-only string', () => {
      const result = validateNonEmptyString('   ', 'field');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('cannot be empty');
    });
  });

  describe('isNonEmptyString', () => {
    it('should return true for non-empty strings', () => {
      expect(isNonEmptyString('value')).toBe(true);
    });

    it('should return false for empty string', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString('   ')).toBe(false);
    });

    it('should return false for non-string', () => {
      expect(isNonEmptyString(42)).toBe(false);
    });
  });

  describe('combineValidations', () => {
    it('should return success if all validations pass', () => {
      const result = combineValidations({ valid: true }, { valid: true }, { valid: true });
      expect(result.valid).toBe(true);
    });

    it('should return first failure', () => {
      const result = combineValidations(
        { valid: true },
        { valid: false, error: 'error1' },
        { valid: false, error: 'error2' }
      );
      expect(result.valid).toBe(false);
      expect(result.error).toBe('error1');
    });

    it('should handle empty validations', () => {
      const result = combineValidations();
      expect(result.valid).toBe(true);
    });
  });

  describe('createValidator', () => {
    it('should create validator with pre-filled command name', () => {
      const v = createValidator('toggle');

      const result = v.targets([]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('toggle:');
    });

    it('should provide all validation methods', () => {
      const v = createValidator('test');

      expect(v.targets).toBeDefined();
      expect(v.strings).toBeDefined();
      expect(v.type).toBeDefined();
      expect(v.defined).toBeDefined();
      expect(v.nonEmptyString).toBeDefined();
    });

    it('should validate strings with custom field name', () => {
      const v = createValidator('add');
      const result = v.strings(['a', ''], 'classes');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('classes');
    });

    it('should validate type discriminator', () => {
      const v = createValidator('add');
      const result = v.type('invalid', ['classes', 'attribute'] as const);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('add:');
    });
  });
});
