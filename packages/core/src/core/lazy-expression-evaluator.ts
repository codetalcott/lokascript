/**
 * Lazy Expression Evaluator - On-demand loading of expression categories
 *
 * Phase 2 optimization: Dynamically load expression categories only when needed
 * This enables minimal bundles to start with just core expressions (~40KB)
 * and lazy-load additional categories on first use.
 *
 * Performance:
 * - Core expressions: Pre-loaded (0ms)
 * - Common expressions: On-demand (~2-3ms first time)
 * - Optional expressions: On-demand (~2-3ms first time)
 *
 * Bundle size reduction:
 * - Minimal bundle: 83KB → 50-60KB gzipped (30% reduction)
 * - Standard bundle: 83KB → 100-110KB gzipped (with common tier)
 */

import type { ASTNode, ExecutionContext } from '../types/core';
import { EXPRESSION_TIERS, type ExpressionCategory, type ExpressionTier } from '../expressions/expression-tiers';
import { debug } from '../utils/debug';

/**
 * Options for lazy expression evaluator
 */
export interface LazyExpressionEvaluatorOptions {
  /**
   * Preloading strategy:
   * - 'core': Load only essential expressions (default)
   * - 'common': Load core + common expressions
   * - 'all': Eager load all expressions (legacy behavior)
   * - 'none': Don't preload anything (maximum lazy loading)
   */
  preload?: 'core' | 'common' | 'all' | 'none';

  /**
   * Specific categories to preload (optional)
   * Overrides tier-based preloading if specified
   */
  categories?: ExpressionCategory[];
}

/**
 * Lazy Expression Evaluator - Loads expression categories on demand
 */
export class LazyExpressionEvaluator {
  private loadedCategories = new Set<string>();
  private expressionRegistry = new Map<string, any>();
  private loadPromises = new Map<string, Promise<void>>();
  private options: LazyExpressionEvaluatorOptions;

  constructor(options: LazyExpressionEvaluatorOptions = {}) {
    this.options = {
      preload: 'core',
      ...options
    };

    // Preload based on strategy
    if (this.options.preload !== 'none') {
      void this.preloadExpressions();
    }
  }

  /**
   * Preload expressions based on configured strategy
   */
  private async preloadExpressions(): Promise<void> {
    if (this.options.categories) {
      // Explicit category list
      await Promise.all(
        this.options.categories.map(cat => this.loadCategory(cat))
      );
      return;
    }

    // Tier-based preloading
    switch (this.options.preload) {
      case 'all':
        await this.preloadTier('core');
        await this.preloadTier('common');
        await this.preloadTier('optional');
        break;

      case 'common':
        await this.preloadTier('core');
        await this.preloadTier('common');
        break;

      case 'core':
        await this.preloadTier('core');
        break;

      case 'none':
        // Don't preload anything
        break;
    }
  }

  /**
   * Preload an expression tier
   */
  private async preloadTier(tier: ExpressionTier): Promise<void> {
    const categories = EXPRESSION_TIERS[tier];
    await Promise.all(categories.map(cat => this.loadCategory(cat)));
  }

  /**
   * Load an expression category dynamically
   */
  private async loadCategory(category: string): Promise<void> {
    // Return early if already loaded
    if (this.loadedCategories.has(category)) {
      return;
    }

    // Return existing load promise if in progress
    if (this.loadPromises.has(category)) {
      return this.loadPromises.get(category)!;
    }

    // Start loading
    const loadPromise = this._loadCategoryImpl(category);
    this.loadPromises.set(category, loadPromise);

    try {
      await loadPromise;
      this.loadedCategories.add(category);
      debug.expressions(`✅ Loaded expression category: ${category}`);
    } finally {
      this.loadPromises.delete(category);
    }
  }

  /**
   * Implementation of category loading with dynamic imports
   */
  private async _loadCategoryImpl(category: string): Promise<void> {
    try {
      debug.expressions(`📦 Loading expression category: ${category}`);

      // Dynamic import based on category name
      let module: any;
      switch (category) {
        case 'references':
          module = await import('../expressions/references/index');
          break;
        case 'logical':
          module = await import('../expressions/logical/index');
          break;
        case 'special':
          module = await import('../expressions/special/index');
          break;
        case 'properties':
          module = await import('../expressions/properties/index');
          break;
        case 'conversion':
          module = await import('../expressions/conversion/index');
          break;
        case 'positional':
          module = await import('../expressions/positional/index');
          break;
        default:
          console.warn(`Unknown expression category: ${category}`);
          return;
      }

      // Extract expressions from module
      // Expected format: { referenceExpressions: {...}, logicalExpressions: {...}, etc. }
      const categoryKey = `${category}Expressions`;
      const expressions = module[categoryKey] || module.default;

      if (!expressions) {
        console.warn(`No expressions found in category: ${category}`);
        return;
      }

      // Register all expressions from this category
      Object.entries(expressions).forEach(([name, impl]) => {
        this.expressionRegistry.set(name, impl);
        debug.expressions(`  ✓ Registered: ${name}`);
      });
    } catch (error) {
      console.error(`Failed to load expression category: ${category}`, error);
      throw error;
    }
  }

