# Type Safety Improvements Plan for HyperFixi

## Executive Summary

This document outlines a systematic approach to address three critical areas:
1. **Type safety in test files** - 914 unsafe `any` type instances across 88 test files
2. **Export strategy clarification** - Inconsistencies in named vs default exports across packages
3. **Browser globals type definitions** - Missing TypeScript declarations for window globals

**Timeline**: Prioritized into three phases (Critical → High → Medium)
**Effort**: Estimated at ~60-80 developer hours across all phases
**Impact**: Improved type safety, better IDE support, reduced runtime errors

---

## Phase 1: Type Safety in Test Files (CRITICAL) ✅ COMPLETE

### Status: COMPLETED (December 2025)

- **Result**: 810 of 814 instances eliminated (99.5% complete)
- **Tests**: 2922 passing, 0 failures (100% pass rate)
- **Commits**: 4 systematic refactoring commits
- **Remaining**: 4 instances in commented-out validation test code (intentionally left)

### Overview
- **Files affected**: 88 out of 197 test files (45%)
- **Total `any` instances**: 914 (854 in core, 60 in semantic)
- **Risk level**: HIGH - Test failures could go undetected due to unsafe type assertions

### 1.1 Priority 1 - AST & Semantic Node Assertions (60+ instances)

#### Problem
Test assertions use `as any` to access properties on AST/semantic nodes:
```typescript
// CURRENT (unsafe)
expect((result as any).name).toBe('toggle');
expect((node as any).roles.get('patient' as any)?.value).toBe('.active');
```

#### Solution

**Step 1: Create Properly Typed Return Interfaces**

Create `packages/core/src/parser/__types__/test-helpers.ts`:
```typescript
// Type-safe interfaces for test returns
export interface ParsedStatementResult {
  node: CommandNode;
  tokens: Token[];
  context: ParserContext;
  metadata?: ParsingMetadata;
}

export interface ASTNodeAssertable extends CommandNode {
  name: string;
  type: NodeType;
  children?: CommandNode[];
  args?: Expression[];
}
```

Create `packages/semantic/src/__types__/test-helpers.ts`:
```typescript
export interface SemanticNodeResult {
  action: string;
  roles: Map<string, SemanticValue>;
  confidence: number;
  errors?: ValidationError[];
}

export interface RoleAccessor<T extends string = string> {
  get(role: T): SemanticValue | undefined;
  has(role: T): boolean;
  keys(): T[];
}
```

**Step 2: Replace `as any` with Type Guards in Assertions**

Update test helper functions to use proper types:
```typescript
// CURRENT (packages/core/src/multilingual/bridge.test.ts:128)
const statement = semanticNodeToParsedStatement(mockNode as any);

// UPDATED
function semanticNodeToParsedStatement(node: SemanticNode): ParsedStatementResult {
  return {
    node: semanticNodeToCommandNode(node),
    tokens: node.tokens || [],
    context: createTestContext(),
  };
}

const statement = semanticNodeToParsedStatement(mockNode); // No cast needed
expect(statement.node.name).toBe('toggle'); // Type-safe
```

**Affected test files** (32 files):
- `packages/core/src/multilingual/bridge.test.ts` (32 `as any` instances)
- `packages/semantic/test/ast-builder.test.ts` (54 instances)
- `packages/semantic/test/semantic.test.ts` (15 instances)
- `packages/semantic/test/gallery-patterns.test.ts` (8 instances)
- `packages/semantic/test/draggable-patterns.test.ts` (5 instances)
- `packages/core/src/commands-v2/toggle.test.ts` (3 instances)
- `packages/core/src/parser/parser.test.ts` (7 instances)
- [25+ more files with 1-4 instances each]

**Effort**: ~20 hours
**Approach**:
1. Create shared test type helpers
2. Update test files systematically (group by affected function)
3. Create type-safe assertion helpers for common patterns

---

### 1.2 Priority 2 - Mock Object Typing (80+ instances)

#### Problem
Mock classes and stubs use `any` for parameters:
```typescript
// CURRENT (unsafe)
postMessage(data: any, transferables?: Transferable[]) { }
simulateMessage(data: any, eventType?: string) { }
json: (data: any) => mockExpressRes
```

#### Solution

**Step 1: Create Generic Mock Interfaces**

Create `packages/core/src/__test-utils__/mock-types.ts`:
```typescript
// Generic mock functions with proper typing
export interface MockFunction<T = unknown, R = unknown> {
  (data: T): R;
  calls: T[];
  lastCall?: T;
  returnValue?: R;
}

export interface MockWebSocketAPI {
  postMessage<T extends Record<string, any> = Record<string, any>>(
    data: T,
    transferables?: Transferable[]
  ): void;
}

export interface MockEventSourceAPI {
  simulateMessage<T extends unknown = string>(
    data: T,
    eventType?: 'message' | 'open' | 'error',
    lastEventId?: string
  ): void;
}

export interface MockExpressResponse {
  json<T extends unknown = any>(data: T): MockExpressResponse;
  send<T extends unknown = any>(data: T): MockExpressResponse;
  status(code: number): MockExpressResponse;
  header(name: string, value: string): MockExpressResponse;
}

// Factory functions for creating typed mocks
export function createMockWebSocket(): MockWebSocketAPI & { addEventListener: (event: string, handler: EventListener) => void } {
  // Implementation
}

export function createMockEventSource(): MockEventSourceAPI & { addEventListener: (event: string, handler: EventListener) => void } {
  // Implementation
}

export function createMockExpressResponse(): MockExpressResponse {
  // Implementation
}
```

