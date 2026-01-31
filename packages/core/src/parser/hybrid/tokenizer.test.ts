/**
 * Test Suite for Hybrid Parser Tokenizer
 *
 * Tests the lexical analyzer that supports CSS selectors, variables,
 * operators, string/number literals, and keywords.
 */

import { describe, it, expect } from 'vitest';
import { tokenize, KEYWORDS } from './tokenizer';

describe('hybrid tokenizer', () => {
  describe('whitespace handling', () => {
    it('should skip whitespace', () => {
      const tokens = tokenize('  toggle  ');
      expect(tokens[0].value).toBe('toggle');
      expect(tokens[1].type).toBe('eof');
    });

    it('should skip newlines', () => {
      const tokens = tokenize('toggle\n.active');
      expect(tokens).toHaveLength(3); // toggle, .active, eof
    });
  });

  describe('comments', () => {
    it('should skip single-line comments (--)', () => {
      const tokens = tokenize('toggle -- this is a comment\n.active');
      expect(tokens[0].value).toBe('toggle');
      expect(tokens[1].value).toBe('.active');
    });

    it('should skip comment until end of line', () => {
      const tokens = tokenize('-- full line comment');
      expect(tokens).toHaveLength(1); // only eof
      expect(tokens[0].type).toBe('eof');
    });
  });

  describe('HTML selectors', () => {
    it('should tokenize HTML selector <button/>', () => {
      const tokens = tokenize('<button/>');
      expect(tokens[0].type).toBe('selector');
      expect(tokens[0].value).toBe('button');
    });

    it('should tokenize HTML selector with class <button.primary/>', () => {
      const tokens = tokenize('<button.primary/>');
      expect(tokens[0].type).toBe('selector');
      expect(tokens[0].value).toBe('button.primary');
    });

    it('should tokenize HTML selector with id <div#main>', () => {
      const tokens = tokenize('<div#main>');
      expect(tokens[0].type).toBe('selector');
      expect(tokens[0].value).toBe('div#main');
    });

    it('should NOT treat < as HTML selector when followed by space', () => {
      const tokens = tokenize('3 < 5');
      // Should be: number, operator, number, eof
      const ops = tokens.filter(t => t.type === 'operator');
      expect(ops.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('possessive', () => {
    it("should tokenize possessive 's as operator", () => {
      const tokens = tokenize("element's value");
      expect(tokens[0].value).toBe('element');
      expect(tokens[1].type).toBe('operator');
      expect(tokens[1].value).toBe("'s");
      expect(tokens[2].value).toBe('value');
    });

    it("should NOT treat 's in middle of word as possessive", () => {
      // 's must not be followed by a letter
      const tokens = tokenize("'string'");
      expect(tokens[0].type).toBe('string');
    });
  });

  describe('string literals', () => {
    it('should tokenize double-quoted strings', () => {
      const tokens = tokenize('"hello world"');
      expect(tokens[0].type).toBe('string');
      expect(tokens[0].value).toBe('"hello world"');
    });

    it('should tokenize single-quoted strings', () => {
      const tokens = tokenize("'hello'");
      expect(tokens[0].type).toBe('string');
      expect(tokens[0].value).toBe("'hello'");
    });

    it('should handle escaped characters in strings', () => {
      const tokens = tokenize('"hello\\"world"');
      expect(tokens[0].type).toBe('string');
    });
  });

  describe('numbers', () => {
    it('should tokenize integers', () => {
      const tokens = tokenize('42');
      expect(tokens[0].type).toBe('number');
      expect(tokens[0].value).toBe('42');
    });

    it('should tokenize floats', () => {
      const tokens = tokenize('3.14');
      expect(tokens[0].type).toBe('number');
      expect(tokens[0].value).toBe('3.14');
    });

    it('should tokenize numbers with ms suffix', () => {
      const tokens = tokenize('300ms');
      expect(tokens[0].type).toBe('number');
      expect(tokens[0].value).toBe('300ms');
    });

    it('should tokenize numbers with s suffix', () => {
      const tokens = tokenize('2s');
      expect(tokens[0].type).toBe('number');
      expect(tokens[0].value).toBe('2s');
    });

    it('should tokenize numbers with px suffix', () => {
      const tokens = tokenize('100px');
      expect(tokens[0].type).toBe('number');
      expect(tokens[0].value).toBe('100px');
    });

    it('should tokenize negative numbers', () => {
      const tokens = tokenize('-5');
      expect(tokens[0].type).toBe('number');
      expect(tokens[0].value).toBe('-5');
    });
  });

  describe('local variables', () => {
    it('should tokenize :name as localVar', () => {
      const tokens = tokenize(':count');
      expect(tokens[0].type).toBe('localVar');
      expect(tokens[0].value).toBe(':count');
    });

    it('should tokenize compound local vars', () => {
      const tokens = tokenize(':myValue');
      expect(tokens[0].type).toBe('localVar');
      expect(tokens[0].value).toBe(':myValue');
    });
  });

  describe('global variables', () => {
    it('should tokenize $name as globalVar', () => {
      const tokens = tokenize('$total');
      expect(tokens[0].type).toBe('globalVar');
      expect(tokens[0].value).toBe('$total');
    });

    it('should tokenize compound global vars', () => {
      const tokens = tokenize('$myTotal');
      expect(tokens[0].type).toBe('globalVar');
      expect(tokens[0].value).toBe('$myTotal');
    });
  });

  describe('CSS selectors', () => {
    it('should tokenize #id as selector', () => {
      const tokens = tokenize('#main');
      expect(tokens[0].type).toBe('selector');
      expect(tokens[0].value).toBe('#main');
    });

    it('should tokenize .class as selector', () => {
      const tokens = tokenize('.active');
      expect(tokens[0].type).toBe('selector');
      expect(tokens[0].value).toBe('.active');
    });

    it('should tokenize hyphenated selectors', () => {
      const tokens = tokenize('#my-element');
      expect(tokens[0].type).toBe('selector');
      expect(tokens[0].value).toBe('#my-element');
    });

    it('should NOT treat .once as a selector (event modifier)', () => {
      const tokens = tokenize('.once');
      expect(tokens[0].type).toBe('symbol');
      expect(tokens[0].value).toBe('.');
      expect(tokens[1].value).toBe('once');
    });

    it('should NOT treat .prevent as a selector (event modifier)', () => {
      const tokens = tokenize('.prevent');
      expect(tokens[0].type).toBe('symbol');
      expect(tokens[0].value).toBe('.');
    });

    it('should NOT treat .stop as a selector (event modifier)', () => {
      const tokens = tokenize('.stop');
      expect(tokens[0].type).toBe('symbol');
      expect(tokens[0].value).toBe('.');
    });

    it('should NOT treat .debounce as a selector (event modifier)', () => {
      const tokens = tokenize('.debounce');
      expect(tokens[0].type).toBe('symbol');
      expect(tokens[0].value).toBe('.');
    });

    it('should NOT treat .throttle as a selector (event modifier)', () => {
      const tokens = tokenize('.throttle');
      expect(tokens[0].type).toBe('symbol');
      expect(tokens[0].value).toBe('.');
    });
  });

  describe('array vs attribute selectors', () => {
    it('should tokenize [data-x] as attribute selector', () => {
      const tokens = tokenize('[data-x]');
      expect(tokens[0].type).toBe('selector');
      expect(tokens[0].value).toBe('[data-x]');
    });

    it('should tokenize [data-x=value] as attribute selector', () => {
      const tokens = tokenize('[data-x=value]');
      expect(tokens[0].type).toBe('selector');
    });

    it('should tokenize [1, 2] as array literal start', () => {
      const tokens = tokenize('[1, 2]');
      expect(tokens[0].type).toBe('symbol');
      expect(tokens[0].value).toBe('[');
    });

    it('should tokenize empty [] as array literal', () => {
      const tokens = tokenize('[]');
      // [ is symbol (array start)
      expect(tokens[0].type).toBe('symbol');
      expect(tokens[0].value).toBe('[');
    });

    it('should tokenize ] as closing symbol', () => {
      const tokens = tokenize(']');
      expect(tokens[0].type).toBe('symbol');
      expect(tokens[0].value).toBe(']');
    });
  });

  describe('operators', () => {
    it('should tokenize multi-char operators', () => {
      expect(tokenize('==')[0]).toMatchObject({ type: 'operator', value: '==' });
      expect(tokenize('!=')[0]).toMatchObject({ type: 'operator', value: '!=' });
      expect(tokenize('<=')[0]).toMatchObject({ type: 'operator', value: '<=' });
      expect(tokenize('>=')[0]).toMatchObject({ type: 'operator', value: '>=' });
      expect(tokenize('&&')[0]).toMatchObject({ type: 'operator', value: '&&' });
      expect(tokenize('||')[0]).toMatchObject({ type: 'operator', value: '||' });
    });

    it('should tokenize single-char operators', () => {
      expect(tokenize('+')[0]).toMatchObject({ type: 'operator', value: '+' });
      expect(tokenize('-')[0]).toMatchObject({ type: 'operator', value: '-' });
      expect(tokenize('/')[0]).toMatchObject({ type: 'operator', value: '/' });
      expect(tokenize('%')[0]).toMatchObject({ type: 'operator', value: '%' });
    });
  });

  describe('style properties', () => {
    it('should tokenize *opacity as styleProperty', () => {
      const tokens = tokenize('*opacity');
      expect(tokens[0].type).toBe('styleProperty');
      expect(tokens[0].value).toBe('*opacity');
    });

    it('should tokenize *background-color as styleProperty', () => {
      const tokens = tokenize('*background-color');
      expect(tokens[0].type).toBe('styleProperty');
      expect(tokens[0].value).toBe('*background-color');
    });

    it('should NOT treat * alone as styleProperty (multiplication)', () => {
      const tokens = tokenize('3 * 5');
      const star = tokens.find(t => t.value === '*');
      expect(star?.type).toBe('operator');
    });
  });

  describe('symbols', () => {
    it('should tokenize parentheses', () => {
      const tokens = tokenize('()');
      expect(tokens[0]).toMatchObject({ type: 'symbol', value: '(' });
      expect(tokens[1]).toMatchObject({ type: 'symbol', value: ')' });
    });

    it('should tokenize braces', () => {
      const tokens = tokenize('{}');
      expect(tokens[0]).toMatchObject({ type: 'symbol', value: '{' });
      expect(tokens[1]).toMatchObject({ type: 'symbol', value: '}' });
    });

    it('should tokenize comma', () => {
      const tokens = tokenize(',');
      expect(tokens[0]).toMatchObject({ type: 'symbol', value: ',' });
    });
  });

  describe('keywords vs identifiers', () => {
    it('should recognize keywords', () => {
      const tokens = tokenize('toggle');
      expect(tokens[0].type).toBe('keyword');
    });

    it('should mark unknown words as identifiers', () => {
      const tokens = tokenize('myFunction');
      expect(tokens[0].type).toBe('identifier');
    });

    it('should be case-insensitive for keyword recognition', () => {
      const tokens = tokenize('Toggle');
      // Keywords are matched via .toLowerCase()
      expect(tokens[0].type).toBe('keyword');
    });

    it('should handle hyphenated identifiers', () => {
      const tokens = tokenize('my-component');
      expect(tokens[0].type).toBe('identifier');
      expect(tokens[0].value).toBe('my-component');
    });
  });

  describe('EOF token', () => {
    it('should always append EOF', () => {
      const tokens = tokenize('');
      expect(tokens).toHaveLength(1);
      expect(tokens[0].type).toBe('eof');
    });

    it('should append EOF after content', () => {
      const tokens = tokenize('toggle');
      expect(tokens[tokens.length - 1].type).toBe('eof');
    });
  });

  describe('KEYWORDS set', () => {
    it('should contain core keywords', () => {
      expect(KEYWORDS.has('on')).toBe(true);
      expect(KEYWORDS.has('toggle')).toBe(true);
      expect(KEYWORDS.has('add')).toBe(true);
      expect(KEYWORDS.has('remove')).toBe(true);
      expect(KEYWORDS.has('set')).toBe(true);
      expect(KEYWORDS.has('if')).toBe(true);
      expect(KEYWORDS.has('else')).toBe(true);
      expect(KEYWORDS.has('end')).toBe(true);
      expect(KEYWORDS.has('then')).toBe(true);
    });

    it('should not contain arbitrary words', () => {
      expect(KEYWORDS.has('banana')).toBe(false);
      expect(KEYWORDS.has('myVar')).toBe(false);
    });
  });

  describe('complex token sequences', () => {
    it('should tokenize a full event handler', () => {
      const tokens = tokenize('on click toggle .active on me');
      const values = tokens.filter(t => t.type !== 'eof').map(t => t.value);
      expect(values).toEqual(['on', 'click', 'toggle', '.active', 'on', 'me']);
    });

    it('should tokenize expression with operators', () => {
      const tokens = tokenize(':count + 1');
      expect(tokens[0]).toMatchObject({ type: 'localVar', value: ':count' });
      expect(tokens[1]).toMatchObject({ type: 'operator', value: '+' });
      expect(tokens[2]).toMatchObject({ type: 'number', value: '1' });
    });

    it('should tokenize possessive chain', () => {
      const tokens = tokenize("#el's textContent");
      expect(tokens[0]).toMatchObject({ type: 'selector', value: '#el' });
      expect(tokens[1]).toMatchObject({ type: 'operator', value: "'s" });
      expect(tokens[2].value).toBe('textContent');
    });

    it('should track token positions', () => {
      const tokens = tokenize('toggle .active');
      expect(tokens[0].pos).toBe(0);
      expect(tokens[1].pos).toBe(7);
    });

    it('should handle unknown characters by skipping them', () => {
      const tokens = tokenize('toggle @ .active');
      // @ is unknown, gets skipped (pos++)
      const values = tokens.filter(t => t.type !== 'eof').map(t => t.value);
      expect(values).toContain('toggle');
      expect(values).toContain('.active');
    });
  });
});
