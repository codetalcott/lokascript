import { describe, it, expect, beforeEach } from 'vitest';
import {
  parseCSSProperty,
  isCSSPropertySyntax,
  parseToggleableCSSProperty,
  getComputedStyleValue,
  setStyleValue,
  removeStyleProperty,
  toggleCSSProperty,
  isDisplayNone,
  isVisibilityHidden,
  isOpacityZero,
} from '../style-manipulation';

describe('style-manipulation', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  describe('parseCSSProperty', () => {
    it('should parse *display syntax', () => {
      const result = parseCSSProperty('*display');
      expect(result).toEqual({ property: 'display' });
    });

    it('should parse *opacity syntax', () => {
      const result = parseCSSProperty('*opacity');
      expect(result).toEqual({ property: 'opacity' });
    });

    it('should parse *background-color syntax', () => {
      const result = parseCSSProperty('*background-color');
      expect(result).toEqual({ property: 'background-color' });
    });

    it('should handle whitespace', () => {
      const result = parseCSSProperty('  *display  ');
      expect(result).toEqual({ property: 'display' });
    });

    it('should return null for non-CSS property syntax', () => {
      expect(parseCSSProperty('display')).toBeNull();
      expect(parseCSSProperty('.active')).toBeNull();
      expect(parseCSSProperty('')).toBeNull();
    });

    it('should return null if no property after *', () => {
      expect(parseCSSProperty('*')).toBeNull();
      expect(parseCSSProperty('*  ')).toBeNull();
    });
  });

  describe('isCSSPropertySyntax', () => {
    it('should detect CSS property syntax', () => {
      expect(isCSSPropertySyntax('*display')).toBe(true);
      expect(isCSSPropertySyntax('*opacity')).toBe(true);
    });

    it('should handle whitespace', () => {
      expect(isCSSPropertySyntax('  *display  ')).toBe(true);
    });

    it('should reject non-CSS property syntax', () => {
      expect(isCSSPropertySyntax('display')).toBe(false);
      expect(isCSSPropertySyntax('.active')).toBe(false);
    });
  });

  describe('parseToggleableCSSProperty', () => {
    it('should parse display property', () => {
      expect(parseToggleableCSSProperty('*display')).toBe('display');
    });

    it('should parse visibility property', () => {
      expect(parseToggleableCSSProperty('*visibility')).toBe('visibility');
    });

    it('should parse opacity property', () => {
      expect(parseToggleableCSSProperty('*opacity')).toBe('opacity');
    });

    it('should handle case-insensitive property names', () => {
      expect(parseToggleableCSSProperty('*DISPLAY')).toBe('display');
      expect(parseToggleableCSSProperty('*Visibility')).toBe('visibility');
    });

    it('should return null for non-toggleable properties', () => {
      expect(parseToggleableCSSProperty('*background-color')).toBeNull();
      expect(parseToggleableCSSProperty('*color')).toBeNull();
    });

    it('should return null for invalid syntax', () => {
      expect(parseToggleableCSSProperty('display')).toBeNull();
    });
  });

  describe('getComputedStyleValue', () => {
    it('should get computed style value', () => {
      element.style.display = 'block';
      const value = getComputedStyleValue(element, 'display');
      expect(value).toBe('block');
    });

    it('should get default computed style', () => {
      element.style.opacity = '1';
      const value = getComputedStyleValue(element, 'opacity');
      expect(value).toBe('1');
    });
  });

  describe('setStyleValue', () => {
    it('should set style value', () => {
      setStyleValue(element, 'display', 'none');
      expect(element.style.display).toBe('none');
    });

    it('should handle kebab-case properties', () => {
      setStyleValue(element, 'background-color', 'red');
      expect(element.style.backgroundColor).toBe('red');
    });
  });

  describe('removeStyleProperty', () => {
    it('should remove style property', () => {
      element.style.display = 'none';
      removeStyleProperty(element, 'display');
      expect(element.style.display).toBe('');
    });
  });

  describe('toggleCSSProperty', () => {
    it('should toggle display from block to none', () => {
      element.style.display = 'block';
      toggleCSSProperty(element, 'display');
      expect(element.style.display).toBe('none');
      expect(element.dataset.previousDisplay).toBe('block');
    });

    it('should toggle display from none to previous value', () => {
      element.style.display = 'none';
      element.dataset.previousDisplay = 'flex';
      toggleCSSProperty(element, 'display');
      expect(element.style.display).toBe('flex');
      expect(element.dataset.previousDisplay).toBeUndefined();
    });

    it('should toggle display from none to block if no previous value', () => {
      element.style.display = 'none';
      toggleCSSProperty(element, 'display');
      expect(element.style.display).toBe('block');
    });

    it('should toggle visibility between hidden and visible', () => {
      element.style.visibility = 'visible';
      toggleCSSProperty(element, 'visibility');
      expect(element.style.visibility).toBe('hidden');

      toggleCSSProperty(element, 'visibility');
      expect(element.style.visibility).toBe('visible');
    });

    it('should toggle opacity between 0 and 1', () => {
      element.style.opacity = '1';
      toggleCSSProperty(element, 'opacity');
      expect(element.style.opacity).toBe('0');

      toggleCSSProperty(element, 'opacity');
      expect(element.style.opacity).toBe('1');
    });
  });

  describe('isDisplayNone', () => {
    it('should detect display none', () => {
      element.style.display = 'none';
      expect(isDisplayNone(element)).toBe(true);
    });

    it('should return false for visible display', () => {
      element.style.display = 'block';
      expect(isDisplayNone(element)).toBe(false);
    });
  });

  describe('isVisibilityHidden', () => {
    it('should detect visibility hidden', () => {
      element.style.visibility = 'hidden';
      expect(isVisibilityHidden(element)).toBe(true);
    });

    it('should return false for visible', () => {
      element.style.visibility = 'visible';
      expect(isVisibilityHidden(element)).toBe(false);
    });
  });

  describe('isOpacityZero', () => {
    it('should detect opacity 0', () => {
      element.style.opacity = '0';
      expect(isOpacityZero(element)).toBe(true);
    });

    it('should return false for non-zero opacity', () => {
      element.style.opacity = '1';
      expect(isOpacityZero(element)).toBe(false);

      element.style.opacity = '0.5';
      expect(isOpacityZero(element)).toBe(false);
    });
  });
});