**Step 2: Update Mock Implementations**

Files to update:
- `packages/core/src/features/sockets.test.ts` - MockWebSocket class
- `packages/core/src/features/webworker.test.ts` - MockWorker class
- `packages/core/src/features/eventsource.test.ts` - MockEventSource class
- `packages/core/src/context/__tests__/integration.test.ts` - mockExpressRes

**Affected test files** (15 files):
- Feature test mocks (3 files with 8-10 instances each)
- Express/Node.js request/response mocks (5 files)
- Generic data processing mocks (7 files)

**Effort**: ~15 hours
**Approach**:
1. Create centralized mock factory with typed constructors
2. Update test files to use factories instead of inline `as any`
3. Create mock builder pattern for complex objects

---

### 1.3 Priority 3 - Error Handling & Try-Catch (30+ instances)

#### Problem
Catch clauses don't specify error types:
```typescript
// CURRENT (unsafe)
try {
  // ...
} catch (error: any) {
  expect(error.message).toContain('...');
}
```

#### Solution

**Step 1: Create Error Type Guards**

Create `packages/core/src/__test-utils__/error-testing.ts`:
```typescript
// Error assertion helpers
export function expectErrorMessage(error: unknown, message: string | RegExp): void {
  if (!(error instanceof Error)) {
    fail(`Expected Error, got ${typeof error}`);
  }
  expect(error.message).toMatch(message);
}

export function expectErrorType<T extends Error>(
  error: unknown,
  ErrorType: new (...args: any[]) => T
): asserts error is T {
  if (!(error instanceof ErrorType)) {
    fail(`Expected ${ErrorType.name}, got ${error instanceof Error ? error.constructor.name : typeof error}`);
  }
}

export function expectSpecificError(
  fn: () => void,
  ErrorType: new (...args: any[]) => Error,
  messageMatch?: string | RegExp
): void {
  try {
    fn();
    fail(`Expected ${ErrorType.name} to be thrown`);
  } catch (error) {
    expectErrorType(error, ErrorType);
    if (messageMatch) {
      expectErrorMessage(error, messageMatch);
    }
  }
}
```

**Step 2: Replace Try-Catch Error Handling**

Pattern 1 - Simple expectation:
```typescript
// CURRENT
try {
  executeInvalidCommand();
} catch (error: any) {
  expect(error.message).toContain('invalid');
}

// UPDATED
expectSpecificError(
  () => executeInvalidCommand(),
  Error,
  /invalid/
);
```

Pattern 2 - Complex error inspection:
```typescript
// CURRENT
let caughtError: any;
try {
  complexOperation();
} catch (error: any) {
  caughtError = error;
}
expect(caughtError.code).toBe('ERR_INVALID');
expect(caughtError.details).toBeDefined();

// UPDATED
const error = expectThrows(complexOperation, CustomError);
expect(error.code).toBe('ERR_INVALID');
expect(error.details).toBeDefined();
```

**Affected test files** (10 files):
- `packages/core/src/validation/core-system.test.ts` (5 instances)
- `packages/core/src/runtime/runtime.test.ts` (3 instances)
- `packages/semantic/test/error-handling.test.ts` (2 instances)
- [7+ more with 1-2 instances]

**Effort**: ~8 hours
**Approach**:
1. Create error testing utilities
2. Update affected test files with helper usage
3. Add JSDoc with error type hints

---

### 1.4 Priority 4 - Test Helper Functions (50+ instances)

#### Problem
Helper functions return `any` instead of proper types:
```typescript
// CURRENT (unsafe)
function expectAST(input: string, expectedStructure: any) {
  const result = parse(input);
  expect(result.node).toMatchObject(expectedStructure);
}

function parseHyperscript(code: string): { success: boolean; node?: any; error?: any } {
  // Implementation
}
```

#### Solution

**Step 1: Create Typed Test Helpers**

Create `packages/core/src/__test-utils__/parser-helpers.ts`:
```typescript
// Type-safe parser test helpers
export interface ParserTestResult {
  success: true;
  node: CommandNode;
  tokens: Token[];
}

export interface ParserTestError {
  success: false;
  error: ParsingError;
  input: string;
}

export type ParserTestOutcome = ParserTestResult | ParserTestError;

export function parseHyperscript(code: string): ParserTestOutcome {
  try {
    const parser = createParser();
    const node = parser.parse(code);
    return {
      success: true,
      node,
      tokens: parser.getTokens(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof ParsingError ? error : new ParsingError(String(error)),
      input: code,
    };
  }
}

export function expectParseSuccess(result: ParserTestOutcome): asserts result is ParserTestResult {
  if (!result.success) {
    fail(`Parse failed: ${result.error.message}`);
  }
}

export function expectAST(
  input: string,
  expectedStructure: Partial<CommandNode>
): void {
  const result = parseHyperscript(input);
  expectParseSuccess(result);
  expect(result.node).toMatchObject(expectedStructure);
}
```

**Affected test files** (12 files):
- `packages/core/src/parser/parser.test.ts` (1 helper)
- `packages/core/src/hyperscript-parser.test.ts` (2 helpers)
- `packages/core/src/runtime/runtime.test.ts` (1 helper)
- [9+ more with 1 helper each]

