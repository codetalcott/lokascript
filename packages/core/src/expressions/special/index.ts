/**
 * Special expressions for hyperscript
 * Handles literal values, calculations, and mathematical operations
 */

import type { ExecutionContext, ExpressionImplementation, EvaluationType } from '../../types/core.js';

// ============================================================================
// Literal Value Expressions
// ============================================================================

export const stringLiteralExpression: ExpressionImplementation = {
  name: 'stringLiteral',
  category: 'Literal',
  evaluatesTo: 'String',
  
  async evaluate(context: ExecutionContext, value: string): Promise<string> {
    if (typeof value !== 'string') {
      throw new Error('String literal must be a string');
    }
    
    // Handle template literal interpolation
    if (value.includes('${') || value.includes('$')) {
      return interpolateString(value, context);
    }
    
    return value;
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 1) {
      return 'string literal requires exactly one argument (value)';
    }
    if (typeof args[0] !== 'string') {
      return 'string literal value must be a string';
    }
    return null;
  }
};

export const numberLiteralExpression: ExpressionImplementation = {
  name: 'numberLiteral',
  category: 'Literal',
  evaluatesTo: 'Number',
  
  async evaluate(context: ExecutionContext, value: number): Promise<number> {
    if (typeof value !== 'number') {
      throw new Error('Number literal must be a number');
    }
    
    if (!isFinite(value)) {
      throw new Error('Number literal must be finite');
    }
    
    return value;
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 1) {
      return 'number literal requires exactly one argument (value)';
    }
    if (typeof args[0] !== 'number') {
      return 'number literal value must be a number';
    }
    if (!isFinite(args[0])) {
      return 'number literal value must be finite';
    }
    return null;
  }
};

export const booleanLiteralExpression: ExpressionImplementation = {
  name: 'booleanLiteral',
  category: 'Literal',
  evaluatesTo: 'Boolean',
  
  async evaluate(context: ExecutionContext, value: boolean): Promise<boolean> {
    if (typeof value !== 'boolean') {
      throw new Error('Boolean literal must be a boolean');
    }
    
    return value;
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 1) {
      return 'boolean literal requires exactly one argument (value)';
    }
    if (typeof args[0] !== 'boolean') {
      return 'boolean literal value must be a boolean';
    }
    return null;
  }
};

export const nullLiteralExpression: ExpressionImplementation = {
  name: 'nullLiteral',
  category: 'Literal',
  evaluatesTo: 'Null',
  
  async evaluate(context: ExecutionContext): Promise<null> {
    return null;
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 0) {
      return 'null literal takes no arguments';
    }
    return null;
  }
};

export const arrayLiteralExpression: ExpressionImplementation = {
  name: 'arrayLiteral',
  category: 'Literal',
  evaluatesTo: 'Array',
  
  async evaluate(context: ExecutionContext, ...elements: any[]): Promise<any[]> {
    // All elements are already evaluated when passed to this function
    return elements;
  },
  
  validate(args: any[]): string | null {
    // Array literals can have any number of elements
    return null;
  }
};

export const objectLiteralExpression: ExpressionImplementation = {
  name: 'objectLiteral',
  category: 'Literal',
  evaluatesTo: 'Object',
  
  async evaluate(context: ExecutionContext, properties: Record<string, any>): Promise<Record<string, any>> {
    if (typeof properties !== 'object' || properties === null || Array.isArray(properties)) {
      throw new Error('Object literal must be an object');
    }
    
    return { ...properties };
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 1) {
      return 'object literal requires exactly one argument (properties object)';
    }
    if (typeof args[0] !== 'object' || args[0] === null || Array.isArray(args[0])) {
      return 'object literal must be an object';
    }
    return null;
  }
};

// ============================================================================
// Mathematical Expressions
// ============================================================================

export const additionExpression: ExpressionImplementation = {
  name: 'addition',
  category: 'Mathematical',
  evaluatesTo: 'Number',
  operators: ['+'],
  precedence: 6,
  associativity: 'Left',
  
  async evaluate(context: ExecutionContext, left: any, right: any): Promise<number> {
    const leftNum = ensureNumber(left, 'Left operand');
    const rightNum = ensureNumber(right, 'Right operand');
    
    return leftNum + rightNum;
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 2) {
      return 'addition requires exactly two arguments (left, right)';
    }
    return null;
  }
};

export const subtractionExpression: ExpressionImplementation = {
  name: 'subtraction',
  category: 'Mathematical',
  evaluatesTo: 'Number',
  operators: ['-'],
  precedence: 6,
  associativity: 'Left',
  
  async evaluate(context: ExecutionContext, left: any, right: any): Promise<number> {
    const leftNum = ensureNumber(left, 'Left operand');
    const rightNum = ensureNumber(right, 'Right operand');
    
    return leftNum - rightNum;
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 2) {
      return 'subtraction requires exactly two arguments (left, right)';
    }
    return null;
  }
};

export const multiplicationExpression: ExpressionImplementation = {
  name: 'multiplication',
  category: 'Mathematical',
  evaluatesTo: 'Number',
  operators: ['*'],
  precedence: 7,
  associativity: 'Left',
  
  async evaluate(context: ExecutionContext, left: any, right: any): Promise<number> {
    const leftNum = ensureNumber(left, 'Left operand');
    const rightNum = ensureNumber(right, 'Right operand');
    
    return leftNum * rightNum;
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 2) {
      return 'multiplication requires exactly two arguments (left, right)';
    }
    return null;
  }
};

