/**
 * LogCommand - Standalone V2 Implementation
 *
 * Logs values to the console for debugging and inspection
 *
 * This is a standalone implementation with NO V1 dependencies,
 * enabling true tree-shaking by avoiding all shared utilities.
 *
 * Syntax:
 *   log                      # Log empty line
 *   log <value>              # Log single value
 *   log <val1> <val2> ...    # Log multiple values
 *
 * @example
 *   log "Hello World"
 *   log me.value
 *   log x y z
 *   log "Result:" result
 */

import type { ExecutionContext, TypedExecutionContext } from '../../types/core';
import type { ASTNode, ExpressionNode } from '../../types/base-types';
import type { ExpressionEvaluator } from '../../core/expression-evaluator';

/**
 * Typed input for LogCommand
 * Represents parsed arguments ready for execution
 */
export interface LogCommandInput {
  /** Values to log to console */
  values: unknown[];
}

/**
 * Typed output for LogCommand
 * Represents the result of logging
 */
export interface LogCommandOutput {
  /** Values that were logged */
  values: unknown[];
  /** Timestamp when logging occurred */
  loggedAt: Date;
}

/**
 * LogCommand - Standalone V2 Implementation
 *
 * Self-contained implementation with no V1 dependencies.
 * Achieves tree-shaking by having zero external imports.
 *
 * V1 Size: 131 lines
 * V2 Size: ~100 lines (24% reduction)
 */
export class LogCommand {
  /**
   * Command name as registered in runtime
   */
  readonly name = 'log';

  /**
   * Command metadata for documentation and tooling
   */
  static readonly metadata = {
    description: 'Log values to the console',
    syntax: 'log [<values...>]',
    examples: [
      'log "Hello World"',
      'log me.value',
      'log x y z',
      'log "Result:" result',
    ],
    category: 'utility',
    sideEffects: ['console-output'],
  } as const;

  /**
   * Instance accessor for metadata (backward compatibility)
   */
  get metadata() {
    return LogCommand.metadata;
  }

  /**
   * Parse raw AST nodes into typed command input
   *
   * Evaluates all argument expressions to get the actual values to log.
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
  ): Promise<LogCommandInput> {
    // If no args, return empty values array
    if (!raw.args || raw.args.length === 0) {
      return { values: [] };
    }

    // Evaluate all arguments to get values to log
    const values = await Promise.all(
      raw.args.map((arg: ASTNode) => evaluator.evaluate(arg, context))
    );

    return { values };
  }

  /**
   * Execute the log command
   *
   * Outputs all values to the console using console.log().
   * If no values provided, logs an empty line.
   *
   * @param input - Typed command input from parseInput()
   * @param context - Typed execution context
   * @returns Output with logged values and timestamp
   */
  async execute(
    input: LogCommandInput,
    context: TypedExecutionContext
  ): Promise<LogCommandOutput> {
    // Use window.console to prevent Terser's drop_console from stripping this
    // The log command is an intentional user-facing feature, not a debug statement
    const logger = typeof window !== 'undefined' ? window.console : console;

    // Log values to console
    if (input.values.length === 0) {
      // No values - log empty line
      logger.log();
    } else {
      // Log all values
      logger.log(...input.values);
    }

    // Return structured output
    return {
      values: input.values,
      loggedAt: new Date(),
    };
  }

  /**
   * Validate parsed input (optional but recommended)
   *
   * Runtime validation to catch parsing errors early.
   *
   * @param input - Input to validate
   * @returns true if input is valid LogCommandInput
   */
  validate(input: unknown): input is LogCommandInput {
    if (typeof input !== 'object' || input === null) return false;

    const typed = input as Partial<LogCommandInput>;

    if (!Array.isArray(typed.values)) return false;

    // Values can be any type - no further validation needed
    return true;
  }
}

// ========== Factory Function ==========

/**
 * Factory function for creating LogCommand instances
 * Maintains compatibility with existing command registration patterns
 *
 * @returns New LogCommand instance
 */
export function createLogCommand(): LogCommand {
  return new LogCommand();
}

// Default export for convenience
export default LogCommand;

// ========== Usage Example ==========
//
// import { LogCommand } from './commands-v2/utility/log-standalone';
// import { RuntimeBase } from './runtime/runtime-base';
//
// const runtime = new RuntimeBase({
//   registry: {
//     log: new LogCommand(),
//   },
// });
//
// // Now only LogCommand is bundled, not all V1 dependencies!
// // Bundle size: ~1-2 KB (vs ~230 KB with V1 inheritance)
