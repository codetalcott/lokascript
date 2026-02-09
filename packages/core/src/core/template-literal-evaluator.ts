/**
 * Template literal and simple expression evaluation,
 * extracted from BaseExpressionEvaluator.
 */

import type { ExecutionContext } from '../types/core';
import { debug } from '../utils/debug';

/**
 * Look up a simple variable name in the context scope chain
 */
function lookupTemplateVariable(name: string, context: ExecutionContext): any {
  if (context.locals?.has(name)) return context.locals.get(name);
  if (context.globals?.has(name)) return context.globals.get(name);
  if (context.variables?.has(name)) return context.variables.get(name);
  if (name === 'me') return context.me;
  if (name === 'it') return context.it;
  if (name === 'result') return context.result;
  return undefined;
}

/**
 * Resolve a variable name (with optional property access) from context.
 * Used for $variable template interpolation.
 */
async function resolveTemplateVariable(varName: string, context: ExecutionContext): Promise<any> {
  if (varName.includes('.')) {
    const parts = varName.split('.');
    let value = lookupTemplateVariable(parts[0], context);
    for (let i = 1; i < parts.length && value != null; i++) {
      value = value[parts[i]];
    }
    return value;
  }
  return lookupTemplateVariable(varName, context);
}

/**
 * Resolve a value from context or parse as literal
 */
export async function resolveValue(name: string, context: ExecutionContext): Promise<any> {
  debug.expressions(`RESOLVE: Looking for '${name}' in context`, {
    hasInLocals: context.locals.has(name),
    localsKeys: Array.from(context.locals.keys()),
    value: context.locals.get(name),
  });

  if (context.locals.has(name)) {
    const value = context.locals.get(name);
    debug.expressions(`RESOLVE: Found '${name}' in locals:`, value);
    return value;
  }
  if (context.globals && context.globals.has(name)) {
    const value = context.globals.get(name);
    debug.expressions(`RESOLVE: Found '${name}' in globals:`, value);
    return value;
  }
  if (context.variables && context.variables.has(name)) {
    const value = context.variables.get(name);
    debug.expressions(`RESOLVE: Found '${name}' in variables (legacy):`, value);
    return value;
  }

  // Try parsing as number
  const num = Number(name);
  if (!isNaN(num)) {
    return num;
  }

  // Try parsing as string literal
  if (
    (name.startsWith('"') && name.endsWith('"')) ||
    (name.startsWith("'") && name.endsWith("'"))
  ) {
    return name.slice(1, -1);
  }

  // Handle property access (e.g., "todoData.id")
  if (name.includes('.')) {
    const parts = name.split('.');
    const baseName = parts[0];

    let obj: any = null;
    if (context.locals.has(baseName)) {
      obj = context.locals.get(baseName);
    } else if (context.globals && context.globals.has(baseName)) {
      obj = context.globals.get(baseName);
    } else if (context.variables && context.variables.has(baseName)) {
      obj = context.variables.get(baseName);
    }

    if (obj !== null && obj !== undefined) {
      for (let i = 1; i < parts.length; i++) {
        if (obj === null || obj === undefined) {
          debug.expressions(`RESOLVE: Property access failed at '${parts[i - 1]}'`);
          return undefined;
        }
        obj = obj[parts[i]];
      }
      debug.expressions(`RESOLVE: Property access '${name}' =`, obj);
      return obj;
    }
  }

  return name;
}

/**
 * Evaluate simple expressions like "clientX - xoff" using context variables.
 * Handles ternary and basic arithmetic: +, -, *, /, %
 */
