import { describe, it } from 'vitest';
import { parse } from './src/parser/parser.js';

describe('Debug Event Handler Parsing', () => {
  it('should debug simple event handler', () => {
    const result = parse('on click hide me');
    console.log('Simple event handler:', JSON.stringify(result, null, 2));
  });

  it('should debug event handler with selector', () => {
    const result = parse('on click from .button hide me');
    console.log('Event handler with selector:', JSON.stringify(result, null, 2));
  });

  it('should debug multiple commands', () => {
    const result = parse('on click hide me then show #result');
    console.log('Multiple commands:', JSON.stringify(result, null, 2));
  });

  it('should debug command with target', () => {
    const result = parse('hide #target');
    console.log('Command with target:', JSON.stringify(result, null, 2));
  });

  it('should debug wait command', () => {
    const result = parse('wait 500ms');
    console.log('Wait command:', JSON.stringify(result, null, 2));
  });

  it('should debug assignment', () => {
    const result = parse('a = b = c');
    console.log('Assignment:', JSON.stringify(result, null, 2));
  });

  it('should debug closest', () => {
    const result = parse('closest form');
    console.log('Closest:', JSON.stringify(result, null, 2));
  });
});
