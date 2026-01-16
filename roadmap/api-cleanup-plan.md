# API Cleanup Plan: hyperscript-api.ts

Post-v2.0.0 cleanup to improve code quality, reduce bundle size, and improve maintainability.

**Estimated Total Effort:** 2-3 hours
**Risk Level:** Low (internal refactoring, no API changes)

---

## Phase 1: Quick Wins (30 minutes)

### 1.1 Remove Dead Code

**File:** `packages/core/src/api/hyperscript-api.ts`
**Lines:** 41-51

Remove the unused `HyperscriptParseError` class:

```typescript
// DELETE THIS - never instantiated
class HyperscriptParseError extends Error {
  line?: number;
  column?: number;
  constructor(message: string, line?: number, column?: number) { ... }
}
```

- [ ] Delete `HyperscriptParseError` class
- [ ] Run tests to verify no regressions

### 1.2 Fix Version Mismatch

**File:** `packages/core/src/api/hyperscript-api.ts`
**Line:** 359

Current code returns hardcoded `'0.1.0'` but package.json is `2.0.0`.

**Option A (Quick):** Update hardcoded version

```typescript
function getVersion(): string {
  return '2.0.0';
}
```

**Option B (Better):** Inject at build time via rollup replace plugin

```typescript
// In hyperscript-api.ts
function getVersion(): string {
  return '__VERSION__'; // Replaced at build time
}

// In rollup.config.mjs
import replace from '@rollup/plugin-replace';
import pkg from './package.json';

plugins: [
  replace({
    __VERSION__: JSON.stringify(pkg.version),
    preventAssignment: true,
  }),
];
```

- [ ] Implement Option B (build-time injection)
- [ ] Update rollup configs
- [ ] Verify version in built bundle

### 1.3 Add Constants for Magic Strings

**File:** `packages/core/src/api/hyperscript-api.ts`

Add constants at top of file:

```typescript
// =============================================================================
// Constants
// =============================================================================

const DEFAULT_EVENT_TYPE = 'click';
const DEFAULT_LANGUAGE = 'en';
```

Update usages:

- Line 652: `const eventType = (ast as ...).event || DEFAULT_EVENT_TYPE;`
- Line 679: `return { eventType: DEFAULT_EVENT_TYPE, body: ast };`
- Line 410: `return DEFAULT_LANGUAGE;`
- Line 757: `const lang = options?.language || DEFAULT_LANGUAGE;`

- [ ] Add constants
- [ ] Update all usages
- [ ] Run tests

---

## Phase 2: Debug Logging Cleanup (45 minutes)

### 2.1 Create Error Logging Helper

**File:** `packages/core/src/api/hyperscript-api.ts`

Replace verbose error logging (lines 489-543) with a focused helper:

```typescript
/**
 * Log compilation error with optional debug details
 */
function logCompileError(element: Element, code: string, result: CompileResult): void {
  console.error(`Failed to compile hyperscript on element:`, element);
  console.error(`Code: "${code}"`);

  if (result.errors?.length) {
    result.errors.forEach((error, i) => {
      console.error(`Error ${i + 1}: ${error.message} (line ${error.line}, col ${error.column})`);
    });
  }

  // Detailed debug info only when debug mode is enabled
  if (debug.isEnabled?.('parser')) {
    debug.parser('Detailed error analysis:', {
      code,
      errors: result.errors,
      tokens: tokenize(code).map(t => `${t.kind}:"${t.value}"`),
    });
  }
}
```

- [ ] Create `logCompileError` helper
- [ ] Replace verbose logging in `processHyperscriptAttributeSync` (lines 489-543)
- [ ] Replace verbose logging in `processHyperscriptAttributeAsync` (lines 444-448)
- [ ] Run tests

### 2.2 Reduce Event Handler Debug Verbosity

**File:** `packages/core/src/api/hyperscript-api.ts`

The `setupEventHandler` function (lines 588-638) has excessive debug logging. Consolidate:

**Before (9 debug calls):**

```typescript
debug.event('setupEventHandler called with:');
debug.event('Element:', element);
debug.event('AST:', ast);
debug.event('Context:', context);
// ... more
```

**After (2 debug calls):**

```typescript
debug.event('Setting up event handler:', {
  element: element.tagName,
  eventType: eventInfo.eventType,
});
// ... setup code ...
debug.event('Event handler attached:', eventInfo.eventType);
```

- [ ] Consolidate debug calls in `setupEventHandler`
- [ ] Consolidate debug calls in `extractEventInfo`
- [ ] Consolidate debug calls in event handler callback
- [ ] Run browser tests to verify events still work

---

## Phase 3: Extract DOM Processing Module (1 hour)

### 3.1 Create New Module

**New File:** `packages/core/src/api/dom-processor.ts`

Extract DOM processing logic from hyperscript-api.ts:

