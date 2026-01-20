# compile()

Compile hyperscript code to an AST without executing it.

## Methods

### `compileSync(code, options?)`

Synchronous compilation. Use when you don't need async language loading.

```javascript
import { hyperscript } from '@lokascript/core';

const result = hyperscript.compileSync('toggle .active on me');

if (result.ok) {
  console.log('AST:', result.ast);
  console.log('Parser used:', result.meta.parser);
} else {
  console.error('Errors:', result.errors);
}
```

### `compileAsync(code, options?)`

Asynchronous compilation. Use when:

- Loading language modules dynamically
- Using multilingual features

```javascript
const result = await hyperscript.compileAsync('トグル .active', {
  language: 'ja',
});
```

## Options

```typescript
interface CompileOptions {
  // Language code (en, ja, es, ko, zh, etc.)
  language?: string;

  // Minimum confidence for semantic parser (0-1)
  // If confidence is below this, falls back to traditional parser
  confidenceThreshold?: number;

  // Force traditional parser (skip semantic)
  traditional?: boolean;
}
```

### Examples

```javascript
// Default (English, semantic parser)
hyperscript.compileSync('toggle .active');

// Force traditional parser
hyperscript.compileSync('toggle .active', { traditional: true });

// Japanese
await hyperscript.compileAsync('トグル .active', { language: 'ja' });

// High confidence threshold
hyperscript.compileSync('toggle .active', { confidenceThreshold: 0.9 });
```

## Result

```typescript
interface CompileResult {
  // Whether compilation succeeded
  ok: boolean;

  // Compiled AST (when ok is true)
  ast?: ASTNode;

  // Compilation errors (when ok is false)
  errors?: CompileError[];

  // Metadata about the compilation
  meta: {
    // Which parser was used
    parser: 'semantic' | 'traditional';

    // Confidence score (semantic parser only)
    confidence?: number;

    // Language used
    language: string;

    // Compilation time
    timeMs: number;

    // Whether direct semantic-to-AST path was taken
    directPath?: boolean;
  };
}
```

## Error Handling

```javascript
const result = hyperscript.compileSync('invalid @@ syntax');

if (!result.ok) {
  result.errors.forEach(error => {
    console.error(`Line ${error.line}, Col ${error.column}: ${error.message}`);

    if (error.suggestion) {
      console.log(`Suggestion: ${error.suggestion}`);
    }
  });
}
```

## Compile Once, Execute Many

For performance, compile once and reuse the AST:

```javascript
const result = hyperscript.compileSync('hide me then wait 500ms then show me');

if (result.ok) {
  // Execute on multiple elements
  for (const element of elements) {
    const ctx = hyperscript.createContext(element);
    await hyperscript.execute(result.ast, ctx);
  }
}
```

## Parser Selection

LokaScript has two parsers:

1. **Semantic Parser** - Fast, multilingual, handles common patterns
2. **Traditional Parser** - Complete, handles all edge cases

By default, the semantic parser is tried first. If confidence is low, it falls back to traditional.

```javascript
// Check which parser was used
const result = hyperscript.compileSync('toggle .active');
console.log(result.meta.parser); // 'semantic' or 'traditional'
console.log(result.meta.confidence); // e.g., 0.95
```

## Next Steps

- [execute()](/en/api/execute) - Running compiled code
- [hyperscript Object](/en/api/hyperscript) - Full API reference
- [Multilingual](/en/guide/multilingual) - Using other languages
