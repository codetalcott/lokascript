import { describe, it, expect } from 'vitest';
import {
  isAttributeSyntax,
  parseAttribute,
  parseAttributeName,
  parseAttributeWithValue,
} from '../attribute-manipulation';

describe('attribute-manipulation', () => {
  describe('isAttributeSyntax', () => {
    it('should detect bracket syntax with value', () => {
      expect(isAttributeSyntax('[@attr="value"]')).toBe(true);
    });

    it('should detect bracket syntax without value', () => {
      expect(isAttributeSyntax('[@attr]')).toBe(true);
    });

    it('should detect direct @ syntax', () => {
      expect(isAttributeSyntax('@attr')).toBe(true);
    });

    it('should handle whitespace', () => {
      expect(isAttributeSyntax('  [@attr]  ')).toBe(true);
      expect(isAttributeSyntax('  @attr  ')).toBe(true);
    });

    it('should reject non-attribute syntax', () => {
      expect(isAttributeSyntax('class')).toBe(false);
      expect(isAttributeSyntax('.active')).toBe(false);
      expect(isAttributeSyntax('')).toBe(false);
    });
  });

  describe('parseAttribute', () => {
    it('should parse bracket syntax with value', () => {
      const result = parseAttribute('[@data-value="test"]');
      expect(result).toEqual({ name: 'data-value', value: 'test' });
    });

    it('should parse bracket syntax with single quotes', () => {
      const result = parseAttribute("[@data-value='test']");
      expect(result).toEqual({ name: 'data-value', value: 'test' });
    });

    it('should parse bracket syntax without value', () => {
      const result = parseAttribute('[@disabled]');
      expect(result).toEqual({ name: 'disabled', value: undefined });
    });

    it('should parse direct @ syntax', () => {
      const result = parseAttribute('@disabled');
      expect(result).toEqual({ name: 'disabled', value: undefined });
    });

    it('should handle whitespace in bracket syntax', () => {
      const result = parseAttribute('[@  data-value  =  "test"  ]');
      expect(result.name).toBe('data-value');
      expect(result.value).toBe('test');
    });

    it('should remove quotes from value', () => {
      const result1 = parseAttribute('[@attr="value"]');
      expect(result1.value).toBe('value');

      const result2 = parseAttribute("[@attr='value']");
      expect(result2.value).toBe('value');
    });

    it('should throw on invalid syntax', () => {
      expect(() => parseAttribute('class')).toThrow('Invalid attribute syntax');
      expect(() => parseAttribute('.active')).toThrow('Invalid attribute syntax');
    });
  });

  describe('parseAttributeName', () => {
    it('should extract name from bracket syntax', () => {
      expect(parseAttributeName('[@disabled]')).toBe('disabled');
      expect(parseAttributeName('[@data-value="test"]')).toBe('data-value');
    });

    it('should extract name from direct syntax', () => {
      expect(parseAttributeName('@disabled')).toBe('disabled');
    });

    it('should throw on invalid syntax', () => {
      expect(() => parseAttributeName('class')).toThrow('Invalid attribute syntax');
    });
  });

  describe('parseAttributeWithValue', () => {
    it('should return value when present', () => {
      const result = parseAttributeWithValue('[@data-value="test"]');
      expect(result).toEqual({ name: 'data-value', value: 'test' });
    });

    it('should default to empty string when value is missing', () => {
      const result = parseAttributeWithValue('[@disabled]');
      expect(result).toEqual({ name: 'disabled', value: '' });
    });

    it('should handle direct @ syntax with empty default', () => {
      const result = parseAttributeWithValue('@disabled');
      expect(result).toEqual({ name: 'disabled', value: '' });
    });

    it('should throw on invalid syntax', () => {
      expect(() => parseAttributeWithValue('class')).toThrow('Invalid attribute syntax');
    });
  });
});
