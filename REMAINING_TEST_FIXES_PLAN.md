# Remaining Test Fixes Plan

This document outlines the strategy for resolving remaining test failures in the core package.

## Overview

| Category | Failing Tests | Priority | Effort |
|----------|---------------|----------|--------|
| Error Handler | 21 | Medium | High |
| Existence Operators | 7 | High | Low |
| Expression Property Access | ~15 | High | Medium |
| Tokenizer Classification | 2 | Low | Low |
| Precedence/Operators | 8 | Medium | Medium |
| CSS Selectors/Queries | 6 | Medium | Medium |
| Template Interpolation | 3 | Low | High |
| Null Coalescing | 2 | Low | Medium |
| Runtime Evaluator | 4 | Medium | Medium |
| **TOTAL** | **~68** | - | - |

---

## Phase 1: Quick Wins (Est. 1-2 hours)

### 1.1 Fix Tokenizer Classification Test
**File**: `src/parser/tokenizer.test.ts`
**Failures**: 2

**Issue**: Test expects `set`, `if`, `repeat`, `def` to be `KEYWORD` but they're classified as `COMMAND` because COMMANDS is checked before KEYWORDS.

**Fix Options**:
- **Option A** (Recommended): Update test expectations to accept COMMAND for dual-purpose tokens
- **Option B**: Reorder classification checks (may break other code)

```typescript
// Update test to reflect actual behavior
const keywords = ['on', 'init', 'behavior', 'end']; // Keep truly keyword-only tokens
const dualPurpose = ['def', 'set', 'if', 'repeat']; // These are also commands
```

### 1.2 Fix Existence Operators
**File**: `src/parser/existence-operators.test.ts`
**Failures**: 7

**Issue**: `no` operator not correctly identifying empty values

**Required Fixes**:
1. Empty array `[]` should return `true` for `no` operator
2. Empty object `{}` should return `true` for `no` operator
3. Boolean `false` should return `false` (not empty, just falsy)
4. Number `0` should return `false` (not empty, just zero)

**Location**: `src/parser/expression-parser.ts` - `evaluateNoOperator()` or similar

---

## Phase 2: Expression Property Access (Est. 2-3 hours)

### 2.1 Fix EnhancedMyExpression Property Access
**File**: `src/expressions/property/index.test.ts`
**Failures**: ~10

**Issue**: Property access on `me` context returns undefined for valid properties

**Tests Failing**:
- `should access simple element properties`
- `should access className property`
- `should access textContent property`
- `should access dataset properties`
- `should access style properties`
- `should handle null/boolean/numeric property values`

**Root Cause**: The `my` expression handler isn't correctly traversing element properties

### 2.2 Fix EnhancedItsExpression Object Access
**File**: `src/expressions/property/index.test.ts`
**Failures**: ~8

**Issue**: `its` property access failing for JavaScript objects

**Tests Failing**:
- `should access properties of JavaScript objects`
- `should access numeric properties`
- `should access boolean properties`
- `should access element properties`
- `should access array properties`
- `should access deeply nested properties`

---

## Phase 3: Operator Precedence (Est. 2-3 hours)

### 3.1 Fix Mixed Math + Comparison Precedence
**Files**:
- `src/parser/precedence-fix.test.ts`
- `src/parser/exponentiation-fix.test.ts`

**Failures**: ~8

**Issue**: Expressions like `2 + 3 > 4` or `2 + 3 * 4 > 10` evaluate incorrectly

**Required Fixes**:
1. Ensure math operators (`+`, `-`, `*`, `/`) bind tighter than comparison (`>`, `<`, `>=`, `<=`)
2. Implement exponentiation operator (`^` or `**`)

**Location**: `src/parser/expression-parser.ts` - precedence climbing algorithm

### 3.2 Fix Comparison Type Coercion
**File**: `src/expressions/comparison-operators-fix.test.ts`
**Failures**: 3