**Effort**: ~10 hours
**Approach**:
1. Identify all helper functions with `any` returns
2. Create proper result type discriminated unions
3. Add type assertion helpers
4. Update test files to use new helpers

---

### 1.5 Priority 5 - Mock Context Creation (20+ instances)

#### Problem
Mock execution contexts and fixtures use `any` for data:
```typescript
// CURRENT (unsafe)
} as any;

const mockContext = {
  json: (data: any) => mockExpressRes,
  send: (data: any) => mockExpressRes,
} as any;
```

#### Solution

**Step 1: Create Typed Context Builders**

Create `packages/core/src/__test-utils__/context-builders.ts`:
```typescript
// Typed context builders
export class TestContextBuilder {
  private options: Partial<ExecutionContextOptions> = {};
  private globals: Record<string, unknown> = {};

  withElement(element: Element): this {
    this.options.element = element;
    return this;
  }

  withGlobal<T>(key: string, value: T): this {
    this.globals[key] = value;
    return this;
  }

  build(): TypedExecutionContext {
    return createContext({
      ...this.options,
      globals: this.globals,
    });
  }
}

export function createTestContext(
  options?: Partial<ExecutionContextOptions>
): TypedExecutionContext {
  return new TestContextBuilder()
    .withElement(document.createElement('div'))
    .build();
}

// Typed Express mock
export interface MockExpressRequest<T extends unknown = any> {
  method: string;
  url: string;
  body: T;
  params: Record<string, string>;
  query: Record<string, string>;
}

export interface TypedMockExpressResponse<T extends unknown = any> {
  json(data: T): this;
  send(data: T): this;
  status(code: number): this;
  contentType(type: string): this;
  getStatusCode(): number;
  getData(): T;
}

export function createMockExpressResponse<T extends unknown = any>(): TypedMockExpressResponse<T> {
  // Implementation
}
```

**Affected test files** (8 files):
- `packages/core/src/commands/utility/__tests__/log.test.ts`
- `packages/core/src/context/__tests__/integration.test.ts`
- `packages/core/src/commands/data/__tests__/set-new-features.test.ts`
- [5+ more]

**Effort**: ~12 hours
**Approach**:
1. Create builder pattern for context creation
2. Add typed response/request factories
3. Update test setup files

---

### 1.6 Type Safety Quick Wins (100+ instances)

**Low-hanging fruit** that can be addressed with find-and-replace:

1. **Replace untyped error variables**:
   ```typescript
   // Before: } catch (error: any) {
   // After:  } catch (error: unknown) { if (error instanceof Error)
   ```

2. **Add unknown instead of any in loops**:
   ```typescript
   // Before: for (const item of items as any) {
   // After:  for (const item of items as unknown[]) {
   ```

3. **Type globalThis assignments**:
   ```typescript
   // Before: (globalThis as any).testGlobal = 'value'
   // After:  declare global { var testGlobal: string; }
   //         globalThis.testGlobal = 'value'
   ```

**Effort**: ~5 hours
**Files**: Find 50+ instances across all test files

---

### Implementation Roadmap - Phase 1

| Task | Priority | Effort | Files | Owner |
|------|----------|--------|-------|-------|
| AST/Semantic node typing | P1 | 20h | 32 | @dev1 |
| Mock object typing | P2 | 15h | 15 | @dev2 |
| Error handling refactor | P3 | 8h | 10 | @dev1 |
| Test helper functions | P3 | 10h | 12 | @dev2 |
| Context builders | P3 | 12h | 8 | @dev1 |
| Quick wins (regex) | P4 | 5h | 50+ | @dev3 |
| **TOTAL PHASE 1** | | **70h** | **88** | |

---

## Phase 2: Export Strategy Clarification (HIGH)

### Overview
- **Inconsistencies**: 6 major categories identified
- **Affected packages**: 3 (core, semantic, i18n)
- **Impact**: Tree-shaking, bundle size, IDE autocomplete

### 2.1 Standardize Default Export Strategy

#### Current State
| Package | Default Export | Method |
|---------|---|---|
| **Core** | ✓ Yes | `export { default } from './api/hyperscript-api'` |
| **Semantic** | ✗ No | N/A |
| **I18n** | ✗ No | Has `defaultTranslator`, `defaultRuntime` instead |

#### Decision: Use Named Exports Only (Recommended)

