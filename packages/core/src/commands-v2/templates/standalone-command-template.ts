/**
 * {CommandName} - Standalone V2 Implementation
 *
 * {Brief description of what this command does}
 *
 * Syntax:
 *   {commandname} <required> [optional]
 *   {commandname} <target> with <modifier>
 *
 * @example
 *   {commandname} me
 *   {commandname} #element
 *   {commandname} .class with transition
 */

import type { ExecutionContext, TypedExecutionContext } from '../../types/core';
import type { ASTNode, ExpressionNode } from '../../types/ast';
import type { ExpressionEvaluator } from '../../runtime/expression-evaluator';

/**
 * Typed input for {CommandName}
 * Represents parsed arguments ready for execution
 */
export interface {CommandName}Input {
  // Define your command's typed input structure
  // Example: targets: HTMLElement[];
  // Example: value: string;
  // Example: options?: { modifier?: string };
}

/**
 * {CommandName} - Standalone V2 Implementation
 *
 * Self-contained implementation with no V1 dependencies.
 * Achieves tree-shaking by inlining essential utilities.
 */
export class {CommandName} {
  /**
   * Command name as registered in runtime
   */
  readonly name = '{commandname}';

  /**
   * Command metadata for documentation and tooling
   */
  readonly metadata = {
    description: '{Brief description}',
    syntax: '{commandname} <required> [optional]',
    examples: [
      '{commandname} me',
      '{commandname} #element',
      '{commandname} .class with transition',
    ],
  };

