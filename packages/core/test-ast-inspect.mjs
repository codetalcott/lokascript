#!/usr/bin/env node
import { parse } from './dist/parser/parser.js';

// Test parsing "add .highlight to #target"
const code = 'add .highlight to #target';
const result = parse(code);

console.log('Parsing:', code);
console.log('\nAST:');
console.log(JSON.stringify(result.node, null, 2));
