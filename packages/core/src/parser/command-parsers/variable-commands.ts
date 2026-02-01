/**
 * Variable Command Parsers
 *
 * Pure function implementations of variable assignment command parsers.
 * These functions use ParserContext for dependency injection, enabling
 * clean separation from the Parser class.
 *
 * Phase 9-3b: Command Extraction (Batch 2)
 * @module parser/command-parsers/variable-commands
 */

import type { ParserContext, IdentifierNode } from '../parser-types';
import type { ASTNode, ExpressionNode, Token } from '../../types/core';
import { CommandNodeBuilder } from '../command-node-builder';
import { KEYWORDS } from '../parser-constants';
import { createBinaryExpression, createLiteral, createIdentifier } from '../helpers/ast-helpers';
// Phase 4: TokenType import removed - using value-based checks instead

/**
 * Parse set command
 *
 * Syntax:
 *   - set <variable> to <value>
 *   - set :localVar to <value>
 *   - set ::globalVar to <value>
 *   - set global <variable> to <value>
 *   - set local <variable> to <value>
 *   - set the <property> of <target> to <value>
 *
 * This command assigns values to variables with support for:
 * - Local scope (colon-variable or local variable)
 * - Global scope (double-colon-variable or global variable)
 * - Property assignment (the X of Y)
 * - Complex expression targets and values
 *
 * Examples:
 *   - set count to 0
 *   - set :localVar to "hello"
 *   - set ::globalConfig to { enabled: true }
 *   - set the textContent of #counter to count + 1
 *
 * @param ctx - Parser context providing access to parser state and methods
 * @param identifierNode - The 'set' identifier node
 * @returns CommandNode representing the set command, or null on error
 *
 * Phase 9-3b: Extracted from Parser.parseSetCommand
 */
/**
 * Parse colon-prefixed variable target: `:localVar` or `::globalVar`
 * @returns Scoped identifier node, or null if current token isn't ':'
 */
export function parseColonVariable(ctx: ParserContext): ASTNode | null {
  if (!ctx.check(':')) return null;

  ctx.advance(); // consume first ':'

  if (ctx.check(':')) {
    // Double-colon: explicit global scope (::globalVar)
    ctx.advance();
    const varToken = ctx.advance();
    return {
      type: 'identifier',
      name: varToken.value,
      scope: 'global',
      start: varToken.start - 2,
      end: varToken.end,
    } as any;
  }

  // Single colon: local scope (:localVar)
  const varToken = ctx.advance();
  return {
    type: 'identifier',
    name: varToken.value,
    scope: 'local',
    start: varToken.start - 1,
    end: varToken.end,
  } as any;
}

/**
 * Parse scope-modified variable target: `global <var>` or `local <var>`
 * @returns Scoped identifier node, or null if current token isn't global/local
 */
export function parseScopedVariable(ctx: ParserContext): ASTNode | null {
  if (!ctx.check(KEYWORDS.GLOBAL) && !ctx.check(KEYWORDS.LOCAL)) return null;

  const scopeToken = ctx.advance();
  const variableToken = ctx.advance();
  return {
    type: 'identifier',
    name: variableToken.value,
    scope: scopeToken.value,
    start: scopeToken.start,
    end: variableToken.end,
  } as any;
}

/**
 * Parse `the <property> of <target>` or `the <var> to ...` syntax
 * Restores position if the pattern doesn't match.
 *
 * @param startPosition - Outer save point for full rollback on partial match
 * @returns Target expression node, or null if pattern doesn't match
 */
export function parsePropertyOfTarget(ctx: ParserContext, startPosition: number): ASTNode | null {
  if (!ctx.check(KEYWORDS.THE)) return null;

  const thePosition = ctx.savePosition();
  ctx.advance(); // consume 'the'

  const nextToken = ctx.peek();
  const tokenAfterNext = ctx.peekAt(1);

  if (nextToken && tokenAfterNext && tokenAfterNext.value === KEYWORDS.OF) {
    const propertyToken = ctx.advance();

    if (ctx.check(KEYWORDS.OF)) {
      ctx.advance(); // consume 'of'
      const targetToken = ctx.advance();

      const isIdSelector = targetToken.value.startsWith('#');
      return {
        type: 'propertyOfExpression',
        property: {
          type: 'identifier',
          name: propertyToken.value,
          start: propertyToken.start,
          end: propertyToken.end,
        },
        target: {
          type: isIdSelector ? 'idSelector' : 'cssSelector',
          value: targetToken.value,
          start: targetToken.start,
          end: targetToken.end,
        },
        start: startPosition,
        end: ctx.current,
      };
    }

    // 'of' wasn't where expected - full rollback
    ctx.restorePosition(startPosition);
    return null;
  }

  if (nextToken && tokenAfterNext && tokenAfterNext.value === KEYWORDS.TO) {
    // "the X to Y" - strip the article, variable is X
    const variableToken = ctx.advance();
    return {
      type: 'identifier',
      name: variableToken.value,
      start: variableToken.start,
      end: variableToken.end,
    } as any;
  }

  // No recognized pattern after 'the' - rollback
  ctx.restorePosition(thePosition);
  return null;
}

