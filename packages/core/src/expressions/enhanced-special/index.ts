/**
 * Enhanced Special Expressions - Literals, Mathematical Operations, and Utilities
 * Implements comprehensive special operations with TypeScript integration
 * Handles literals, mathematical operations, parentheses, and utility functions
 */

import { z } from 'zod';
import type {
  TypedExpressionImplementation,
  TypedExecutionContext,
  HyperScriptValue,
  EvaluationResult,
  LLMDocumentation
} from '../../types/enhanced-core.js';

// ============================================================================
// Input Validation Schemas
// ============================================================================

/**
 * Schema for literal expressions
 */
export const LiteralInputSchema = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.unknown()),
  z.record(z.unknown())
]).describe('Literal value');

export type LiteralInput = z.infer<typeof LiteralInputSchema>;

/**
 * Schema for mathematical operations
 */
export const MathOperationInputSchema = z.tuple([
  z.union([z.number(), z.string()]).describe('Left operand'),
  z.union([z.number(), z.string()]).describe('Right operand')
]);

export type MathOperationInput = z.infer<typeof MathOperationInputSchema>;

/**
 * Schema for unary operations
 */
export const UnaryOperationInputSchema = z.tuple([
  z.union([z.number(), z.string()]).describe('Operand')
]);

export type UnaryOperationInput = z.infer<typeof UnaryOperationInputSchema>;

// ============================================================================
// Enhanced String Literal Expression
// ============================================================================

/**
 * Enhanced string literal expression with template interpolation
 */
export class EnhancedStringLiteralExpression implements TypedExpressionImplementation<string> {
  public readonly name = 'string-literal';
  public readonly category = 'literal' as const;
  public readonly precedence = 20;
  public readonly associativity = 'none' as const;
  public readonly outputType = 'string' as const;

  public readonly analysisInfo = {
    isPure: false, // Template interpolation can access context
    canThrow: false,
    complexity: 'O(n)' as const,
    dependencies: ['context']
  };

  public readonly documentation: LLMDocumentation = {
    summary: 'Creates string literals with optional template interpolation support',
    parameters: [
      {
        name: 'value',
        type: 'string',
        description: 'String literal value, supports ${expression} and $variable interpolation',
        optional: false,
        examples: ['"hello"', '"Hello ${name}"', '"Count: $count"']
      }
    ],
    returns: {
      type: 'string',
      description: 'String with interpolated values',
      examples: ['hello', 'Hello John', 'Count: 5']
    },
    examples: [
      {
        title: 'Simple string literal',
        code: '"hello world"',
        explanation: 'Creates a simple string literal',
        output: 'hello world'
      },
      {
        title: 'Template interpolation',
        code: '"Hello ${name}"',
        explanation: 'String with variable interpolation',
        output: 'Hello John'
      }
    ],
    seeAlso: ['template', 'interpolation', 'variables'],
    tags: ['literal', 'string', 'template', 'interpolation']
  };

