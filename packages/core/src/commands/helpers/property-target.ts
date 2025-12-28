/**
 * PropertyTarget Utility - Shared primitive for 'x of y' patterns
 *
 * Handles both paths for "the X of Y" patterns:
 * 1. Parser path: `propertyOfExpression` AST nodes (parsed at compile time)
 * 2. Runtime path: String patterns like "the innerHTML of #element"
 *
 * Used by: set, put, toggle, and other commands that target element properties
 *
 * This consolidates property targeting logic into a reusable primitive that
 * reduces cognitive load by allowing consistent syntax across commands.
 */

import type { ASTNode, ExecutionContext } from '../../types/base-types';
import type { ExpressionEvaluator } from '../../core/expression-evaluator';
import { isHTMLElement } from '../../utils/element-check';
import { resolveElement } from './element-resolution';
import { getElementProperty, setElementProperty } from './element-property-access';

// ============================================================================
// Types
// ============================================================================

/**
 * A PropertyTarget represents a resolved (element, property) tuple.
 * This is the runtime representation after resolution.
 */
export interface PropertyTarget {
  element: HTMLElement;
  property: string;
}

/**
 * AST node shape for "the X of Y" expressions (parser-generated)
 */
export interface PropertyOfExpressionNode {
  type: 'propertyOfExpression';
  property: { type: 'identifier'; name: string };
  target: ASTNode;
}

/**
 * The regex pattern for matching "the X of Y" string syntax
 */
export const PROPERTY_OF_PATTERN = /^the\s+(.+?)\s+of\s+(.+)$/i;

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Check if an AST node is a propertyOfExpression (parser-generated)
 */
export function isPropertyOfExpressionNode(node: unknown): node is PropertyOfExpressionNode {
  if (!node || typeof node !== 'object') return false;
  const n = node as Record<string, unknown>;
  return n.type === 'propertyOfExpression' &&
         typeof n.property === 'object' &&
         n.property !== null;
}

/**
 * Check if an AST node is a possessive expression (element's property)
 */
export function isPossessiveExpressionNode(node: unknown): boolean {
  if (!node || typeof node !== 'object') return false;
  const n = node as Record<string, unknown>;
  return n.type === 'possessiveExpression' ||
         (n.type === 'memberExpression' && n.computed === false);
}

/**
 * Check if a string matches the "the X of Y" pattern
 */
export function isPropertyTargetString(value: unknown): value is string {
  return typeof value === 'string' && PROPERTY_OF_PATTERN.test(value);
}

/**
 * Parse a "the X of Y" string into property and target parts
 * Returns null if the string doesn't match the pattern
 */
export function parsePropertyTargetString(value: string): { property: string; targetExpr: string } | null {
  const match = value.match(PROPERTY_OF_PATTERN);
  if (!match) return null;
  return {
    property: match[1].trim(),
    targetExpr: match[2].trim(),
  };
}

// ============================================================================
// Resolution Functions
// ============================================================================

/**
 * Resolve a PropertyTarget from a propertyOfExpression AST node
 *
 * @param node - The propertyOfExpression AST node
 * @param evaluator - Expression evaluator for resolving the target
 * @param context - Execution context
 * @returns PropertyTarget or null if resolution fails
 */
export async function resolvePropertyTargetFromNode(
  node: PropertyOfExpressionNode,
  evaluator: ExpressionEvaluator,
  context: ExecutionContext
): Promise<PropertyTarget | null> {
  const propertyNode = node.property;
  const property = propertyNode.name;

  if (!property || typeof property !== 'string') {
    return null;
  }

  // Evaluate the target expression
  const targetValue = await evaluator.evaluate(node.target, context);

  // Handle arrays - take first element
  let element = targetValue;
  if (Array.isArray(element) && element.length > 0) {
    element = element[0];
  }

  if (!isHTMLElement(element)) {
    return null;
  }

  return { element: element as HTMLElement, property };
}

/**
 * Resolve a PropertyTarget from a "the X of Y" string
 *
 * @param value - String like "the innerHTML of #target" or "the value of me"
 * @param context - Execution context for resolving element references
 * @returns PropertyTarget or null if resolution fails
 */