/**
 * Fallback target parsing: collect tokens and try to reconstruct a target
 * Used when primary strategies (colon, scoped, the-of, expression) all fail.
 *
 * @returns Object with either an expression or raw tokens
 */
export function parseTargetFallback(ctx: ParserContext): {
  expression: ASTNode | null;
  tokens: ASTNode[];
} {
  // Try colon-match as secondary fallback
  if (ctx.match(':')) {
    const varToken = ctx.advance();
    return {
      expression: {
        type: 'identifier',
        name: varToken.value,
        scope: 'local',
        start: varToken.start,
        end: varToken.end,
      } as any,
      tokens: [],
    };
  }

  // Collect tokens until a terminator
  const targetTokens: ASTNode[] = [];
  while (
    !ctx.isAtEnd() &&
    !ctx.check(KEYWORDS.TO) &&
    !ctx.check(KEYWORDS.THEN) &&
    !ctx.check(KEYWORDS.AND) &&
    !ctx.check(KEYWORDS.ELSE) &&
    !ctx.check(KEYWORDS.END)
  ) {
    targetTokens.push(ctx.parsePrimary());
  }

  if (targetTokens.length === 0) {
    return { expression: null, tokens: [] };
  }

  // Try to reconstruct "the X of Y" from collected tokens
  if (
    targetTokens.length >= 4 &&
    (targetTokens[0] as any).value === KEYWORDS.THE &&
    (targetTokens[2] as any).value === KEYWORDS.OF
  ) {
    return {
      expression: {
        type: 'propertyOfExpression',
        property: {
          type: 'identifier',
          name: (targetTokens[1] as any).value || (targetTokens[1] as any).name,
          start: (targetTokens[1] as any).start,
          end: (targetTokens[1] as any).end,
        },
        target: {
          type: (targetTokens[3] as any).type === 'idSelector' ? 'idSelector' : 'cssSelector',
          value: (targetTokens[3] as any).value || (targetTokens[3] as any).name,
          start: (targetTokens[3] as any).start,
          end: (targetTokens[3] as any).end,
        },
        start: (targetTokens[0] as any).start,
        end: (targetTokens[3] as any).end,
      },
      tokens: [],
    };
  }

  if (targetTokens.length === 1) {
    return { expression: targetTokens[0], tokens: [] };
  }

  // Multiple tokens but no recognizable pattern - return raw tokens
  return { expression: null, tokens: targetTokens };
}

export function parseSetCommand(ctx: ParserContext, identifierNode: IdentifierNode) {
  const startPosition = ctx.savePosition();
  let targetExpression: ASTNode | null = null;
  let fallbackTokens: ASTNode[] = [];

  // Strategy 1-4: Try each target parsing strategy
  try {
    targetExpression =
      parseColonVariable(ctx) ??
      parseScopedVariable(ctx) ??
      parsePropertyOfTarget(ctx, startPosition);

    // Strategy 4: General expression
    if (!targetExpression) {
      targetExpression = ctx.parseExpression();
    }
  } catch {
    ctx.restorePosition(startPosition);
    targetExpression = null;
  }

  // Strategy 5: Fallback token collection
  if (!targetExpression) {
    const fallback = parseTargetFallback(ctx);
    targetExpression = fallback.expression;
    fallbackTokens = fallback.tokens;
  }

  // Expect 'to' keyword
  if (!ctx.check(KEYWORDS.TO)) {
    const found = ctx.isAtEnd() ? 'end of input' : ctx.peek().value;
    throw new Error(`Expected 'to' in set command, found: ${found}`);
  }
  ctx.advance(); // consume 'to'

  // Parse value expression
  const value = ctx.parseExpression() ?? ctx.parsePrimary();

  // Build final args: [target, 'to', value]
  const finalArgs: ASTNode[] = [];
  if (targetExpression) {
    finalArgs.push(targetExpression);
  } else if (fallbackTokens.length > 0) {
    finalArgs.push(...fallbackTokens);
  }
  finalArgs.push(ctx.createIdentifier(KEYWORDS.TO));
  if (value) {
    finalArgs.push(value);
  }

  return CommandNodeBuilder.fromIdentifier(identifierNode)
    .withArgs(...finalArgs)
    .endingAt(ctx.getPosition())
    .build();
}