export const divisionExpression: ExpressionImplementation = {
  name: 'division',
  category: 'Mathematical',
  evaluatesTo: 'Number',
  operators: ['/'],
  precedence: 7,
  associativity: 'Left',
  
  async evaluate(context: ExecutionContext, left: any, right: any): Promise<number> {
    const leftNum = ensureNumber(left, 'Left operand');
    const rightNum = ensureNumber(right, 'Right operand');
    
    if (rightNum === 0) {
      throw new Error('Division by zero');
    }
    
    return leftNum / rightNum;
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 2) {
      return 'division requires exactly two arguments (left, right)';
    }
    return null;
  }
};

export const moduloExpression: ExpressionImplementation = {
  name: 'modulo',
  category: 'Mathematical',
  evaluatesTo: 'Number',
  operators: ['mod', '%'],
  precedence: 7,
  associativity: 'Left',
  
  async evaluate(context: ExecutionContext, left: any, right: any): Promise<number> {
    const leftNum = ensureNumber(left, 'Left operand');
    const rightNum = ensureNumber(right, 'Right operand');
    
    if (rightNum === 0) {
      throw new Error('Modulo by zero');
    }
    
    return leftNum % rightNum;
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 2) {
      return 'modulo requires exactly two arguments (left, right)';
    }
    return null;
  }
};

export const exponentiationExpression: ExpressionImplementation = {
  name: 'exponentiation',
  category: 'Mathematical',
  evaluatesTo: 'Number',
  operators: ['^', '**'],
  precedence: 8,
  associativity: 'Right',
  
  async evaluate(context: ExecutionContext, left: any, right: any): Promise<number> {
    const leftNum = ensureNumber(left, 'Left operand');
    const rightNum = ensureNumber(right, 'Right operand');
    
    return Math.pow(leftNum, rightNum);
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 2) {
      return 'exponentiation requires exactly two arguments (left, right)';
    }
    return null;
  }
};

// ============================================================================
// Unary Expressions
// ============================================================================

export const unaryMinusExpression: ExpressionImplementation = {
  name: 'unaryMinus',
  category: 'Mathematical',
  evaluatesTo: 'Number',
  operators: ['-'],
  precedence: 9,
  associativity: 'Right',
  
  async evaluate(context: ExecutionContext, operand: any): Promise<number> {
    const num = ensureNumber(operand, 'Operand');
    return -num;
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 1) {
      return 'unary minus requires exactly one argument (operand)';
    }
    return null;
  }
};

export const unaryPlusExpression: ExpressionImplementation = {
  name: 'unaryPlus',
  category: 'Mathematical',
  evaluatesTo: 'Number',
  operators: ['+'],
  precedence: 9,
  associativity: 'Right',
  
  async evaluate(context: ExecutionContext, operand: any): Promise<number> {
    const num = ensureNumber(operand, 'Operand');
    return +num;
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 1) {
      return 'unary plus requires exactly one argument (operand)';
    }
    return null;
  }
};

// ============================================================================
// Parenthesis Expression (For Grouping)
// ============================================================================

export const parenthesesExpression: ExpressionImplementation = {
  name: 'parentheses',
  category: 'Grouping',
  evaluatesTo: 'Any',
  operators: ['(', ')'],
  precedence: 10,
  
  async evaluate(context: ExecutionContext, expression: any): Promise<any> {
    // Parentheses just return the inner expression value unchanged
    return expression;
  },
  
  validate(args: any[]): string | null {
    if (args.length !== 1) {
      return 'parentheses require exactly one argument (expression)';
    }
    return null;
  }
};

// ============================================================================
// Helper Functions
// ============================================================================

function ensureNumber(value: any, context: string): number {
  if (typeof value === 'number') {
    if (!isFinite(value)) {
      throw new Error(`${context} must be a finite number`);
    }
    return value;
  }
  
  if (typeof value === 'string') {
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw new Error(`${context} cannot be converted to number: "${value}"`);
    }
    return num;
  }
  
  if (typeof value === 'boolean') {
    return value ? 1 : 0;
  }
  
  if (value === null || value === undefined) {
    return 0;
  }
  
  throw new Error(`${context} cannot be converted to number`);
}

function interpolateString(template: string, context: ExecutionContext): string {
  // Handle simple $variable interpolation
  let result = template.replace(/\$([a-zA-Z_][a-zA-Z0-9_]*)/g, (match, varName) => {
    // In a real implementation, this would look up variables from context
    // For now, return the variable name for testing
    return `[${varName}]`;
  });
  
  // Handle ${expression} interpolation  
  result = result.replace(/\$\{([^}]+)\}/g, (match, expression) => {
    // In a real implementation, this would evaluate the expression
    // For now, return the expression for testing
    return `[${expression}]`;
  });
  
  return result;
}

// ============================================================================
// Export all special expressions
// ============================================================================

export const specialExpressions = {
  stringLiteral: stringLiteralExpression,
  numberLiteral: numberLiteralExpression,
  booleanLiteral: booleanLiteralExpression,
  nullLiteral: nullLiteralExpression,
  arrayLiteral: arrayLiteralExpression,
  objectLiteral: objectLiteralExpression,
  addition: additionExpression,
  subtraction: subtractionExpression,
  multiplication: multiplicationExpression,
  division: divisionExpression,
  modulo: moduloExpression,
  exponentiation: exponentiationExpression,
  unaryMinus: unaryMinusExpression,
  unaryPlus: unaryPlusExpression,
  parentheses: parenthesesExpression,
} as const;

export type SpecialExpressionName = keyof typeof specialExpressions;

// Export helper functions for testing
export { ensureNumber, interpolateString };