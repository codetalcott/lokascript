# API v2 Implementation Plan

**Status:** Phase 1 Complete ✅
**Created:** 2026-01-16
**Last Updated:** 2026-01-16

## Overview

This plan covers the remaining work to fully roll out the new HyperFixi API (v2) with cleaner naming, async-by-default compilation, and consistent error handling.

---

## Phase 1: Core API Redesign ✅ COMPLETE

### Completed Tasks

- [x] Add new type definitions (`CompileResult`, `CompileError`, `NewCompileOptions`, `ValidateResult`)
- [x] Implement `compileSync()` - synchronous, English-optimized
- [x] Implement async `compile()` - handles all 13 languages
- [x] Implement `eval()` - compile and execute in one step
- [x] Implement `validate()` - syntax validation with error details
- [x] Update `createContext(element?, parent?)` - unified with optional parent
- [x] Add deprecation warnings for old methods (shown once per method)
- [x] Update `HyperscriptAPI` interface with new/deprecated sections
- [x] Update internal usages (`browser-bundle.ts`, `browser-modular.ts`, `attribute-processor.ts`)
- [x] Update tests to use new API
- [x] TypeScript passes
- [x] All 3906 tests pass

---

## Phase 2: Immediate Tasks (This Session)

### 2.1 Commit and Push Changes

**Priority:** High
**Effort:** 5 minutes

- [ ] Create commit with descriptive message covering both changes:
  - Vitest v4 compatibility fix for i18n/semantic packages
  - API v2 implementation with deprecation warnings
- [ ] Push to main branch

### 2.2 Update API Documentation

**Priority:** High
**Effort:** 30 minutes

Update `packages/core/docs/API.md` to document new API:

- [ ] Add "API v2 (Recommended)" section at top
- [ ] Document `compile()` async method with examples
- [ ] Document `compileSync()` with performance notes
- [ ] Document `eval()` with context handling examples
- [ ] Document `validate()` with error structure
- [ ] Document `createContext(element?, parent?)` unified signature
- [ ] Mark deprecated methods with warnings and migration paths
- [ ] Add "Migration Guide" section

### 2.3 Update CLAUDE.md

**Priority:** Medium
**Effort:** 15 minutes

Update project instructions with new API info:

- [ ] Update "Key commands" section with new method names
- [ ] Add note about async `compile()` being default
- [ ] Update any code examples to use new API

### 2.4 Mark Phase 1 Complete in Proposal

**Priority:** Low
**Effort:** 5 minutes

- [ ] Update `roadmap/api-redesign-proposal.md` Implementation Plan section
- [ ] Check off Phase 1 items
- [ ] Add completion date

---

## Phase 3: Short-term Improvements (Next Session)

### 3.1 Create Migration Guide Document

**Priority:** High
**Effort:** 45 minutes
**File:** `packages/core/docs/MIGRATION.md`

```markdown
# Migration Guide: API v1 → v2

## Quick Reference

| Old API                           | New API                     | Notes          |
| --------------------------------- | --------------------------- | -------------- |
| `compile(code)`                   | `await compile(code)`       | Now async      |
| `compileMultilingual(code, opts)` | `await compile(code, opts)` | Unified        |
| `run(code, ctx)`                  | `await eval(code, ctx)`     | Renamed        |
| `evaluate(code, ctx)`             | `await eval(code, ctx)`     | Renamed        |
| `isValidHyperscript(code)`        | `await validate(code)`      | Returns errors |
| `createChildContext(parent, el)`  | `createContext(el, parent)` | Args swapped   |
| `processNode(el)`                 | `process(el)`               | Simplified     |
| `parse(code)`                     | `compileSync(code)`         | Consistent     |

## Detailed Examples

...
```

### 3.2 Update types-browser Package

**Priority:** High
**Effort:** 30 minutes
**File:** `packages/types-browser/src/core-api.d.ts`

Update browser type definitions to include new methods:

