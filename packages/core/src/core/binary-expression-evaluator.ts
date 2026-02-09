/**
 * Binary expression evaluation extracted from BaseExpressionEvaluator.
 * Handles comparisons, arithmetic, assignment, has/have, and all binary operators.
 */

import type { ExecutionContext } from '../types/core';
import type { EvaluateFn, UnwrapFn } from './evaluator-types';
import { debug } from '../utils/debug';

/**
 * Coerce DOM elements (or arrays of elements from selector results) to their
 * numeric/string value for arithmetic operations.
 * Returns the original value unchanged if it's not a DOM element or element array.
 */
export function coerceArithmeticOperand(value: unknown): unknown {
  // Unwrap single-element arrays (from querySelectorAll/selector evaluation)
  if (Array.isArray(value) && value.length === 1) {
    value = value[0];
  }

  if (
    value !== null &&
    typeof value === 'object' &&
    typeof (value as any).textContent === 'string'
  ) {
    const text = (value as any).value ?? (value as any).textContent;
    if (text !== null && text !== undefined) {
      const trimmed = String(text).trim();
      if (trimmed === '') return 0;
      const num = parseFloat(trimmed);
      return isNaN(num) ? trimmed : num;
    }
    return 0;
  }
  return value;
}

/**
 * Evaluate binary expressions (comparisons, arithmetic, assignment, has/have, etc.)
 */
