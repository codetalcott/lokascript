#!/usr/bin/env node

// Simple test to debug the template executor
import { TemplateExecutor } from './src/commands/templates/template-executor.js';
import { TemplateCompiler } from './src/commands/templates/template-compiler.js';

const executor = new TemplateExecutor();
const compiler = new TemplateCompiler();

const template = `<div>Hello \${name}!</div>`;
const compiled = compiler.compileTemplate(template);

console.log('Compiled:', compiled);

const context = {
  me: null,
  it: null,
  you: null,
  result: null,
  locals: new Map([['name', 'World']]),
  globals: new Map(),
  meta: { __ht_template_result: [] }
};

try {
  const result = await executor.executeTemplate(compiled, context);
  console.log('Result:', result);
} catch (error) {
  console.error('Error:', error);
}