```typescript
/**
 * DOM Processing Module
 * Handles attribute processing and event handler setup
 */

import type { ASTNode, ExecutionContext } from '../types/base-types';
import { createContext } from '../core/context';
import { debug } from '../utils/debug';

// Constants
const DEFAULT_EVENT_TYPE = 'click';

// Types
interface EventInfo {
  eventType: string;
  body: ASTNode;
}

// Exports
export function detectLanguage(element: Element): string { ... }
export function extractEventInfo(ast: ASTNode): EventInfo | null { ... }
export function setupEventHandler(
  element: Element,
  ast: ASTNode,
  context: ExecutionContext,
  executor: (ast: ASTNode, ctx: ExecutionContext) => Promise<unknown>
): void { ... }
export function createHyperscriptContext(element?: HTMLElement | null): ExecutionContext { ... }
```

Functions to move:

- `detectLanguage` (lines 394-411)
- `extractEventInfo` (lines 643-688)
- `setupEventHandler` (lines 588-638)
- `createHyperscriptContext` (lines 705-707)
- `processHyperscriptAttribute` (lines 416-428)
- `processHyperscriptAttributeSync` (lines 482-583)
- `processHyperscriptAttributeAsync` (lines 433-477)
- `logCompileError` (new helper from Phase 2)

- [ ] Create `dom-processor.ts`
- [ ] Move functions
- [ ] Update imports in `hyperscript-api.ts`
- [ ] Export from index.ts if needed for advanced usage
- [ ] Run all tests

### 3.2 Update hyperscript-api.ts Imports

**File:** `packages/core/src/api/hyperscript-api.ts`

```typescript
import {
  detectLanguage,
  setupEventHandler,
  createHyperscriptContext,
  processHyperscriptAttribute,
} from './dom-processor';
```

The `process()` function stays in hyperscript-api.ts but delegates to dom-processor.

- [ ] Update imports
- [ ] Verify API object still works
- [ ] Run tests

---

## Phase 4: Type Safety Improvements (30 minutes)

### 4.1 Fix Unsafe Type Casts

**File:** `packages/core/src/api/hyperscript-api.ts`

**Issue 1 (line 130):** Double cast

```typescript
// Before
return semanticAnalyzerInstance as unknown as SemanticAnalyzerInterface;

// After - fix the type definition or use proper interface
return semanticAnalyzerInstance satisfies SemanticAnalyzerInterface;
```

**Issue 2 (line 145):** Unsafe language narrowing

```typescript
// Before
language: config.language as 'en',

// After - validate or use string type
language: config.language,
```

**Issue 3 (lines 652-673):** AST type assertions

Create a proper AST type guard:

```typescript
interface EventHandlerAST extends ASTNode {
  type: 'eventHandler';
  event?: string;
  commands?: ASTNode[];
}

function isEventHandlerAST(ast: ASTNode): ast is EventHandlerAST {
  return ast.type === 'eventHandler';
}
```

- [ ] Fix double cast on line 130
- [ ] Fix language cast on line 145
- [ ] Add AST type guards
- [ ] Run typecheck

---

## Phase 5: Testing & Documentation (15 minutes)

### 5.1 Run Full Test Suite

```bash
npm test --prefix packages/core
npm run typecheck --prefix packages/core
npm run build:browser --prefix packages/core
```

- [ ] All unit tests pass
- [ ] TypeScript compiles without errors
- [ ] Browser bundle builds successfully
- [ ] Bundle size same or smaller

### 5.2 Update Documentation

- [ ] Update this file with completion status
- [ ] Add entry to CHANGELOG.md if significant

---

## Summary

| Phase | Task                    | Effort | Priority |
| ----- | ----------------------- | ------ | -------- |
| 1.1   | Remove dead code        | 5 min  | High     |
| 1.2   | Fix version             | 15 min | High     |
| 1.3   | Add constants           | 10 min | Medium   |
| 2.1   | Error logging helper    | 20 min | Medium   |
| 2.2   | Reduce debug verbosity  | 25 min | Medium   |
| 3.1   | Create dom-processor.ts | 45 min | Low      |
| 3.2   | Update imports          | 15 min | Low      |
| 4.1   | Fix type casts          | 30 min | Low      |
| 5     | Testing & docs          | 15 min | High     |

**Recommended Order:** 1.1 → 1.2 → 5 → 1.3 → 2.1 → 2.2 → 5 → 3.1 → 3.2 → 4.1 → 5

Run tests after each phase to catch regressions early.

---

## Acceptance Criteria

- [ ] No unused code in hyperscript-api.ts
- [ ] Version returns correct value (2.0.0)
- [ ] Debug logging only verbose when debug mode enabled
- [ ] DOM processing in separate module (optional)
- [ ] No `as unknown as` casts
- [ ] All 3,923+ tests passing
- [ ] Bundle size ≤ current size
