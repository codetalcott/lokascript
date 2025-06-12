#!/usr/bin/env node

// Quick debug script to see what parser outputs for failing test cases
import { parse } from './src/parser/parser.js';

const testCases = [
  'window.location.href', // chained property access
  'object.method(arg)', // method call
  'on click hide me', // event handler
  'hide #target', // command with target
  'put "hello" into #output', // put command
  'add .active', // add class command
  'wait 500ms', // wait command
  'closest form', // navigation
  'a = b = c', // assignment
  'on click if my value > 0 and my className contains active then hide me' // complex event handler
];

for (const testCase of testCases) {
  console.log(`\n=== Testing: "${testCase}" ===`);
  try {
    const result = parse(testCase);
    console.log('Success:', result.success);
    if (result.success) {
      console.log('AST:', JSON.stringify(result.node, null, 2));
    } else {
      console.log('Error:', result.error);
    }
  } catch (error) {
    console.log('Exception:', error.message);
  }
}
