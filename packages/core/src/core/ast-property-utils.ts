/**
 * AST Property Extraction Utilities
 *
 * The core parser always produces ASTNode objects for property fields
 * (IdentifierNode with .name, LiteralNode with .value, etc.), but the
 * hybrid parser may produce raw strings. The runtime historically tolerated
 * both via duck-typing patterns like `property.name || property`.
 *
 * This module replaces those implicit fallbacks with explicit, documented
 * extraction, making the contract visible and centralizing the logic.
 */

/**
 * Extract a property name from an AST property field.
 *
 * Handles three representations that appear in LokaScript AST nodes:
 * 1. Raw string (hybrid parser's MemberNode, PossessiveNode)
 * 2. IdentifierNode: `{ name: string }`
 * 3. StringLiteralNode / LiteralNode: `{ value: string }`
 *
 * Returns the original value unchanged if none of these match
 * (e.g., numeric index for computed access).
 *
 * @param property - The property field from an AST node
 * @returns The extracted property name
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractPropertyName(property: any): any {
  // Raw string (hybrid parser)
  if (typeof property === 'string') return property;

  if (property && typeof property === 'object') {
    // IdentifierNode: { type: 'identifier', name: string }
    if (typeof property.name === 'string') return property.name;

    // StringLiteralNode / LiteralNode: { type: 'string'|'literal', value: string }
    if (typeof property.value === 'string') return property.value;
  }

  // Return as-is for non-string property access (numeric index, etc.)
  return property;
}