  /**
   * Parse raw AST nodes into typed command input
   *
   * This method receives raw AST from the parser and converts it into
   * structured input ready for execution. It evaluates expressions and
   * extracts command-specific patterns.
   *
   * @param raw - Raw command node with args and modifiers from AST
   * @param evaluator - Expression evaluator for evaluating AST nodes
   * @param context - Execution context with me, you, it, etc.
   * @returns Typed input object for execute()
   */
  async parseInput(
    raw: { args: ASTNode[]; modifiers: Record<string, ExpressionNode> },
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<{CommandName}Input> {
    // TODO: Implement argument parsing
    //
    // Common patterns:
    // 1. Resolve targets: await this.resolveTargets(raw.args, evaluator, context)
    // 2. Parse modifiers: raw.modifiers.with ? ... : undefined
    // 3. Evaluate expressions: await evaluator.evaluate(arg, context)
    //
    // Example:
    // const targets = await this.resolveTargets(raw.args, evaluator, context);
    // const value = raw.modifiers.to
    //   ? await evaluator.evaluate(raw.modifiers.to, context)
    //   : undefined;
    //
    // return { targets, value };

    throw new Error('{CommandName}.parseInput() not implemented');
  }

  /**
   * Execute the {commandname} command
   *
   * Receives typed input from parseInput() and performs the command's
   * side effects (DOM manipulation, state changes, etc.).
   *
   * @param input - Typed command input from parseInput()
   * @param context - Typed execution context
   * @returns Command result (void for most commands)
   */
  async execute(
    input: {CommandName}Input,
    context: TypedExecutionContext
  ): Promise<void> {
    // TODO: Implement command execution
    //
    // Common patterns:
    // 1. Iterate targets: for (const target of input.targets) { ... }
    // 2. DOM manipulation: target.style.property = value
    // 3. State changes: context.locals.set(key, value)
    //
    // Example:
    // for (const element of input.targets) {
    //   this.applyEffect(element, input.value);
    // }

    throw new Error('{CommandName}.execute() not implemented');
  }

  /**
   * Validate parsed input (optional but recommended)
   *
   * Runtime validation to catch parsing errors early.
   * Use for defensive programming and better error messages.
   *
   * @param input - Input to validate
   * @returns true if input is valid {CommandName}Input
   */
  validate(input: unknown): input is {CommandName}Input {
    if (typeof input !== 'object' || input === null) return false;

    const typed = input as Partial<{CommandName}Input>;

    // TODO: Implement validation logic
    //
    // Example:
    // if (!Array.isArray(typed.targets)) return false;
    // if (!typed.targets.every(t => t instanceof HTMLElement)) return false;
    // if (typed.value !== undefined && typeof typed.value !== 'string') return false;

    return true;
  }

  // ========== Private Utility Methods ==========
  //
  // Inline essential utilities here (~20 lines each).
  // Common utilities: resolveTargets, parseClasses, assertElement
  //
  // IMPORTANT: Do NOT import from V1 utilities!
  // Copy and adapt the logic inline to avoid dependency chains.

  /**
   * Resolve target elements from AST args
   *
   * Inline version of dom-utils.resolveTargets
   * Handles: context.me default, HTMLElement, NodeList, CSS selectors
   *
   * @param args - Raw AST arguments
   * @param evaluator - Expression evaluator
   * @param context - Execution context
   * @returns Array of resolved HTMLElements
   */
  private async resolveTargets(
    args: ASTNode[],
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<HTMLElement[]> {
    // Default to context.me if no args
    if (!args || args.length === 0) {
      return [context.me];
    }

    const targets: HTMLElement[] = [];

    for (const arg of args) {
      const evaluated = await evaluator.evaluate(arg, context);

      if (evaluated instanceof HTMLElement) {
        targets.push(evaluated);
      } else if (evaluated instanceof NodeList || Array.isArray(evaluated)) {
        const elements = Array.from(evaluated).filter(
          (el): el is HTMLElement => el instanceof HTMLElement
        );
        targets.push(...elements);
      } else if (typeof evaluated === 'string') {
        // CSS selector
        const selected = document.querySelectorAll(evaluated);
        const elements = Array.from(selected).filter(
          (el): el is HTMLElement => el instanceof HTMLElement
        );
        targets.push(...elements);
      } else {
        throw new Error(
          `Invalid target: expected HTMLElement, got ${typeof evaluated}`
        );
      }
    }

    if (targets.length === 0) {
      throw new Error(`${this.name} command: no valid targets found`);
    }

    return targets;
  }

  /**
   * Parse class names from various formats
   *
   * Inline version of dom-utils.parseClasses
   * Handles: "class", ".class", "class1 class2", [".class1", "class2"]
   *
   * @param classArg - Class argument (string or array)
   * @returns Array of class names without dot prefix
   */
  private parseClasses(classArg: unknown): string[] {
    if (typeof classArg === 'string') {
      // Handle space-separated: "class1 class2"
      // Handle dot-prefixed: ".class1 .class2"
      return classArg
        .split(/\s+/)
        .map(c => c.replace(/^\./, ''))
        .filter(c => c.length > 0);
    }

    if (Array.isArray(classArg)) {
      return classArg
        .map(c => String(c).replace(/^\./, ''))
        .filter(c => c.length > 0);
    }

    // Single class
    return [String(classArg).replace(/^\./, '')];
  }

  /**
   * Assert value is HTMLElement
   *
   * Inline lightweight validation
   *
   * @param value - Value to check
   * @param context - Context string for error message
   * @throws Error if value is not HTMLElement
   */
  private assertElement(
    value: unknown,
    context?: string
  ): asserts value is HTMLElement {
    if (!(value instanceof HTMLElement)) {
      const ctx = context ? ` (${context})` : '';
      throw new Error(
        `Expected HTMLElement${ctx}, got ${value?.constructor?.name ?? typeof value}`
      );
    }
  }
}

// ========== Usage Example ==========
//
// import { {CommandName} } from './commands-v2/{category}/{commandname}-standalone';
// import { RuntimeBase } from './runtime/runtime-base';
//
// const runtime = new RuntimeBase({
//   registry: {
//     '{commandname}': new {CommandName}(),
//   },
// });
//
// // Now only {CommandName} is bundled, not all V1 dependencies!
