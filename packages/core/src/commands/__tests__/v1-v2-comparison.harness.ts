/**
 * V1 vs V2 Command Comparison Test Harness
 *
 * Utilities for testing that standalone V2 commands produce
 * identical results to V1 commands they replace.
 *
 * Usage:
 *   import { compareCommands } from './v1-v2-comparison.harness';
 *   import { HideCommand as HideV1 } from '../../commands/dom/hide';
 *   import { HideCommand as HideV2 } from '../dom/hide-standalone';
 *
 *   describe('HideCommand V1 vs V2', () => {
 *     it('should produce identical results', async () => {
 *       await compareCommands({
 *         v1: new HideV1(),
 *         v2: new HideV2(),
 *         testElement: '<div>Test</div>',
 *         input: { args: [], modifiers: {} },
 *         assertions: (el1, el2) => {
 *           expect(el1.style.display).toBe(el2.style.display);
 *           expect(el1.style.display).toBe('none');
 *         },
 *       });
 *     });
 *   });
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import type { ExecutionContext, TypedExecutionContext } from '../../types/core';
import type { ASTNode, ExpressionNode } from '../../types/ast';

// ========== Test Utilities ==========

/**
 * Create a test HTMLElement from HTML string
 */
export function createTestElement(html: string): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = html.trim();
  const element = container.firstElementChild as HTMLElement;

  if (!element) {
    throw new Error(`Failed to create element from HTML: ${html}`);
  }

  // Add to document for realistic testing
  document.body.appendChild(element);

  return element;
}

/**
 * Create multiple test elements
 */
export function createTestElements(htmlArray: string[]): HTMLElement[] {
  return htmlArray.map(html => createTestElement(html));
}

/**
 * Clean up test element from DOM
 */