export async function evaluateSimpleExpression(
  exprCode: string,
  context: ExecutionContext
): Promise<any> {
  debug.expressions('EVAL: Evaluating expression:', exprCode);

  // Handle ternary expressions
  const ternaryMatch = exprCode.match(/^(.+?)\s*\?(?![\.\[])\s*(.+?)\s*:\s*(.+)$/);
  if (ternaryMatch) {
    const [, conditionExpr, trueExpr, falseExpr] = ternaryMatch;
    debug.expressions('EVAL: Parsed ternary:', { conditionExpr, trueExpr, falseExpr });

    const conditionValue = await resolveValue(conditionExpr.trim(), context);
    debug.expressions('EVAL: Ternary condition value:', conditionValue);

    if (conditionValue) {
      const trueValue = await resolveValue(trueExpr.trim(), context);
      debug.expressions('EVAL: Ternary returned true branch:', trueValue);
      return trueValue;
    } else {
      const falseValue = await resolveValue(falseExpr.trim(), context);
      debug.expressions('EVAL: Ternary returned false branch:', falseValue);
      return falseValue;
    }
  }

  // Try arithmetic operators
  const arithmeticMatch = exprCode.match(
    /^([a-zA-Z_$][a-zA-Z0-9_$]*|\d+(?:\.\d+)?)\s*([\+\-\*\/\%])\s*([a-zA-Z_$][a-zA-Z0-9_$]*|\d+(?:\.\d+)?)$/
  );

  if (arithmeticMatch) {
    const [, left, operator, right] = arithmeticMatch;
    debug.expressions('EVAL: Parsed arithmetic:', { left, operator, right });

    const leftValue = await resolveValue(left.trim(), context);
    const rightValue = await resolveValue(right.trim(), context);
    debug.expressions('EVAL: Resolved values:', { leftValue, rightValue });

    const leftNum = Number(leftValue);
    const rightNum = Number(rightValue);

    if (!isNaN(leftNum) && !isNaN(rightNum)) {
      let result: number;
      switch (operator) {
        case '+':
          result = leftNum + rightNum;
          break;
        case '-':
          result = leftNum - rightNum;
          break;
        case '*':
          result = leftNum * rightNum;
          break;
        case '/':
          result = leftNum / rightNum;
          break;
        case '%':
          result = leftNum % rightNum;
          break;
        default:
          result = leftNum;
      }
      debug.expressions('EVAL: Arithmetic result:', result);
      return result;
    }
  }

  // Fallback: resolve as single value
  const fallback = await resolveValue(exprCode.trim(), context);
  debug.expressions('EVAL: Fallback result:', fallback);
  return fallback;
}

/**
 * Evaluate template literal — parse $variable and ${expression} patterns.
 * Supports both _hyperscript-style $var and JavaScript-style ${expr}.
 */
export async function evaluateTemplateLiteral(
  node: any,
  context: ExecutionContext
): Promise<string> {
  let template = node.value || '';

  debug.expressions('TEMPLATE LITERAL: Evaluating', { template, node });

  // First pass: Replace $variable patterns (without curly braces)
  const varPattern = /\$([a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*)/g;

  const matches: Array<{ match: string; varName: string; index: number }> = [];
  let m;
  while ((m = varPattern.exec(template)) !== null) {
    if (template[m.index + 1] === '{') continue;
    matches.push({ match: m[0], varName: m[1], index: m.index });
  }

  // Replace from end to preserve indices
  for (let i = matches.length - 1; i >= 0; i--) {
    const { match, varName, index } = matches[i];
    const value = await resolveTemplateVariable(varName, context);
    debug.expressions(`TEMPLATE: $${varName} resolved to`, value);
    template =
      template.slice(0, index) + String(value ?? '') + template.slice(index + match.length);
  }

  // Second pass: Handle ${expression} patterns
  let result = '';
  let j = 0;

  while (j < template.length) {
    const exprStart = template.indexOf('${', j);

    if (exprStart === -1) {
      result += template.slice(j);
      break;
    }

    result += template.slice(j, exprStart);

    // Find matching closing brace, accounting for nested braces
    let depth = 1;
    let exprEnd = exprStart + 2;
    while (exprEnd < template.length && depth > 0) {
      if (template[exprEnd] === '{') depth++;
      if (template[exprEnd] === '}') depth--;
      if (depth > 0) exprEnd++;
    }
    if (depth !== 0) {
      throw new Error(`Unterminated template expression in: ${template}`);
    }

    const exprCode = template.slice(exprStart + 2, exprEnd);

    debug.expressions('TEMPLATE: Evaluating expression:', exprCode);

    let value: any;
    const trimmed = exprCode.trim();

    if (context.locals.has(trimmed)) {
      value = context.locals.get(trimmed);
      debug.expressions(`TEMPLATE: Found in locals: ${trimmed} =`, value);
    } else if (context.globals && context.globals.has(trimmed)) {
      value = context.globals.get(trimmed);
      debug.expressions(`TEMPLATE: Found in globals: ${trimmed} =`, value);
    } else if (context.variables && context.variables.has(trimmed)) {
      value = context.variables.get(trimmed);
      debug.expressions(`TEMPLATE: Found in variables (legacy): ${trimmed} =`, value);
    } else {
      value = await evaluateSimpleExpression(exprCode, context);
      debug.expressions(`TEMPLATE: Evaluated expression "${exprCode}" =`, value);
    }

    result += String(value);
    j = exprEnd + 1;
  }

  return result;
}
