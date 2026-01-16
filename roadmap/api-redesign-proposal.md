# HyperFixi API Redesign Proposal

## Current Issues

### 1. Mixed Sync/Async Compilation

```typescript
// Current: Two different patterns based on language
const result = hyperscript.compile(code); // sync
const result = await hyperscript.compileMultilingual(code, opts); // async
```

### 2. Confusing Method Names

```typescript
hyperscript.run(code); // compile + execute
hyperscript.execute(ast); // execute only
hyperscript.evaluate(code); // alias for run
hyperscript.parse(code); // throws on error (different from compile)
```

### 3. Context Creation Redundancy

```typescript
hyperscript.createContext(element);
hyperscript.createChildContext(parent, element); // Could be one method
```

### 4. Inconsistent Error Handling

```typescript
compile(code); // Returns { success, errors, ast }
parse(code); // Throws on error
```

---

## Proposed API Design

### Core Principles

1. **Async by default** - All compilation is async (multilingual support is fundamental)
2. **Clear naming** - Methods named for what they do, not aliases
3. **Consistent errors** - All methods return result objects, never throw for parse errors
4. **Minimal surface** - One way to do each thing

### New API Structure

```typescript
interface HyperscriptAPI {
  // ─────────────────────────────────────────────────────────────
  // COMPILATION
  // ─────────────────────────────────────────────────────────────

  /**
   * Compile hyperscript code to AST.
   * Handles all languages automatically based on options.language
   */
  compile(code: string, options?: CompileOptions): Promise<CompileResult>;

  /**
   * Synchronous compile for English-only (performance optimization).
   * Use compile() unless you specifically need sync behavior.
   */
  compileSync(code: string): CompileResult;

  // ─────────────────────────────────────────────────────────────
  // EXECUTION
  // ─────────────────────────────────────────────────────────────

  /**
   * Execute a compiled AST.
   */
  execute(ast: ASTNode, context?: ExecutionContext): Promise<unknown>;

  /**
   * Compile and execute in one step.
   * Convenience method equivalent to: compile() then execute()
   */
  eval(code: string, context?: ExecutionContext, options?: CompileOptions): Promise<unknown>;

  // ─────────────────────────────────────────────────────────────
  // CONTEXT
  // ─────────────────────────────────────────────────────────────

  /**
   * Create an execution context.
   * @param element - Element to bind as 'me'
   * @param parent - Optional parent context for scope inheritance
   */
  createContext(element?: HTMLElement | null, parent?: ExecutionContext): ExecutionContext;

  // ─────────────────────────────────────────────────────────────
  // DOM PROCESSING
  // ─────────────────────────────────────────────────────────────

  /**
   * Process element and descendants for hyperscript attributes.
   * Automatically detects language from element/document.
   */
  process(element: Element): void;

  // ─────────────────────────────────────────────────────────────
  // UTILITIES
  // ─────────────────────────────────────────────────────────────

  /**
   * Validate syntax without executing.
   */
  validate(code: string, options?: CompileOptions): Promise<ValidationResult>;

  /**
   * Global configuration
   */
  config: HyperscriptConfig;

  /**
   * Version string
   */
  version: string;
}
```

### Type Definitions

```typescript
interface CompileOptions {
  /** Language code (default: 'en'). Auto-detected from element if using process() */
  language?: string;

  /** Confidence threshold for semantic parsing (0-1, default: 0.5) */
  confidenceThreshold?: number;

  /** Force traditional parser (skip semantic analysis) */
  traditional?: boolean;
}

interface CompileResult {
  /** Whether compilation succeeded */
  ok: boolean;

  /** Compiled AST (present if ok=true) */
  ast?: ASTNode;

  /** Compilation errors (present if ok=false) */
  errors?: CompileError[];

  /** Metadata about the compilation */
  meta: {
    /** Which parser was used */
    parser: 'semantic' | 'traditional';
    /** Confidence score if semantic parser was used */
    confidence?: number;
    /** Language detected/used */
    language: string;
    /** Compilation time in ms */
    timeMs: number;
  };
}

interface CompileError {
  message: string;
  line: number;
  column: number;
  /** Suggestion for fixing the error */
  suggestion?: string;
}

interface ValidationResult {
  valid: boolean;
  errors?: CompileError[];
}

interface HyperscriptConfig {
  /** Enable/disable semantic parsing globally (default: true) */
  semantic: boolean;

  /** Default language (default: 'en') */
  language: string;

  /** Default confidence threshold (default: 0.5) */
  confidenceThreshold: number;
}
```

---

## Migration Path

### Before → After

