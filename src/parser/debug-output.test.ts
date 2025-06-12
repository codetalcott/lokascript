/**
 * Debug test to inspect parser output
 */
import { describe, it, expect } from 'vitest';
import { parse } from './parser.js';

describe('Parser Debug', () => {
  it('should show actual parser output for chained property access', () => {
    const result = parse('window.location.href');
    console.log('CHAINED PROPERTY:', JSON.stringify(result.node, null, 2));
    expect(result.success).toBe(true);
  });

  it('should show actual parser output for method call', () => {
    const result = parse('object.method(arg)');
    console.log('METHOD CALL:', JSON.stringify(result.node, null, 2));
    expect(result.success).toBe(true);
  });

  it('should show actual parser output for event handler', () => {
    const result = parse('on click hide me');
    console.log('EVENT HANDLER:', JSON.stringify(result.node, null, 2));
    expect(result.success).toBe(true);
  });

  it('should show actual parser output for command', () => {
    const result = parse('hide #target');
    console.log('COMMAND:', JSON.stringify(result.node, null, 2));
    expect(result.success).toBe(true);
  });
});