  async evaluate(context: TypedExecutionContext, value: string): Promise<EvaluationResult<string>> {
    try {
      if (typeof value !== 'string') {
        return {
          success: false,
          error: {
            name: 'StringLiteralError',
            message: 'String literal must be a string',
            code: 'INVALID_STRING_TYPE',
            suggestions: ['Provide a string value']
          },
          type: 'error'
        };
      }

      // Handle template literal interpolation
      let result = value;
      if (value.includes('${') || value.includes('$')) {
        result = this.interpolateString(value, context);
      }

      return {
        success: true,
        value: result,
        type: 'string'
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'StringLiteralError',
          message: `String literal evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
          code: 'STRING_LITERAL_FAILED',
          suggestions: ['Check template syntax', 'Verify variable names']
        },
        type: 'error'
      };
    }
  }

  private interpolateString(template: string, context: TypedExecutionContext): string {
    // Handle simple $variable interpolation
    let result = template.replace(/\$([a-zA-Z0-9_$][a-zA-Z0-9_.$]*)/g, (match, varName) => {
      try {
        // Handle numeric literals like $1, $2, $42, etc.
        if (/^\d+$/.test(varName)) {
          return varName;
        }
        
        if (varName.includes('.')) {
          const parts = varName.split('.');
          let value = this.resolveVariable(parts[0], context);
          
          for (let i = 1; i < parts.length; i++) {
            if (value == null) break;
            value = (value as any)[parts[i]];
          }
          
          return value !== undefined ? String(value) : `[${varName}]`;
        }
        
        const value = this.resolveVariable(varName, context);
        return value !== undefined ? String(value) : `[${varName}]`;
      } catch (error) {
        return '';
      }
    });
    
    // Handle ${expression} interpolation  
    result = result.replace(/\$\{([^}]+)\}/g, (match, expression) => {
      try {
        const expr = expression.trim();
        if (/^\d+$/.test(expr)) {
          return expr;
        }
        
        if (/^[a-zA-Z_$][a-zA-Z0-9_.$]*$/.test(expr)) {
          const varName = expr;
          if (varName.includes('.')) {
            const parts = varName.split('.');
            let value = this.resolveVariable(parts[0], context);
            
            for (let i = 1; i < parts.length; i++) {
              if (value == null) break;
              value = (value as any)[parts[i]];
            }
            
            return value !== undefined ? String(value) : `[${varName}]`;
          }
          
          const value = this.resolveVariable(varName, context);
          return value !== undefined ? String(value) : `[${varName}]`;
        }
        
        return `[${expression}]`;
      } catch (error) {
        return '';
      }
    });
    
    return result;
  }

  private resolveVariable(varName: string, context: TypedExecutionContext): any {
    if (context.locals?.has(varName)) {
      return context.locals.get(varName);
    }
    
    if (varName === 'me' && context.me) return context.me;
    if (varName === 'you' && context.you) return context.you;
    if (varName === 'it' && context.it) return context.it;
    if (varName === 'result' && context.result) return context.result;
    
    if (typeof window !== 'undefined' && varName === 'window') {
      return window;
    }
    
    if (context.globals?.has(varName)) {
      return context.globals.get(varName);
    }
    
    return undefined;
  }
}

// ============================================================================
// Enhanced Number Literal Expression
// ============================================================================

/**
 * Enhanced number literal expression with validation
 */
export class EnhancedNumberLiteralExpression implements TypedExpressionImplementation<number> {
  public readonly name = 'number-literal';
  public readonly category = 'literal' as const;
  public readonly precedence = 20;
  public readonly associativity = 'none' as const;
  public readonly outputType = 'number' as const;

  public readonly analysisInfo = {
    isPure: true,
    canThrow: false,
    complexity: 'O(1)' as const,
    dependencies: []
  };

  public readonly documentation: LLMDocumentation = {
    summary: 'Creates number literals with comprehensive validation',
    parameters: [
      {
        name: 'value',
        type: 'number',
        description: 'Numeric value',
        optional: false,
        examples: ['42', '3.14159', '-10', '0']
      }
    ],
    returns: {
      type: 'number',
      description: 'Validated numeric value',
      examples: [42, 3.14159, -10, 0]
    },
    examples: [
      {
        title: 'Integer literal',
        code: '42',
        explanation: 'Creates an integer literal',
        output: 42
      },
      {
        title: 'Float literal',
        code: '3.14159',
        explanation: 'Creates a floating-point literal',
        output: 3.14159
      }
    ],
    seeAlso: ['integer', 'float', 'decimal'],
    tags: ['literal', 'number', 'integer', 'float']
  };

  async evaluate(context: TypedExecutionContext, value: number): Promise<EvaluationResult<number>> {
    try {
      if (typeof value !== 'number') {
        return {
          success: false,
          error: {
            name: 'NumberLiteralError',
            message: 'Number literal must be a number',
            code: 'INVALID_NUMBER_TYPE',
            suggestions: ['Provide a numeric value']
          },
          type: 'error'
        };
      }
      
      if (!isFinite(value)) {
        return {
          success: false,
          error: {
            name: 'NumberLiteralError',
            message: 'Number literal must be finite',
            code: 'INFINITE_NUMBER',
            suggestions: ['Provide a finite number', 'Avoid division by zero']
          },
          type: 'error'
        };
      }
      
      return {
        success: true,
        value: value,
        type: 'number'
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'NumberLiteralError',
          message: `Number literal evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
          code: 'NUMBER_LITERAL_FAILED',
          suggestions: ['Check numeric format']
        },
        type: 'error'
      };
    }
  }
}

// ============================================================================
// Enhanced Boolean Literal Expression
// ============================================================================

/**
 * Enhanced boolean literal expression
 */
