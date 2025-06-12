#!/usr/bin/env node

// Debug script to see actual parser output
import { parse } from './src/parser/parser.js';

console.log('=== Testing simple literal ===');
const result1 = parse('42');
console.log(JSON.stringify(result1, null, 2));

console.log('\n=== Testing binary expression ===');
const result2 = parse('5 + 3');
console.log(JSON.stringify(result2, null, 2));

console.log('\n=== Testing member expression ===');
const result3 = parse('me.value');
console.log(JSON.stringify(result3, null, 2));

console.log('\n=== Testing empty input ===');
const result4 = parse('');
console.log(JSON.stringify(result4, null, 2));