  /**
   * Evaluate an AST node using the appropriate expression implementation
   * Automatically loads required expression categories on demand
   */
  async evaluate(node: ASTNode, context: ExecutionContext): Promise<any> {
    // Handle null/undefined nodes
    if (!node) {
      debug.expressions('LAZY EVALUATOR: Received null/undefined node, returning null');
      return null;
    }

    // Handle nodes without type property
    if (!node.type) {
      console.error('⚠️ LAZY EVALUATOR: Node missing type property:', node);
      throw new Error(`Node missing type property: ${JSON.stringify(node)}`);
    }

    // Determine which category this node type requires
    const category = this.getCategoryForNodeType(node.type);

    // Load category if needed
    if (category && !this.loadedCategories.has(category)) {
      debug.expressions(`🔄 Auto-loading category for node type: ${node.type} → ${category}`);
      await this.loadCategory(category);
    }

    // Delegate to the same evaluation logic as ExpressionEvaluator
    // Import the original evaluator's methods dynamically
    return this.evaluateNode(node, context);
  }

  /**
   * Map node types to expression categories for lazy loading
   */
  private getCategoryForNodeType(nodeType: string): string | null {
    // Map node types to categories based on Phase 2 plan
    const typeToCategory: Record<string, string> = {
      // Reference expressions
      'identifier': 'references',  // Could be me, you, it, etc.
      'selector': 'references',    // CSS selectors
      'dollarExpression': 'references',

      // Logical expressions
      'binaryExpression': 'logical',
      'unaryExpression': 'logical',
      'comparison': 'logical',

      // Special expressions (literals)
      'literal': 'special',
      'string': 'special',
      'numberLiteral': 'special',
      'stringLiteral': 'special',
      'booleanLiteral': 'special',
      'arrayLiteral': 'special',
      'objectLiteral': 'special',
      'templateLiteral': 'special',

      // Property expressions
      'memberExpression': 'properties',
      'possessiveExpression': 'properties',

      // Conversion expressions
      'asExpression': 'conversion',

      // Positional expressions
      'positional': 'positional',

      // Call expressions (might need special handling)
      'callExpression': 'references',
    };

    return typeToCategory[nodeType] || null;
  }

  /**
   * Evaluate a node using loaded expressions
   * This is similar to ExpressionEvaluator.evaluate() but works with lazy-loaded registry
   */
  private async evaluateNode(node: ASTNode, context: ExecutionContext): Promise<any> {
    switch (node.type) {
      case 'identifier':
        return this.evaluateIdentifier(node as any, context);

      case 'literal':
        return this.evaluateLiteral(node as any, context);

      case 'string':
        return (node as any).value || (node as any).content || '';

      case 'memberExpression':
        return this.evaluateMemberExpression(node as any, context);

      case 'binaryExpression':
        return this.evaluateBinaryExpression(node as any, context);

      case 'unaryExpression':
        return this.evaluateUnaryExpression(node as any, context);

      case 'callExpression':
        return this.evaluateCallExpression(node as any, context);

      case 'selector':
        return this.evaluateSelector(node as any, context);

      case 'dollarExpression':
        return this.evaluateDollarExpression(node as any, context);

      case 'possessiveExpression':
        return this.evaluatePossessiveExpression(node as any, context);

      case 'templateLiteral':
        return this.evaluateTemplateLiteral(node as any, context);

      case 'arrayLiteral':
        return this.evaluateArrayLiteral(node as any, context);

      case 'objectLiteral':
        return this.evaluateObjectLiteral(node as any, context);

      default:
        throw new Error(`Unsupported AST node type for evaluation: ${node.type}`);
    }
  }

