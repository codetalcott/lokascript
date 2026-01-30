import { describe, it, expect } from 'vitest';
import {
  createLiteral,
  createIdentifier,
  createBinaryExpression,
  createUnaryExpression,
  createMemberExpression,
  createCallExpression,
  createSelector,
  createPossessiveExpression,
  createProgramNode,
  createErrorNode,
} from '../ast-helpers';
import type { Position } from '../../parser-types';

describe('ast-helpers', () => {
  const mockPosition: Position = {
    start: 0,
    end: 10,
    line: 1,
    column: 1,
  };

  describe('createLiteral', () => {
    it('should create string literal node', () => {
      const node = createLiteral('hello', '"hello"', mockPosition);

      expect(node.type).toBe('literal');
      expect(node.value).toBe('hello');
      expect(node.raw).toBe('"hello"');
      expect(node.start).toBe(0);
      expect(node.end).toBe(10);
    });

    it('should create number literal node', () => {
      const node = createLiteral(42, '42', mockPosition);

      expect(node.type).toBe('literal');
      expect(node.value).toBe(42);
      expect(node.raw).toBe('42');
    });

    it('should create boolean literal node', () => {
      const node = createLiteral(true, 'true', mockPosition);

      expect(node.type).toBe('literal');
      expect(node.value).toBe(true);
      expect(node.raw).toBe('true');
    });

    it('should create null literal node', () => {
      const node = createLiteral(null, 'null', mockPosition);

      expect(node.type).toBe('literal');
      expect(node.value).toBeNull();
      expect(node.raw).toBe('null');
    });

    it('should preserve position information', () => {
      const pos: Position = { start: 5, end: 15, line: 2, column: 3 };
      const node = createLiteral('test', '"test"', pos);

      expect(node.start).toBe(5);
      expect(node.end).toBe(15);
      expect(node.line).toBe(2);
      expect(node.column).toBe(3);
    });
  });

  describe('createIdentifier', () => {
    it('should create identifier node', () => {
      const node = createIdentifier('myVariable', mockPosition);

      expect(node.type).toBe('identifier');
      expect(node.name).toBe('myVariable');
      expect(node.start).toBe(0);
      expect(node.end).toBe(10);
    });

    it('should handle single character names', () => {
      const node = createIdentifier('x', mockPosition);

      expect(node.name).toBe('x');
    });

    it('should handle reserved word-like names', () => {
      const node = createIdentifier('then', mockPosition);

      expect(node.name).toBe('then');
    });

    it('should preserve position information', () => {
      const pos: Position = { start: 10, end: 20, line: 3, column: 5 };
      const node = createIdentifier('test', pos);

      expect(node.start).toBe(10);
      expect(node.line).toBe(3);
      expect(node.column).toBe(5);
    });
  });

  describe('createBinaryExpression', () => {
    it('should create addition expression', () => {
      const left = createIdentifier('a', mockPosition);
      const right = createIdentifier('b', mockPosition);
      const node = createBinaryExpression('+', left, right, mockPosition);

      expect(node.type).toBe('binaryExpression');
      expect(node.operator).toBe('+');
      expect(node.left).toBe(left);
      expect(node.right).toBe(right);
    });

    it('should create comparison expression', () => {
      const left = createLiteral(5, '5', mockPosition);
      const right = createLiteral(10, '10', mockPosition);
      const node = createBinaryExpression('>', left, right, mockPosition);

      expect(node.operator).toBe('>');
      expect(node.left.value).toBe(5);
      expect(node.right.value).toBe(10);
    });

    it('should calculate position from operands', () => {
      const left = createIdentifier('a', { start: 0, end: 1, line: 1, column: 0 });
      const right = createIdentifier('b', { start: 4, end: 5, line: 1, column: 4 });
      const pos: Position = { start: 0, end: 5, line: 1, column: 0 };
      const node = createBinaryExpression('+', left, right, pos);

      expect(node.start).toBe(0);
      expect(node.end).toBe(5);
    });

    it('should support logical operators', () => {
      const left = createIdentifier('x', mockPosition);
      const right = createIdentifier('y', mockPosition);
      const node = createBinaryExpression('and', left, right, mockPosition);

      expect(node.operator).toBe('and');
    });

    it('should support equality operators', () => {
      const left = createIdentifier('a', mockPosition);
      const right = createLiteral(5, '5', mockPosition);
      const node = createBinaryExpression('is', left, right, mockPosition);

      expect(node.operator).toBe('is');
    });
  });

  describe('createUnaryExpression', () => {
    it('should create prefix unary expression', () => {
      const arg = createIdentifier('x', mockPosition);
      const node = createUnaryExpression('not', arg, true, mockPosition);

      expect(node.type).toBe('unaryExpression');
      expect(node.operator).toBe('not');
      expect(node.argument).toBe(arg);
      expect(node.prefix).toBe(true);
    });

    it('should create postfix unary expression', () => {
      const arg = createIdentifier('count', mockPosition);
      const node = createUnaryExpression('++', arg, false, mockPosition);

      expect(node.operator).toBe('++');
      expect(node.prefix).toBe(false);
    });

    it('should preserve position', () => {
      const arg = createIdentifier('x', { start: 5, end: 6, line: 1, column: 5 });
      const pos: Position = { start: 4, end: 6, line: 1, column: 4 };
      const node = createUnaryExpression('not', arg, true, pos);

      expect(node.start).toBe(4);
      expect(node.end).toBe(6);
    });
  });

  describe('createMemberExpression', () => {
    it('should create dot notation member access', () => {
      const obj = createIdentifier('element', mockPosition);
      const prop = createIdentifier('classList', mockPosition);
      const node = createMemberExpression(obj, prop, false, mockPosition);

      expect(node.type).toBe('memberExpression');
      expect(node.object).toBe(obj);
      expect(node.property).toBe(prop);
      expect(node.computed).toBe(false);
    });

    it('should create bracket notation member access', () => {
      const obj = createIdentifier('array', mockPosition);
      const prop = createLiteral(0, '0', mockPosition);
      const node = createMemberExpression(obj, prop, true, mockPosition);

      expect(node.computed).toBe(true);
    });

    it('should calculate position from object and property', () => {
      const obj = createIdentifier('obj', { start: 0, end: 3, line: 1, column: 0 });
      const prop = createIdentifier('prop', { start: 4, end: 8, line: 1, column: 4 });
      const pos: Position = { start: 0, end: 8, line: 1, column: 0 };
      const node = createMemberExpression(obj, prop, false, pos);

      expect(node.start).toBe(0);
      expect(node.end).toBe(8);
    });

    it('should support chained member access', () => {
      const obj = createIdentifier('a', mockPosition);
      const prop1 = createIdentifier('b', mockPosition);
      const inner = createMemberExpression(obj, prop1, false, mockPosition);
      const prop2 = createIdentifier('c', mockPosition);
      const outer = createMemberExpression(inner, prop2, false, mockPosition);

      expect(outer.object).toBe(inner);
      expect(outer.property.name).toBe('c');
    });
  });

  describe('createCallExpression', () => {
    it('should create function call with no arguments', () => {
      const callee = createIdentifier('func', mockPosition);
      const node = createCallExpression(callee, [], mockPosition);

      expect(node.type).toBe('callExpression');
      expect(node.callee).toBe(callee);
      expect(node.arguments).toHaveLength(0);
    });

    it('should create function call with single argument', () => {
      const callee = createIdentifier('func', mockPosition);
      const arg = createLiteral(42, '42', mockPosition);
      const node = createCallExpression(callee, [arg], mockPosition);

      expect(node.arguments).toHaveLength(1);
      expect(node.arguments[0]).toBe(arg);
    });

    it('should create function call with multiple arguments', () => {
      const callee = createIdentifier('func', mockPosition);
      const arg1 = createLiteral(1, '1', mockPosition);
      const arg2 = createLiteral(2, '2', mockPosition);
      const node = createCallExpression(callee, [arg1, arg2], mockPosition);

      expect(node.arguments).toHaveLength(2);
    });

    it('should preserve position information', () => {
      const callee = createIdentifier('func', mockPosition);
      const pos: Position = { start: 0, end: 10, line: 1, column: 0 };
      const node = createCallExpression(callee, [], pos);

      expect(node.start).toBe(0);
      expect(node.end).toBe(10);
    });

    it('should support method calls', () => {
      const obj = createIdentifier('element', mockPosition);
      const prop = createIdentifier('classList', mockPosition);
      const method = createMemberExpression(obj, prop, false, mockPosition);
      const arg = createLiteral('active', '"active"', mockPosition);
      const node = createCallExpression(method, [arg], mockPosition);

      expect(node.callee.type).toBe('memberExpression');
    });
  });

  describe('createSelector', () => {
    it('should create class selector', () => {
      const node = createSelector('.active', mockPosition);

      expect(node.type).toBe('selector');
      expect(node.value).toBe('.active');
    });

    it('should create id selector', () => {
      const node = createSelector('#button', mockPosition);

      expect(node.value).toBe('#button');
    });

    it('should create attribute selector', () => {
      const node = createSelector('[data-value]', mockPosition);

      expect(node.value).toBe('[data-value]');
    });

    it('should create complex selector', () => {
      const node = createSelector('.container > .item:first-child', mockPosition);

      expect(node.value).toBe('.container > .item:first-child');
    });

    it('should preserve position information', () => {
      const pos: Position = { start: 20, end: 30, line: 4, column: 1 };
      const node = createSelector('.test', pos);

      expect(node.start).toBe(20);
      expect(node.end).toBe(30);
    });
  });

  describe('createPossessiveExpression', () => {
    it('should create possessive expression', () => {
      const obj = createIdentifier('element', mockPosition);
      const prop = createIdentifier('className', mockPosition);
      const node = createPossessiveExpression(obj, prop, mockPosition);

      expect(node.type).toBe('possessiveExpression');
      expect(node.object).toBe(obj);
      expect(node.property).toBe(prop);
    });

    it('should preserve position information', () => {
      const obj = createIdentifier('el', mockPosition);
      const prop = createIdentifier('value', mockPosition);
      const pos: Position = { start: 0, end: 15, line: 1, column: 0 };
      const node = createPossessiveExpression(obj, prop, pos);

      expect(node.start).toBe(0);
      expect(node.end).toBe(15);
    });
  });

  describe('createProgramNode', () => {
    it('should create program with multiple statements', () => {
      const stmt1 = createIdentifier('a', mockPosition);
      const stmt2 = createIdentifier('b', mockPosition);
      const node = createProgramNode([stmt1, stmt2]);

      expect(node.type).toBe('Program');
      expect(node.statements).toHaveLength(2);
    });

    it('should return single statement for one-element array', () => {
      const stmt = createIdentifier('single', mockPosition);
      const node = createProgramNode([stmt]);

      // Returns the single statement directly, not wrapped
      expect(node).toBe(stmt);
    });

    it('should return error node for empty array', () => {
      const node = createProgramNode([]);

      expect(node.type).toBe('identifier');
      expect(node.name).toBe('__ERROR__');
    });

    it('should calculate position from first and last statements', () => {
      const stmt1 = createIdentifier('a', { start: 0, end: 1, line: 1, column: 0 });
      const stmt2 = createIdentifier('b', { start: 10, end: 11, line: 2, column: 0 });
      const node = createProgramNode([stmt1, stmt2]);

      expect(node.start).toBe(0);
      expect(node.end).toBe(11);
    });
  });

  describe('createErrorNode', () => {
    it('should create error node with __ERROR__ name', () => {
      const node = createErrorNode(mockPosition);

      expect(node.type).toBe('identifier');
      expect(node.name).toBe('__ERROR__');
    });

    it('should preserve position information', () => {
      const pos: Position = { start: 42, end: 50, line: 5, column: 10 };
      const node = createErrorNode(pos);

      expect(node.start).toBe(42);
      expect(node.end).toBe(50);
      expect(node.line).toBe(5);
      expect(node.column).toBe(10);
    });
  });
});
