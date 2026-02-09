/**
 * Call expression evaluation extracted from BaseExpressionEvaluator.
 * Handles function calls, constructor calls, and method invocations.
 */

import type { ExecutionContext } from '../types/core';
import type { EvaluateFn, UnwrapFn } from './evaluator-types';
import { extractPropertyName } from './ast-property-utils';

/**
 * Evaluate call expressions — function calls, constructor calls, method calls.
 *
 * @param evaluateSelector - Callback for evaluating selector nodes (needed for collection functions)
 */
export async function evaluateCallExpression(
  node: any,
  context: ExecutionContext,
  evaluate: EvaluateFn,
  unwrap: UnwrapFn,
  expressionRegistry: Map<string, any>,
  evaluateSelector: (node: { value: string }, context: ExecutionContext) => Promise<HTMLElement[]>
): Promise<any> {
  const { callee, arguments: args, isConstructor } = node;

  // Handle constructor calls
  if (isConstructor) {
    const constructorName = callee.name;
    const Constructor = context.globals?.get(constructorName) || (window as any)[constructorName];
    if (typeof Constructor === 'function') {
      const evaluatedArgs = await Promise.all(args.map((arg: any) => evaluate(arg, context)));
      return new Constructor(...evaluatedArgs);
    }
    throw new Error(`Unknown constructor: ${constructorName}`);
  }

  // Handle member expression and property access calls (obj.method() or #selector.method())
  if (callee.type === 'memberExpression' || callee.type === 'propertyAccess') {
    return evaluateMethodCall(callee, args, context, evaluate, unwrap);
  }

  const functionName = callee.name || callee;

  // Check if it's a registered expression function
  const expression = expressionRegistry.get(functionName);
  if (expression) {
    const selectorStringFunctions = ['closest', 'previous', 'next'];
    const collectionFunctions = ['first', 'last', 'random', 'at'];

    const needsSelectorString = selectorStringFunctions.includes(functionName);
    const needsCollection = collectionFunctions.includes(functionName);

    const evaluatedArgs = await Promise.all(
      args.map((arg: any) => {
        if (
          needsSelectorString &&
          arg &&
          arg.type === 'selector' &&
          typeof arg.value === 'string'
        ) {
          return arg.value;
        }
        if (
          needsSelectorString &&
          arg &&
          arg.type === 'identifier' &&
          typeof arg.name === 'string'
        ) {
          return arg.name;
        }
        if (needsCollection && arg && arg.type === 'selector' && typeof arg.value === 'string') {
          return evaluateSelector(arg, context);
        }
        return evaluate(arg, context);
      })
    );

    return expression.evaluate(context, ...evaluatedArgs);
  }

  // Try to resolve from context or global scope
  const func = context.globals?.get(functionName) || (window as any)[functionName];
  if (typeof func === 'function') {
    const evaluatedArgs = await Promise.all(args.map((arg: any) => evaluate(arg, context)));
    return func(...evaluatedArgs);
  }

  throw new Error(`Unknown function: ${functionName}`);
}

/**
 * Evaluate method calls on objects (both memberExpression and propertyAccess).
 * Handles: obj.method(), #selector.method(), element.showModal(), etc.
 */
export async function evaluateMethodCall(
  callee: any,
  args: any[],
  context: ExecutionContext,
  evaluate: EvaluateFn,
  unwrap: UnwrapFn
): Promise<any> {
  try {
    const object = await evaluate(callee.object, context);
    const thisContext = unwrap(object);

    if (thisContext === null || thisContext === undefined) {
      throw new Error(`Cannot call method on null or undefined`);
    }

    const propertyName = extractPropertyName(callee.property);
    if (!propertyName || typeof propertyName !== 'string') {
      throw new Error(`Invalid method name: ${propertyName}`);
    }

    const func = thisContext[propertyName];

    if (typeof func !== 'function') {
      throw new Error(
        `Property "${propertyName}" is not a function on ${
          thisContext.constructor?.name || typeof thisContext
        }`
      );
    }

    const evaluatedArgs = await Promise.all(args.map((arg: any) => evaluate(arg, context)));
    const result = func.apply(thisContext, evaluatedArgs);
    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to evaluate method call: ${error}`);
  }
}