export class EnhancedBooleanLiteralExpression implements TypedExpressionImplementation<boolean> {
  public readonly name = 'boolean-literal';
  public readonly category = 'literal' as const;
  public readonly precedence = 20;
  public readonly associativity = 'none' as const;
  public readonly outputType = 'boolean' as const;

  public readonly analysisInfo = {
    isPure: true,
    canThrow: false,
    complexity: 'O(1)' as const,
    dependencies: []
  };

  public readonly documentation: LLMDocumentation = {
    summary: 'Creates boolean literals with type validation',
    parameters: [
      {
        name: 'value',
        type: 'boolean',
        description: 'Boolean value',
        optional: false,
        examples: ['true', 'false']
      }
    ],
    returns: {
      type: 'boolean',
      description: 'Boolean value',
      examples: [true, false]
    },
    examples: [
      {
        title: 'True literal',
        code: 'true',
        explanation: 'Creates true boolean literal',
        output: true
      },
      {
        title: 'False literal',
        code: 'false',
        explanation: 'Creates false boolean literal',
        output: false
      }
    ],
    seeAlso: ['logical', 'condition'],
    tags: ['literal', 'boolean', 'true', 'false']
  };

  async evaluate(context: TypedExecutionContext, value: boolean): Promise<EvaluationResult<boolean>> {
    try {
      if (typeof value !== 'boolean') {
        return {
          success: false,
          error: {
            name: 'BooleanLiteralError',
            message: 'Boolean literal must be a boolean',
            code: 'INVALID_BOOLEAN_TYPE',
            suggestions: ['Provide true or false']
          },
          type: 'error'
        };
      }
      
      return {
        success: true,
        value: value,
        type: 'boolean'
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'BooleanLiteralError',
          message: `Boolean literal evaluation failed: ${error instanceof Error ? error.message : String(error)}`,
          code: 'BOOLEAN_LITERAL_FAILED',
          suggestions: ['Use true or false']
        },
        type: 'error'
      };
    }
  }
}

// ============================================================================
// Enhanced Addition Expression
// ============================================================================

/**
 * Enhanced addition expression with comprehensive type handling
 */
export class EnhancedAdditionExpression implements TypedExpressionImplementation<number> {
  public readonly name = 'addition';
  public readonly category = 'mathematical' as const;
  public readonly precedence = 6;
  public readonly associativity = 'left' as const;
  public readonly outputType = 'number' as const;

  public readonly analysisInfo = {
    isPure: true,
    canThrow: false,
    complexity: 'O(1)' as const,
    dependencies: []
  };

  public readonly documentation: LLMDocumentation = {
    summary: 'Performs addition with type coercion and validation',
    parameters: [
      {
        name: 'left',
        type: 'number',
        description: 'Left operand',
        optional: false,
        examples: ['5', '10.5', '"3"']
      },
      {
        name: 'right',
        type: 'number',
        description: 'Right operand',
        optional: false,
        examples: ['3', '2.7', '"7"']
      }
    ],
    returns: {
      type: 'number',
      description: 'Sum of left and right operands',
      examples: [8, 13.2, 10]
    },
    examples: [
      {
        title: 'Basic addition',
        code: '5 + 3',
        explanation: 'Add two numbers',
        output: 8
      },
      {
        title: 'String number addition',
        code: '"5" + "3"',
        explanation: 'Add string numbers with coercion',
        output: 8
      }
    ],
    seeAlso: ['subtraction', 'multiplication', 'division'],
    tags: ['mathematical', 'arithmetic', 'addition', 'operator']
  };

