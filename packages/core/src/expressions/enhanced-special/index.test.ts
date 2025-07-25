/**
 * Enhanced Special Expression Tests
 * Comprehensive testing of special operations with TypeScript integration
 * Tests literals, mathematical operations, and utilities
 */

import { describe, test, expect, beforeEach } from 'vitest';
import { 
  EnhancedStringLiteralExpression,
  EnhancedNumberLiteralExpression,
  EnhancedBooleanLiteralExpression,
  EnhancedAdditionExpression,
  EnhancedSubtractionExpression,
  EnhancedMultiplicationExpression,
  EnhancedDivisionExpression,
  EnhancedParenthesesExpression,
  enhancedSpecialExpressions,
  evaluateStringLiteral,
  evaluateNumberLiteral,
  evaluateAddition,
  evaluateDivision
} from './index.js';
import type { TypedExecutionContext } from '../../types/enhanced-core.js';

// Mock context for testing
function createMockContext(): TypedExecutionContext {
  return {
    me: document.createElement('div'),
    you: document.createElement('button'),
    it: null,
    locals: new Map([
      ['name', 'John'],
      ['count', 5],
      ['user', { name: 'Alice', age: 30 }],
      ['x', 10],
      ['y', 3]
    ]),
    globals: new Map([
      ['PI', 3.14159],
      ['globalVar', 'global value']
    ]),
    result: null,
    meta: {
      startTime: Date.now(),
      commandStack: [],
      debugMode: false
    }
  };
}

describe('Enhanced String Literal Expression', () => {
  let expression: EnhancedStringLiteralExpression;
  let context: TypedExecutionContext;

  beforeEach(() => {
    expression = new EnhancedStringLiteralExpression();
    context = createMockContext();
  });

  describe('Basic String Literals', () => {
    test('creates simple string literal', async () => {
      const result = await expression.evaluate(context, 'hello world');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('hello world');
        expect(result.type).toBe('string');
      }
    });

    test('handles empty string', async () => {
      const result = await expression.evaluate(context, '');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('');
        expect(result.type).toBe('string');
      }
    });

    test('handles special characters', async () => {
      const result = await expression.evaluate(context, 'hello\nworld\t!');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('hello\nworld\t!');
      }
    });
  });

  describe('Template Interpolation', () => {
    test('interpolates simple variables', async () => {
      const result = await expression.evaluate(context, 'Hello $name');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('Hello John');
      }
    });

    test('interpolates with ${} syntax', async () => {
      const result = await expression.evaluate(context, 'Count: ${count}');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('Count: 5');
      }
    });

    test('interpolates property access', async () => {
      const result = await expression.evaluate(context, 'User: $user.name');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('User: Alice');
      }
    });

    test('handles undefined variables', async () => {
      const result = await expression.evaluate(context, 'Value: $undefined');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('Value: [undefined]');
      }
    });

    test('interpolates numeric literals in template', async () => {
      const result = await expression.evaluate(context, 'Number: $42');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('Number: 42');
      }
    });

    test('handles complex interpolation', async () => {
      const result = await expression.evaluate(context, 'Hello $name, count is ${count} and user is $user.name');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('Hello John, count is 5 and user is Alice');
      }
    });
  });

  describe('Error Handling', () => {
    test('handles non-string input', async () => {
      const result = await expression.evaluate(context, 123 as any);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_STRING_TYPE');
      }
    });
  });
});

