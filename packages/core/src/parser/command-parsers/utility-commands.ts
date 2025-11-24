/**
 * Utility Command Parsers
 *
 * Pure function implementations of general utility command parsers.
 * These functions use ParserContext for dependency injection, enabling
 * clean separation from the Parser class.
 *
 * Phase 9-3b: Command Extraction (Batch 2)
 * @module parser/command-parsers/utility-commands
 */

import type { ParserContext, IdentifierNode } from '../parser-types';
import type { ASTNode, Token, ExpressionNode } from '../../types/core';
import { TokenType } from '../tokenizer';
import { CommandNodeBuilder } from '../command-node-builder';
import { isKeyword } from '../helpers/parsing-helpers';

/**
 * Parse regular command
 *
 * Generic command parser that collects space-separated arguments until
 * a command boundary is reached. This is used for commands that don't
 * have special parsing requirements.
 *
 * Arguments are collected until one of these boundaries:
 * - 'then', 'and', 'else', 'end' keywords
 * - Another command token
 * - End of input
 *
 * Examples:
 *   - log "message" value
 *   - call myFunction(arg1, arg2)
 *   - send customEvent to <button/>
 *
 * @param ctx - Parser context providing access to parser state and methods
 * @param identifierNode - The command identifier node
 * @returns CommandNode representing the command
 *
 * Phase 9-3b: Extracted from Parser.parseRegularCommand
 */
export function parseRegularCommand(
  ctx: ParserContext,
  identifierNode: IdentifierNode
) {
  const args: ASTNode[] = [];

  // Parse command arguments (space-separated, not comma-separated)
  while (
    !ctx.isAtEnd() &&
    !ctx.check('then') &&
    !ctx.check('and') &&
    !ctx.check('else') &&
    !ctx.check('end') &&
    !ctx.checkTokenType(TokenType.COMMAND)
  ) {
    if (
      ctx.checkTokenType(TokenType.CONTEXT_VAR) ||
      ctx.checkTokenType(TokenType.IDENTIFIER) ||
      ctx.checkTokenType(TokenType.KEYWORD) ||
      ctx.checkTokenType(TokenType.CSS_SELECTOR) ||
      ctx.checkTokenType(TokenType.ID_SELECTOR) ||
      ctx.checkTokenType(TokenType.CLASS_SELECTOR) ||
      ctx.checkTokenType(TokenType.STRING) ||
      ctx.checkTokenType(TokenType.NUMBER) ||
      ctx.checkTokenType(TokenType.TIME_EXPRESSION) ||
      ctx.match('<')
    ) {
      args.push(ctx.parsePrimary());
    } else {
      break;
    }
  }

  // Phase 2 Refactoring: Use CommandNodeBuilder for consistent node construction
  return CommandNodeBuilder.fromIdentifier(identifierNode)
    .withArgs(...args)
    .endingAt(ctx.getPosition())
    .build();
}

/**
 * Parse multi-word command with modifiers
 *
 * Syntax: <command> <args> <keyword> <value> [<keyword> <value>...]
 *
 * This parser handles commands with keyword-based modifiers like:
 * - append X to Y
 * - fetch URL as json
 * - set $x to 5
 *
 * The parser:
 * 1. Gets the multi-word pattern for the command (defines valid keywords)
 * 2. Parses primary arguments until hitting a keyword or boundary
 * 3. Parses modifiers (keyword + value pairs)
 *
 * IMPORTANT: Uses parsePrimary() for arguments to avoid consuming modifiers.
 * For example, "fetch URL as json" should NOT parse "URL as json" as one expression.
 *
 * Examples:
 *   - append <div/> to <body/>
 *   - fetch "/api/data" as json
 *   - set $counter to 0
 *
 * @param ctx - Parser context providing access to parser state and methods
 * @param commandToken - The command token
 * @param commandName - The command name (for pattern lookup)
 * @returns CommandNode representing the multi-word command, or null if no pattern found
 *
 * Phase 9-3b: Extracted from Parser.parseMultiWordCommand
 */
export function parseMultiWordCommand(
  ctx: ParserContext,
  commandToken: Token,
  commandName: string
) {
  const pattern = ctx.getMultiWordPattern(commandName);
  if (!pattern) return null;

  const args: ASTNode[] = [];
  const modifiers: Record<string, ExpressionNode> = {};

  // Parse primary arguments (before any keywords)
  // IMPORTANT: Use parsePrimary() instead of parseExpression() to avoid consuming modifiers
  // For example, "fetch URL as json" should NOT parse "URL as json" as one expression
  while (
    !ctx.isAtEnd() &&
    !isKeyword(ctx.peek(), pattern.keywords) &&
    !ctx.check('then') &&
    !ctx.check('and') &&
    !ctx.check('else') &&
    !ctx.check('end') &&
    !ctx.checkTokenType(TokenType.COMMAND)
  ) {
    // Use parsePrimary() to parse just the value, not full expressions
    // This prevents "URL as json" from being parsed as one expression
    const expr = ctx.parsePrimary();
    if (expr) {
      args.push(expr);
    } else {
      break;
    }

    // Handle comma-separated arguments
    if (ctx.match(',')) {
      continue;
    }

    // Check if we're at a modifier keyword
    if (isKeyword(ctx.peek(), pattern.keywords)) {
      break;
    }
  }

  // Parse modifiers (keywords + their arguments)
  while (!ctx.isAtEnd() && isKeyword(ctx.peek(), pattern.keywords)) {
    const keyword = ctx.advance().value;

    // Parse the expression after the keyword
    const modifierValue = ctx.parseExpression();
    if (modifierValue) {
      modifiers[keyword] = modifierValue as ExpressionNode;
    }

    // Check for more modifiers
    if (!isKeyword(ctx.peek(), pattern.keywords)) {
      break;
    }
  }

  // Phase 2 Refactoring: Use CommandNodeBuilder for consistent node construction
  const builder = CommandNodeBuilder.from(commandToken)
    .withArgs(...args)
    .endingAt(ctx.getPosition());

  if (Object.keys(modifiers).length > 0) {
    builder.withModifiers(modifiers);
  }

  return builder.build();
}