  async evaluate(_context: TypedExecutionContext, left: unknown, right: unknown): Promise<EvaluationResult<number>> {
    try {
      const leftNum = this.ensureNumber(left, 'Left operand');
      const rightNum = this.ensureNumber(right, 'Right operand');
      
      if (leftNum.success && rightNum.success) {
        return {
          success: true,
          value: leftNum.value + rightNum.value,
          type: 'number'
        };
      }
      
      return {
        success: false,
        error: {
          name: 'AdditionError',
          message: `Addition failed: ${!leftNum.success ? leftNum.error?.message : rightNum.error?.message}`,
          code: 'ADDITION_TYPE_ERROR',
          suggestions: ['Ensure operands are numeric', 'Check for null/undefined values']
        },
        type: 'error'
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'AdditionError',
          message: `Addition operation failed: ${error instanceof Error ? error.message : String(error)}`,
          code: 'ADDITION_FAILED',
          suggestions: ['Check operand values']
        },
        type: 'error'
      };
    }
  }

  private ensureNumber(value: unknown, context: string): EvaluationResult<number> {
    if (typeof value === 'number') {
      if (!isFinite(value)) {
        return {
          success: false,
          error: {
            name: 'NumberConversionError',
            message: `${context} must be a finite number`,
            code: 'INFINITE_NUMBER'
          },
          type: 'error'
        };
      }
      return { success: true, value, type: 'number' };
    }
    
    if (typeof value === 'string') {
      const num = parseFloat(value);
      if (isNaN(num)) {
        return {
          success: false,
          error: {
            name: 'NumberConversionError',
            message: `${context} cannot be converted to number: "${value}"`,
            code: 'INVALID_NUMBER_STRING'
          },
          type: 'error'
        };
      }
      return { success: true, value: num, type: 'number' };
    }
    
    if (typeof value === 'boolean') {
      return { success: true, value: value ? 1 : 0, type: 'number' };
    }
    
    if (value === null || value === undefined) {
      return { success: true, value: 0, type: 'number' };
    }
    
    return {
      success: false,
      error: {
        name: 'NumberConversionError',
        message: `${context} cannot be converted to number`,
        code: 'UNCONVERTIBLE_TYPE'
      },
      type: 'error'
    };
  }
}

// ============================================================================
// Enhanced Subtraction Expression
// ============================================================================

/**
 * Enhanced subtraction expression
 */
export class EnhancedSubtractionExpression implements TypedExpressionImplementation<number> {
  public readonly name = 'subtraction';
  public readonly category = 'mathematical' as const;
  public readonly precedence = 6;
  public readonly associativity = 'left' as const;
  public readonly outputType = 'number' as const;

  public readonly analysisInfo = {
    isPure: true,
    canThrow: false,
    complexity: 'O(1)' as const,
    dependencies: []
  };

  public readonly documentation: LLMDocumentation = {
    summary: 'Performs subtraction with type coercion and validation',
    parameters: [
      {
        name: 'left',
        type: 'number',
        description: 'Left operand (minuend)',
        optional: false,
        examples: ['10', '7.5', '"15"']
      },
      {
        name: 'right',
        type: 'number',
        description: 'Right operand (subtrahend)',
        optional: false,
        examples: ['3', '2.2', '"5"']
      }
    ],
    returns: {
      type: 'number',
      description: 'Difference of left minus right',
      examples: [7, 5.3, 10]
    },
    examples: [
      {
        title: 'Basic subtraction',
        code: '10 - 3',
        explanation: 'Subtract two numbers',
        output: 7
      }
    ],
    seeAlso: ['addition', 'multiplication', 'division'],
    tags: ['mathematical', 'arithmetic', 'subtraction', 'operator']
  };

  async evaluate(_context: TypedExecutionContext, left: unknown, right: unknown): Promise<EvaluationResult<number>> {
    const additionExpr = new EnhancedAdditionExpression();
    const leftResult = (additionExpr as any).ensureNumber(left, 'Left operand');
    const rightResult = (additionExpr as any).ensureNumber(right, 'Right operand');
    
    if (leftResult.success && rightResult.success) {
      return {
        success: true,
        value: leftResult.value - rightResult.value,
        type: 'number'
      };
    }
    
    return {
      success: false,
      error: {
        name: 'SubtractionError',
        message: `Subtraction failed: ${!leftResult.success ? leftResult.error?.message : rightResult.error?.message}`,
        code: 'SUBTRACTION_TYPE_ERROR',
        suggestions: ['Ensure operands are numeric', 'Check for null/undefined values']
      },
      type: 'error'
    };
  }
}

// ============================================================================
// Enhanced Multiplication Expression
// ============================================================================

/**
 * Enhanced multiplication expression
 */
export class EnhancedMultiplicationExpression implements TypedExpressionImplementation<number> {
  public readonly name = 'multiplication';
  public readonly category = 'mathematical' as const;
  public readonly precedence = 7;
  public readonly associativity = 'left' as const;
  public readonly outputType = 'number' as const;

  public readonly analysisInfo = {
    isPure: true,
    canThrow: false,
    complexity: 'O(1)' as const,
    dependencies: []
  };