export function resolvePropertyTargetFromString(
  value: string,
  context: ExecutionContext
): PropertyTarget | null {
  const parsed = parsePropertyTargetString(value);
  if (!parsed) return null;

  try {
    const element = resolveElement(parsed.targetExpr, context);
    return { element, property: parsed.property };
  } catch {
    return null;
  }
}

/**
 * Resolve a PropertyTarget from a possessiveExpression AST node
 *
 * Handles patterns like: element's property, #target's innerHTML
 *
 * @param node - The possessiveExpression or memberExpression AST node
 * @param evaluator - Expression evaluator
 * @param context - Execution context
 * @returns PropertyTarget or null if resolution fails
 */
export async function resolvePropertyTargetFromPossessive(
  node: Record<string, unknown>,
  evaluator: ExpressionEvaluator,
  context: ExecutionContext
): Promise<PropertyTarget | null> {
  const objectNode = node.object as ASTNode;
  const propertyNode = node.property as Record<string, unknown>;

  if (!objectNode || !propertyNode) return null;

  const property = (propertyNode.name || propertyNode.value) as string;
  if (!property || typeof property !== 'string') return null;

  // Evaluate the object (element)
  let element = await evaluator.evaluate(objectNode, context);

  // Handle arrays - take first element
  if (Array.isArray(element) && element.length > 0) {
    element = element[0];
  }

  if (!isHTMLElement(element)) return null;

  return { element: element as HTMLElement, property };
}

// ============================================================================
// Operations on PropertyTargets
// ============================================================================

/**
 * Read the value of a property target
 */
export function readPropertyTarget(target: PropertyTarget): unknown {
  return getElementProperty(target.element, target.property);
}

/**
 * Write a value to a property target
 */
export function writePropertyTarget(target: PropertyTarget, value: unknown): void {
  setElementProperty(target.element, target.property, value);
}

/**
 * Toggle a property target
 *
 * Behavior depends on property type:
 * - Boolean properties (disabled, checked, hidden): true ↔ false
 * - Numeric properties (opacity, tabIndex): current ↔ 0 (or 0 → 1)
 * - String properties: current ↔ '' (empty string)
 *
 * @returns The new value after toggling
 */
export function togglePropertyTarget(target: PropertyTarget): unknown {
  const current = readPropertyTarget(target);

  // Boolean: simple negation
  if (typeof current === 'boolean' || isBooleanProperty(target.property)) {
    const newValue = !current;
    writePropertyTarget(target, newValue);
    return newValue;
  }

  // Numeric: toggle between current and 0 (or 0 → 1)
  if (typeof current === 'number') {
    const newValue = current === 0 ? 1 : 0;
    writePropertyTarget(target, newValue);
    return newValue;
  }

  // String: toggle between current and empty
  if (typeof current === 'string') {
    // Store original value for restoration
    const storageKey = `__hyperfixi_toggle_${target.property}`;
    const stored = (target.element as any)[storageKey];

    if (current === '' && stored !== undefined) {
      // Restore original value
      writePropertyTarget(target, stored);
      return stored;
    } else {
      // Store current and clear
      (target.element as any)[storageKey] = current;
      writePropertyTarget(target, '');
      return '';
    }
  }

  // Fallback: treat as boolean-like
  const newValue = !current;
  writePropertyTarget(target, newValue);
  return newValue;
}

/**
 * Check if a property is known to be boolean
 *
 * These are DOM properties that are guaranteed to be boolean
 * and are safe for toggle operations.
 */
export function isBooleanProperty(property: string): boolean {
  const booleanProperties = new Set([
    'disabled',
    'checked',
    'hidden',
    'readOnly',
    'readonly',
    'required',
    'multiple',
    'selected',
    'autofocus',
    'autoplay',
    'controls',
    'loop',
    'muted',
    'open',
    'reversed',
    'async',
    'defer',
    'noValidate',
    'novalidate',
    'formNoValidate',
    'formnovalidate',
    'isContentEditable', // Note: this is readonly
    'draggable',
    'spellcheck',
    'contentEditable', // Actually string "true"/"false"/"inherit" but often used as boolean
  ]);

  return booleanProperties.has(property) || booleanProperties.has(property.toLowerCase());
}