describe('Enhanced Number Literal Expression', () => {
  let expression: EnhancedNumberLiteralExpression;
  let context: TypedExecutionContext;

  beforeEach(() => {
    expression = new EnhancedNumberLiteralExpression();
    context = createMockContext();
  });

  describe('Basic Number Literals', () => {
    test('creates integer literal', async () => {
      const result = await expression.evaluate(context, 42);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(42);
        expect(result.type).toBe('number');
      }
    });

    test('creates float literal', async () => {
      const result = await expression.evaluate(context, 3.14159);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(3.14159);
        expect(result.type).toBe('number');
      }
    });

    test('creates negative number', async () => {
      const result = await expression.evaluate(context, -10);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(-10);
      }
    });

    test('creates zero', async () => {
      const result = await expression.evaluate(context, 0);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(0);
      }
    });
  });

  describe('Error Handling', () => {
    test('handles non-number input', async () => {
      const result = await expression.evaluate(context, 'not a number' as any);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_NUMBER_TYPE');
      }
    });

    test('handles infinite numbers', async () => {
      const result = await expression.evaluate(context, Infinity);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INFINITE_NUMBER');
      }
    });

    test('handles NaN', async () => {
      const result = await expression.evaluate(context, NaN);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INFINITE_NUMBER');
      }
    });
  });
});

describe('Enhanced Boolean Literal Expression', () => {
  let expression: EnhancedBooleanLiteralExpression;
  let context: TypedExecutionContext;

  beforeEach(() => {
    expression = new EnhancedBooleanLiteralExpression();
    context = createMockContext();
  });

  describe('Basic Boolean Literals', () => {
    test('creates true literal', async () => {
      const result = await expression.evaluate(context, true);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(true);
        expect(result.type).toBe('boolean');
      }
    });

    test('creates false literal', async () => {
      const result = await expression.evaluate(context, false);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(false);
        expect(result.type).toBe('boolean');
      }
    });
  });

  describe('Error Handling', () => {
    test('handles non-boolean input', async () => {
      const result = await expression.evaluate(context, 'not boolean' as any);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_BOOLEAN_TYPE');
      }
    });
  });
});

describe('Enhanced Addition Expression', () => {
  let expression: EnhancedAdditionExpression;
  let context: TypedExecutionContext;

  beforeEach(() => {
    expression = new EnhancedAdditionExpression();
    context = createMockContext();
  });

  describe('Basic Addition', () => {
    test('adds two integers', async () => {
      const result = await expression.evaluate(context, 5, 3);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(8);
        expect(result.type).toBe('number');
      }
    });

    test('adds two floats', async () => {
      const result = await expression.evaluate(context, 2.5, 3.7);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeCloseTo(6.2);
      }
    });

    test('adds mixed integer and float', async () => {
      const result = await expression.evaluate(context, 5, 2.5);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(7.5);
      }
    });

    test('adds negative numbers', async () => {
      const result = await expression.evaluate(context, -5, 3);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(-2);
      }
    });
  });

  describe('Type Coercion', () => {
    test('converts string numbers', async () => {
      const result = await expression.evaluate(context, '5', '3');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(8);
      }
    });

    test('converts boolean values', async () => {
      const result = await expression.evaluate(context, true, false);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(1);
      }
    });

    test('converts null and undefined', async () => {
      const result = await expression.evaluate(context, null, undefined);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(0);
      }
    });
  });

  describe('Error Handling', () => {
    test('handles invalid string numbers', async () => {
      const result = await expression.evaluate(context, 'not a number', 5);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ADDITION_TYPE_ERROR');
      }
    });

    test('handles infinite numbers', async () => {
      const result = await expression.evaluate(context, Infinity, 5);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('ADDITION_TYPE_ERROR');
      }
    });
  });
});

describe('Enhanced Subtraction Expression', () => {
  let expression: EnhancedSubtractionExpression;
  let context: TypedExecutionContext;

  beforeEach(() => {
    expression = new EnhancedSubtractionExpression();
    context = createMockContext();
  });

  describe('Basic Subtraction', () => {
    test('subtracts two integers', async () => {
      const result = await expression.evaluate(context, 10, 3);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(7);
        expect(result.type).toBe('number');
      }
    });

    test('subtracts floats', async () => {
      const result = await expression.evaluate(context, 5.7, 2.2);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeCloseTo(3.5);
      }
    });

    test('handles negative results', async () => {
      const result = await expression.evaluate(context, 3, 10);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(-7);
      }
    });
  });

  describe('Type Coercion', () => {
    test('converts string numbers', async () => {
      const result = await expression.evaluate(context, '10', '3');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(7);
      }
    });
  });
});