  public readonly documentation: LLMDocumentation = {
    summary: 'Performs multiplication with type coercion and validation',
    parameters: [
      {
        name: 'left',
        type: 'number',
        description: 'Left operand (multiplicand)',
        optional: false,
        examples: ['5', '2.5', '"4"']
      },
      {
        name: 'right',
        type: 'number',
        description: 'Right operand (multiplier)',
        optional: false,
        examples: ['3', '1.5', '"6"']
      }
    ],
    returns: {
      type: 'number',
      description: 'Product of left times right',
      examples: [15, 3.75, 24]
    },
    examples: [
      {
        title: 'Basic multiplication',
        code: '5 * 3',
        explanation: 'Multiply two numbers',
        output: 15
      }
    ],
    seeAlso: ['addition', 'subtraction', 'division'],
    tags: ['mathematical', 'arithmetic', 'multiplication', 'operator']
  };

  async evaluate(_context: TypedExecutionContext, left: unknown, right: unknown): Promise<EvaluationResult<number>> {
    const additionExpr = new EnhancedAdditionExpression();
    const leftResult = (additionExpr as any).ensureNumber(left, 'Left operand');
    const rightResult = (additionExpr as any).ensureNumber(right, 'Right operand');
    
    if (leftResult.success && rightResult.success) {
      return {
        success: true,
        value: leftResult.value * rightResult.value,
        type: 'number'
      };
    }
    
    return {
      success: false,
      error: {
        name: 'MultiplicationError',
        message: `Multiplication failed: ${!leftResult.success ? leftResult.error?.message : rightResult.error?.message}`,
        code: 'MULTIPLICATION_TYPE_ERROR',
        suggestions: ['Ensure operands are numeric', 'Check for null/undefined values']
      },
      type: 'error'
    };
  }
}

// ============================================================================
// Enhanced Division Expression
// ============================================================================

/**
 * Enhanced division expression with zero division protection
 */
export class EnhancedDivisionExpression implements TypedExpressionImplementation<number> {
  public readonly name = 'division';
  public readonly category = 'mathematical' as const;
  public readonly precedence = 7;
  public readonly associativity = 'left' as const;
  public readonly outputType = 'number' as const;

  public readonly analysisInfo = {
    isPure: true,
    canThrow: true, // Can throw on division by zero
    complexity: 'O(1)' as const,
    dependencies: []
  };

  public readonly documentation: LLMDocumentation = {
    summary: 'Performs division with zero-division protection and type coercion',
    parameters: [
      {
        name: 'left',
        type: 'number',
        description: 'Left operand (dividend)',
        optional: false,
        examples: ['10', '15.6', '"20"']
      },
      {
        name: 'right',
        type: 'number',
        description: 'Right operand (divisor)',
        optional: false,
        examples: ['2', '3.2', '"4"']
      }
    ],
    returns: {
      type: 'number',
      description: 'Quotient of left divided by right',
      examples: [5, 4.875, 5]
    },
    examples: [
      {
        title: 'Basic division',
        code: '10 / 2',
        explanation: 'Divide two numbers',
        output: 5
      }
    ],
    seeAlso: ['addition', 'subtraction', 'multiplication', 'modulo'],
    tags: ['mathematical', 'arithmetic', 'division', 'operator']
  };

  async evaluate(_context: TypedExecutionContext, left: unknown, right: unknown): Promise<EvaluationResult<number>> {
    const additionExpr = new EnhancedAdditionExpression();
    const leftResult = (additionExpr as any).ensureNumber(left, 'Left operand');
    const rightResult = (additionExpr as any).ensureNumber(right, 'Right operand');
    
    if (!leftResult.success || !rightResult.success) {
      return {
        success: false,
        error: {
          name: 'DivisionError',
          message: `Division failed: ${!leftResult.success ? leftResult.error?.message : rightResult.error?.message}`,
          code: 'DIVISION_TYPE_ERROR',
          suggestions: ['Ensure operands are numeric', 'Check for null/undefined values']
        },
        type: 'error'
      };
    }
    
    if (rightResult.value === 0) {
      return {
        success: false,
        error: {
          name: 'DivisionError',
          message: 'Division by zero',
          code: 'DIVISION_BY_ZERO',
          suggestions: ['Ensure divisor is not zero', 'Add zero check before division']
        },
        type: 'error'
      };
    }
    
    return {
      success: true,
      value: leftResult.value / rightResult.value,
      type: 'number'
    };
  }
}

