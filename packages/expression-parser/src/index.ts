/**
 * @hyperfixi/expression-parser
 *
 * Shared expression parser for hyperscript.
 * Used by both @hyperfixi/semantic (AST building) and @hyperfixi/core (runtime).
 *
 * @example
 * ```typescript
 * import { parseExpression } from '@hyperfixi/expression-parser';
 *
 * const result = parseExpression('#button.active');
 * if (result.success) {
 *   console.log(result.node);
 *   // { type: 'selector', value: '#button.active', selectorType: 'complex' }
 * }
 * ```
 */

// Types
export type {
  ExpressionNode,
  LiteralNode,
  TemplateLiteralNode,
  SelectorNode,
  SelectorKind,
  ContextReferenceNode,
  ContextType,
  IdentifierNode,
  PropertyAccessNode,
  MemberExpressionNode,
  PossessiveExpressionNode,
  BinaryExpressionNode,
  UnaryExpressionNode,
  CallExpressionNode,
  ArrayLiteralNode,
  ObjectLiteralNode,
  ObjectPropertyNode,
  TimeExpressionNode,
  ErrorNode,
  AnyExpressionNode,
  ExpressionParseResult,
} from './types';

// Tokenizer
export { tokenize, TokenType } from './tokenizer';
export type { Token } from './tokenizer';

// Parser
export { ExpressionParser, parseExpression } from './parser';
