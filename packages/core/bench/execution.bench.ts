/**
 * Command Execution Performance Benchmarks
 *
 * Measures execution time for common hyperscript operations.
 * Uses vitest bench for statistical analysis.
 *
 * Run: npm run bench
 */

import { bench, describe, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';

// Setup DOM environment
let document: Document;
let compile: (code: string) => { ast?: unknown; success: boolean };
let execute: (ast: unknown, context?: unknown) => Promise<unknown>;

beforeAll(async () => {
  const dom = new JSDOM(
    `<!DOCTYPE html>
    <html>
      <body>
        <button id="button" class="btn">Click</button>
        <div id="container">
          <div class="item">Item 1</div>
          <div class="item">Item 2</div>
          <div class="item">Item 3</div>
        </div>
        <div id="output"></div>
        <input id="input" value="test" />
      </body>
    </html>`,
    { url: 'http://localhost/' }
  );
  document = dom.window.document;

  // Mock global document/window
  (globalThis as unknown as { document: Document }).document = document;
  (globalThis as unknown as { window: Window }).window = dom.window as unknown as Window;

  // Load hyperfixi
  const mod = await import('../src/index.js');
  compile = mod.compile;
  execute = mod.execute;
});

// =============================================================================
// Class Manipulation (target: < 0.1ms)
// =============================================================================

describe('Execute: Class Manipulation', () => {
  bench(
    'toggle class',
    async () => {
      const result = compile('toggle .active on #button');
      if (result.success && result.ast) {
        await execute(result.ast);
      }
    },
    { warmupIterations: 100, iterations: 1000 }
  );

  bench(
    'add class',
    async () => {
      const result = compile('add .highlight to #button');
      if (result.success && result.ast) {
        await execute(result.ast);
      }
      // Cleanup
      document.getElementById('button')?.classList.remove('highlight');
    },
    { warmupIterations: 100, iterations: 1000 }
  );

  bench(
    'remove class',
    async () => {
      // Setup
      document.getElementById('button')?.classList.add('temp');

      const result = compile('remove .temp from #button');
      if (result.success && result.ast) {
        await execute(result.ast);
      }
    },
    { warmupIterations: 100, iterations: 1000 }
  );

  bench(
    'toggle on multiple elements',
    async () => {
      const result = compile('toggle .selected on .item');
      if (result.success && result.ast) {
        await execute(result.ast);
      }
    },
    { warmupIterations: 100, iterations: 1000 }
  );
});

// =============================================================================
// Content Manipulation (target: < 0.2ms)
// =============================================================================

describe('Execute: Content Manipulation', () => {
  bench(
    'put text content',
    async () => {
      const result = compile("put 'Hello World' into #output");
      if (result.success && result.ast) {
        await execute(result.ast);
      }
    },
    { warmupIterations: 100, iterations: 1000 }
  );

  bench(
    'append content',
    async () => {
      const result = compile("append '<span>item</span>' to #output");
      if (result.success && result.ast) {
        await execute(result.ast);
      }
      // Cleanup
      const output = document.getElementById('output');
      if (output) output.innerHTML = '';
    },
    { warmupIterations: 50, iterations: 500 }
  );

  bench(
    'prepend content',
    async () => {
      const result = compile("prepend '<span>first</span>' to #output");
      if (result.success && result.ast) {
        await execute(result.ast);
      }
      // Cleanup
      const output = document.getElementById('output');
      if (output) output.innerHTML = '';
    },
    { warmupIterations: 50, iterations: 500 }
  );
});

// =============================================================================
// Variable Operations (target: < 0.1ms)
// =============================================================================

describe('Execute: Variable Operations', () => {
  bench(
    'set local variable',
    async () => {
      const result = compile('set :count to 42');
      if (result.success && result.ast) {
        await execute(result.ast);
      }
    },
    { warmupIterations: 100, iterations: 1000 }
  );

  bench(
    'arithmetic with variables',
    async () => {
      const result = compile('set :a to 10 then set :b to :a * 2 + 5');
      if (result.success && result.ast) {
        await execute(result.ast);
      }
    },
    { warmupIterations: 100, iterations: 1000 }
  );

  bench(
    'increment variable',
    async () => {
      const result = compile('set :n to 0 then increment :n');
      if (result.success && result.ast) {
        await execute(result.ast);
      }
    },
    { warmupIterations: 100, iterations: 1000 }
  );
});

// =============================================================================
// Visibility (target: < 0.1ms)
// =============================================================================

describe('Execute: Visibility', () => {
  bench(
    'hide element',
    async () => {
      const result = compile('hide #output');
      if (result.success && result.ast) {
        await execute(result.ast);
      }
      // Reset
      const output = document.getElementById('output');
      if (output) output.style.display = '';
    },
    { warmupIterations: 100, iterations: 1000 }
  );

  bench(
    'show element',
    async () => {
      const result = compile('show #output');
      if (result.success && result.ast) {
        await execute(result.ast);
      }
    },
    { warmupIterations: 100, iterations: 1000 }
  );
});

// =============================================================================
// Loop Performance (target: < 10ms for 100 iterations)
// =============================================================================

describe('Execute: Loops', () => {
  bench(
    'repeat 10 times',
    async () => {
      const result = compile('repeat 10 times toggle .temp on #button end');
      if (result.success && result.ast) {
        await execute(result.ast);
      }
    },
    { warmupIterations: 20, iterations: 100 }
  );

  bench(
    'for each on 3 items',
    async () => {
      const result = compile('for each el in .item toggle .processed on el end');
      if (result.success && result.ast) {
        await execute(result.ast);
      }
      // Cleanup
      document.querySelectorAll('.item').forEach((el) => {
        el.classList.remove('processed');
      });
    },
    { warmupIterations: 20, iterations: 100 }
  );
});
