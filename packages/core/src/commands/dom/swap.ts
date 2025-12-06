/**
 * SwapCommand - htmx-inspired DOM swapping with morphing support
 *
 * First command built using the new defineCommand() Builder Pattern.
 * Provides intelligent DOM replacement with multiple strategies including
 * morphing (preserves form state, focus, scroll position).
 *
 * Swap Strategies:
 * - morph (default): Intelligent DOM diffing via morphlex, preserves state
 * - innerHTML: Replace inner content, destroys state
 * - outerHTML: Replace entire element, destroys state
 * - beforeBegin: Insert before element
 * - afterBegin: Insert at start of element (prepend)
 * - beforeEnd: Insert at end of element (append)
 * - afterEnd: Insert after element
 * - delete: Remove element from DOM
 * - none: No DOM changes (useful with event triggers)
 *
 * Natural Language Syntax:
 *   swap #target with <content>                        # morph (default, preserves state)
 *   morph #target with <content>                       # explicit morph
 *   morph over #target with <content>                  # outer morph (replace element)
 *   swap into #target with <content>                   # innerHTML (destroys state)
 *   swap over #target with <content>                   # outerHTML (replace element)
 *   swap innerHTML of #target with <content>           # explicit innerHTML
 *   swap outerHTML of #target with <content>           # explicit outerHTML
 *   swap beforeBegin of #target with <content>
 *   swap afterEnd of #target with <content>
 *   swap delete #target                                # remove element
 *   swap #target with <content> using view transition  # with View Transitions API
 *
 * View Transitions API:
 *   The "using view transition" modifier enables smooth CSS-powered transitions
 *   between DOM states. Transitions are queued to prevent cancellation.
 *
 * @example
 *   on click
 *     fetch "/api/content" as html
 *     swap #target with it                   -- morph (preserves form state)
 *
 *   on click
 *     fetch "/api/content" as html
 *     swap innerHTML of #target with it      -- raw innerHTML
 *
 *   on click
 *     swap delete #modal                     -- remove element
 *
 *   on click
 *     fetch "/page/2" as html
 *     swap #content with it using view transition  -- smooth page transition
 */

import { defineCommand, type RawCommandArgs } from '../command-builder';
import type { ExecutionContext, TypedExecutionContext, ASTNode } from '../../types/core';
import type { ExpressionEvaluator } from '../../core/expression-evaluator';
import { resolveElements } from '../helpers/element-resolution';
import {
  executeSwap,
  executeSwapWithTransition,
  extractContent,
  STRATEGY_KEYWORDS,
  type SwapStrategy,
} from '../../lib/swap-executor';
import type { MorphOptions } from '../../lib/morph-adapter';
import { isHTMLElement } from '../../utils/element-check';

// Re-export types from swap-executor for consumers
export type { SwapStrategy } from '../../lib/swap-executor';

// ============================================================================
// Types
// ============================================================================

/**
 * Parsed and validated input for swap command
 */
export interface SwapCommandInput {
  /** Target element(s) to swap */
  targets: HTMLElement[];
  /** Content to swap in (null for delete strategy) */
  content: string | HTMLElement | null;
  /** Swap strategy to use */
  strategy: SwapStrategy;
  /** Morphing options (for morph strategies) */
  morphOptions?: MorphOptions;
  /** Use View Transitions API for smooth animations */
  useViewTransition?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Resolve target elements from selector or context
 * Uses shared element-resolution helper
 */
async function resolveTargets(
  selector: string | null,
  context: ExecutionContext
): Promise<HTMLElement[]> {
  const elements = resolveElements(selector || undefined, context);

  if (elements.length === 0) {
    const selectorInfo = selector ? ` matching "${selector}"` : '';
    throw new Error(`[HyperFixi] swap: no elements found${selectorInfo}`);
  }

  return elements;
}

// ============================================================================
// Command Definition using Builder Pattern
// ============================================================================

/**
 * SwapCommand - Built using defineCommand() Builder Pattern
 */
export const swapCommand = defineCommand('swap')
  .category('dom')
  .description('Swap content into target elements with intelligent morphing support')
  .syntax([
    'swap <target> with <content>',
    'swap [strategy] of <target> with <content>',
    'swap into <target> with <content>',
    'swap over <target> with <content>',
    'swap delete <target>',
    'swap <target> with <content> using view transition',
  ])
  .examples([
    'swap #target with it',
    'swap innerHTML of #target with it',
    'swap over #modal with fetchedContent',
    'swap delete #notification',
    'swap beforeEnd of #list with newItem',
    'swap #content with it using view transition',
  ])
  .sideEffects(['dom-mutation'])
  .relatedCommands(['put', 'morph', 'remove', 'append', 'prepend'])

