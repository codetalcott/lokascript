#!/usr/bin/env node

/**
 * Quick test runner for specific _hyperscript tests against HyperFixi
 * This directly executes test expressions rather than trying to parse complex test files
 */

import { evalHyperScript } from '../dist/src/compatibility/eval-hyperscript.js';

class QuickTestRunner {
  constructor() {
    this.results = { passed: 0, failed: 0, total: 0 };
  }

  async runTest(name, expression, context, expectedResult) {
    this.results.total++;
    
    try {
      const result = await evalHyperScript(expression, context);
      
      // Handle expected result comparison
      let passed = false;
      if (typeof expectedResult === 'function') {
        passed = expectedResult(result);
      } else {
        passed = result === expectedResult;
      }
      
      if (passed) {
        console.log(`✅ ${name}: ${expression} => ${JSON.stringify(result)}`);
        this.results.passed++;
      } else {
        console.log(`❌ ${name}: ${expression} => ${JSON.stringify(result)} (expected ${JSON.stringify(expectedResult)})`);
        this.results.failed++;
      }
    } catch (error) {
      console.log(`❌ ${name}: ${expression} => ERROR: ${error.message}`);
      this.results.failed++;
    }
  }

  async runErrorTest(name, expression, context) {
    this.results.total++;
    
    try {
      await evalHyperScript(expression, context);
      console.log(`❌ ${name}: ${expression} => Should have thrown error but didn't`);
      this.results.failed++;
    } catch (error) {
      console.log(`✅ ${name}: ${expression} => Correctly threw: ${error.message}`);
      this.results.passed++;
    }
  }

  printSummary() {
    console.log(`\n📊 Results: ${this.results.passed}/${this.results.total} passed (${Math.round(this.results.passed/this.results.total*100)}%)`);
  }

  async runAllTests() {
    console.log('🧪 Running specific _hyperscript expression tests against HyperFixi\n');

    // String tests (from strings.js)
    await this.runTest('String literal double quotes', '"foo"', {}, 'foo');
    await this.runTest('String literal single quotes', "'foo'", {}, 'foo');
    await this.runTest('String with quotes', '"fo\'o"', {}, "fo'o");

    // Math operator tests (from mathOperator.js)
    await this.runTest('Addition', '1 + 1', {}, 2);
    await this.runTest('String concatenation', '"a" + "b"', {}, 'ab');
    await this.runTest('Subtraction', '5 - 2', {}, 3);
    await this.runTest('Multiplication', '3 * 4', {}, 12);
    await this.runTest('Division', '8 / 2', {}, 4);
    await this.runTest('Modulo', '7 mod 3', {}, 1);
    
    // Precedence enforcement tests
    await this.runErrorTest('Mixed operators error', '1 + 2 * 3');
    await this.runTest('Parenthesized mixed operators', '1 + (2 * 3)', {}, 7);

    // Boolean tests (from boolean.js)  
    await this.runTest('True literal', 'true', {}, true);
    await this.runTest('False literal', 'false', {}, false);

    // Logical operator tests (from logicalOperator.js)
    await this.runTest('And operation', 'true and false', {}, false);
    await this.runTest('Or operation', 'true or false', {}, true);
    await this.runTest('And operation true', 'true and true', {}, true);
    await this.runTest('Or operation false', 'false or false', {}, false);

    // Comparison tests (from comparisonOperator.js)
    await this.runTest('Less than true', '1 < 2', {}, true);
    await this.runTest('Less than false', '2 < 1', {}, false);
    await this.runTest('Greater than true', '2 > 1', {}, true);
    await this.runTest('Greater than false', '1 > 2', {}, false);
    await this.runTest('Equal', '1 == 1', {}, true);
    await this.runTest('Not equal', '1 != 2', {}, true);
    await this.runTest('Is equal', '1 is 1', {}, true);
    await this.runTest('Is not equal', '1 is not 2', {}, true);

    // Possessive expression tests (from possessiveExpression.js)
    await this.runTest(
      'Basic property access', 
      "foo's bar", 
      { locals: { foo: { bar: 'baz' } } }, 
      'baz'
    );
    
    await this.runTest(
      'Null safe property access', 
      "foo's bar", 
      {}, 
      undefined
    );

    await this.runTest(
      'My property access', 
      'my value', 
      { me: { value: 42 } }, 
      42
    );

    await this.runTest(
      'My property null safe', 
      'my value', 
      {}, 
      undefined
    );

    await this.runTest(
      'Its property access', 
      'its result', 
      { result: { result: 'success' } }, 
      'success'
    );

    await this.runTest(
      'Its property null safe', 
      'its result', 
      {}, 
      undefined
    );

    // Type conversion tests (from asExpression.js)
    await this.runTest('String to Int', '"123" as Int', {}, 123);
    await this.runTest('String to Float', '"12.34" as Float', {}, 12.34);
    await this.runTest('Number to String', '123 as String', {}, '123');
    await this.runTest('Value to JSON', '{a: 1} as JSON', {}, '{"a":1}');

    // Property access tests (from propertyAccess.js)  
    await this.runTest(
      'Basic property access dot notation',
      'obj.prop',
      { locals: { obj: { prop: 'value' } } },
      'value'
    );

    await this.runTest(
      'Property access null safe',
      'obj.prop', 
      {},
      undefined
    );

    this.printSummary();
  }
}

// Run the tests
const runner = new QuickTestRunner();
runner.runAllTests().catch(console.error);