export function cleanupElement(element: HTMLElement): void {
  if (element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/**
 * Create a basic execution context for testing
 */
export function createTestContext(me: HTMLElement): ExecutionContext {
  return {
    me,
    you: undefined,
    it: undefined,
    result: undefined,
    locals: new Map(),
    target: me,
    detail: undefined,
  } as ExecutionContext;
}

/**
 * Create a typed execution context for V2 commands
 */
export function createTypedContext(me: HTMLElement): TypedExecutionContext {
  return {
    me,
    you: undefined,
    it: undefined,
    result: undefined,
    locals: new Map(),
    target: me,
    detail: undefined,
  } as TypedExecutionContext;
}

/**
 * Clone an element deeply for comparison testing
 */
export function cloneElement(element: HTMLElement): HTMLElement {
  const clone = element.cloneNode(true) as HTMLElement;
  document.body.appendChild(clone);
  return clone;
}

// ========== Command Comparison Utilities ==========

export interface V1Command {
  execute(context: ExecutionContext, ...args: any[]): Promise<any>;
}

export interface V2Command {
  parseInput(
    raw: { args: ASTNode[]; modifiers: Record<string, ExpressionNode> },
    evaluator: any,
    context: ExecutionContext
  ): Promise<any>;
  execute(input: any, context: TypedExecutionContext): Promise<any>;
}

export interface CompareCommandsOptions {
  v1: V1Command;
  v2: V2Command;
  testElement: string | HTMLElement;
  input: {
    args: ASTNode[];
    modifiers: Record<string, ExpressionNode>;
  };
  assertions: (el1: HTMLElement, el2: HTMLElement) => void | Promise<void>;
  cleanup?: boolean; // Default: true
}

/**
 * Compare V1 and V2 command execution results
 *
 * Creates two identical elements, runs V1 and V2 commands on each,
 * and verifies they produce identical results.
 *
 * @param options - Comparison configuration
 */
export async function compareCommands(
  options: CompareCommandsOptions
): Promise<void> {
  const { v1, v2, testElement, input, assertions, cleanup = true } = options;

  // Create two identical test elements
  let el1: HTMLElement;
  let el2: HTMLElement;

  if (typeof testElement === 'string') {
    el1 = createTestElement(testElement);
    el2 = createTestElement(testElement);
  } else {
    el1 = testElement;
    el2 = cloneElement(testElement);
  }

  try {
    // Create contexts
    const ctx1 = createTestContext(el1);
    const ctx2 = createTypedContext(el2);

    // Execute V1 command
    // Note: V1 commands take context + args, need to adapt
    await v1.execute(ctx1);

    // Execute V2 command
    // V2 commands use parseInput() → execute() pattern
    const mockEvaluator = {
      evaluate: async (node: any, context: any) => {
        // Simple mock - just return the node value
        // Real evaluator would parse AST
        return node;
      },
    };

    const parsedInput = await v2.parseInput(input, mockEvaluator, ctx2);
    await v2.execute(parsedInput, ctx2);

    // Run assertions
    await assertions(el1, el2);
  } finally {
    // Cleanup
    if (cleanup) {
      cleanupElement(el1);
      cleanupElement(el2);
    }
  }
}

/**
 * Compare command results on multiple test cases
 *
 * Runs V1 vs V2 comparison across multiple scenarios
 * to ensure comprehensive compatibility.
 */
export async function compareCommandsMultiple(
  v1: V1Command,
  v2: V2Command,
  testCases: Array<{
    name: string;
    element: string;
    input: { args: ASTNode[]; modifiers: Record<string, ExpressionNode> };
    assertions: (el1: HTMLElement, el2: HTMLElement) => void | Promise<void>;
  }>
): Promise<void> {
  for (const testCase of testCases) {
    await compareCommands({
      v1,
      v2,
      testElement: testCase.element,
      input: testCase.input,
      assertions: testCase.assertions,
    });
  }
}

// ========== DOM State Comparison Utilities ==========

/**
 * Compare computed styles of two elements
 */
export function compareStyles(
  el1: HTMLElement,
  el2: HTMLElement,
  properties: string[]
): void {
  const style1 = window.getComputedStyle(el1);
  const style2 = window.getComputedStyle(el2);

  for (const prop of properties) {
    expect(style1.getPropertyValue(prop)).toBe(style2.getPropertyValue(prop));
  }
}

/**
 * Compare class lists of two elements
 */
export function compareClasses(el1: HTMLElement, el2: HTMLElement): void {
  const classes1 = Array.from(el1.classList).sort();
  const classes2 = Array.from(el2.classList).sort();
  expect(classes1).toEqual(classes2);
}

/**
 * Compare attributes of two elements
 */
export function compareAttributes(
  el1: HTMLElement,
  el2: HTMLElement,
  attributes: string[]
): void {
  for (const attr of attributes) {
    expect(el1.getAttribute(attr)).toBe(el2.getAttribute(attr));
  }
}

/**
 * Compare innerHTML of two elements
 */
export function compareInnerHTML(el1: HTMLElement, el2: HTMLElement): void {
  expect(el1.innerHTML).toBe(el2.innerHTML);
}

/**
 * Compare textContent of two elements
 */
export function compareTextContent(el1: HTMLElement, el2: HTMLElement): void {
  expect(el1.textContent).toBe(el2.textContent);
}

/**
 * Deep compare two elements
 *
 * Compares:
 * - tagName
 * - className
 * - All attributes
 * - Inline styles
 * - innerHTML
 */
export function deepCompareElements(el1: HTMLElement, el2: HTMLElement): void {
  // Tag name
  expect(el1.tagName).toBe(el2.tagName);

  // Classes
  compareClasses(el1, el2);

  // All attributes
  const attrs1 = Array.from(el1.attributes).map(a => a.name).sort();
  const attrs2 = Array.from(el2.attributes).map(a => a.name).sort();
  expect(attrs1).toEqual(attrs2);

  for (const attr of attrs1) {
    compareAttributes(el1, el2, [attr]);
  }

  // Inline styles
  expect(el1.style.cssText).toBe(el2.style.cssText);

  // Inner HTML
  compareInnerHTML(el1, el2);
}

// ========== Test Scaffolding ==========

/**
 * Create a V1 vs V2 comparison test suite
 *
 * Generates a describe block with common test cases
 */
export function createComparisonSuite(
  commandName: string,
  V1Class: new () => V1Command,
  V2Class: new () => V2Command,
  testCases: Array<{
    name: string;
    element: string;
    input: { args: ASTNode[]; modifiers: Record<string, ExpressionNode> };
    assertions: (el1: HTMLElement, el2: HTMLElement) => void | Promise<void>;
  }>
): void {
  describe(`${commandName} V1 vs V2 Compatibility`, () => {
    let v1: V1Command;
    let v2: V2Command;

    beforeEach(() => {
      v1 = new V1Class();
      v2 = new V2Class();
    });

    for (const testCase of testCases) {
      it(testCase.name, async () => {
        await compareCommands({
          v1,
          v2,
          testElement: testCase.element,
          input: testCase.input,
          assertions: testCase.assertions,
        });
      });
    }

    it('should produce byte-for-byte identical DOM', async () => {
      // Deep comparison test
      const el1 = createTestElement('<div class="test" data-value="123">Content</div>');
      const el2 = cloneElement(el1);

      try {
        const ctx1 = createTestContext(el1);
        const ctx2 = createTypedContext(el2);

        await v1.execute(ctx1);

        const mockEvaluator = {
          evaluate: async (node: any) => node,
        };

        const input = await v2.parseInput({ args: [], modifiers: {} }, mockEvaluator, ctx2);
        await v2.execute(input, ctx2);

        deepCompareElements(el1, el2);
      } finally {
        cleanupElement(el1);
        cleanupElement(el2);
      }
    });
  });
}

// ========== Usage Example ==========
//
// import { createComparisonSuite } from './v1-v2-comparison.harness';
// import { HideCommand as HideV1 } from '../../commands/dom/hide';
// import { HideCommand as HideV2 } from '../dom/hide-standalone';
//
// createComparisonSuite('HideCommand', HideV1, HideV2, [
//   {
//     name: 'should hide single element',
//     element: '<div>Test</div>',
//     input: { args: [], modifiers: {} },
//     assertions: (el1, el2) => {
//       expect(el1.style.display).toBe('none');
//       expect(el2.style.display).toBe('none');
//       expect(el1.style.display).toBe(el2.style.display);
//     },
//   },
//   {
//     name: 'should hide element with class selector',
//     element: '<div class="target">Test</div>',
//     input: { args: ['.target'], modifiers: {} },
//     assertions: (el1, el2) => {
//       expect(el1.style.display).toBe(el2.style.display);
//     },
//   },
// ]);