export async function evaluateBinaryExpression(
  node: any,
  context: ExecutionContext,
  evaluate: EvaluateFn,
  unwrap: UnwrapFn,
  expressionRegistry: Map<string, any>,
  evaluateSelector: (node: { value: string }, context: ExecutionContext) => Promise<HTMLElement[]>
): Promise<any> {
  const { operator, left, right } = node;

  // Special handling for 'in' operator with selectors
  if (operator === 'in' && left.type === 'selector') {
    let selector = left.value;
    if (selector.startsWith('<') && selector.endsWith('/>')) {
      selector = selector.slice(1, -2).trim();
    }
    const contextElement = unwrap(await evaluate(right, context));

    if (!contextElement || typeof contextElement.querySelector !== 'function') {
      throw new Error(
        `'in' operator requires a DOM element as the right operand (got: ${typeof contextElement})`
      );
    }

    const nodeList = contextElement.querySelectorAll(selector);
    return Array.from(nodeList);
  }

  // Special handling for 'in' operator with queryReference
  if (operator === 'in' && left.type === 'queryReference') {
    let selector = left.selector;
    if (selector.startsWith('<') && selector.endsWith('/>')) {
      selector = selector.slice(1, -2).trim();
    }
    const contextElement = unwrap(await evaluate(right, context));

    if (!contextElement || typeof contextElement.querySelector !== 'function') {
      throw new Error(
        `'in' operator requires a DOM element as the right operand (got: ${typeof contextElement})`
      );
    }

    const nodeList = contextElement.querySelectorAll(selector);
    return Array.from(nodeList);
  }

  // Special handling for positional expressions with 'in' scope
  if (operator === 'in') {
    let positionalOp: string | null = null;
    let selector: string | null = null;

    if (left.type === 'positionalExpression') {
      positionalOp = left.operator;
      const selectorArg = left.argument;

      if (selectorArg?.type === 'cssSelector') {
        selector = selectorArg.selector;
      } else if (selectorArg?.type === 'selector') {
        selector = selectorArg.value;
      } else if (selectorArg?.type === 'classSelector') {
        selector = '.' + selectorArg.className;
      } else if (selectorArg?.type === 'idSelector') {
        selector = '#' + selectorArg.id;
      } else if (selectorArg) {
        selector = String(await evaluate(selectorArg, context));
      }
    } else if (
      left.type === 'memberExpression' &&
      left.object?.type === 'identifier' &&
      (left.object.name === 'first' || left.object.name === 'last')
    ) {
      positionalOp = left.object.name;
      if (left.property?.type === 'identifier' && left.property.name) {
        selector = '.' + left.property.name;
      }
    } else if (
      left.type === 'callExpression' &&
      left.callee?.type === 'identifier' &&
      (left.callee.name === 'first' || left.callee.name === 'last')
    ) {
      positionalOp = left.callee.name;
      const selectorArg = left.arguments?.[0];

      if (selectorArg?.type === 'selector') {
        selector = selectorArg.value;
      } else if (selectorArg?.type === 'cssSelector') {
        selector = selectorArg.selector;
      } else if (selectorArg?.type === 'classSelector') {
        selector = '.' + selectorArg.className;
      } else if (selectorArg?.type === 'idSelector') {
        selector = '#' + selectorArg.id;
      } else if (selectorArg) {
        selector = String(await evaluate(selectorArg, context));
      }
    }

    if (positionalOp && selector) {
      const scopeElement = unwrap(await evaluate(right, context));

      if (!scopeElement || typeof scopeElement.querySelectorAll !== 'function') {
        return undefined;
      }

      const nodeList = scopeElement.querySelectorAll(selector);
      const elements = Array.from(nodeList);

      if (positionalOp === 'first') {
        return elements.length > 0 ? elements[0] : undefined;
      } else if (positionalOp === 'last') {
        return elements.length > 0 ? elements[elements.length - 1] : undefined;
      }

      return elements;
    }
  }

  // Special handling for 'matches' operator
  if (
    operator === 'matches' &&
    (right.type === 'selector' || right.type === 'cssSelector' || right.type === 'classSelector')
  ) {
    const leftValue = await evaluate(left, context);
    const selectorStr = right.value || right.selector;

    if (leftValue && typeof leftValue.matches === 'function') {
      try {
        return leftValue.matches(selectorStr);
      } catch {
        return false;
      }
    }
    return false;
  }

  // Evaluate operands normally
  const leftValue = await evaluate(left, context);
  const rightValue = await evaluate(right, context);

  // Handle 'has'/'have' operator
  if (operator === 'has' || operator === 'have') {
    if (leftValue instanceof Element) {
      // 1. Class selector: me has .active
      if (
        (right.type === 'cssSelector' && right.selectorType === 'class') ||
        (right.type === 'selector' && right.value?.startsWith('.'))
      ) {
        const className = right.selector?.slice(1) || right.value?.slice(1) || '';
        return leftValue.classList.contains(className);
      }

      // 2. Attribute check: me has @disabled
      if (right.type === 'attributeAccess' || right.type === 'attributeRef') {
        const attrName = right.attributeName || right.name || right.value?.replace(/^@/, '') || '';
        return leftValue.hasAttribute(attrName);
      }
      if (right.type === 'cssSelector' && right.selectorType === 'attribute') {
        const attrName = (right.selector || right.value || '').replace(/^@/, '');
        return leftValue.hasAttribute(attrName);
      }

      // 3. ID selector: me has #child-id (checks descendants)
      if (
        (right.type === 'cssSelector' && right.selectorType === 'id') ||
        right.type === 'idSelector'
      ) {
        const id = (right.selector || right.value || '').replace(/^#/, '');
        return leftValue.querySelector(`#${CSS.escape(id)}`) !== null;
      }

      // 4. General CSS selector: me has <button.primary/>
      if (right.type === 'selector' || right.type === 'queryReference') {
        let sel = right.value || right.selector || '';
        if (sel.startsWith('<') && sel.endsWith('/>')) {
          sel = sel.slice(1, -2).trim();
        }
        try {
          return leftValue.querySelector(sel) !== null;
        } catch {
          return false;
        }
      }

      // 5. Any other cssSelector type — try querySelector
      if (right.type === 'cssSelector') {
        const sel = right.selector || '';
        try {
          return leftValue.querySelector(sel) !== null;
        } catch {
          return false;
        }
      }
    }

    // Non-element has/have: array/string inclusion
    if (Array.isArray(leftValue)) {
      return leftValue.includes(rightValue);
    }
    if (typeof leftValue === 'string') {
      return leftValue.includes(String(rightValue));
    }

    return false;
  }

  switch (operator) {
    case '>':
    case 'is greater than':
      return leftValue > rightValue;

    case '<':
    case 'is less than':
      return leftValue < rightValue;

    case '>=':
    case 'is greater than or equal to':
      return leftValue >= rightValue;

    case '<=':
    case 'is less than or equal to':
      return leftValue <= rightValue;

    case '==':
    case 'equals':
    case 'is equal to':
      return leftValue == rightValue;

    case '===':
    case 'is really equal to':
    case 'really equals':
      return leftValue === rightValue;

    case '!=':
    case 'is not equal to':
      return leftValue != rightValue;

    case '!==':
    case 'is not really equal to':
      return leftValue !== rightValue;

    case '+': {
      const coercedLeft = coerceArithmeticOperand(leftValue);
      const coercedRight = coerceArithmeticOperand(rightValue);

      const shouldUseStringConcatenation =
        typeof coercedLeft === 'string' || typeof coercedRight === 'string';

      if (shouldUseStringConcatenation) {
        const stringConcatExpr = expressionRegistry.get('stringConcatenation');
        if (stringConcatExpr) {
          debug.expressions('Using string concatenation for:', {
            leftValue: coercedLeft,
            rightValue: coercedRight,
          });
          const result = await stringConcatExpr.evaluate(context, {
            left: coercedLeft,
            right: coercedRight,
          });
          return result.success ? result.value : (coercedLeft as any) + (coercedRight as any);
        }
      } else {
        const additionExpr = expressionRegistry.get('addition');
        if (additionExpr) {
          debug.expressions('Using numeric addition for:', {
            leftValue: coercedLeft,
            rightValue: coercedRight,
          });
          const result = await additionExpr.evaluate(context, {
            left: coercedLeft,
            right: coercedRight,
          });
          return result.success ? result.value : (coercedLeft as any) + (coercedRight as any);
        }
      }
      return (coercedLeft as any) + (coercedRight as any);
    }

    case '-':
      return (
        (coerceArithmeticOperand(leftValue) as any) - (coerceArithmeticOperand(rightValue) as any)
      );

    case '*':
      return (
        (coerceArithmeticOperand(leftValue) as any) * (coerceArithmeticOperand(rightValue) as any)
      );

    case '/':
      return (
        (coerceArithmeticOperand(leftValue) as any) / (coerceArithmeticOperand(rightValue) as any)
      );

    case '%':
    case 'mod':
      return (
        (coerceArithmeticOperand(leftValue) as any) % (coerceArithmeticOperand(rightValue) as any)
      );

    case 'as':
      const typeName =
        typeof rightValue === 'string'
          ? rightValue
          : right.type === 'identifier'
            ? right.name
            : right.type === 'literal'
              ? right.value
              : String(rightValue);
      const asExpr = expressionRegistry.get('as');
      return asExpr ? asExpr.evaluate(context, leftValue, typeName) : leftValue;

    case '&&':
    case 'and':
      return leftValue && rightValue;

    case '||':
    case 'or':
      return leftValue || rightValue;

    case 'is':
      return leftValue === rightValue;

    case 'is not':
      return leftValue !== rightValue;

    case 'is a':
    case 'is an':
      const checkTypeName =
        right.type === 'identifier' ? right.name.toLowerCase() : String(rightValue).toLowerCase();
      switch (checkTypeName) {
        case 'string':
          return typeof leftValue === 'string';
        case 'number':
          return typeof leftValue === 'number';
        case 'boolean':
          return typeof leftValue === 'boolean';
        case 'object':
          return typeof leftValue === 'object' && leftValue !== null;
        case 'array':
          return Array.isArray(leftValue);
        case 'function':
          return typeof leftValue === 'function';
        case 'null':
          return leftValue === null;
        case 'undefined':
          return leftValue === undefined;
        default:
          const typeNameStr = right.type === 'identifier' ? right.name : String(rightValue);
          return leftValue != null && leftValue.constructor?.name === typeNameStr;
      }

    case 'is not a':
    case 'is not an':
      const negCheckTypeName =
        right.type === 'identifier' ? right.name.toLowerCase() : String(rightValue).toLowerCase();
      switch (negCheckTypeName) {
        case 'string':
          return typeof leftValue !== 'string';
        case 'number':
          return typeof leftValue !== 'number';
        case 'boolean':
          return typeof leftValue !== 'boolean';
        case 'object':
          return !(typeof leftValue === 'object' && leftValue !== null);
        case 'array':
          return !Array.isArray(leftValue);
        case 'function':
          return typeof leftValue !== 'function';
        case 'null':
          return leftValue !== null;
        case 'undefined':
          return leftValue !== undefined;
        default:
          const negTypeNameStr = right.type === 'identifier' ? right.name : String(rightValue);
          return !(leftValue != null && leftValue.constructor?.name === negTypeNameStr);
      }

    case '=':
      if (left.type === 'identifier') {
        const variableName = left.name;

        if (variableName === 'result') {
          context.result = rightValue;
        } else if (variableName === 'it') {
          context.it = rightValue;
        } else if (variableName === 'you') {
          context.you = rightValue;
        } else {
          context.locals.set(variableName, rightValue);
        }

        return rightValue;
      } else {
        throw new Error('Left side of assignment must be an identifier');
      }

    case 'contains':
      if (Array.isArray(leftValue)) {
        return leftValue.includes(rightValue);
      }
      if (typeof leftValue === 'string') {
        return leftValue.includes(String(rightValue));
      }
      if (leftValue && typeof leftValue.matches === 'function') {
        return leftValue.matches(String(rightValue));
      }
      return false;

    case 'include':
    case 'includes':
      if (Array.isArray(leftValue)) {
        return leftValue.includes(rightValue);
      }
      if (typeof leftValue === 'string') {
        return leftValue.includes(String(rightValue));
      }
      if (leftValue && typeof leftValue.matches === 'function') {
        return leftValue.matches(String(rightValue));
      }
      return false;

    case 'match':
    case 'matches':
      if (leftValue && typeof leftValue.matches === 'function') {
        const selectorStr = typeof rightValue === 'string' ? rightValue : String(rightValue);
        try {
          return leftValue.matches(selectorStr);
        } catch {
          return false;
        }
      }
      return false;

    case 'in':
      const selectorIn = typeof leftValue === 'string' ? leftValue : String(leftValue);
      const contextElementIn = rightValue;

      if (!contextElementIn || typeof contextElementIn.querySelector !== 'function') {
        if (Array.isArray(contextElementIn)) {
          return contextElementIn.includes(leftValue);
        }
        if (typeof contextElementIn === 'object' && contextElementIn !== null) {
          return selectorIn in contextElementIn;
        }
        throw new Error(
          `'in' operator requires a DOM element, array, or object as the right operand (got: ${typeof contextElementIn})`
        );
      }

      return contextElementIn.querySelector(selectorIn);

    case ' ':
      if (typeof leftValue === 'string' && typeof rightValue === 'string') {
        return { command: leftValue, selector: rightValue };
      }
      if (left.type === 'identifier' && right.type === 'selector') {
        return { command: left.name, selector: right.value };
      }
      return rightValue;

    default:
      throw new Error(`Unsupported binary operator: "${operator}" (length: ${operator.length})`);
  }
}
