/**
 * Validation Helpers - Reusable argument validation for expression implementations
 *
 * These helpers eliminate repetitive validation boilerplate across 12+ expression files.
 * Each function returns null on success or an error message string on failure,
 * matching the standard ExpressionImplementation.validate() return type.
 *
 * Estimated savings: ~200 lines across expression implementations
 */

// Number-to-word mapping for small numbers (matches existing error message style)
const NUMBER_WORDS: Record<number, string> = {
  1: 'one',
  2: 'two',
  3: 'three',
  4: 'four',
  5: 'five',
};

function numberToWord(n: number): string {
  return NUMBER_WORDS[n] ?? String(n);
}

/**
 * Validate that args has exactly the expected number of arguments
 *
 * @example
 * validate(args: unknown[]): string | null {
 *   return validateArgCount(args, 2, 'equals', 'left, right');
 * }
 * // Returns: "equals requires exactly two arguments (left, right)" on failure
 */
export function validateArgCount(
  args: unknown[],
  expected: number,
  expressionName: string,
  argNames?: string
): string | null {
  if (args.length !== expected) {
    const argDesc = argNames ? ` (${argNames})` : '';
    return `${expressionName} requires exactly ${numberToWord(expected)} argument${expected === 1 ? '' : 's'}${argDesc}`;
  }
  return null;
}

/**
 * Validate that args has at least the minimum number of arguments
 *
 * @example
 * validate(args: unknown[]): string | null {
 *   return validateMinArgs(args, 1, 'contains');
 * }
 */
export function validateMinArgs(
  args: unknown[],
  minimum: number,
  expressionName: string
): string | null {
  if (args.length < minimum) {
    return `${expressionName} requires at least ${numberToWord(minimum)} argument${minimum === 1 ? '' : 's'}`;
  }
  return null;
}

/**
 * Validate that a specific argument is a string
 *
 * @example
 * validate(args: unknown[]): string | null {
 *   return validateArgCount(args, 1, 'querySelector')
 *     ?? validateArgIsString(args, 0, 'querySelector', 'selector');
 * }
 */
export function validateArgIsString(
  args: unknown[],
  index: number,
  expressionName: string,
  argName?: string
): string | null {
  if (typeof args[index] !== 'string') {
    const name = argName || `argument ${index + 1}`;
    return `${expressionName} ${name} must be a string`;
  }
  return null;
}

/**
 * Validate that a specific argument is a number
 */
export function validateArgIsNumber(
  args: unknown[],
  index: number,
  expressionName: string,
  argName?: string
): string | null {
  if (typeof args[index] !== 'number') {
    const name = argName || `argument ${index + 1}`;
    return `${expressionName} ${name} must be a number`;
  }
  return null;
}

/**
 * Validate that a specific argument is a DOM Element
 * Uses duck typing (nodeType === 1) for cross-realm compatibility
 */
export function validateArgIsElement(
  args: unknown[],
  index: number,
  expressionName: string,
  argName?: string
): string | null {
  const arg = args[index];
  const isElement = arg != null && typeof arg === 'object' && (arg as any).nodeType === 1;
  if (!isElement) {
    const name = argName || `argument ${index + 1}`;
    return `${expressionName} ${name} must be a DOM Element`;
  }
  return null;
}

/**
 * Validate that a specific argument is an array or array-like
 */
export function validateArgIsArrayLike(
  args: unknown[],
  index: number,
  expressionName: string,
  argName?: string
): string | null {
  const arg = args[index];
  const isArrayLike =
    Array.isArray(arg) ||
    arg instanceof NodeList ||
    (arg != null && typeof arg === 'object' && 'length' in arg);
  if (!isArrayLike) {
    const name = argName || `argument ${index + 1}`;
    return `${expressionName} ${name} must be an array or array-like`;
  }
  return null;
}

/**
 * Validate that a specific argument is not null or undefined
 */
export function validateArgNotNull(
  args: unknown[],
  index: number,
  expressionName: string,
  argName?: string
): string | null {
  if (args[index] == null) {
    const name = argName || `argument ${index + 1}`;
    return `${expressionName} ${name} cannot be null or undefined`;
  }
  return null;
}

/**
 * Combined validator: check count then type for single-argument string expressions
 * Common pattern for selector-based expressions (querySelector, getElementById, etc.)
 *
 * @example
 * validate(args: unknown[]): string | null {
 *   return validateSingleStringArg(args, 'querySelector', 'selector');
 * }
 */
export function validateSingleStringArg(
  args: unknown[],
  expressionName: string,
  argName: string
): string | null {
  return (
    validateArgCount(args, 1, expressionName, argName) ??
    validateArgIsString(args, 0, expressionName, argName)
  );
}

/**
 * Combined validator: check count then type for two-argument comparison expressions
 * Common pattern for comparison operators (equals, greaterThan, etc.)
 *
 * @example
 * validate(args: unknown[]): string | null {
 *   return validateTwoArgs(args, 'equals');
 * }
 */
export function validateTwoArgs(args: unknown[], expressionName: string): string | null {
  return validateArgCount(args, 2, expressionName, 'left, right');
}

/**
 * No-op validator for expressions that take no arguments
 * Useful for reference expressions (me, you, it, result)
 */
export function validateNoArgs(): string | null {
  return null;
}

/**
 * Validate that args has at most the maximum number of arguments
 *
 * Note: Uses "one" for 1, but numbers (2, 3) for higher values to match
 * existing positional expression conventions.
 *
 * @example
 * validate(args: unknown[]): string | null {
 *   return validateMaxArgs(args, 1, 'first', 'collection');
 * }
 * // Returns: "first expression takes at most one argument (collection)" on failure
 */
export function validateMaxArgs(
  args: unknown[],
  maximum: number,
  expressionName: string,
  argNames?: string
): string | null {
  if (args.length > maximum) {
    const argDesc = argNames ? ` (${argNames})` : '';
    // Use "one" for 1, but numbers for 2+ (matches positional expression style)
    const maxStr = maximum === 1 ? 'one' : String(maximum);
    return `${expressionName} expression takes at most ${maxStr} argument${maximum === 1 ? '' : 's'}${argDesc}`;
  }
  return null;
}

/**
 * Validate that args count is within a range (inclusive)
 *
 * @example
 * validate(args: unknown[]): string | null {
 *   return validateArgRange(args, 2, 3, 'closestSibling', 'selector, direction, fromElement');
 * }
 * // Returns: "closestSibling requires 2-3 arguments (selector, direction, fromElement)" on failure
 */
export function validateArgRange(
  args: unknown[],
  min: number,
  max: number,
  expressionName: string,
  argNames?: string
): string | null {
  if (args.length < min || args.length > max) {
    const argDesc = argNames ? ` (${argNames})` : '';
    return `${expressionName} requires ${min}-${max} arguments${argDesc}`;
  }
  return null;
}