  /**
   * Evaluate identifier nodes (me, you, it, etc.)
   */
  private async evaluateIdentifier(node: { name: string }, context: ExecutionContext): Promise<any> {
    const { name } = node;

    // Check if it's a built-in reference expression
    const expression = this.expressionRegistry.get(name);
    if (expression) {
      return expression.evaluate(context);
    }

    // Check locals first
    if (context.locals?.has(name)) {
      return context.locals.get(name);
    }

    // Check globals
    if (context.globals?.has(name)) {
      return context.globals.get(name);
    }

    // Check custom variables
    if (context.variables?.has(name)) {
      return context.variables.get(name);
    }

    // Check JavaScript global objects
    if (typeof globalThis !== 'undefined' && name in globalThis) {
      return (globalThis as any)[name];
    }

    // Default to returning the name itself
    return name;
  }

  /**
   * Evaluate literal nodes (strings, numbers, booleans)
   */
  private async evaluateLiteral(node: { value: any }, _context: ExecutionContext): Promise<any> {
    return node.value;
  }

  /**
   * Evaluate member expressions (object.property)
   */
  private async evaluateMemberExpression(node: any, context: ExecutionContext): Promise<any> {
    const { object, property, computed } = node;

    // Evaluate the object first
    const objectValue = await this.evaluate(object, context);

    if (computed) {
      // For computed access like obj[key]
      const propertyValue = await this.evaluate(property, context);
      return objectValue[propertyValue];
    } else {
      // For property access like obj.property
      const propertyName = property.name || property;
      return objectValue[propertyName];
    }
  }

  /**
   * Evaluate binary expressions (comparisons, arithmetic, etc.)
   */
  private async evaluateBinaryExpression(node: any, context: ExecutionContext): Promise<any> {
    const { operator, left, right } = node;

    // Evaluate operands
    const leftValue = await this.evaluate(left, context);
    const rightValue = await this.evaluate(right, context);

    // Map operators to expression implementations
    switch (operator) {
      case '>':
        const greaterThanExpr = this.expressionRegistry.get('greaterThan');
        return greaterThanExpr ? greaterThanExpr.evaluate(context, leftValue, rightValue) : leftValue > rightValue;

      case '<':
        const lessThanExpr = this.expressionRegistry.get('lessThan');
        return lessThanExpr ? lessThanExpr.evaluate(context, leftValue, rightValue) : leftValue < rightValue;

      case '>=':
        const gteExpr = this.expressionRegistry.get('greaterThanOrEqual');
        return gteExpr ? gteExpr.evaluate(context, leftValue, rightValue) : leftValue >= rightValue;

      case '<=':
        const lteExpr = this.expressionRegistry.get('lessThanOrEqual');
        return lteExpr ? lteExpr.evaluate(context, leftValue, rightValue) : leftValue <= rightValue;

      case '==':
      case '===':
      case 'equals':
        const equalsExpr = this.expressionRegistry.get('equals');
        return equalsExpr ? equalsExpr.evaluate(context, leftValue, rightValue) : leftValue === rightValue;

      case '!=':
      case '!==':
        const notEqualsExpr = this.expressionRegistry.get('notEquals');
        return notEqualsExpr ? notEqualsExpr.evaluate(context, leftValue, rightValue) : leftValue !== rightValue;

      case '+':
        return leftValue + rightValue;

      case '-':
        return leftValue - rightValue;

      case '*':
        return leftValue * rightValue;

      case '/':
        return leftValue / rightValue;

      case '%':
      case 'mod':
        return leftValue % rightValue;

      case '&&':
      case 'and':
        const andExpr = this.expressionRegistry.get('and');
        return andExpr ? andExpr.evaluate(context, leftValue, rightValue) : leftValue && rightValue;

      case '||':
      case 'or':
        const orExpr = this.expressionRegistry.get('or');
        return orExpr ? orExpr.evaluate(context, leftValue, rightValue) : leftValue || rightValue;

      default:
        throw new Error(`Unsupported binary operator: "${operator}"`);
    }
  }

  /**
   * Evaluate unary expressions (not, -, +, etc.)
   */
  private async evaluateUnaryExpression(node: any, context: ExecutionContext): Promise<any> {
    const { operator, argument } = node;

    // Evaluate operand
    const operandValue = await this.evaluate(argument, context);

    switch (operator) {
      case 'not':
      case '!':
        const notExpr = this.expressionRegistry.get('not');
        return notExpr ? notExpr.evaluate(context, operandValue) : !operandValue;

      case '-':
        return -operandValue;

      case '+':
        return +operandValue;

      default:
        throw new Error(`Unsupported unary operator: ${operator}`);
    }
  }

