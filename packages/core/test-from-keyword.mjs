import { parse } from './src/parser/parser.ts';

console.log('Testing: toggle .active from me');
const result = parse('toggle .active from me');
console.log('Parse result:', JSON.stringify(result, null, 2));

if (!result.success) {
  console.log('Error:', result.error);
} else {
  console.log('Success! AST:', result.node);
}