describe('Enhanced Multiplication Expression', () => {
  let expression: EnhancedMultiplicationExpression;
  let context: TypedExecutionContext;

  beforeEach(() => {
    expression = new EnhancedMultiplicationExpression();
    context = createMockContext();
  });

  describe('Basic Multiplication', () => {
    test('multiplies two integers', async () => {
      const result = await expression.evaluate(context, 5, 3);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(15);
        expect(result.type).toBe('number');
      }
    });

    test('multiplies floats', async () => {
      const result = await expression.evaluate(context, 2.5, 4);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(10);
      }
    });

    test('handles zero multiplication', async () => {
      const result = await expression.evaluate(context, 5, 0);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(0);
      }
    });

    test('handles negative multiplication', async () => {
      const result = await expression.evaluate(context, -3, 4);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(-12);
      }
    });
  });
});

describe('Enhanced Division Expression', () => {
  let expression: EnhancedDivisionExpression;
  let context: TypedExecutionContext;

  beforeEach(() => {
    expression = new EnhancedDivisionExpression();
    context = createMockContext();
  });

  describe('Basic Division', () => {
    test('divides two integers', async () => {
      const result = await expression.evaluate(context, 10, 2);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(5);
        expect(result.type).toBe('number');
      }
    });

    test('divides with decimal result', async () => {
      const result = await expression.evaluate(context, 10, 3);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBeCloseTo(3.333333);
      }
    });

    test('handles negative division', async () => {
      const result = await expression.evaluate(context, -10, 2);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(-5);
      }
    });
  });

  describe('Division by Zero', () => {
    test('handles division by zero', async () => {
      const result = await expression.evaluate(context, 10, 0);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('DIVISION_BY_ZERO');
      }
    });

    test('handles division by zero with string', async () => {
      const result = await expression.evaluate(context, 10, '0');
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('DIVISION_BY_ZERO');
      }
    });
  });
});

describe('Enhanced Parentheses Expression', () => {
  let expression: EnhancedParenthesesExpression;
  let context: TypedExecutionContext;

  beforeEach(() => {
    expression = new EnhancedParenthesesExpression();
    context = createMockContext();
  });

  describe('Expression Grouping', () => {
    test('preserves number value', async () => {
      const result = await expression.evaluate(context, 42);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(42);
        expect(result.type).toBe('number');
      }
    });

    test('preserves string value', async () => {
      const result = await expression.evaluate(context, 'hello');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe('hello');
        expect(result.type).toBe('string');
      }
    });

    test('preserves boolean value', async () => {
      const result = await expression.evaluate(context, true);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(true);
        expect(result.type).toBe('boolean');
      }
    });

    test('preserves object value', async () => {
      const obj = { key: 'value' };
      const result = await expression.evaluate(context, obj);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(obj);
        expect(result.type).toBe('object');
      }
    });

    test('preserves null value', async () => {
      const result = await expression.evaluate(context, null);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value).toBe(null);
        expect(result.type).toBe('object');
      }
    });
  });
});

describe('Expression Registry', () => {
  test('exports all enhanced special expressions', () => {
    expect(enhancedSpecialExpressions['string-literal']).toBeInstanceOf(EnhancedStringLiteralExpression);
    expect(enhancedSpecialExpressions['number-literal']).toBeInstanceOf(EnhancedNumberLiteralExpression);
    expect(enhancedSpecialExpressions['boolean-literal']).toBeInstanceOf(EnhancedBooleanLiteralExpression);
    expect(enhancedSpecialExpressions['addition']).toBeInstanceOf(EnhancedAdditionExpression);
    expect(enhancedSpecialExpressions['subtraction']).toBeInstanceOf(EnhancedSubtractionExpression);
    expect(enhancedSpecialExpressions['multiplication']).toBeInstanceOf(EnhancedMultiplicationExpression);
    expect(enhancedSpecialExpressions['division']).toBeInstanceOf(EnhancedDivisionExpression);
    expect(enhancedSpecialExpressions['parentheses']).toBeInstanceOf(EnhancedParenthesesExpression);
  });
});

