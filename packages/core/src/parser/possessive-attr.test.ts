/**
 * Regression tests for possessive @attr parsing
 *
 * Bug: element's @data-attr was not parsed correctly because the main parser's
 * parseCall() possessive handler used consumeIdentifier() which rejects SYMBOL
 * tokens (@ prefixed). This caused the parser to silently drop all tokens after
 * the possessive, breaking expressions like:
 *   query is '' or card's @data-searchtext.toLowerCase() contains query.toLowerCase()
 *
 * The fix adds SYMBOL token handling in the possessive branch of parseCall().
 */

import { describe, it, expect } from 'vitest';
import { parse } from './parser';
import { evaluateAST } from './runtime';
import { createMockHyperscriptContext } from '../test-setup';

describe("Possessive @attr parsing (element's @attribute)", () => {
  describe('AST parsing', () => {
    it("should parse element's @data-attr as a possessive expression", () => {
      const ast = parse("me's @data-value");
      expect(ast.success).toBe(true);
      expect(ast.node).toBeDefined();
      expect(ast.node!.type).toBe('possessiveExpression');
    });

    it('should not produce parse errors for possessive @attr', () => {
      const ast = parse("me's @data-searchtext");
      expect(ast.success).toBe(true);
      expect(ast.error).toBeUndefined();
    });

    it("should parse element's @data-attr.method() with method chaining", () => {
      const ast = parse("me's @data-value.toLowerCase()");
      expect(ast.success).toBe(true);
      expect(ast.error).toBeUndefined();
      // The top-level node should be a call expression (method call)
      expect(ast.node!.type).toBe('callExpression');
    });
  });

  describe('Runtime evaluation', () => {
    it("should evaluate element's @data-attr via getAttribute", async () => {
      const element = document.createElement('div');
      element.setAttribute('data-value', 'hello');
      const context = createMockHyperscriptContext(element);

      const ast = parse("me's @data-value");
      expect(ast.success).toBe(true);
      expect(ast.error).toBeUndefined();

      const result = await evaluateAST(ast.node!, context);
      expect(result).toBe('hello');
    });

    it("should evaluate element's @data-attr with hyphenated names", async () => {
      const element = document.createElement('div');
      element.setAttribute('data-search-text', 'searchable content');
      const context = createMockHyperscriptContext(element);

      const ast = parse("me's @data-search-text");
      expect(ast.success).toBe(true);
      expect(ast.error).toBeUndefined();

      const result = await evaluateAST(ast.node!, context);
      expect(result).toBe('searchable content');
    });
  });

  describe('Context property access: my/its/your @attr', () => {
    it('should parse my @data-attr as a member expression', () => {
      const ast = parse('my @data-value');
      expect(ast.success).toBe(true);
      expect(ast.node).toBeDefined();
      expect(ast.node!.type).toBe('memberExpression');
      // Property should be an identifier with @-prefixed name
      const prop = (ast.node as any).property;
      expect(prop.type).toBe('identifier');
      expect(prop.name).toBe('@data-value');
    });

    it('should evaluate my @data-attr via getAttribute', async () => {
      const element = document.createElement('div');
      element.setAttribute('data-value', 'my-test');
      const context = createMockHyperscriptContext(element);

      const ast = parse('my @data-value');
      expect(ast.success).toBe(true);

      const result = await evaluateAST(ast.node!, context);
      expect(result).toBe('my-test');
    });

    it('should evaluate my @data-attr with hyphenated names', async () => {
      const element = document.createElement('div');
      element.setAttribute('data-search-text', 'hello world');
      const context = createMockHyperscriptContext(element);

      const ast = parse('my @data-search-text');
      expect(ast.success).toBe(true);

      const result = await evaluateAST(ast.node!, context);
      expect(result).toBe('hello world');
    });
  });

  describe('Precedence with or/contains', () => {
    it('should parse or + contains with correct precedence (contains binds tighter)', () => {
      // This is the core regression: "or" must not consume the possessive as its full right operand
      const ast = parse("'' is '' or 'hello world' contains 'world'");
      expect(ast.success).toBe(true);
      // Top level should be 'or', not just a possessive
      expect(ast.node!.type).toBe('binaryExpression');
      expect((ast.node as any).operator).toBe('or');
    });

    it("should parse 'query is empty or text contains query' correctly", () => {
      const ast = parse("'' is '' or 'some text' contains 'some'");
      expect(ast.success).toBe(true);
      expect(ast.node!.type).toBe('binaryExpression');
      expect((ast.node as any).operator).toBe('or');
      // Right side should be the contains comparison, not just a value
      const right = (ast.node as any).right;
      expect(right.type).toBe('binaryExpression');
      expect(right.operator).toBe('contains');
    });
  });
});
