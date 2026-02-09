/**
 * Core parsing utilities for HyperFixi
 * Pure functions for parsing hyperscript tokens
 */

/** Minimal parser interface needed by parsing utilities */
export interface HyperscriptParser {
  parseElementExpression(): unknown;
  raiseParseError(tokens: TokenStream, message: string): never;
}

/** Token stream interface */
export interface TokenStream {
  matchToken(token: string): boolean;
}

/** Base command structure returned by createBaseCommand */
export interface BaseCommand {
  url: unknown;
  placement: string | null;
  target: unknown;
  options: Record<string, unknown>;
}

/**
 * Parse a URL expression from hyperscript tokens
 */
export function parseURL(parser: HyperscriptParser, tokens: TokenStream): unknown {
  const url = parser.parseElementExpression();
  if (!url) {
    parser.raiseParseError(tokens, "Expected URL after 'fetch'");
  }
  return url;
}

/**
 * Parse a target selector expression
 */
export function parseTarget(parser: HyperscriptParser, _tokens: TokenStream): unknown {
  return parser.parseElementExpression();
}

/**
 * Parse an option value expression
 */
export function parseOptionValue(parser: HyperscriptParser, _tokens: TokenStream): unknown {
  return parser.parseElementExpression();
}

/**
 * Parse a colon separator ':'
 */
export function parseColon(parser: HyperscriptParser, tokens: TokenStream): void {
  if (!tokens.matchToken(':')) {
    parser.raiseParseError(tokens, "Expected ':' after option name");
  }
}

/**
 * Parse comma separator ','
 */
export function parseComma(tokens: TokenStream): boolean {
  return tokens.matchToken(',');
}

/**
 * Parse optional 'and' connector
 */
export function parseOptionalAnd(tokens: TokenStream): boolean {
  return tokens.matchToken('and');
}

/**
 * Create a base command structure
 */
export function createBaseCommand(url: unknown): BaseCommand {
  return {
    url: url,
    placement: null,
    target: null,
    options: {},
  };
}
