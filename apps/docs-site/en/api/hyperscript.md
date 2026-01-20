# hyperscript Object

The main LokaScript API object.

## Import

```javascript
import { hyperscript } from '@lokascript/core';
```

Or use the global when loaded via CDN:

```javascript
window.lokascript; // or window.hyperscript
```

## Core Methods

### `eval(code, context?, options?)`

Compile and execute hyperscript code in one call. **Recommended for most use cases.**

```javascript
// Simple expression
const sum = await hyperscript.eval('5 + 3');

// With element context
const button = document.getElementById('btn');
await hyperscript.eval('add .active to me', button);

// With options
await hyperscript.eval('toggle .visible', element, { language: 'en' });
```

**Parameters:**

- `code: string` - Hyperscript code to execute
- `context?: Element | ExecutionContext` - Element or execution context
- `options?: CompileOptions` - Compilation options

**Returns:** `Promise<unknown>` - The result of execution

---

### `compileSync(code, options?)`

Synchronously compile hyperscript code without executing.

```javascript
const result = hyperscript.compileSync('toggle .active on me');

if (result.ok) {
  console.log('Parser:', result.meta.parser); // 'semantic' or 'traditional'
  console.log('Time:', result.meta.timeMs, 'ms');
} else {
  console.error('Errors:', result.errors);
}
```

**Returns:** [`CompileResult`](#compileresult)

---

### `compileAsync(code, options?)`

Asynchronously compile code. Use when loading language modules.

```javascript
const result = await hyperscript.compileAsync('toggle .active', {
  language: 'ja',
});
```

**Returns:** `Promise<CompileResult>`

---

### `validate(code, options?)`

Check syntax without executing.

```javascript
const result = await hyperscript.validate('toggle .active on me');

if (result.valid) {
  console.log('Syntax OK');
} else {
  result.errors?.forEach(err => {
    console.error(`Line ${err.line}: ${err.message}`);
  });
}
```

**Returns:** `Promise<ValidateResult>`

---

### `createContext(element?, parent?)`

Create an execution context.

```javascript
// Basic context
const ctx = hyperscript.createContext(element);

// Child context inheriting from parent
const parentCtx = hyperscript.createContext();
parentCtx.globals?.set('theme', 'dark');

const childCtx = hyperscript.createContext(element, parentCtx);
// childCtx inherits parent's globals
```

**Returns:** [`ExecutionContext`](#executioncontext)

---

### `processNode(element)`

Process all `_="..."` attributes in an element and its descendants.

```javascript
// After dynamic HTML insertion
container.innerHTML = '<div _="on click log \'hello\'">New</div>';
hyperscript.processNode(container);
```

---

### `cleanup(element)`

Remove event listeners and observers from an element.

```javascript
hyperscript.cleanup(element);
```

---

### `destroy()`

Full runtime shutdown. Cleans up all elements and removes global handlers.

```javascript
hyperscript.destroy();
```

## Properties

### `version`

Current LokaScript version.

```javascript
console.log(hyperscript.version); // "1.0.0"
```

## Types

### `CompileResult`

```typescript
interface CompileResult {
  ok: boolean;
  ast?: ASTNode;
  errors?: CompileError[];
  meta: {
    parser: 'semantic' | 'traditional';
    confidence?: number; // 0-1 for semantic parser
    language: string;
    timeMs: number;
  };
}
```

### `CompileError`

```typescript
interface CompileError {
  message: string;
  line: number;
  column: number;
  suggestion?: string;
}
```

### `ExecutionContext`

```typescript
interface ExecutionContext {
  me: HTMLElement | null; // Current element
  it: any; // Previous result
  you: HTMLElement | null; // Target element
  result: any; // Explicit result
  locals?: Map<string, any>; // Local variables (:var)
  globals?: Map<string, any>; // Global variables
  event?: Event; // Current DOM event
  parent?: ExecutionContext; // Parent context
}
```

### `CompileOptions`

```typescript
interface CompileOptions {
  language?: string; // 'en', 'ja', 'es', etc.
  confidenceThreshold?: number; // Min confidence for semantic (0-1)
  traditional?: boolean; // Force traditional parser
}
```

## Debug API

### `debugControl`

```javascript
// Enable debug logging
hyperscript.debugControl.enable();

// Disable
hyperscript.debugControl.disable();

// Check status
hyperscript.debugControl.isEnabled();

// Get detailed status
hyperscript.debugControl.status();
```

Debug settings persist across page reloads via localStorage.

## Next Steps

- [compile()](/en/api/compile) - Compilation details
- [execute()](/en/api/execute) - Execution details
- [Commands](/en/api/commands/dom) - Command reference
