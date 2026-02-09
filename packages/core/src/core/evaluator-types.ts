/**
 * Shared callback types for extracted evaluator modules.
 * These allow standalone functions to call back into the BaseExpressionEvaluator
 * for recursive evaluation without circular class dependencies.
 */

import type { ASTNode, ExecutionContext } from '../types/core';

/** Recursive evaluation callback — delegates to BaseExpressionEvaluator.evaluate() */
export type EvaluateFn = (node: ASTNode | any, context: ExecutionContext) => Promise<any>;

/** Unwrap selector results to a single element */
export type UnwrapFn = (value: any) => any;

/** Selector evaluation callback */
export type EvaluateSelectorFn = (node: any, context: ExecutionContext) => Promise<any>;