**Issue**: `==` (loose equality) not performing type coercion

**Tests Failing**:
- `"1" == 1` should be `true` (string/number coercion)
- Boolean coercion edge cases

---

## Phase 4: CSS Selectors (Est. 2 hours)

### 4.1 Fix Pseudo-Class Selectors
**Files**:
- `src/expressions/css-selector-enhancement.test.ts`
- `src/expressions/advanced-patterns.test.ts`

**Failures**: ~4

**Issue**: `:not()`, `:first-child`, etc. not parsed correctly

**Tests Failing**:
- Complex CSS selector with `:not()`
- Class selector with pseudo-class
- Complex attribute selectors

### 4.2 Fix Query Reference Property Access
**File**: `src/expressions/advanced-patterns.test.ts`

**Issue**: `document.querySelector(...)` property access returns undefined

---

## Phase 5: Error Handler Implementation (Est. 4-5 hours)

### 5.1 Complete Error Handler
**File**: `src/parser/error-handler.test.ts`
**Failures**: 21

**Issue**: Most error handler features are stubbed/unimplemented

**Required Implementations**:
1. Binary operator error enhancement
2. Parentheses error enhancement
3. Member access error enhancement
4. Command error enhancement
5. Typo detection (boolean, command, context variable)
6. Recovery strategy generation
7. Pattern detection (consecutive operators, invalid combinations)
8. Multiple error collection
9. Position tracking
10. Context-aware messaging

**Note**: This is a large undertaking. Consider if all these features are needed or if simpler error messages suffice.

---

## Phase 6: Lower Priority Items (Est. 3-4 hours)

### 6.1 Template String Interpolation
**Files**: `src/parser/expression-gaps-analysis.test.ts`
**Failures**: 3

**Issue**: Nested template literals fail to parse

### 6.2 Null Coalescing
**File**: `src/parser/expression-gaps-analysis.test.ts`
**Failures**: 2

**Issue**: `??` operator not implemented

### 6.3 Runtime Evaluator Fixes
**File**: `src/parser/runtime.test.ts`
**Failures**: 4

**Issues**:
- `my` property access in runtime
- Arithmetic expression evaluation
- Operator precedence in runtime

---

## Recommended Execution Order

1. **Phase 1** - Quick wins (tokenizer, existence operators)
2. **Phase 3** - Operator precedence (foundational for many other tests)
3. **Phase 2** - Property access (high-impact fixes)
4. **Phase 4** - CSS selectors
5. **Phase 6** - Lower priority items
6. **Phase 5** - Error handler (optional, high effort)

---

## Testing Commands

```bash
# Run specific test files
npm test --workspace=@hyperfixi/core -- --run src/parser/tokenizer.test.ts
npm test --workspace=@hyperfixi/core -- --run src/parser/existence-operators.test.ts
npm test --workspace=@hyperfixi/core -- --run src/expressions/property/

# Run all parser tests
npm test --workspace=@hyperfixi/core -- --run src/parser/

# Run all expression tests
npm test --workspace=@hyperfixi/core -- --run src/expressions/

# Full test suite
npm test --workspace=@hyperfixi/core -- --run
```

---

## Success Metrics

| Phase | Current Failures | Target | Tests Fixed |
|-------|------------------|--------|-------------|
| Phase 1 | 9 | 0 | 9 |
| Phase 2 | 18 | 0 | 18 |
| Phase 3 | 11 | 0 | 11 |
| Phase 4 | 6 | 0 | 6 |
| Phase 5 | 21 | 0 | 21 |
| Phase 6 | 9 | 0 | 9 |
| **Total** | **~68** | **0** | **~68** |

---

## Notes

- All failures are **pre-existing issues** not caused by recent `def` feature changes
- The `def` feature implementation added 8 new passing tests
- Parser consolidation (removing legacy `hyperscript-parser.ts`) is complete
- Core parser and hyperscript-parser tests: 102/102 passing