- [ ] Add `compileSync()` method
- [ ] Add `eval()` method
- [ ] Add `validate()` method
- [ ] Update `compile()` signature (now async)
- [ ] Update `createContext()` signature (optional parent)
- [ ] Add `CompileResult`, `ValidateResult` types
- [ ] Mark deprecated methods with `@deprecated` JSDoc

### 3.3 Add JSDoc Examples for IDE Support

**Priority:** Medium
**Effort:** 20 minutes

Enhance `hyperscript-api.ts` with JSDoc examples:

````typescript
/**
 * Compile hyperscript code to AST (async, handles all languages).
 *
 * @example
 * ```typescript
 * // English
 * const result = await hyperscript.compile('toggle .active');
 * if (result.ok) {
 *   await hyperscript.execute(result.ast, context);
 * }
 *
 * // Japanese
 * const result = await hyperscript.compile('.active を トグル', { language: 'ja' });
 * ```
 */
compile(code: string, options?: NewCompileOptions): Promise<CompileResult>;
````

### 3.4 Update Cookbook Examples

**Priority:** Medium
**Effort:** 30 minutes

Update examples in `cookbook/` to use new API:

- [ ] `cookbook/README.md` - update API examples
- [ ] `cookbook/complete-demo.html` - if uses old API
- [ ] Check other cookbook files for old API usage

---

## Phase 4: Medium-term Improvements (Future Sessions)

### 4.1 Performance Benchmarking

**Priority:** Medium
**Effort:** 1 hour

Create benchmark suite to validate:

- [ ] `compileSync()` vs old `compile()` - should be equivalent
- [ ] `compile()` async overhead for English - should be minimal
- [ ] `compile()` with Japanese - measure direct AST path
- [ ] `eval()` vs `run()` - should be equivalent

**File:** `packages/core/src/api/hyperscript-api.bench.ts`

### 4.2 Add Edge Case Tests

**Priority:** Medium
**Effort:** 30 minutes

Add tests for uncovered scenarios:

- [ ] `createContext(element, parent)` - verify parent inheritance
- [ ] `eval()` with Element passed directly as context
- [ ] `eval()` with partial context object
- [ ] `validate()` with various languages
- [ ] `compile()` with `confidenceThreshold` option

### 4.3 Prepare for Major Version Bump

**Priority:** Low
**Effort:** 2 hours (when ready)

Before removing deprecated methods:

- [ ] Ensure all internal code uses new API
- [ ] Search for external usage in examples/docs
- [ ] Update version to 2.0.0 in package.json
- [ ] Create CHANGELOG entry
- [ ] Remove deprecated methods and their wrappers
- [ ] Remove old type definitions (`CompilationResult`, `CompileOptions`, etc.)
- [ ] Final test pass

### 4.4 Update MCP Server Tools

**Priority:** Low
**Effort:** 1 hour

If MCP tools use the API, update them:

- [ ] Check `packages/*/src/mcp/` for API usage
- [ ] Update to use new method names
- [ ] Update tool descriptions if they mention old API

---

## Testing Checklist

Before each commit:

```bash
# Quick validation
npm run typecheck --prefix packages/core
npm test --prefix packages/core -- --run

# Full validation (before push)
npm test --prefix packages/core -- --run
npm test --prefix packages/i18n -- --run
npm test --prefix packages/semantic -- --run
```

---

## Success Criteria

### Phase 2 Complete When:

- [ ] Changes committed and pushed
- [ ] API.md documents all new methods
- [ ] CLAUDE.md updated with new API info

### Phase 3 Complete When:

- [ ] MIGRATION.md created with examples
- [ ] types-browser updated with new types
- [ ] JSDoc examples added to API methods
- [ ] Cookbook examples updated

### Phase 4 Complete When:

- [ ] Performance benchmarks show no regression
- [ ] Edge case tests added and passing
- [ ] Ready for 2.0.0 release (deprecated methods can be removed)

---

## Notes

- Deprecation warnings are shown **once per method** to avoid console spam
- The async `compile()` delegates to `compileSync()` for English, so no performance penalty
- Browser bundles still expose sync compile via wrapper for backward compatibility
- `eval` is a reserved word in JS but works fine as object property (`hyperscript.eval()`)