  /**
   * Evaluate call expressions (function calls)
   */
  private async evaluateCallExpression(node: any, context: ExecutionContext): Promise<any> {
    const { callee, arguments: args } = node;

    // Get function name
    const functionName = callee.name || callee;

    // Check if it's a registered expression function
    const expression = this.expressionRegistry.get(functionName);
    if (expression) {
      // Evaluate arguments
      const evaluatedArgs = await Promise.all(
        args.map((arg: any) => this.evaluate(arg, context))
      );

      return expression.evaluate(context, ...evaluatedArgs);
    }

    // For unknown functions, try to resolve from context or global scope
    const func = context.globals?.get(functionName) || (window as any)[functionName];
    if (typeof func === 'function') {
      const evaluatedArgs = await Promise.all(
        args.map((arg: any) => this.evaluate(arg, context))
      );
      return func(...evaluatedArgs);
    }

    throw new Error(`Unknown function: ${functionName}`);
  }

  /**
   * Evaluate CSS selector nodes
   */
  private async evaluateSelector(node: { value: string }, context: ExecutionContext): Promise<HTMLElement[]> {
    const selectorExpr = this.expressionRegistry.get('querySelector');
    if (selectorExpr) {
      const element = await selectorExpr.evaluate(context, node.value);
      return element ? [element] : [];
    }

    // Fallback to basic querySelector
    const elements = document.querySelectorAll(node.value);
    return Array.from(elements) as HTMLElement[];
  }

  /**
   * Evaluate dollar expressions ($variable, $1, $window.foo)
   */
  private async evaluateDollarExpression(node: { expression: any }, context: ExecutionContext): Promise<any> {
    // Evaluate the inner expression normally
    const value = await this.evaluate(node.expression, context);

    // If it's a simple identifier, try to resolve it from context
    if (node.expression.type === 'identifier') {
      const varName = node.expression.name;

      // Handle context variables
      if (context.locals?.has(varName)) {
        return context.locals.get(varName);
      }

      if (varName === 'me' && context.me) return context.me;
      if (varName === 'you' && context.you) return context.you;
      if (varName === 'it' && context.it) return context.it;

      if (context.globals?.has(varName)) {
        return context.globals.get(varName);
      }

      return '';
    }

    return value;
  }

  /**
   * Evaluate possessive expressions (element's property)
   */
  private async evaluatePossessiveExpression(node: any, context: ExecutionContext): Promise<any> {
    const { object, property } = node;

    // Evaluate the object first
    const objectValue = await this.evaluate(object, context);

    if (!objectValue) {
      return undefined;
    }

    // Get property name
    const propertyName = property.name || property.value || property;

    // Regular property access
    return objectValue[propertyName];
  }

  /**
   * Evaluate template literal
   */
  private async evaluateTemplateLiteral(node: any, _context: ExecutionContext): Promise<string> {
    const template = node.value || '';
    // Simplified template evaluation - just return the template for now
    // Full implementation would parse ${} expressions
    return template;
  }

  /**
   * Evaluate array literal
   */
  private async evaluateArrayLiteral(node: any, context: ExecutionContext): Promise<any[]> {
    const elements = node.elements || [];
    const evaluatedElements = [];

    for (const element of elements) {
      const value = await this.evaluate(element, context);
      evaluatedElements.push(value);
    }

    return evaluatedElements;
  }

  /**
   * Evaluate object literal
   */
  private async evaluateObjectLiteral(node: any, context: ExecutionContext): Promise<Record<string, any>> {
    const properties = node.properties || [];
    const result: Record<string, any> = {};

    for (const property of properties) {
      let key: string;
      if (property.key.type === 'identifier') {
        key = property.key.name;
      } else if (property.key.type === 'literal') {
        key = String(property.key.value);
      } else {
        const evaluatedKey = await this.evaluate(property.key, context);
        key = String(evaluatedKey);
      }

      const value = await this.evaluate(property.value, context);
      result[key] = value;
    }

    return result;
  }

  /**
   * Warmup API - Preload specific categories before they're needed
   */
  async warmupExpressions(categories: string[]): Promise<void> {
    debug.expressions(`🔥 Warming up expression categories: ${categories.join(', ')}`);
    await Promise.all(categories.map(cat => this.loadCategory(cat)));
  }

  /**
   * Get available expression names (from loaded categories)
   */
  getAvailableExpressions(): string[] {
    return Array.from(this.expressionRegistry.keys());
  }

  /**
   * Check if an expression is registered (in loaded categories)
   */
  hasExpression(name: string): boolean {
    return this.expressionRegistry.has(name);
  }

  /**
   * Get loaded categories
   */
  getLoadedCategories(): string[] {
    return Array.from(this.loadedCategories);
  }
}