// ============================================================================
// Enhanced Parentheses Expression
// ============================================================================

/**
 * Enhanced parentheses expression for grouping
 */
export class EnhancedParenthesesExpression implements TypedExpressionImplementation<HyperScriptValue> {
  public readonly name = 'parentheses';
  public readonly category = 'grouping' as const;
  public readonly precedence = 20;
  public readonly associativity = 'none' as const;
  public readonly outputType = 'unknown' as const;

  public readonly analysisInfo = {
    isPure: true,
    canThrow: false,
    complexity: 'O(1)' as const,
    dependencies: []
  };

  public readonly documentation: LLMDocumentation = {
    summary: 'Groups expressions and preserves evaluation order',
    parameters: [
      {
        name: 'expression',
        type: 'unknown',
        description: 'Expression to group',
        optional: false,
        examples: ['5 + 3', 'function()', 'variable']
      }
    ],
    returns: {
      type: 'unknown',
      description: 'Result of inner expression unchanged',
      examples: [8, 'result', 42]
    },
    examples: [
      {
        title: 'Mathematical grouping',
        code: '(5 + 3) * 2',
        explanation: 'Group addition before multiplication',
        output: 16
      }
    ],
    seeAlso: ['precedence', 'order-of-operations'],
    tags: ['grouping', 'parentheses', 'precedence', 'order']
  };

  async evaluate(_context: TypedExecutionContext, expression: HyperScriptValue): Promise<EvaluationResult<HyperScriptValue>> {
    return {
      success: true,
      value: expression,
      type: typeof expression as any
    };
  }
}

// ============================================================================
// Convenience Exports
// ============================================================================

/**
 * Enhanced special expressions registry
 */
export const enhancedSpecialExpressions = {
  'string-literal': new EnhancedStringLiteralExpression(),
  'number-literal': new EnhancedNumberLiteralExpression(),
  'boolean-literal': new EnhancedBooleanLiteralExpression(),
  'addition': new EnhancedAdditionExpression(),
  'subtraction': new EnhancedSubtractionExpression(),
  'multiplication': new EnhancedMultiplicationExpression(),
  'division': new EnhancedDivisionExpression(),
  'parentheses': new EnhancedParenthesesExpression()
} as const;

/**
 * Factory functions for creating enhanced special expressions
 */
export function createStringLiteralExpression(): EnhancedStringLiteralExpression {
  return new EnhancedStringLiteralExpression();
}

export function createNumberLiteralExpression(): EnhancedNumberLiteralExpression {
  return new EnhancedNumberLiteralExpression();
}

export function createBooleanLiteralExpression(): EnhancedBooleanLiteralExpression {
  return new EnhancedBooleanLiteralExpression();
}

export function createAdditionExpression(): EnhancedAdditionExpression {
  return new EnhancedAdditionExpression();
}

export function createSubtractionExpression(): EnhancedSubtractionExpression {
  return new EnhancedSubtractionExpression();
}

export function createMultiplicationExpression(): EnhancedMultiplicationExpression {
  return new EnhancedMultiplicationExpression();
}

export function createDivisionExpression(): EnhancedDivisionExpression {
  return new EnhancedDivisionExpression();
}

export function createParenthesesExpression(): EnhancedParenthesesExpression {
  return new EnhancedParenthesesExpression();
}

/**
 * Utility functions for special operations
 */
export async function evaluateStringLiteral(
  value: string,
  context: TypedExecutionContext
): Promise<EvaluationResult<string>> {
  const expression = new EnhancedStringLiteralExpression();
  return expression.evaluate(context, value);
}

export async function evaluateNumberLiteral(
  value: number,
  context: TypedExecutionContext
): Promise<EvaluationResult<number>> {
  const expression = new EnhancedNumberLiteralExpression();
  return expression.evaluate(context, value);
}

export async function evaluateAddition(
  left: unknown,
  right: unknown,
  context: TypedExecutionContext
): Promise<EvaluationResult<number>> {
  const expression = new EnhancedAdditionExpression();
  return expression.evaluate(context, left, right);
}

export async function evaluateDivision(
  left: unknown,
  right: unknown,
  context: TypedExecutionContext
): Promise<EvaluationResult<number>> {
  const expression = new EnhancedDivisionExpression();
  return expression.evaluate(context, left, right);
}

export default enhancedSpecialExpressions;