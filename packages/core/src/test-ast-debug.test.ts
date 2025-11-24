import { describe, it } from 'vitest';
import { parse } from './parser/parser';

describe('AST Debug', () => {
  it('should show AST for add .highlight to #target', () => {
    const code = 'add .highlight to #target';
    const result = parse(code);

    console.log('\n=== Parsing:', code, '===');
    console.log(JSON.stringify(result.node, null, 2));
  });
});