```typescript
// ─────────────────────────────────────────────────────────────
// COMPILATION
// ─────────────────────────────────────────────────────────────

// Before: Two methods, one sync one async
const result = hyperscript.compile(code);
const result = await hyperscript.compileMultilingual(code, { language: 'ja' });

// After: One async method handles all cases
const result = await hyperscript.compile(code);
const result = await hyperscript.compile(code, { language: 'ja' });

// If you really need sync (English only, performance-critical):
const result = hyperscript.compileSync(code);

// ─────────────────────────────────────────────────────────────
// EXECUTION
// ─────────────────────────────────────────────────────────────

// Before: Three names for similar operations
await hyperscript.run(code, context);
await hyperscript.evaluate(code, context); // alias
await hyperscript.execute(ast, context);

// After: Clear distinction
await hyperscript.eval(code, context); // compile + execute
await hyperscript.execute(ast, context); // execute only

// ─────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────

// Before: Two methods
const ctx = hyperscript.createContext(element);
const child = hyperscript.createChildContext(parent, element);

// After: One method with optional parent
const ctx = hyperscript.createContext(element);
const child = hyperscript.createContext(element, parent);

// ─────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────

// Before: Two patterns
const isValid = hyperscript.isValidHyperscript(code); // boolean only
const ast = hyperscript.parse(code); // throws on error

// After: One method with full info
const result = await hyperscript.validate(code);
if (!result.valid) {
  console.log(result.errors);
}

// ─────────────────────────────────────────────────────────────
// DOM PROCESSING
// ─────────────────────────────────────────────────────────────

// Before: Two names
hyperscript.processNode(element);
hyperscript.process(element); // alias

// After: One name
hyperscript.process(element);
```

---

## Backward Compatibility

During transition, maintain aliases with deprecation warnings:

```typescript
export const hyperscript: HyperscriptAPI & DeprecatedAPI = {
  // New API
  compile,
  compileSync,
  execute,
  eval: evalCode,
  createContext,
  process,
  validate,
  config,
  version,

  // Deprecated (warn on use)
  /** @deprecated Use compile() instead */
  compileMultilingual: deprecated('compileMultilingual', 'compile', compileMultilingual),

  /** @deprecated Use eval() instead */
  run: deprecated('run', 'eval', evalCode),

  /** @deprecated Use eval() instead */
  evaluate: deprecated('evaluate', 'eval', evalCode),

  /** @deprecated Use process() instead */
  processNode: deprecated('processNode', 'process', process),

  /** @deprecated Use validate() instead */
  isValidHyperscript: deprecated('isValidHyperscript', 'validate', isValidHyperscript),

  /** @deprecated Use validate() and check errors instead */
  parse: deprecated('parse', 'compile', parse),

  /** @deprecated Use createContext(element, parent) instead */
  createChildContext: deprecated('createChildContext', 'createContext', createChildContext),
};

function deprecated<T extends Function>(oldName: string, newName: string, fn: T): T {
  return ((...args: unknown[]) => {
    console.warn(`hyperscript.${oldName}() is deprecated. Use hyperscript.${newName}() instead.`);
    return fn(...args);
  }) as unknown as T;
}
```

---

## Summary of Changes

| Current                                    | Proposed                     | Rationale                               |
| ------------------------------------------ | ---------------------------- | --------------------------------------- |
| `compile()` (sync)                         | `compileSync()`              | Explicit that it's sync-only            |
| `compileMultilingual()` (async)            | `compile()`                  | Default is async, handles all languages |
| `run()` / `evaluate()`                     | `eval()`                     | Single clear name                       |
| `execute()`                                | `execute()`                  | Unchanged - already clear               |
| `parse()` (throws)                         | Removed                      | Use `compile()` or `validate()`         |
| `isValidHyperscript()`                     | `validate()`                 | Returns errors, not just boolean        |
| `processNode()` / `process()`              | `process()`                  | Single name                             |
| `createContext()` + `createChildContext()` | `createContext(el, parent?)` | Combined with optional parent           |

### Benefits

1. **Simpler mental model** - Async by default, sync as explicit opt-in
2. **Fewer methods to learn** - 8 methods instead of 14
3. **Consistent patterns** - All return result objects, none throw for parse errors
4. **Better naming** - `eval()` is standard JS terminology for "evaluate code"
5. **Multilingual-first** - Language support is built into the default path
6. **Better errors** - `validate()` returns structured errors with suggestions

---

## Implementation Plan

### Phase 1: Add New Methods

- [ ] Add `compile()` async method that wraps current logic
- [ ] Add `compileSync()` as renamed current `compile()`
- [ ] Add `eval()` method
- [ ] Add `validate()` method
- [ ] Update `createContext()` to accept optional parent

### Phase 2: Deprecation Warnings

- [ ] Add deprecation warnings to old methods
- [ ] Update documentation to show new API
- [ ] Update examples and tests

### Phase 3: Remove Deprecated (Major Version)

- [ ] Remove deprecated aliases
- [ ] Final documentation update
