# HyperScript Compatibility Plan

## Goal
Achieve 100% compatibility with the official `_hyperscript` library by running and passing the original test suite.

## Current Status
- ✅ **Internal Implementation**: 1800+ tests, 98.5% pass rate  
- ✅ **Parser**: 56/56 hyperscript AST parser tests passing
- ✅ **Expressions**: 388/388 expression evaluation tests passing
- ❌ **Official Compatibility**: Not tested against `_hyperscript` test suite

## Analysis of Official Test Suite

Located at: `/Users/williamtalcott/projects/_hyperscript/test/`

### Test Structure:
- **Framework**: Mocha (we use Vitest)
- **Environment**: Browser DOM (we use Happy-DOM) 
- **API**: `evalHyperScript(expression, context)` function
- **Categories**:
  - `commands/` - 25+ command implementation tests
  - `expressions/` - 30+ expression parsing/evaluation tests  
  - `core/` - Parser, runtime, tokenizer tests
  - `features/` - Advanced features (behaviors, workers, etc.)

### Key Compatibility Requirements:
1. **API Compatibility**: Must provide `evalHyperScript()` function
2. **Context Compatibility**: Must handle `{ me, locals, result }` context format
3. **Return Value Compatibility**: Must return exact same values as original
4. **Error Compatibility**: Must handle errors the same way

## Implementation Plan

### Phase 1: API Compatibility Layer (2-3 hours)
**Goal**: Create `evalHyperScript()` adapter that wraps our `parseAndEvaluateExpression()`

**Tasks**:
1. Create `src/compatibility/eval-hyperscript.ts` 
2. Implement context format conversion
3. Implement return value normalization
4. Write basic compatibility tests
5. Export from main package

**TDD Approach**:
```typescript
// Test: should match _hyperscript API signature
it('should evaluate simple expressions like _hyperscript', async () => {
  const result = evalHyperScript("5 + 3");
  expect(result).toBe(8);
});

it('should handle context like _hyperscript', async () => {
  const result = evalHyperScript("my value", { me: { value: 42 } });
  expect(result).toBe(42);
});
```

### Phase 2: Test Suite Integration (1-2 hours) 
**Goal**: Set up infrastructure to run original `_hyperscript` tests

**Tasks**:
1. Create `src/compatibility/test-runner.ts`
2. Set up Mocha-to-Vitest test adapter
3. Create DOM environment compatibility layer
4. Import and adapt first test file
5. Establish baseline compatibility metrics

**TDD Approach**:
```typescript
// Test: should run original _hyperscript test
it('should pass possessive expression tests from _hyperscript', async () => {
  // Import original test: evalHyperScript("foo's foo", { locals: { foo: { foo: "foo" } } })
  const result = evalHyperScript("foo's foo", { locals: { foo: { foo: "foo" } } });
  expect(result).toBe("foo");
});
```

### Phase 3: Systematic Compatibility Testing (4-6 hours)
**Goal**: Run all original tests and catalog compatibility gaps

**Tasks**:
1. Run all expression tests (30+ files)
2. Run core parser/tokenizer tests  
3. Run basic command tests
4. Generate compatibility report
5. Prioritize fixes by impact

**Expected Issues**:
- Context variable differences (`me` vs `context.me`)
- Return value type differences (promises vs sync)
- Error handling differences
- Edge case behavior differences

### Phase 4: Fix Compatibility Issues (6-8 hours)
**Goal**: Achieve 95%+ compatibility with original test suite

**TDD Process**:
1. **Identify failing test**
2. **Write minimal reproduction** in our test suite
3. **Implement fix** in our codebase
4. **Verify fix** passes both our test and original test
5. **Repeat** until compatibility target achieved

**Priority Order**:
1. **Core Expressions** (arithmetic, logical, comparison)
2. **Property Access** (possessive, attribute references)
3. **DOM References** (CSS selectors, query references)
4. **Basic Commands** (put, set, add, remove)
5. **Advanced Features** (if needed for compatibility)

## Success Metrics

### Minimum Viable Compatibility (MVP):
- ✅ 90%+ of expression tests passing
- ✅ 80%+ of core parser/tokenizer tests passing  
- ✅ 70%+ of basic command tests passing

### Full Compatibility (Stretch):
- ✅ 95%+ of all expression tests passing
- ✅ 90%+ of all core tests passing
- ✅ 85%+ of all command tests passing

## Implementation Timeline

**Day 1 (4 hours)**:
- ✅ Phase 1: API Compatibility Layer
- ✅ Phase 2: Test Suite Integration

**Day 2 (6 hours)**:  
- ✅ Phase 3: Systematic Compatibility Testing
- 🚧 Phase 4: Begin fixing critical compatibility issues

**Day 3 (4 hours)**:
- ✅ Phase 4: Complete compatibility fixes
- ✅ Final compatibility report and documentation update

## Risks & Mitigation

**Risk**: Fundamental architectural differences  
**Mitigation**: Focus on API compatibility layer, not rewriting core

**Risk**: DOM environment differences
**Mitigation**: Use compatibility shims for DOM differences

**Risk**: Async vs sync execution differences
**Mitigation**: Provide both sync/async versions of API

## Deliverables

1. **`evalHyperScript()` compatibility function**
2. **Compatibility test suite** (original tests adapted)
3. **Compatibility report** (pass/fail breakdown)
4. **Updated documentation** with compatibility status
5. **Migration guide** for users switching from `_hyperscript`