  .parseInput<SwapCommandInput>(async (
    raw: RawCommandArgs,
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<SwapCommandInput> => {
    const args = raw.args;

    if (!args || args.length === 0) {
      throw new Error('[HyperFixi] swap: command requires arguments');
    }

    // Parse arguments to extract: strategy, target, content
    // Syntax patterns:
    //   swap <target> with <content>           → strategy=morph
    //   swap [strategy] of <target> with <content>
    //   swap into <target> with <content>      → strategy=innerHTML
    //   swap over <target> with <content>      → strategy=outerHTML
    //   swap delete <target>                   → strategy=delete

    // Helper to extract keyword name from AST node without evaluation
    const getNodeKeyword = (node: unknown): string | null => {
      if (!node || typeof node !== 'object') return null;
      const nodeObj = node as Record<string, unknown>;
      const nodeType = nodeObj.type as string;

      if (nodeType === 'literal' && typeof nodeObj.value === 'string') {
        return (nodeObj.value as string).toLowerCase();
      }
      if (nodeType === 'identifier' && typeof nodeObj.name === 'string') {
        return (nodeObj.name as string).toLowerCase();
      }
      return null;
    };

    // First pass: extract keywords from AST nodes and find key positions
    const argKeywords: (string | null)[] = args.map(getNodeKeyword);

    // Find keyword positions
    const withIndex = argKeywords.findIndex(k => k === 'with');
    const ofIndex = argKeywords.findIndex(k => k === 'of');
    const deleteIndex = argKeywords.findIndex(k => k === 'delete');
    const usingIndex = argKeywords.findIndex(k => k === 'using');

    // Detect "using view transition" modifier
    let useViewTransition = false;
    if (usingIndex !== -1) {
      const afterUsing = argKeywords.slice(usingIndex + 1);
      if (afterUsing.includes('view') && afterUsing.includes('transition')) {
        useViewTransition = true;
      }
    }

    let strategy: SwapStrategy = 'morph';
    let targetNode: ASTNode | null = null;
    let contentNode: ASTNode | null = null;

    if (deleteIndex !== -1) {
      // Delete pattern: swap delete <target>
      strategy = 'delete';
      targetNode = args[deleteIndex + 1];
      contentNode = null;
    } else if (ofIndex !== -1 && withIndex !== -1) {
      // "swap [strategy] of <target> with <content>" pattern
      const potentialStrategy = argKeywords[0];
      if (potentialStrategy && STRATEGY_KEYWORDS[potentialStrategy]) {
        strategy = STRATEGY_KEYWORDS[potentialStrategy];
      }
      targetNode = args[ofIndex + 1];
      contentNode = args[withIndex + 1];
    } else if (withIndex !== -1) {
      // Check for "into" or "over" before target
      const beforeWithKeywords = argKeywords.slice(0, withIndex);
      const intoIdx = beforeWithKeywords.findIndex(k => k === 'into');
      const overIdx = beforeWithKeywords.findIndex(k => k === 'over');

      if (intoIdx !== -1) {
        strategy = 'innerHTML';
        targetNode = args[intoIdx + 1];
      } else if (overIdx !== -1) {
        strategy = 'outerHTML';
        targetNode = args[overIdx + 1];
      } else {
        // Simple "swap <target> with <content>" - use morph as default
        // Check first arg for potential strategy
        const firstKeyword = argKeywords[0];
        if (firstKeyword && STRATEGY_KEYWORDS[firstKeyword]) {
          strategy = STRATEGY_KEYWORDS[firstKeyword];
          targetNode = args[1] || args[withIndex - 1];
        } else {
          targetNode = args[withIndex - 1];
        }
      }
      contentNode = args[withIndex + 1];
    } else {
      // Fallback: assume [target, content] or [strategy, target, content]
      if (args.length >= 2) {
        const firstKeyword = argKeywords[0];
        if (firstKeyword && STRATEGY_KEYWORDS[firstKeyword]) {
          strategy = STRATEGY_KEYWORDS[firstKeyword];
        }
        targetNode = args[args.length - 2];
        contentNode = args[args.length - 1];
      } else {
        throw new Error('[HyperFixi] swap: could not parse arguments. Expected "swap <target> with <content>"');
      }
    }

    // Now evaluate the target and content nodes
    let targetArg: unknown = null;
    let contentArg: unknown = null;

    if (targetNode) {
      // Check if targetNode is a selector - if so, extract the selector string
      const nodeType = (targetNode as Record<string, unknown>).type;
      const nodeValue = (targetNode as Record<string, unknown>).value;

      if (nodeType === 'selector' && typeof nodeValue === 'string') {
        // Don't evaluate selector nodes - use the selector string directly
        targetArg = nodeValue;
      } else if (nodeType === 'binaryExpression' && (targetNode as Record<string, unknown>).operator === 'of') {
        // Handle "beforeEnd of #target" style - extract strategy from left, target from right
        const left = (targetNode as Record<string, unknown>).left as Record<string, unknown>;
        const right = (targetNode as Record<string, unknown>).right as Record<string, unknown>;

        // Extract strategy from left side (e.g., "beforeEnd", "afterBegin")
        if (left && left.type === 'identifier' && typeof left.name === 'string') {
          const strategyName = left.name.toLowerCase();
          if (STRATEGY_KEYWORDS[strategyName]) {
            strategy = STRATEGY_KEYWORDS[strategyName];
          }
        }

        // Extract target from right side (selector or expression)
        if (right && right.type === 'selector' && typeof right.value === 'string') {
          targetArg = right.value;
        } else if (right) {
          targetArg = await evaluator.evaluate(right, context);
        }
      } else {
        targetArg = await evaluator.evaluate(targetNode, context);
      }
    }
    if (contentNode) {
      contentArg = await evaluator.evaluate(contentNode, context);
    }

    // Resolve target selector
    let targetSelector: string | null = null;
    if (typeof targetArg === 'string') {
      targetSelector = targetArg;
    } else if (isHTMLElement(targetArg)) {
      // Direct element reference
      return {
        targets: [targetArg as HTMLElement],
        content: extractContent(contentArg),
        strategy,
        morphOptions: { preserveChanges: true },
        useViewTransition,
      };
    }

    const targets = await resolveTargets(targetSelector, context);
    const content = extractContent(contentArg);

    return {
      targets,
      content,
      strategy,
      morphOptions: { preserveChanges: true },
      useViewTransition,
    };
  })

  .execute(async (
    input: SwapCommandInput,
    _context: TypedExecutionContext
  ): Promise<void> => {
    const { targets, content, strategy, morphOptions, useViewTransition } = input;

    // Use shared executeSwapWithTransition for consistent behavior
    await executeSwapWithTransition(targets, content, strategy, {
      morphOptions,
      useViewTransition,
    });
  })

  .build();

// ============================================================================
// Morph Command (Alias)
// ============================================================================

/**
 * MorphCommand - Alias for swap with morph strategy
 *
 * Provides natural language syntax for morphing:
 *   morph #target with <content>        # inner morph (children only)
 *   morph over #target with <content>   # outer morph (replace element)
 */
export const morphCommand = defineCommand('morph')
  .category('dom')
  .description('Morph content into target elements (intelligent diffing, preserves state)')
  .syntax([
    'morph <target> with <content>',
    'morph over <target> with <content>',
  ])
  .examples([
    'morph #target with it',
    'morph over #modal with fetchedContent',
  ])
  .sideEffects(['dom-mutation'])
  .relatedCommands(['swap', 'put'])

  .parseInput<SwapCommandInput>(async (
    raw: RawCommandArgs,
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<SwapCommandInput> => {
    const args = raw.args;

    if (!args || args.length === 0) {
      throw new Error('[HyperFixi] morph: command requires arguments');
    }

    let strategy: SwapStrategy = 'morph';
    let targetArg: unknown = null;
    let contentArg: unknown = null;

    // Evaluate all arguments
    const evaluatedArgs: unknown[] = [];
    const argStrings: string[] = [];
    for (const arg of args) {
      const evaluated = await evaluator.evaluate(arg, context);
      evaluatedArgs.push(evaluated);
      if (typeof evaluated === 'string') {
        argStrings.push(evaluated.toLowerCase());
      }
    }

    // Find 'with' and 'over' keywords
    const withIndex = argStrings.findIndex(s => s === 'with');
    const overIndex = argStrings.findIndex(s => s === 'over');

    if (overIndex !== -1 && overIndex < (withIndex === -1 ? Infinity : withIndex)) {
      // "morph over <target> with <content>" pattern
      strategy = 'morphOuter';
      targetArg = evaluatedArgs[overIndex + 1];
    } else if (withIndex !== -1) {
      // "morph <target> with <content>" pattern
      targetArg = evaluatedArgs[withIndex - 1];
    }

    if (withIndex !== -1) {
      contentArg = evaluatedArgs[withIndex + 1];
    }

    if (!targetArg) {
      throw new Error('[HyperFixi] morph: could not determine target');
    }

    // Resolve target using shared helper
    let targets: HTMLElement[];
    if (typeof targetArg === 'string') {
      targets = await resolveTargets(targetArg, context);
    } else if (isHTMLElement(targetArg)) {
      targets = [targetArg as HTMLElement];
    } else {
      throw new Error('[HyperFixi] morph: target must be a selector or element');
    }

    return {
      targets,
      content: extractContent(contentArg),
      strategy,
      morphOptions: { preserveChanges: true },
    };
  })

  .execute(async (
    input: SwapCommandInput,
    _context: TypedExecutionContext
  ): Promise<void> => {
    const { targets, content, strategy, morphOptions } = input;

    // Use shared executeSwap for consistent behavior
    for (const target of targets) {
      executeSwap(target, content, strategy, morphOptions);
    }
  })

  .build();

// ============================================================================
// Exports
// ============================================================================

export default swapCommand;

/**
 * Factory function for SwapCommand (compatibility with existing patterns)
 */
export function createSwapCommand() {
  return swapCommand;
}

/**
 * Factory function for MorphCommand
 */
export function createMorphCommand() {
  return morphCommand;
}
