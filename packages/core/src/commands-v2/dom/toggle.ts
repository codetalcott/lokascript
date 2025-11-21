/**
 * ToggleCommand V2 - Enhanced with parseInput() for RuntimeBase
 * Non-destructive wrapper that extends the original ToggleCommand
 */

import { ToggleCommand as ToggleCommandV1 } from '../../commands/dom/toggle';
import type { ASTNode, ExecutionContext } from '../../types/base-types';
import type { ExpressionEvaluator } from '../../core/expression-evaluator';
import { debug } from '../../utils/debug';

/**
 * Raw input from RuntimeBase (before evaluation)
 */
export interface ToggleCommandRawInput {
  args: ASTNode[];
  modifiers: Record<string, ASTNode>;
}

/**
 * Enhanced ToggleCommand with parseInput() method for tree-shakable RuntimeBase
 *
 * This wrapper extends the original ToggleCommand and adds complex argument parsing
 * logic that was previously in Runtime.executeEnhancedCommand().
 *
 * Toggle supports multiple patterns:
 * - "toggle .class" (implicit target: me)
 * - "toggle .class on #target"
 * - "toggle #dialog" (smart element detection)
 * - "toggle #dialog modal" (element with mode)
 */
export class ToggleCommand extends ToggleCommandV1 {
  /**
   * Parse raw AST input with complex pattern handling
   *
   * Toggle has multiple syntax patterns that require special parsing logic.
   * This method replicates the logic from Runtime.executeEnhancedCommand()
   * (lines 844-1011).
   *
   * @param raw - Raw AST nodes and modifiers from the parser
   * @param evaluator - Expression evaluator for resolving AST nodes
   * @param context - Execution context
   * @returns Evaluated arguments ready for execute()
   */
  async parseInput(
    raw: ToggleCommandRawInput,
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<any[]> {
    const { args } = raw;

    if (!args || args.length === 0) {
      return [];
    }

    let evaluatedArgs: any[] = [];

    // Pattern 1: "toggle .class on #target" or "toggle .class from #target" (3 args)
    if (args.length === 3) {
      // First argument: class expression (extract string value)
      let classArg: any = args[0];
      if ((classArg as any)?.type === 'selector' || (classArg as any)?.type === 'literal') {
        classArg = (classArg as any).value;
      }
      // Strip leading . from class name
      if (typeof classArg === 'string' && classArg.startsWith('.')) {
        classArg = classArg.slice(1);
      }

      // Second argument: preposition ('on' or 'from') - just a syntax marker, ignore it

      // Third argument: target (special handling for context variables)
      let target: any = args[2];
      const targetAny = target as any;

      // Special context variable handling
      if (targetAny?.type === 'identifier' && targetAny.name === 'me') {
        target = context.me;
      } else if (targetAny?.type === 'identifier' && targetAny.name === 'it') {
        target = context.it;
      } else if (targetAny?.type === 'identifier' && targetAny.name === 'you') {
        target = context.you;
      } else if (targetAny?.type === 'selector') {
        target = targetAny.value;
      } else if (targetAny?.type === 'identifier') {
        // Check if it's a variable in locals/globals first
        const varName = targetAny.name;
        if (context.locals.has(varName)) {
          target = context.locals.get(varName);
        } else if (context.globals.has(varName)) {
          target = context.globals.get(varName);
        } else {
          // Not a known variable - evaluate as expression
          target = await evaluator.evaluate(target, context);
        }
      } else if (targetAny?.type === 'literal') {
        target = targetAny.value;
      } else {
        target = await evaluator.evaluate(target, context);
      }

      evaluatedArgs = [classArg, target];
    }
    // Pattern 2: "toggle .active" (implicit target: me) OR "toggle #dialog" (smart element)
    else if (args.length === 1) {
      let classArg: unknown = args[0];
      const classArgAny = classArg as any;

      // Extract the value
      if (classArgAny?.type === 'selector' || classArgAny?.type === 'literal') {
        classArg = classArgAny.value;
      } else if (classArgAny?.type === 'identifier') {
        classArg = classArgAny.name;
      }

      // Convert to string if needed
      if (typeof classArg !== 'string') {
        classArg = String(classArg);
      }

      // Smart element detection: Check if this is an element selector (not a class)
      // Elements that can be "toggled": dialog, details, summary, select
      const isSmartElementCandidate =
        typeof classArg === 'string' &&
        !classArg.startsWith('.') &&
        !classArg.startsWith('@') &&
        !classArg.startsWith('*') &&
        (classArg.startsWith('#') || ['dialog', 'details', 'summary', 'select'].includes(classArg.toLowerCase()));

      if (isSmartElementCandidate) {
        // Pass as selector without implicit target - let toggle command detect smart element
        evaluatedArgs = [classArg];
      } else {
        // Strip leading . for class names
        if (typeof classArg === 'string' && classArg.startsWith('.')) {
          classArg = classArg.slice(1);
        }
        // Use context.me as implicit target for class/attribute toggle
        evaluatedArgs = [classArg, context.me];
      }
    }
    // Pattern 3: "toggle #dialog modal" or "toggle #dialog as modal" (2+ args)
    else if (args.length >= 2) {
      const firstArg = args[0] as any;
      const secondArg = args[1] as any;
      const thirdArg = args.length >= 3 ? args[2] : undefined;

      // If second arg is 'as', it's a mode specifier pattern
      const isAsPattern = secondArg?.type === 'identifier' && secondArg.name === 'as';

      if (isAsPattern && thirdArg) {
        // Pattern: "toggle #dialog as modal"
        let selector = firstArg?.type === 'selector' ? firstArg.value : firstArg;
        let mode = (thirdArg as any)?.type === 'identifier' ? (thirdArg as any).name : thirdArg;

        evaluatedArgs = [selector, mode];
      } else {
        // Pattern: "toggle #dialog modal" (no 'as' keyword)
        let selector = firstArg?.type === 'selector' ? firstArg.value : firstArg;
        let mode = secondArg?.type === 'identifier' ? secondArg.name : secondArg;

        evaluatedArgs = [selector, mode];
      }
    }

    debug.runtime(`ToggleCommand.parseInput: evaluated args:`, evaluatedArgs);
    return evaluatedArgs;
  }

  // execute() is inherited from ToggleCommandV1 - no changes needed!
}

/**
 * Factory function for creating ToggleCommand instances
 * Maintains compatibility with existing command registration
 */
export function createToggleCommand(): ToggleCommand {
  return new ToggleCommand();
}
