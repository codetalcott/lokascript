const { parse } = require('./packages/core/dist/index.js');

console.log('Testing put command parsing...');

// Test 1: Simple put command
console.log('\n=== Test 1: Simple put command ===');
const result1 = parse('put "hello" into #content');
console.log('Parse result success:', result1.success);
if (result1.success) {
  console.log('AST node type:', result1.node?.type);
  console.log('Command name:', result1.node?.name);
  console.log('Arguments:', result1.node?.args?.map(arg => ({ 
    type: arg.type, 
    value: arg.value || arg.name,
    raw: arg.raw 
  })));
} else {
  console.log('Parse error:', result1.error?.message);
}

// Test 2: More complex put command
console.log('\n=== Test 2: Complex put command ===');
const result2 = parse('put the result into .target');
console.log('Parse result success:', result2.success);
if (result2.success) {
  console.log('AST node type:', result2.node?.type);
  console.log('Command name:', result2.node?.name);
  console.log('Arguments:', result2.node?.args?.map(arg => ({ 
    type: arg.type, 
    value: arg.value || arg.name,
    raw: arg.raw 
  })));
} else {
  console.log('Parse error:', result2.error?.message);
}

// Test 3: Set command
console.log('\n=== Test 3: Set command ===');
const result3 = parse('set myVar to "value"');
console.log('Parse result success:', result3.success);
if (result3.success) {
  console.log('AST node type:', result3.node?.type);
  console.log('Command name:', result3.node?.name);
  console.log('Arguments:', result3.node?.args?.map(arg => ({ 
    type: arg.type, 
    value: arg.value || arg.name,
    raw: arg.raw 
  })));
} else {
  console.log('Parse error:', result3.error?.message);
}