**Rationale**:
- Better tree-shaking support (no ambiguity about what's included)
- Explicit about module boundaries
- Easier IDE navigation
- No confusion about which is the "main" export
- Aligns with semantic and i18n already

**Implementation**:

**Task 2.1.1: Remove default export from Core**

File: `packages/core/src/index.ts`
```typescript
// REMOVE THIS LINE:
export { default } from './api/hyperscript-api'

// KEEP EXISTING NAMED EXPORTS:
export { hyperscript, type HyperscriptAPI, type CompilationResult } from './api/hyperscript-api'
```

Update consuming code:
- Search for `import hyperfixi from '@hyperfixi/core'`
- Replace with `import { hyperscript as hyperfixi } from '@hyperfixi/core'`
- Update documentation

**Files affected**:
- `packages/core/src/index.ts` (1 line removal)
- Documentation files (examples, README)
- Test setup files that import core

**Effort**: ~3 hours

---

### 2.2 Unify Re-export Patterns

#### Current State
| Package | Re-export Style |
|---------|---|
| **Core** | Explicit named exports (100%) |
| **Semantic** | Explicit named exports (100%) |
| **I18n** | Mixed: Wildcard (4 modules) + Named (60%) |

#### Decision: Use Explicit Named Exports (Recommended)

**Rationale**:
- Better for tree-shaking
- Easier to track what's public vs internal
- IDE can index exports explicitly
- Avoids namespace pollution from wildcard re-exports

**Implementation**:

**Task 2.2.1: Convert I18n Wildcard Exports to Named**

File: `packages/i18n/src/index.ts`
```typescript
// BEFORE (lines that use wildcard):
export * from './types'
export * from './translator'
export * from './dictionaries'
export * from './parser'

// AFTER (explicit):
export type {
  TranslationKey,
  TranslatorOptions,
  LocalizationOptions,
  // ... all types from ./types
} from './types'

export type { HyperscriptTranslator, TranslatorInstance } from './translator'
export { HyperscriptTranslator, defaultTranslator } from './translator'

// ... continue for all wildcards
```

**Task 2.2.2: Document I18n Grammar Exports**

File: `packages/i18n/src/grammar/index.ts` (60 lines)
- Convert `export *` to explicit named exports
- Add JSDoc explaining semantic roles, word order, etc.

**Files affected**:
- `packages/i18n/src/index.ts` (4 wildcard exports)
- `packages/i18n/src/grammar/index.ts` (2 wildcard exports)
- `packages/i18n/src/browser.ts` (update if needed)

**Effort**: ~4 hours

---

### 2.3 Consolidate Build Strategies

#### Current State
| Package | Build Tool(s) |
|---------|---|
| **Core** | Rollup only |
| **Semantic** | tsup (node) + tsup IIFE (browser) |
| **I18n** | tsup (node) + Rollup UMD (browser) |

#### Decision: Keep Current (Inconsistent but Working)

**Rationale for Not Changing**:
- Core uses Rollup effectively for complex builds
- Semantic's tsup + IIFE is clean and simple
- Changing build tools risks introducing bugs
- Each is optimized for its package's needs

**Alternative - Standardize on Rollup** (not recommended due to risk):
- Would require rewriting semantic and i18n build configs
- Potential for regressions
- Current setup works; not worth the migration cost

**Recommendation**: Document the rationale in `CONTRIBUTING.md`

**Files to update**:
- `CONTRIBUTING.md` - Add build tool section explaining choices
- `packages/core/CONTRIBUTING.md` (if exists)
- `packages/semantic/CONTRIBUTING.md` (if exists)

**Effort**: ~2 hours

---

### 2.4 Clarify Browser Export Paths

#### Current State
| Package | Export Path | Points To | Format |
|---------|---|---|---|
| **Semantic** | `./browser` | `dist/hyperfixi-semantic.browser.global.js` | IIFE |
| **I18n** | `./browser` | `dist/browser.mjs` / `dist/browser.js` | ESM/CJS |
| **Core** | (implicit) | Must import from `dist/` directly | Multiple |

#### Decision: Standardize Browser Export Paths

**Implementation**:

**Task 2.4.1: Add Explicit Browser Export to Core**

File: `packages/core/package.json`
```json
{
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.mjs", "require": "./dist/index.js" },
    "./parser": { /* ... */ },
    "./runtime": { /* ... */ },
    "./browser": {
      "default": "./dist/hyperfixi-browser.js",
      "types": "./dist/index.d.ts"
    }
  }
}
```

Documentation in `packages/core/README.md`:
```markdown
## Browser Usage

### Full Bundle (with parser)
```html
<script src="node_modules/@hyperfixi/core/dist/hyperfixi-browser.js"></script>
<script>window.hyperfixi.execute('toggle .active')</script>
```

### Named Imports
```javascript
import { hyperscript, parse, Runtime } from '@hyperfixi/core'
```
```

**Task 2.4.2: Clarify Semantic Browser Export**

File: `packages/semantic/package.json`
```json
{
  "exports": {
    ".": { /* node/npm imports */ },
    "./browser": {
      "default": "./dist/hyperfixi-semantic.browser.global.js",
      "types": "./dist/browser.d.ts"
    }
  }
}
```

Add JSDoc comment explaining IIFE format:
```typescript
// packages/semantic/src/browser.ts
/**
 * Browser IIFE bundle for @hyperfixi/semantic
 *
 * Usage:
 * ```html
 * <script src="hyperfixi-semantic.browser.global.js"></script>
 * <script>
 *   const result = window.HyperFixiSemantic.parse('toggle .active', 'en')
 * </script>
 * ```
 */
```

**Task 2.4.3: Clarify I18n Browser Export**

File: `packages/i18n/package.json`
```json
{
  "exports": {
    ".": { /* node imports */ },
    "./browser": {
      "default": "./dist/hyperfixi-i18n.min.js",
      "types": "./dist/browser.d.ts"
    }
  }
}
```

Add documentation explaining UMD format and global:
```typescript
// packages/i18n/src/browser.ts header
/**
 * Browser bundle for @hyperfixi/i18n (Grammar transformation)
 *
 * Exposes: window.HyperFixiI18n
 *
 * Usage:
 * ```html
 * <script src="hyperfixi-i18n.min.js"></script>
 * <script>
 *   const result = HyperFixiI18n.translate('on click toggle .active', 'en', 'ja')
 * </script>
 * ```
 */
```

**Files affected**:
- `packages/core/package.json` (add exports field)
- `packages/semantic/package.json` (clarify)
- `packages/i18n/package.json` (clarify)
- `packages/*/README.md` (add examples)
- `CONTRIBUTING.md` (document patterns)

**Effort**: ~5 hours

---

### 2.5 Create Public API Documentation

**Task 2.5.1: Document Semantic Public API**

The semantic package has `src/public-api.ts` (curated subset) that isn't exposed.

Decision: **Export it as separate entrypoint**

File: `packages/semantic/package.json`
```json
{
  "exports": {
    ".": { "types": "./dist/index.d.ts", "import": "./dist/index.mjs" },
    "./public": {
      "types": "./dist/public-api.d.ts",
      "import": "./dist/public-api.mjs",
      "require": "./dist/public-api.js"
    }
  }
}
```

Build config in `tsup.config.ts`:
```typescript
{
  entry: ['src/public-api.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  outDir: 'dist',
  outExtension(ctx) {
    return {
      js: `.${ctx.format === 'esm' ? 'mjs' : 'js'}`,
      dts: '.d.ts'
    }
  }
}
```

**Documentation in `packages/semantic/README.md`**:
```markdown
## API Usage

### Complete API (all internal helpers)
```javascript
import { parse, buildAST, tokenize, /* 100+ items */ } from '@hyperfixi/semantic'
```

### Public API (recommended, stable)
```javascript
import { parse, buildAST, translate, /* 30 key items */ } from '@hyperfixi/semantic/public'
```
```

**Effort**: ~4 hours

---

### 2.6 Create Export Documentation

**File**: `docs/exports-guide.md`

Content:
```markdown
# Export Strategies in HyperFixi

## Core Package (@hyperfixi/core)

### Node.js/npm
```javascript
// Named imports (recommended)
import { hyperscript, parse, Runtime } from '@hyperfixi/core'

// Sub-packages
import { parse } from '@hyperfixi/core/parser'
import { Runtime } from '@hyperfixi/core/runtime'
```

### Browser
```html
<script src="hyperfixi-browser.js"></script>
<!-- Exposes: window.hyperfixi -->
```

## Semantic Package (@hyperfixi/semantic)

### Node.js/npm (Complete)
```javascript
import { parse, buildAST, tokenize } from '@hyperfixi/semantic'
```

### Node.js/npm (Public API - recommended)
```javascript
import { parse, buildAST, translate } from '@hyperfixi/semantic/public'
```

### Browser (IIFE)
```html
<script src="hyperfixi-semantic.browser.global.js"></script>
<!-- Exposes: window.HyperFixiSemantic -->
```

## I18n Package (@hyperfixi/i18n)

### Node.js/npm
```javascript
import { GrammarTransformer, translate } from '@hyperfixi/i18n'
```

### Browser (UMD)
```html
<script src="hyperfixi-i18n.min.js"></script>
<!-- Exposes: window.HyperFixiI18n -->
```
```

**Effort**: ~2 hours

---

### Implementation Roadmap - Phase 2

| Task | Priority | Effort | Files |
|------|----------|--------|-------|
| Remove Core default export | P1 | 3h | 1 |
| Convert I18n wildcards to named | P1 | 4h | 2 |
| Add Core ./browser export path | P2 | 2h | 1 |
| Clarify Semantic export path | P2 | 1h | 1 |
| Clarify I18n export path | P2 | 1h | 1 |
| Create public API export | P2 | 4h | 2 |
| Document build tool rationale | P3 | 2h | 1 |
| Create export documentation | P3 | 2h | 1 |
| **TOTAL PHASE 2** | | **19h** | **15** |

---

## Phase 3: Browser Globals Type Definitions (MEDIUM)

### Overview
- **Missing declarations**: 3 global objects (hyperfixi, HyperFixiSemantic, HyperFixiI18n)
- **Current coverage**: Only Core has declarations (partial)
- **Impact**: IDE autocomplete, type safety in HTML scripts

### 3.1 Create Unified Browser Globals Type Definition

#### Current State
- Core: Has `declare global { interface Window { hyperfixi: {...} } }`
- Semantic: No type declarations
- I18n: No type declarations
- No `globalThis` augmentation
- No type guards or ambient modules

#### Decision: Create Comprehensive Global Types Package

**Task 3.1.1: Create @hyperfixi/types-browser Package**

New directory structure:
```
packages/types-browser/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts           # Main ambient declarations
│   ├── globals.d.ts       # Window/globalThis augmentation
│   ├── core-api.ts        # HyperFixiCore type definitions
│   ├── semantic-api.ts    # HyperFixiSemantic type definitions
│   ├── i18n-api.ts        # HyperFixiI18n type definitions
│   └── type-guards.ts     # Runtime type checking utilities
└── dist/
    └── index.d.ts
```

**File: `packages/types-browser/package.json`**
```json
{
  "name": "@hyperfixi/types-browser",
  "version": "1.0.0",
  "description": "TypeScript type definitions for HyperFixi browser globals",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "keywords": ["hyperfixi", "types", "browser", "globals"]
}
```

**File: `packages/types-browser/src/index.ts`**
```typescript
/**
 * @hyperfixi/types-browser
 * TypeScript type definitions for HyperFixi browser globals
 *
 * This package provides complete type definitions for using HyperFixi
 * packages in the browser via global variables.
 *
 * Install with: npm install --save-dev @hyperfixi/types-browser
 *
 * Then add to your tsconfig.json:
 * ```json
 * {
 *   "compilerOptions": {
 *     "typeRoots": ["./node_modules/@hyperfixi/types-browser", "./node_modules/@types"]
 *   }
 * }
 * ```
 */

export * from './core-api'
export * from './semantic-api'
export * from './i18n-api'
export * from './type-guards'
```

**File: `packages/types-browser/src/globals.d.ts`**
```typescript
import type {
  HyperFixiCoreAPI,
  EvalHyperScriptFunction,
  EvalHyperScriptAsyncFunction,
  EvalHyperScriptSmartFunction,
} from './core-api'
import type { HyperFixiSemanticAPI } from './semantic-api'
import type { HyperFixiI18nAPI } from './i18n-api'

declare global {
  interface Window {
    /**
     * Main HyperFixi core API
     *
     * @example
     * ```html
     * <script src="hyperfixi-browser.js"></script>
     * <script>
     *   window.hyperfixi.execute('toggle .active')
     * </script>
     * ```
     */
    hyperfixi: HyperFixiCoreAPI

    /**
     * Shorthand: evaluate hyperscript code
     * @example window.evalHyperScript('toggle .active')
     */
    evalHyperScript: EvalHyperScriptFunction

    /**
     * Async version of evalHyperScript
     * @example await window.evalHyperScriptAsync('wait 1s then toggle .active')
     */
    evalHyperScriptAsync: EvalHyperScriptAsyncFunction

    /**
     * Smart evaluation: detects element context automatically
     */
    evalHyperScriptSmart: EvalHyperScriptSmartFunction
  }

  interface Window {
    /**
     * Semantic parser API (when semantic-parser bundle is loaded)
     *
     * @example
     * ```html
     * <script src="hyperfixi-semantic.browser.global.js"></script>
     * <script>
     *   const result = window.HyperFixiSemantic.parse('toggle .active', 'en')
     * </script>
     * ```
     */
    HyperFixiSemantic?: HyperFixiSemanticAPI
  }

  interface Window {
    /**
     * i18n/Grammar transformation API (when i18n bundle is loaded)
     *
     * @example
     * ```html
     * <script src="hyperfixi-i18n.min.js"></script>
     * <script>
     *   const result = window.HyperFixiI18n.translate('on click toggle .active', 'en', 'ja')
     * </script>
     * ```
     */
    HyperFixiI18n?: HyperFixiI18nAPI
  }

  /**
   * globalThis augmentation (Node.js/non-browser environments)
   */
  interface Global {
    hyperfixi?: HyperFixiCoreAPI
    HyperFixiSemantic?: HyperFixiSemanticAPI
    HyperFixiI18n?: HyperFixiI18nAPI
  }
}

export {}
```

**File: `packages/types-browser/src/core-api.ts`**
```typescript
import type {
  HyperscriptAPI,
  CompilationResult,
  ExecutionContext,
} from '@hyperfixi/core'

/**
 * HyperFixi core API exposed on window.hyperfixi
 */
export interface HyperFixiCoreAPI extends HyperscriptAPI {
  /**
   * Evaluate hyperscript string directly
   */
  evalHyperScript(code: string, element?: Element): any

  /**
   * Async evaluation of hyperscript
   */
  evalHyperScriptAsync(code: string, element?: Element): Promise<any>

  /**
   * Smart evaluation with automatic context detection
   */
  evalHyperScriptSmart(code: string): Promise<any>

  /**
   * Low-level parser access
   */
  Parser: typeof import('@hyperfixi/core').Parser

  /**
   * Low-level runtime access
   */
  Runtime: typeof import('@hyperfixi/core').Runtime

  /**
   * Debug utilities
   */
  debug: {
    enableDebugLogging(): void
    disableDebugLogging(): void
  }
}

export type EvalHyperScriptFunction = (
  code: string,
  element?: Element
) => any

export type EvalHyperScriptAsyncFunction = (
  code: string,
  element?: Element
) => Promise<any>

export type EvalHyperScriptSmartFunction = (
  code: string
) => Promise<any>
```

**File: `packages/types-browser/src/semantic-api.ts`**
```typescript
import type {
  ActionType,
  SemanticNode,
  SemanticValue,
} from '@hyperfixi/semantic'

/**
 * HyperFixi semantic parser API exposed on window.HyperFixiSemantic
 */
export interface HyperFixiSemanticAPI {
  /**
   * Parse hyperscript in any supported language to semantic representation
   *
   * @param code Hyperscript code to parse
   * @param language Two-letter language code (en, ja, ar, es, ko, tr, zh, pt, fr, de, id, qu, sw)
   * @returns Parsed semantic node
   */
  parse(code: string, language: SupportedLanguage): SemanticNode | null

  /**
   * Check if hyperscript can be parsed in a language
   */
  canParse(code: string, language: SupportedLanguage): boolean

  /**
   * Translate hyperscript between languages
   */
  translate(
    code: string,
    fromLanguage: SupportedLanguage,
    toLanguage: SupportedLanguage
  ): string | null

  /**
   * Get all translations of hyperscript in supported languages
   */
  getAllTranslations(
    code: string,
    fromLanguage: SupportedLanguage
  ): Record<SupportedLanguage, string>

  /**
   * Get list of supported language codes
   */
  getSupportedLanguages(): SupportedLanguage[]

  /**
   * Build AST from semantic node
   */
  buildAST(node: SemanticNode): any
}

export type SupportedLanguage =
  | 'en' | 'ja' | 'ar' | 'es' | 'ko' | 'tr'
  | 'zh' | 'pt' | 'fr' | 'de' | 'id' | 'qu' | 'sw'
```

**File: `packages/types-browser/src/i18n-api.ts`**
```typescript
import type { SemanticRole } from '@hyperfixi/i18n'

/**
 * HyperFixi i18n/Grammar transformation API on window.HyperFixiI18n
 */
export interface HyperFixiI18nAPI {
  /**
   * Transform hyperscript statement from one language word order to another
   *
   * @param statement Parsed hyperscript statement
   * @param fromLocale Source language locale (e.g., 'en')
   * @param toLocale Target language locale (e.g., 'ja')
   * @returns Transformed statement
   */
  translate(
    statement: HyperscriptStatement,
    fromLocale: string,
    toLocale: string
  ): HyperscriptStatement | null

  /**
   * Get supported locales for grammar transformation
   */
  getSupportedLocales(): string[]

  /**
   * Check if transformation is supported between two locales
   */
  supportsTransform(fromLocale: string, toLocale: string): boolean

  /**
   * Get language profile information
   */
  getProfile(locale: string): LanguageProfile | null
}

export interface HyperscriptStatement {
  command: string
  roles: Record<string, any>
  modifiers?: string[]
}

export interface LanguageProfile {
  locale: string
  name: string
  wordOrder: 'SVO' | 'SOV' | 'VSO' | 'VOS'
  isRTL: boolean
}
```

**File: `packages/types-browser/src/type-guards.ts`**
```typescript
import type {
  HyperFixiCoreAPI,
  HyperFixiSemanticAPI,
  HyperFixiI18nAPI,
} from './index'

/**
 * Type guards for browser globals
 */

/**
 * Check if window.hyperfixi is available and properly typed
 */
export function isHyperFixiCoreAvailable(
  obj?: any
): obj is HyperFixiCoreAPI {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.execute === 'function' &&
    typeof obj.parse === 'function'
  )
}

/**
 * Check if window.HyperFixiSemantic is available
 */
export function isHyperFixiSemanticAvailable(
  obj?: any
): obj is HyperFixiSemanticAPI {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.parse === 'function' &&
    typeof obj.canParse === 'function'
  )
}

/**
 * Check if window.HyperFixiI18n is available
 */
export function isHyperFixiI18nAvailable(
  obj?: any
): obj is HyperFixiI18nAPI {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.translate === 'function' &&
    typeof obj.getSupportedLocales === 'function'
  )
}

/**
 * Safe access to window.hyperfixi with type checking
 */
export function getHyperFixiCore(): HyperFixiCoreAPI | null {
  if (typeof window !== 'undefined' && isHyperFixiCoreAvailable(window.hyperfixi)) {
    return window.hyperfixi
  }
  return null
}

/**
 * Safe access to window.HyperFixiSemantic with type checking
 */
export function getHyperFixiSemantic(): HyperFixiSemanticAPI | null {
  if (typeof window !== 'undefined' && isHyperFixiSemanticAvailable(window.HyperFixiSemantic)) {
    return window.HyperFixiSemantic
  }
  return null
}

/**
 * Safe access to window.HyperFixiI18n with type checking
 */
export function getHyperFixiI18n(): HyperFixiI18nAPI | null {
  if (typeof window !== 'undefined' && isHyperFixiI18nAvailable(window.HyperFixiI18n)) {
    return window.HyperFixiI18n
  }
  return null
}
```

**Effort**: ~25 hours (create new package with comprehensive types)

---

### 3.2 Update Core Package Type Exports

**Task 3.2.1: Refactor Core Browser Bundle Declarations**

File: `packages/core/src/compatibility/browser-bundle.ts`

Move type declarations from inline to dedicated file:

Create `packages/core/src/compatibility/globals.d.ts`:
```typescript
import type {
  EvalHyperScriptFunction,
  EvalHyperScriptAsyncFunction,
  EvalHyperScriptSmartFunction,
  HyperFixiCoreAPI,
} from '@hyperfixi/types-browser'

declare global {
  interface Window {
    hyperfixi: HyperFixiCoreAPI
    evalHyperScript: EvalHyperScriptFunction
    evalHyperScriptAsync: EvalHyperScriptAsyncFunction
    evalHyperScriptSmart: EvalHyperScriptSmartFunction
  }
}

export {}
```

Update `browser-bundle.ts` to import from this file:
```typescript
import './globals'

// Rest of implementation
```

**Effort**: ~3 hours

---

### 3.3 Create Type Definition Examples

**File**: `docs/browser-globals-usage.md`

Content:
```markdown
# Using HyperFixi Browser Globals with TypeScript

## Installation

### Step 1: Install Type Definitions
```bash
npm install --save-dev @hyperfixi/types-browser
```

### Step 2: Update tsconfig.json
```json
{
  "compilerOptions": {
    "typeRoots": [
      "./node_modules/@hyperfixi/types-browser",
      "./node_modules/@types"
    ]
  }
}
```

## Usage Examples

### Core API
```typescript
// window.hyperfixi is now fully typed
const result = await window.hyperfixi.execute('toggle .active')

// Type-safe function calls
window.evalHyperScript('toggle .active')
await window.evalHyperScriptAsync('wait 1s then toggle .active')
```

### Semantic Parser
```typescript
// window.HyperFixiSemantic is typed (if bundle is loaded)
if (window.HyperFixiSemantic) {
  const node = window.HyperFixiSemantic.parse('toggle .active', 'en')
  const japanese = window.HyperFixiSemantic.translate('toggle .active', 'en', 'ja')
}
```

### Type Guards
```typescript
import { isHyperFixiCoreAvailable, getHyperFixiCore } from '@hyperfixi/types-browser'

// Safe access
const hyperfixi = getHyperFixiCore()
if (hyperfixi) {
  hyperfixi.execute('toggle .active')
}
```

## HTML Example

```html
<!DOCTYPE html>
<html>
<head>
  <!-- Load bundles -->
  <script src="hyperfixi-browser.js"></script>
  <script src="hyperfixi-semantic.browser.global.js"></script>
  <script src="hyperfixi-i18n.min.js"></script>
</head>
<body>
  <button id="button" class="active">Click me</button>

  <!-- TypeScript file with type checking -->
  <script type="module">
    import { getHyperFixiCore } from '@hyperfixi/types-browser'

    const hyperfixi = getHyperFixiCore()
    if (!hyperfixi) throw new Error('HyperFixi not loaded')

    // All calls are now type-safe
    document.querySelector('#button')?.addEventListener('click', async () => {
      await hyperfixi.execute('toggle .active on me')
    })
  </script>
</body>
</html>
```
```

**Effort**: ~2 hours

---

### 3.4 globalThis vs window Augmentation

**Task 3.4.1: Extend Declarations to globalThis**

Already covered in `types-browser/src/globals.d.ts`:

```typescript
declare global {
  interface Global {
    hyperfixi?: HyperFixiCoreAPI
    HyperFixiSemantic?: HyperFixiSemanticAPI
    HyperFixiI18n?: HyperFixiI18nAPI
  }
}
```

This enables:
- Node.js environment support
- Web Worker support
- Service Worker support
- Any environment with globalThis

**Effort**: Already included in 3.1 (0 additional hours)

---

### Implementation Roadmap - Phase 3

| Task | Priority | Effort | Files |
|------|----------|--------|-------|
| Create @hyperfixi/types-browser package | P1 | 25h | 5 |
| Update Core global declarations | P1 | 3h | 2 |
| Create usage documentation | P2 | 2h | 1 |
| Create HTML examples | P2 | 2h | 1 |
| **TOTAL PHASE 3** | | **32h** | **11** |

---

## Overall Implementation Timeline

### Recommended Execution Order

**Week 1: Foundation (Phase 3 - Part 1)**
- Create @hyperfixi/types-browser package (25h)
- Minimal but comprehensive type definitions

**Week 2-3: Test Safety (Phase 1 - Part 1)**
- AST/Semantic node typing (20h)
- Mock object typing (15h)

**Week 3-4: Test Safety (Phase 1 - Part 2)**
- Error handling refactor (8h)
- Test helper functions (10h)
- Context builders (12h)

**Week 5: Export Strategy (Phase 2)**
- Remove Core default export (3h)
- Convert I18n wildcards (4h)
- Add browser exports (4h)
- Create public API (4h)

**Week 6: Documentation & Polish (Phase 3 - Part 2)**
- Update Core declarations (3h)
- Create usage documentation (2h)
- Create HTML examples (2h)
- Quick wins (regex finds) (5h)

---

## Summary

| Phase | Name | Priority | Total Effort | Files | Impact |
|-------|------|----------|---|---|---|
| **Phase 1** | Type Safety in Tests | CRITICAL | 70h | 88 | Prevent type-related test failures |
| **Phase 2** | Export Strategy | HIGH | 19h | 15 | Improve tree-shaking & IDE support |
| **Phase 3** | Browser Globals Types | MEDIUM | 32h | 11 | Enable IDE autocomplete for globals |
| | | | **121h** | **114** | **~6 person-weeks** |

---

## Key Decision Points

1. **Phase 1**: Keep test helper pattern (not rewrite to snapshot testing)
   - Reason: Explicit assertions are more maintainable than snapshots
   - Benefits: Better error messages, easier to debug

2. **Phase 2**: Remove default exports, use named only
   - Reason: Better tree-shaking, explicit module contracts
   - Risk: Breaking change for users importing default, but documented

3. **Phase 3**: Create separate @hyperfixi/types-browser package
   - Reason: Centralized, reusable, not tied to any specific bundle
   - Alternative: Embed in each package (rejected: duplication, maintenance burden)

---

## Success Criteria

### Phase 1 Success
- [ ] 0 `as any` type assertions in core test files
- [ ] 0 untyped catch variables (use `unknown` with type guards)
- [ ] All mock functions have proper generic types
- [ ] All test helpers return typed results
- [ ] 100% test suite passes

### Phase 2 Success
- [ ] No default exports from any package
- [ ] No wildcard re-exports (only explicit named)
- [ ] All browser entry points documented
- [ ] Public API clearly marked in semantic package
- [ ] Build rationale documented

### Phase 3 Success
- [ ] @hyperfixi/types-browser package published
- [ ] window.hyperfixi, HyperFixiSemantic, HyperFixiI18n all have types
- [ ] Type guards available for all globals
- [ ] IDE autocomplete works in HTML files
- [ ] Documentation with examples

---

## Related Documents

- See `CONTRIBUTING.md` for build tool documentation
- See `docs/exports-guide.md` for export patterns (to be created)
- See `docs/browser-globals-usage.md` for TypeScript usage (to be created)
- See `packages/types-browser/README.md` for installation (to be created)