describe('Utility Functions', () => {
  let context: TypedExecutionContext;

  beforeEach(() => {
    context = createMockContext();
  });

  test('evaluateStringLiteral utility works', async () => {
    const result = await evaluateStringLiteral('Hello $name', context);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe('Hello John');
    }
  });

  test('evaluateNumberLiteral utility works', async () => {
    const result = await evaluateNumberLiteral(42, context);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(42);
    }
  });

  test('evaluateAddition utility works', async () => {
    const result = await evaluateAddition(5, 3, context);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(8);
    }
  });

  test('evaluateDivision utility works', async () => {
    const result = await evaluateDivision(10, 2, context);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.value).toBe(5);
    }
  });

  test('evaluateDivision handles division by zero', async () => {
    const result = await evaluateDivision(10, 0, context);
    
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.code).toBe('DIVISION_BY_ZERO');
    }
  });
});

describe('Performance Characteristics', () => {
  let context: TypedExecutionContext;

  beforeEach(() => {
    context = createMockContext();
  });

  test('handles many mathematical operations efficiently', async () => {
    const addExpr = new EnhancedAdditionExpression();
    const mulExpr = new EnhancedMultiplicationExpression();
    const operationCount = 1000;
    
    const startTime = performance.now();
    const promises = Array(operationCount).fill(0).map(async (_, i) => {
      const addResult = await addExpr.evaluate(context, i, i + 1);
      const mulResult = await mulExpr.evaluate(context, i, 2);
      return [addResult, mulResult];
    });
    const results = await Promise.all(promises);
    const endTime = performance.now();
    
    // All should succeed
    results.forEach(([addResult, mulResult]) => {
      expect(addResult.success).toBe(true);
      expect(mulResult.success).toBe(true);
    });
    
    // Should be very fast
    expect(endTime - startTime).toBeLessThan(100); // Less than 100ms for 2000 operations
  });

  test('handles many string interpolations efficiently', async () => {
    const expr = new EnhancedStringLiteralExpression();
    const interpolationCount = 500;
    
    const startTime = performance.now();
    const promises = Array(interpolationCount).fill(0).map((_, i) => 
      expr.evaluate(context, `Item ${i}: $name has count ${i}`)
    );
    const results = await Promise.all(promises);
    const endTime = performance.now();
    
    // All should succeed
    results.forEach(result => {
      expect(result.success).toBe(true);
    });
    
    // Should be reasonably fast
    expect(endTime - startTime).toBeLessThan(150); // Less than 150ms for 500 interpolations
  });

  test('handles division operations with error checking efficiently', async () => {
    const expr = new EnhancedDivisionExpression();
    const operationCount = 100;
    
    const startTime = performance.now();
    const promises = [];
    
    // Mix of valid operations and division by zero
    for (let i = 0; i < operationCount; i++) {
      const divisor = i % 10 === 0 ? 0 : i; // Every 10th operation divides by zero
      promises.push(expr.evaluate(context, i * 10, divisor));
    }
    
    const results = await Promise.all(promises);
    const endTime = performance.now();
    
    // Should have mix of success and failure
    const successes = results.filter(r => r.success).length;
    const failures = results.filter(r => !r.success).length;
    
    expect(successes).toBeGreaterThan(0);
    expect(failures).toBeGreaterThan(0);
    
    // Should be fast even with error handling
    expect(endTime - startTime).toBeLessThan(100); // Less than 100ms for 100 operations
  });
});