/**
 * Data Command Parsers
 *
 * Pure function implementations of data-related command parsers.
 * These functions use ParserContext for dependency injection, enabling
 * clean separation from the Parser class.
 *
 * LokaScript Extensions: bind and persist are NOT part of the official
 * _hyperscript specification. Prefer server-side state management when possible.
 *
 * @module parser/command-parsers/data-commands
 */

import type { ParserContext, IdentifierNode } from '../parser-types';
import type { CommandNode, ExpressionNode } from '../../types/core';
import { CommandNodeBuilder } from '../command-node-builder';
import { createLiteral } from '../helpers/ast-helpers';
import { parseColonVariable } from './variable-commands';

/**
 * Parse bind command (LokaScript extension)
 *
 * Syntax:
 *   bind :variable to <target>.<property>
 *   bind :variable from <target>.<property>
 *   bind :variable to <target>.<property> bidirectional
 *
 * Examples:
 *   bind :username to #input.value
 *   bind :count from #display.textContent
 *   bind :msg to #input.value bidirectional
 *
 * @param ctx - Parser context providing access to parser state and methods
 * @param identifierNode - The 'bind' identifier node
 * @returns CommandNode representing the bind command
 */
export function parseBindCommand(
  ctx: ParserContext,
  identifierNode: IdentifierNode
): CommandNode | null {
  const builder = CommandNodeBuilder.fromIdentifier(identifierNode);

  // 1. Parse variable name — :localVar or ::globalVar
  const colonVar = parseColonVariable(ctx);
  if (colonVar) {
    builder.withArgs(colonVar);
  } else if (ctx.checkIdentifierLike()) {
    // Plain identifier (e.g., bind myVar to ...)
    const token = ctx.advance();
    builder.withArgs({
      type: 'identifier',
      name: token.value,
      start: token.start ?? 0,
      end: token.end ?? 0,
      line: token.line,
      column: token.column,
    } as IdentifierNode);
  } else {
    ctx.addError('bind command requires a variable name');
    return builder.endingAt(ctx.getPosition()).build();
  }

  // 2. Parse direction keyword: 'to' or 'from'
  let direction: 'to' | 'from' = 'to';
  if (ctx.check('to')) {
    ctx.advance(); // consume 'to'
    direction = 'to';
  } else if (ctx.check('from')) {
    ctx.advance(); // consume 'from'
    direction = 'from';
  }

  // 3. Parse target expression (CSS selector, 'me', 'my', identifier, etc.)
  if (!ctx.isAtEnd() && !ctx.check('then') && !ctx.check('end') && !ctx.check('bidirectional')) {
    const targetExpr = ctx.parseExpression();
    if (targetExpr) {
      builder.withModifier(direction, targetExpr as ExpressionNode);
    }
  }

  // 4. Check for 'bidirectional' keyword
  if (ctx.check('bidirectional')) {
    const bidiToken = ctx.advance(); // consume 'bidirectional'
    const pos = {
      start: bidiToken.start ?? 0,
      end: bidiToken.end ?? 0,
      line: bidiToken.line ?? 1,
      column: bidiToken.column ?? 1,
    };
    builder.withModifier(
      'bidirectional',
      createLiteral(true, 'true', pos) as unknown as ExpressionNode
    );
  }

  return builder.endingAt(ctx.getPosition()).build();
}

/**
 * Parse persist command (LokaScript extension)
 *
 * Syntax:
 *   persist <value> to <storage> as <key> [ttl <ms>]
 *   persist <key> from <storage>             (restore)
 *   persist remove <key> from <storage>      (remove)
 *
 * Examples:
 *   persist myValue to local as "username"
 *   persist "username" from local
 *   persist remove "username" from local
 *   persist formData to session as "draft" ttl 5000
 *
 * @param ctx - Parser context providing access to parser state and methods
 * @param identifierNode - The 'persist' identifier node
 * @returns CommandNode representing the persist command
 */
export function parsePersistCommand(
  ctx: ParserContext,
  identifierNode: IdentifierNode
): CommandNode | null {
  const builder = CommandNodeBuilder.fromIdentifier(identifierNode);

  // 1. Check for 'remove' sub-operation
  if (ctx.check('remove')) {
    const removeToken = ctx.advance(); // consume 'remove'
    const pos = {
      start: removeToken.start ?? 0,
      end: removeToken.end ?? 0,
      line: removeToken.line ?? 1,
      column: removeToken.column ?? 1,
    };
    builder.withModifier(
      'operation',
      createLiteral('remove', 'remove', pos) as unknown as ExpressionNode
    );
  }

  // 2. Parse first expression (value for save, key for restore/remove)
  if (!ctx.isAtEnd() && !ctx.check('then') && !ctx.check('end')) {
    const firstExpr = ctx.parseExpression();
    if (firstExpr) {
      builder.withArgs(firstExpr);
    }
  }

  // 3. Parse modifier keywords in order
  // 'to <storage>' — signals save operation
  // IMPORTANT: Use parsePrimary() instead of parseExpression() to avoid consuming
  // subsequent 'as' keyword as a conversion operator (e.g., "local as 'key'" would
  // be parsed as one expression instead of storage='local', key='key')
  if (ctx.check('to')) {
    ctx.advance(); // consume 'to'
    if (!ctx.isAtEnd()) {
      const storageExpr = ctx.parsePrimary();
      if (storageExpr) {
        builder.withModifier('to', storageExpr as ExpressionNode);
      }
    }
  }

  // 'as <key>' — key name for save operations
  if (ctx.check('as')) {
    ctx.advance(); // consume 'as'
    if (!ctx.isAtEnd()) {
      const keyExpr = ctx.parseExpression();
      if (keyExpr) {
        builder.withModifier('as', keyExpr as ExpressionNode);
      }
    }
  }

  // 'from <storage>' — signals restore operation
  if (ctx.check('from')) {
    ctx.advance(); // consume 'from'
    if (!ctx.isAtEnd()) {
      const storageExpr = ctx.parseExpression();
      if (storageExpr) {
        builder.withModifier('from', storageExpr as ExpressionNode);
      }
    }
  }

  // 'ttl <ms>' — optional time-to-live
  if (ctx.check('ttl')) {
    ctx.advance(); // consume 'ttl'
    if (!ctx.isAtEnd()) {
      const ttlExpr = ctx.parseExpression();
      if (ttlExpr) {
        builder.withModifier('ttl', ttlExpr as ExpressionNode);
      }
    }
  }

  return builder.endingAt(ctx.getPosition()).build();
}