/**
 * Parse increment or decrement command
 *
 * Syntax:
 *   - increment <variable>
 *   - increment <variable> by <amount>
 *   - increment global <variable>
 *   - increment global <variable> by <amount>
 *   - decrement <variable>
 *   - decrement <variable> by <amount>
 *   - decrement global <variable>
 *   - decrement global <variable> by <amount>
 *
 * This command increments or decrements a variable's value with support for:
 * - Global scope modifier
 * - Custom increment/decrement amount via 'by' keyword
 * - Default increment/decrement of 1
 *
 * IMPLEMENTATION NOTE (Phase 1 - Parser Sugar):
 * This function now transforms increment/decrement into a `set` command at parse time:
 *   - `increment x` → `set x to (x + 1)`
 *   - `increment x by 5` → `set x to (x + 5)`
 *   - `decrement x` → `set x to (x - 1)`
 *
 * This eliminates the need for separate increment/decrement runtime implementations,
 * reducing bundle size while maintaining backward compatibility at the syntax level.
 *
 * Examples:
 *   - increment count
 *   - increment count by 5
 *   - increment global counter
 *   - decrement value by 2
 *
 * @param ctx - Parser context providing access to parser state and methods
 * @param commandToken - The 'increment' or 'decrement' command token
 * @returns CommandNode representing a `set` command with binary expression
 *
 * Phase 9-3b: Extracted from Parser.parseCommand (special handling section)
 * Phase 1 (Bundle Reduction): Transformed to emit `set` command
 */
export function parseIncrementDecrementCommand(ctx: ParserContext, commandToken: Token) {
  const commandName = commandToken.value;
  const isIncrement = commandName === 'increment';
  const operator = isIncrement ? '+' : '-';

  // Check for 'global' keyword first
  let hasGlobal = false;
  if (ctx.check(KEYWORDS.GLOBAL)) {
    hasGlobal = true;
    ctx.advance(); // consume 'global'
  }

  // Parse the target (variable name or element reference)
  const target = ctx.parseExpression();
  if (!target) {
    throw new Error(`Expected variable or expression after ${commandName}`);
  }

  // Check for 'by' keyword followed by amount
  let amount: ASTNode;
  if (ctx.check(KEYWORDS.BY)) {
    ctx.advance(); // consume 'by'
    const parsedAmount = ctx.parseExpression();
    if (!parsedAmount) {
      throw new Error(`Expected amount after 'by' in ${commandName} command`);
    }
    amount = parsedAmount;
  } else {
    // Default amount is 1
    const pos = {
      start: commandToken.start,
      end: ctx.previous().end,
      line: commandToken.line,
      column: commandToken.column,
    };
    amount = createLiteral(1, '1', pos);
  }

  // If global scope, mark the target with scope
  let targetWithScope = target;
  if (hasGlobal && target.type === 'identifier') {
    targetWithScope = {
      ...target,
      scope: 'global',
    } as typeof target;
  }

  // Create the binary expression: target + amount OR target - amount
  const pos = {
    start: commandToken.start,
    end: ctx.previous().end,
    line: commandToken.line,
    column: commandToken.column,
  };
  const binaryExpr = createBinaryExpression(operator, target, amount, pos);

  // Create the 'to' keyword identifier
  const toIdentifier = createIdentifier(KEYWORDS.TO, pos);

  // Build args for set command: [target, 'to', binaryExpression]
  const args: ASTNode[] = [targetWithScope, toIdentifier, binaryExpr];

  // Return a `set` command node instead of increment/decrement
  return CommandNodeBuilder.from(commandToken)
    .withName('set')
    .withArgs(...args)
    .withOriginalCommand(commandName)
    .endingAt({ end: ctx.previous().end })
    .build();
}
