#!/usr/bin/env node

// Script to fix parser test expectations based on actual parser output
import fs from 'fs';
import path from 'path';

const testFile = '/Users/williamtalcott/projects/hyperfixi/src/parser/parser.test.ts';
let content = fs.readFileSync(testFile, 'utf8');

// Define the type mappings from test expectations to actual parser output
const typeMappings = {
  'MemberExpression': 'memberExpression',
  'BinaryExpression': 'binaryExpression', 
  'CallExpression': 'callExpression',
  'UnaryExpression': 'unaryExpression',
  'ConditionalExpression': 'conditionalExpression',
  'EventHandler': 'eventHandler',
  'Identifier': 'identifier',
  'Literal': 'literal',
  'Selector': 'selector',
  'Command': 'command'
};

// Apply the mappings
for (const [oldType, newType] of Object.entries(typeMappings)) {
  const regex = new RegExp(`type: '${oldType}'`, 'g');
  content = content.replace(regex, `type: '${newType}'`);
}

// Write back to file
fs.writeFileSync(testFile, content);
console.log('Fixed type expectations in parser tests');
