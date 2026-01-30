import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  getElementProperty,
  setElementProperty,
  getElementValue,
  setElementValue,
  isEmpty,
  isPlainObject,
} from '../element-property-access';

describe('Element Property Access', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('div');
    element.id = 'test';
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('getElementProperty', () => {
    it('should get attribute value with @attribute syntax', () => {
      element.setAttribute('data-value', 'test123');
      const result = getElementProperty(element, '@data-value');
      expect(result).toBe('test123');
    });

    it('should return null for missing attribute with @ syntax', () => {
      const result = getElementProperty(element, '@missing');
      expect(result).toBeNull();
    });

    it('should get textContent property', () => {
      element.textContent = 'Hello World';
      const result = getElementProperty(element, 'textContent');
      expect(result).toBe('Hello World');
    });

    it('should get value property from input element', () => {
      const input = document.createElement('input');
      input.value = 'test value';
      const result = getElementProperty(input, 'value');
      expect(result).toBe('test value');
    });

    it('should get checked property from checkbox', () => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = true;
      const result = getElementProperty(checkbox, 'checked');
      expect(result).toBe(true);
    });

    it('should get nested property with dot notation (style.color)', () => {
      (element as HTMLElement).style.color = 'red';
      const result = getElementProperty(element, 'style.color');
      expect(result).toBe('red');
    });

    it('should get nested property with dot notation (dataset.foo)', () => {
      element.setAttribute('data-foo', 'bar');
      const result = getElementProperty(element, 'dataset.foo');
      expect(result).toBe('bar');
    });

    it('should get CSS property with hyphenated name', () => {
      (element as HTMLElement).style.backgroundColor = 'blue';
      const result = getElementProperty(element, 'background-color');
      expect(result).toBe('blue');
    });

    it('should get CSS property from inline style', () => {
      element.setAttribute('style', 'margin-top: 10px;');
      const result = getElementProperty(element, 'margin-top');
      expect(result).toBe('10px');
    });

    it('should get generic property directly from element', () => {
      (element as any).customProp = 'custom value';
      const result = getElementProperty(element, 'customProp');
      expect(result).toBe('custom value');
    });

    it('should return undefined for non-existent property', () => {
      const result = getElementProperty(element, 'nonExistent');
      expect(result).toBeUndefined();
    });
  });

  describe('setElementProperty', () => {
    it('should set attribute with @attribute syntax', () => {
      setElementProperty(element, '@data-test', 'value123');
      expect(element.getAttribute('data-test')).toBe('value123');
    });

    it('should set textContent property', () => {
      setElementProperty(element, 'textContent', 'New Text');
      expect(element.textContent).toBe('New Text');
    });

    it('should set value property on input element', () => {
      const input = document.createElement('input');
      setElementProperty(input, 'value', 'new value');
      expect(input.value).toBe('new value');
    });

    it('should set checked property on checkbox', () => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      setElementProperty(checkbox, 'checked', true);
      expect(checkbox.checked).toBe(true);
    });

    it('should set nested property with dot notation (style.color)', () => {
      setElementProperty(element, 'style.color', 'green');
      expect((element as HTMLElement).style.color).toBe('green');
    });

    it('should set nested property with dot notation (dataset.foo)', () => {
      setElementProperty(element, 'dataset.foo', 'baz');
      expect(element.getAttribute('data-foo')).toBe('baz');
    });

    it('should set CSS property with hyphenated name', () => {
      setElementProperty(element, 'background-color', 'yellow');
      expect((element as HTMLElement).style.backgroundColor).toBe('yellow');
    });

    it('should set CSS property on style object', () => {
      setElementProperty(element, 'padding-left', '20px');
      expect((element as HTMLElement).style.paddingLeft).toBe('20px');
    });

    it('should handle readonly properties gracefully', () => {
      // Try to set a readonly property (should not throw)
      expect(() => {
        setElementProperty(element, 'offsetWidth', 100);
      }).not.toThrow();
    });

    it('should set generic property directly on element', () => {
      setElementProperty(element, 'customProp', 'custom value');
      expect((element as any).customProp).toBe('custom value');
    });

    it('should handle setting className property', () => {
      setElementProperty(element, 'className', 'test-class');
      expect(element.className).toBe('test-class');
    });
  });

  describe('getElementValue', () => {
    it('should return value from input element', () => {
      const input = document.createElement('input');
      input.value = 'input value';
      const result = getElementValue(input);
      expect(result).toBe('input value');
    });

    it('should return textContent from div element', () => {
      const div = document.createElement('div');
      div.textContent = 'div content';
      const result = getElementValue(div);
      expect(result).toBe('div content');
    });

    it('should return value from textarea', () => {
      const textarea = document.createElement('textarea');
      textarea.value = 'textarea value';
      const result = getElementValue(textarea);
      expect(result).toBe('textarea value');
    });

    it('should return value from select element', () => {
      const select = document.createElement('select');
      const option = document.createElement('option');
      option.value = 'option1';
      option.selected = true;
      select.appendChild(option);
      const result = getElementValue(select);
      expect(result).toBe('option1');
    });
  });

  describe('setElementValue', () => {
    it('should set value on input element', () => {
      const input = document.createElement('input');
      setElementValue(input, 'new input value');
      expect(input.value).toBe('new input value');
    });

    it('should set textContent on div element', () => {
      const div = document.createElement('div');
      setElementValue(div, 'new div content');
      expect(div.textContent).toBe('new div content');
    });

    it('should set value on textarea', () => {
      const textarea = document.createElement('textarea');
      setElementValue(textarea, 'new textarea value');
      expect(textarea.value).toBe('new textarea value');
    });

    it('should set value on select element', () => {
      const select = document.createElement('select');
      const option1 = document.createElement('option');
      option1.value = 'opt1';
      const option2 = document.createElement('option');
      option2.value = 'opt2';
      select.appendChild(option1);
      select.appendChild(option2);
      setElementValue(select, 'opt2');
      expect(select.value).toBe('opt2');
    });
  });

  describe('isEmpty', () => {
    it('should return true for undefined', () => {
      expect(isEmpty(undefined)).toBe(true);
    });

    it('should return true for null', () => {
      expect(isEmpty(null)).toBe(true);
    });

    it('should return true for empty string', () => {
      expect(isEmpty('')).toBe(true);
    });

    it('should return false for zero', () => {
      expect(isEmpty(0)).toBe(false);
    });

    it('should return false for false', () => {
      expect(isEmpty(false)).toBe(false);
    });

    it('should return false for non-empty string', () => {
      expect(isEmpty('text')).toBe(false);
    });

    it('should return false for objects', () => {
      expect(isEmpty({})).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isEmpty([])).toBe(false);
    });
  });

  describe('isPlainObject', () => {
    it('should return true for plain object literal', () => {
      expect(isPlainObject({})).toBe(true);
    });

    it('should return true for object with properties', () => {
      expect(isPlainObject({ key: 'value' })).toBe(true);
    });

    it('should return false for null', () => {
      expect(isPlainObject(null)).toBe(false);
    });

    it('should return false for array', () => {
      expect(isPlainObject([])).toBe(false);
    });

    it('should return false for DOM node', () => {
      const div = document.createElement('div');
      expect(isPlainObject(div)).toBe(false);
    });

    it('should return false for Date object', () => {
      expect(isPlainObject(new Date())).toBe(false);
    });

    it('should return false for RegExp', () => {
      expect(isPlainObject(/test/)).toBe(false);
    });

    it('should return false for class instance', () => {
      class TestClass {}
      expect(isPlainObject(new TestClass())).toBe(false);
    });

    it('should return true for Object.create(null)', () => {
      expect(isPlainObject(Object.create(null))).toBe(true);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex nested property path', () => {
      const container = document.createElement('div');
      (container as any).config = { settings: { theme: 'dark' } };

      const result = getElementProperty(container, 'config.settings.theme');
      expect(result).toBe('dark');
    });

    it('should handle setting complex nested property path', () => {
      const container = document.createElement('div');
      (container as any).config = { settings: {} };

      setElementProperty(container, 'config.settings.theme', 'light');
      expect((container as any).config.settings.theme).toBe('light');
    });

    it('should handle multiple CSS properties', () => {
      setElementProperty(element, 'color', 'red');
      setElementProperty(element, 'background-color', 'blue');
      setElementProperty(element, 'font-size', '16px');

      expect((element as HTMLElement).style.color).toBe('red');
      expect((element as HTMLElement).style.backgroundColor).toBe('blue');
      expect((element as HTMLElement).style.fontSize).toBe('16px');
    });

    it('should handle value and checked on same checkbox', () => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';

      setElementProperty(checkbox, 'value', 'checkbox-value');
      setElementProperty(checkbox, 'checked', true);

      expect(checkbox.value).toBe('checkbox-value');
      expect(checkbox.checked).toBe(true);
    });
  });
});
