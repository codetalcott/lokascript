/**
 * Explicit Mode Parser (Semantic Package Wrapper)
 *
 * Delegates to @lokascript/framework/ir with hyperscript-specific
 * command schemas for role validation.
 */

import { parseExplicit as parseExplicitBase, isExplicitSyntax } from '@lokascript/framework';
import type { SchemaLookup } from '@lokascript/framework';
import type { SemanticNode } from '../types';
import { getSchema } from '../generators/command-schemas';

// Re-export the pure detection function
export { isExplicitSyntax };

// Hyperscript-specific schema lookup
const hyperscriptSchemaLookup: SchemaLookup = { getSchema };

/**
 * Parse explicit syntax with hyperscript schema validation.
 *
 * This wrapper injects the hyperscript command schemas so that
 * role names are validated against known commands (toggle, add, etc.).
 * Unknown commands are accepted without validation.
 */
export function parseExplicit(input: string): SemanticNode {
  return parseExplicitBase(input, {
    schemaLookup: hyperscriptSchemaLookup,
  }) as SemanticNode;
}
