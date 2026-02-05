# @lokascript/aot-compiler

Ahead-of-Time compiler for LokaScript/hyperscript. Transforms hyperscript to optimized JavaScript at build time, eliminating runtime parsing overhead and reducing bundle sizes.

## Features

- **Zero-cost parsing**: 100% of parsing happens at build time
- **Smaller bundles**: ~80% reduction by removing the runtime parser
- **Static analysis**: Enables optimization and dead code elimination
- **Tree-shaking**: Includes only commands actually used
- **Faster execution**: Direct function calls instead of registry lookups
- **Multilingual**: Supports 24 languages via semantic parser integration
- **Source maps**: Debug original hyperscript in browser devtools

## Installation

```bash
npm install @lokascript/aot-compiler
```

## Usage

### Programmatic API

```typescript
import { AOTCompiler, compileHyperscript } from '@lokascript/aot-compiler';

// Simple usage
const js = await compileHyperscript('on click toggle .active');

// Full compiler usage
const compiler = new AOTCompiler();

// Extract hyperscript from HTML
const scripts = compiler.extract(htmlSource, 'index.html');

// Compile all extracted scripts
const result = compiler.compile(scripts, { language: 'en' });

console.log(result.code);
// Output: JavaScript code with event handlers
```

### CLI

```bash
# Compile HTML files to JavaScript
lokascript-aot compile "src/**/*.html" --output dist

# Analyze hyperscript usage
lokascript-aot analyze "src/**/*.html" --json

# Extract hyperscript without compiling
lokascript-aot extract "src/**/*.html"

# Generate minimal runtime bundle
lokascript-aot bundle "src/**/*.html" --output dist/runtime.js
```

### Vite Plugin Integration

```typescript
// vite.config.ts
import { lokascriptAOT } from '@lokascript/vite-plugin';

export default {
  plugins: [
    lokascriptAOT({
      enabled: true,
      sourceMaps: true,
      languages: ['en', 'es', 'ja'],
    }),
  ],
};
```

## Example Output

**Input (HTML):**
```html
<button id="btn" _="on click toggle .active">Toggle</button>
```

**Generated JavaScript:**
```javascript
import { createContext } from '@lokascript/aot-compiler/runtime';

function _handler_click_toggle_a1b2(_event) {
  const _ctx = createContext(_event, this);
  _ctx.me.classList.toggle('active');
}

document.getElementById('btn').addEventListener('click', _handler_click_toggle_a1b2);
```

## Supported Features

### Commands

| Command | Status | Notes |
|---------|--------|-------|
| toggle | Full | classList.toggle() |
| add | Full | classList.add() or DOM |
| remove | Full | classList.remove() or DOM |
| set | Full | Property/attribute assignment |
| put | Full | innerHTML/textContent |
| show/hide | Full | display style |
| focus/blur | Full | Element methods |
| log | Full | console.log |
| wait | Full | setTimeout promise |
| fetch | Full | Native fetch API |
| send/trigger | Full | dispatchEvent |
| increment/decrement | Full | Variable manipulation |
| halt/exit | Full | Control flow |
| return | Full | Return statement |
| if/else | Full | Conditionals |
| repeat | Full | For loops |
| for each | Full | Iteration |
| while | Full | While loops |

### Expressions

| Expression | Status |
|------------|--------|
| Literals | Full |
| Selectors (#id, .class) | Full |
| Context vars (me, you, it) | Full |
| Local vars (:var) | Full |
| Global vars ($var, ::var) | Full |
| Binary operators | Full |
| Possessive ('s) | Full |
| Positional (first, last, next, previous, closest, parent) | Full |
| Method calls | Full |

### Event Modifiers

| Modifier | Status |
|----------|--------|
| .prevent | Full |
| .stop | Full |
| .once | Full |
| .passive | Full |
| .capture | Full |
| .debounce(N) | Full |
| .throttle(N) | Full |

## Optimization Passes

The compiler includes several optimization passes:

1. **Constant Folding**: Evaluates compile-time constants
   ```hyperscript
   set :x to 5 + 3  →  set :x to 8
   ```

2. **Selector Caching**: Caches repeated selector lookups
   ```hyperscript
   add .a to #btn then remove .b from #btn
   →
   const _sel = document.getElementById('btn');
   _sel.classList.add('a');
   _sel.classList.remove('b');
   ```

3. **Dead Code Elimination**: Removes unreachable code
   ```hyperscript
   halt then log "never runs"  →  halt
   ```

4. **Loop Unrolling**: Unrolls small fixed-count loops
   ```hyperscript
   repeat 3 times add .a end
   →
   add .a; add .a; add .a;
   ```

## Runtime

The AOT runtime is a minimal (~3KB) set of helpers that cannot be inlined:

```typescript
import {
  createContext,  // Execution context
  toggle,         // Class/attribute toggle
  debounce,       // Function debouncing
  throttle,       // Function throttling
  wait,           // Promise-based delay
  send,           // Custom event dispatch
  fetchJSON,      // Fetch helper
  globals,        // Global variable store
} from '@lokascript/aot-compiler/runtime';
```

## Configuration

```typescript
interface CompileOptions {
  // Language code (ISO 639-1). Defaults to 'en'.
  language?: string;

  // Confidence threshold for semantic parsing (0-1).
  confidenceThreshold?: number;

  // Enable debug logging
  debug?: boolean;

  // Optimization level: 0 = none, 1 = basic, 2 = full
  optimizationLevel?: 0 | 1 | 2;

  // Code generation options
  codegen?: {
    target: 'es2020' | 'es2022' | 'esnext';
    mode: 'iife' | 'esm' | 'cjs';
    minify: boolean;
    sourceMaps: boolean;
  };
}
```

## Performance

| Metric | JIT (Runtime) | AOT (Build-time) | Improvement |
|--------|--------------|------------------|-------------|
| Initial parse time | 2-5ms per handler | 0ms | 100% |
| Bundle size (full) | 203 KB | ~40 KB | 80% |
| Bundle size (lite) | 7.3 KB | ~3 KB | 59% |
| Command dispatch | ~0.5ms | ~0.1ms | 80% |

## License

MIT
