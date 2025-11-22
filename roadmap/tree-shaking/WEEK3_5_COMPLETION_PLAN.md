# Weeks 3-5 Standalone Command Migration Plan

**Date**: 2025-11-22
**Status**: 🚧 **READY TO START** - Week 3 Begins
**Scope**: Complete standalone migration for remaining 9/16 commands
**Timeline**: 3 weeks (26-34 hours Week 3, 20-26 hours Week 4, 18-24 hours Week 5)

---

## Executive Summary

This document provides the detailed execution plan for completing the hybrid tree-shaking initiative by converting the remaining 9 V2 commands to standalone implementations (zero V1 dependencies).

### Current State (Week 2 Complete)

- ✅ **7/16 commands standalone** (43% complete)
- ✅ **42% bundle reduction** achieved (366 KB → 213 KB)
- ✅ **308+ tests passing** (100% V1 feature parity)
- ✅ **Proven pattern** across diverse command complexities

### Target State (Week 5 Complete)

- 🎯 **16/16 commands standalone** (100% complete)
- 🎯 **51-59% bundle reduction** (366 KB → 150-180 KB standard bundle)
- 🎯 **73-78% minimal reduction** (366 KB → 80-100 KB minimal bundle)
- 🎯 **True command-level tree-shaking** enabled
- 🎯 **All 440+ tests passing** with zero breaking changes

### Remaining Work

9 commands organized into 3 priority tiers:

**Week 3 (High Priority)**: toggle, put, send (3 commands, 26-34 hours)
**Week 4 (Standard Priority)**: fetch, trigger, make (3 commands, 20-26 hours)
**Week 5 (Completeness)**: increment, decrement, go (3 commands, 18-24 hours)

**Total Effort**: 64-84 hours (8-10.5 days)

---

## Week 3: High-Priority Commands (26-34 hours)

### 1. Toggle Command (HIGH COMPLEXITY)

**Priority**: CRITICAL - High bundle impact, used in minimal bundle

**Current State**:
- **File**: `packages/core/src/commands-v2/dom/toggle.ts`
- **Status**: Extends ToggleCommandV1
- **V1 Lines**: 1,110 lines
- **V1 File**: `packages/core/src/commands/dom/toggle.ts`

**V1 Dependencies to Inline**:

```typescript
// From validation/lightweight-validators.ts (~15 lines)
- resolveTargets()

// From utils/dom-utils.ts (~20 lines)
- parseClasses()
- parseAttributes()

// From core/events.ts (~10 lines)
- temporal modifier handling

// From commands/dom/toggle.ts V1 features
- Class toggling (add/remove based on presence)
- Attribute toggling (set/remove based on presence)
- Dialog/details element handling (open attribute)
- Temporal modifiers (for <duration>, until <event>)
```

**V1 Features to Preserve**:

1. **Class Toggle**: `toggle .class` - add if absent, remove if present
2. **Attribute Toggle**: `toggle @disabled` - set if absent, remove if present
3. **Multiple Targets**: `toggle .active on .items`
4. **Dialog/Details**: Special handling for `<dialog>` and `<details>` elements
5. **Temporal Modifiers**: `toggle .class for 1s`, `toggle .class until click`

**Implementation Strategy**:

1. **Phase 1**: Analyze V1 implementation (2 hours)
   - Read full V1 toggle.ts (1,110 lines)
   - Identify all edge cases
   - Map out temporal modifier dependencies

2. **Phase 2**: Implement standalone parseInput() (4-6 hours)
   - Parse target expressions
   - Parse classes/attributes to toggle
   - Parse temporal modifiers
   - Inline resolveTargets utility

3. **Phase 3**: Implement execute() (4-6 hours)
   - Inline class/attribute toggling logic
   - Handle dialog/details special cases
   - Implement temporal modifiers
   - Preserve V1 behavior exactly

4. **Phase 4**: Testing & Validation (2-4 hours)
   - Write unit tests for parseInput
   - Write unit tests for execute
   - Write V1-v2 compatibility tests
   - Run official _hyperscript toggle tests

**Estimated Standalone Size**: 400-600 lines (vs 1,110 V1 lines)

**Effort**: 12-16 hours

**Success Criteria**:

- [ ] Zero V1 dependencies (verified via imports)
- [ ] All V1 features working (classes, attributes, dialog/details, temporal)
- [ ] 100% compatibility tests passing
- [ ] Official _hyperscript toggle tests passing
- [ ] TypeScript zero errors
- [ ] Bundle size reduction measured

---

### 2. Put Command (MEDIUM COMPLEXITY)

**Priority**: HIGH - Used in minimal bundle, moderate complexity

**Current State**:
- **File**: `packages/core/src/commands-v2/dom/put.ts`
- **Status**: Extends PutCommandV1
- **V1 Lines**: ~400 lines
- **V1 File**: `packages/core/src/commands/dom/put.ts`

**V1 Dependencies to Inline**:

```typescript
// From validation/lightweight-validators.ts
- resolveTargets() (~25 lines)

// From utils/dom-utils.ts
- parseValue() (~15 lines)
- DOM insertion logic (~20 lines)
```

**V1 Features to Preserve**:

1. **Standard Positions**: beforeend, afterend, beforebegin, afterbegin
2. **Multiple Values**: `put "text" into #target`
3. **Multiple Targets**: `put "text" into .targets`
4. **Member Expressions**: `put result into element's dataset.value` (fixed in recent commit)

**Implementation Strategy**:

1. **Phase 1**: Analyze V1 + recent fixes (1-2 hours)
   - Review V1 put.ts implementation
   - Verify memberExpression fix (commit e9cbade)
   - Map insertion positions

2. **Phase 2**: Implement parseInput() (2-3 hours)
   - Parse value expression
   - Parse target expression
   - Parse position (beforeend/afterend/etc)
   - Inline resolveTargets

3. **Phase 3**: Implement execute() (2-3 hours)
   - Inline DOM insertion logic for each position
   - Handle memberExpression targets
   - Preserve exact V1 behavior

4. **Phase 4**: Testing (1-2 hours)
   - Unit tests (parseInput + execute)
   - V1-v2 compatibility tests
   - MemberExpression regression test

**Estimated Standalone Size**: 250-350 lines (vs ~400 V1 lines)

**Effort**: 6-8 hours

**Success Criteria**:

- [ ] Zero V1 dependencies
- [ ] All 4 position types working (beforeend, afterend, beforebegin, afterbegin)
- [ ] MemberExpression fix preserved
- [ ] Compatibility tests passing
- [ ] TypeScript zero errors

---

### 3. Send Command (MEDIUM-HIGH COMPLEXITY)

**Priority**: HIGH - Used in minimal bundle, event creation complexity

**Current State**:
- **File**: `packages/core/src/commands-v2/events/send.ts`
- **Status**: Extends SendCommandV1
- **V1 Lines**: 682 lines
- **V1 File**: `packages/core/src/commands/events/send.ts`

**V1 Dependencies to Inline**:

```typescript
// From utils/event-utils.ts
- createCustomEvent() (~30 lines)
- parseEventDetails() (~20 lines)

// From validation/lightweight-validators.ts
- resolveTargets() (~25 lines)
```

**V1 Features to Preserve**:

1. **Simple Events**: `send customEvent to #target`
2. **Event Details**: `send dataEvent(foo: 'bar') to #target`
3. **Bubbling**: `send event to #target with bubbles`
4. **Multiple Targets**: `send event to .targets`
5. **To Window**: `send globalEvent to window`

**Implementation Strategy**:

1. **Phase 1**: Analyze V1 event system (2 hours)
   - Read V1 send.ts
   - Understand event creation patterns
   - Map detail data structures

2. **Phase 2**: Implement parseInput() (3-4 hours)
   - Parse event name
   - Parse event details (key-value pairs)
   - Parse target expression
   - Parse options (bubbles, cancelable, etc)

3. **Phase 3**: Implement execute() (2-3 hours)
   - Inline createCustomEvent utility
   - Build detail object from parsed data
   - Dispatch event to targets

4. **Phase 4**: Testing (1-3 hours)
   - Unit tests (various event types)
   - V1-v2 compatibility tests
   - Event detail verification

**Estimated Standalone Size**: 350-450 lines (vs 682 V1 lines)

**Effort**: 8-10 hours

**Success Criteria**:

- [ ] Zero V1 dependencies
- [ ] All event types working (simple, with details, bubbling)
- [ ] Event details correctly structured
- [ ] Compatibility tests passing
- [ ] TypeScript zero errors

---

### Week 3 Summary

**Commands**: toggle (12-16h), put (6-8h), send (8-10h)
**Total Effort**: 26-34 hours (3.25-4.25 days)
**Target**: 10/16 commands complete (62%)
**Expected Bundle**: ~200-210 KB standard bundle

**Risk Mitigation**:

- Toggle is highest complexity - allocate extra time
- Each command committed separately for easy rollback
- Compatibility tests required before moving to next command
- Daily progress check against time estimates

---

## Week 4: Standard Bundle Commands (20-26 hours)

### 4. Fetch Command (MEDIUM-HIGH COMPLEXITY)

**Priority**: STANDARD - HTTP requests, moderate bundle impact

**Current State**:
- **File**: `packages/core/src/commands-v2/async/fetch.ts`
- **Status**: Extends FetchCommandV1
- **V1 Lines**: ~400 lines
- **V1 File**: `packages/core/src/commands/async/fetch.ts`

**V1 Dependencies to Inline**:

```typescript
// From utils/http-utils.ts
- parseRequestOptions() (~25 lines)
- handleResponse() (~20 lines)

// From validation/lightweight-validators.ts
- validateURL() (~10 lines)
```

**V1 Features to Preserve**:

1. **Simple Fetch**: `fetch /api/data`
2. **With Options**: `fetch /api/data with method:'POST', body:data`
3. **Response Handling**: `fetch /api/data as json then set result`
4. **Error Handling**: Proper error propagation

**Effort**: 8-10 hours

**Success Criteria**:

- [ ] Zero V1 dependencies
- [ ] All HTTP methods working (GET, POST, PUT, DELETE)
- [ ] Request options correctly applied
- [ ] Response types handled (json, text, blob)
- [ ] Error handling preserved
- [ ] Compatibility tests passing

---

### 5. Trigger Command (MEDIUM-HIGH COMPLEXITY)

**Priority**: STANDARD - Similar to send but different semantics

**Current State**:
- **File**: `packages/core/src/commands-v2/events/trigger.ts`
- **Status**: Extends TriggerCommandV1
- **V1 Lines**: 682 lines
- **V1 File**: `packages/core/src/commands/events/trigger.ts`

**V1 Dependencies to Inline**:

```typescript
// From utils/event-utils.ts
- createCustomEvent() (~30 lines)  // Same as send
- parseEventDetails() (~20 lines)

// From validation/lightweight-validators.ts
- resolveTargets() (~25 lines)
```

**V1 Features to Preserve**:

1. **Trigger on Target**: `trigger click on #button`
2. **Custom Events**: `trigger customEvent on #target`
3. **Event Details**: `trigger dataEvent(foo: 'bar') on #target`
4. **DOM Events**: Click, change, input, etc.

**Effort**: 8-10 hours

**Success Criteria**:

- [ ] Zero V1 dependencies
- [ ] Both DOM and custom events working
- [ ] Event details correctly structured
- [ ] Triggers fire on correct targets
- [ ] Compatibility tests passing

---

### 6. Make Command (MEDIUM COMPLEXITY)

**Priority**: STANDARD - DOM creation utilities

**Current State**:
- **File**: `packages/core/src/commands-v2/dom/make.ts`
- **Status**: Extends MakeCommandV1
- **V1 Lines**: ~300 lines
- **V1 File**: `packages/core/src/commands/dom/make.ts`

**V1 Dependencies to Inline**:

```typescript
// From utils/dom-utils.ts
- createElement() (~20 lines)
- parseElementSpec() (~15 lines)
- setAttributes() (~10 lines)
```

**V1 Features to Preserve**:

1. **Simple Elements**: `make a <div/>`
2. **With Attributes**: `make a <div.class#id/>`
3. **With Content**: `make a <div>"content"</div>`
4. **Assign to Variable**: `make a <button/> called btn`

**Effort**: 6-8 hours

**Success Criteria**:

- [ ] Zero V1 dependencies
- [ ] Element creation working
- [ ] Attributes correctly applied
- [ ] Content insertion working
- [ ] Variable assignment working
- [ ] Compatibility tests passing

---

### Week 4 Summary

**Commands**: fetch (8-10h), trigger (8-10h), make (6-8h)
**Total Effort**: 22-28 hours (2.75-3.5 days)
**Target**: 13/16 commands complete (81%)
**Expected Bundle**: ~170-190 KB standard bundle

---

## Week 5: Final Commands (18-24 hours)

### 7. Increment Command (MEDIUM COMPLEXITY)

**Priority**: COMPLETENESS - Variable manipulation

**Current State**:
- **File**: `packages/core/src/commands-v2/data/increment.ts`
- **Status**: Extends IncrementCommandV1
- **V1 Lines**: 544 lines
- **V1 File**: `packages/core/src/commands/data/increment.ts`

**V1 Dependencies to Inline**:

```typescript
// From utils/variable-utils.ts
- resolveVariable() (~20 lines)
- parseNumericValue() (~15 lines)
```

**V1 Features to Preserve**:

1. **Simple Increment**: `increment x`
2. **By Amount**: `increment x by 5`
3. **Property Increment**: `increment obj.count`
4. **Element Properties**: `increment element's value`

**Effort**: 6-8 hours

**Success Criteria**:

- [ ] Zero V1 dependencies
- [ ] Variable increment working
- [ ] Property increment working
- [ ] Numeric parsing correct
- [ ] Compatibility tests passing

---

### 8. Decrement Command (MEDIUM COMPLEXITY)

**Priority**: COMPLETENESS - Mirror of increment

**Current State**:
- **File**: `packages/core/src/commands-v2/data/decrement.ts`
- **Status**: Extends DecrementCommandV1
- **V1 Lines**: ~500 lines
- **V1 File**: `packages/core/src/commands/data/decrement.ts`

**V1 Dependencies to Inline**:

```typescript
// From utils/variable-utils.ts
- resolveVariable() (~20 lines)  // Same as increment
- parseNumericValue() (~15 lines)
```

**V1 Features to Preserve**:

1. **Simple Decrement**: `decrement x`
2. **By Amount**: `decrement x by 5`
3. **Property Decrement**: `decrement obj.count`
4. **Element Properties**: `decrement element's value`

**Effort**: 6-8 hours

**Success Criteria**:

- [ ] Zero V1 dependencies
- [ ] Variable decrement working
- [ ] Property decrement working
- [ ] Numeric parsing correct
- [ ] Compatibility tests passing

---

### 9. Go Command (MEDIUM COMPLEXITY)

**Priority**: COMPLETENESS - Navigation

**Current State**:
- **File**: `packages/core/src/commands-v2/navigation/go.ts`
- **Status**: Extends GoCommandV1
- **V1 Lines**: ~400 lines
- **V1 File**: `packages/core/src/commands/navigation/go.ts`

**V1 Dependencies to Inline**:

```typescript
// From utils/navigation-utils.ts
- parseURL() (~15 lines)
- validateNavigationTarget() (~10 lines)
```

**V1 Features to Preserve**:

1. **URL Navigation**: `go to url '/page'`
2. **Back/Forward**: `go back`, `go forward`
3. **History API**: `go to url '/page' with method:'replace'`
4. **External Links**: `go to url 'https://example.com'`

**Effort**: 6-8 hours

**Success Criteria**:

- [ ] Zero V1 dependencies
- [ ] URL navigation working
- [ ] Back/forward working
- [ ] History API methods working
- [ ] External link handling correct
- [ ] Compatibility tests passing

---

### Week 5 Summary

**Commands**: increment (6-8h), decrement (6-8h), go (6-8h)
**Total Effort**: 18-24 hours (2.25-3 days)
**Target**: 16/16 commands complete (100%)
**Expected Bundle**: ~150-180 KB standard bundle (51-59% reduction)

---

## Testing Strategy

### Per-Command Testing (Required Before Marking Complete)

1. **Unit Tests** - parseInput() method:
   - Test all argument variations
   - Test edge cases
   - Test error conditions

2. **Unit Tests** - execute() method:
   - Test core functionality
   - Test all feature variations
   - Test error handling

3. **V1-V2 Compatibility Tests**:
   - Side-by-side comparison with V1
   - Verify identical behavior
   - Test edge cases that differ

4. **Official _hyperscript Tests** (if available):
   - Run relevant official test files
   - Verify 100% compatibility

### Integration Testing (After Each Week)

1. **Build Validation**:
   ```bash
   npm run build:browser --prefix packages/core
   npm run typecheck --prefix packages/core
   ```

2. **Test Suite Validation**:
   ```bash
   npm run test:quick --prefix packages/core
   npm test --prefix packages/core
   ```

3. **Bundle Size Measurement**:
   - Measure minimal bundle size
   - Measure standard bundle size
   - Document savings vs baseline

### Final Validation (Week 5 Complete)

1. **Full Test Suite**: All 440+ tests passing
2. **Official Compatibility**: All 81 test files passing
3. **Bundle Analysis**: Final size measurements and documentation
4. **TypeScript**: Zero errors across entire codebase
5. **Linting**: Zero warnings

---

## Risk Management

### High-Risk Items

1. **Toggle Command Complexity** (Week 3)
   - **Risk**: 1,110 V1 lines, temporal modifiers, complex edge cases
   - **Mitigation**: Allocate 12-16 hours (most time), test-first approach
   - **Contingency**: If exceeds 16 hours, carry overflow to Week 4

2. **Dual Event Commands** (Send + Trigger, Weeks 3-4)
   - **Risk**: Similar but subtly different semantics
   - **Mitigation**: Implement send first, learn patterns, apply to trigger
   - **Contingency**: Consider shared event utility if duplication excessive

3. **Time Overruns**
   - **Risk**: Commands take longer than estimated
   - **Mitigation**: Track actual time per command, adjust subsequent estimates
   - **Contingency**: Week 5 has buffer (simplest commands)

### Rollback Plan

Each command is committed separately with clear commit messages:
```
feat(commands-v2): Implement standalone ToggleCommand

- Zero V1 dependencies
- 100% V1 feature parity
- 42 unit tests passing
- 15 v1-v2 compatibility tests passing
- Bundle size: 205 KB standard (-8 KB vs previous)
```

**Rollback Process**:
1. Identify problematic commit: `git log --oneline`
2. Revert to previous commit: `git reset --hard <commit-hash>`
3. Re-run tests to verify stability
4. Document issue and revise approach

### Quality Gates

Each command must pass ALL gates before proceeding to next:

- ✅ **Gate 1**: Zero V1 dependencies (verify imports)
- ✅ **Gate 2**: All unit tests passing
- ✅ **Gate 3**: V1-v2 compatibility tests passing
- ✅ **Gate 4**: TypeScript zero errors
- ✅ **Gate 5**: Bundle size improvement measured
- ✅ **Gate 6**: Code review (self-review for consistency)

---

## Success Metrics

### Code Quality Metrics

- **Zero V1 dependencies**: Verified via import analysis
- **Pattern consistency**: All commands follow same structure
- **Type safety**: 100% TypeScript coverage
- **Documentation**: Comprehensive JSDoc for all methods
- **Code duplication**: Acceptable (<200 lines total across all commands)

### Bundle Size Metrics

| Milestone | Standard Bundle | vs Baseline | vs Phase 4 |
|-----------|-----------------|-------------|------------|
| **Week 2 Complete** | 213 KB (minimal) | -42% | -7% |
| **Week 3 Target** | ~200-210 KB | -45-47% | -9-13% |
| **Week 4 Target** | ~180-190 KB | -49-51% | -17-22% |
| **Week 5 Target** | ~150-180 KB | -51-59% | -22-35% |

### Test Coverage Metrics

- **Unit tests**: 100% coverage for parseInput + execute
- **Compatibility tests**: 100% V1 behavior preserved
- **Official tests**: All relevant _hyperscript tests passing
- **Regression tests**: Zero new failures introduced

### Timeline Metrics

- **Week 3 Target**: Complete by Day 4.25 (26-34 hours)
- **Week 4 Target**: Complete by Day 7.5 (additional 22-28 hours)
- **Week 5 Target**: Complete by Day 10.5 (additional 18-24 hours)
- **Total Timeline**: 8-10.5 days of focused work

---

## Related Documentation

- [TREE_SHAKING_COMPLETE.md](TREE_SHAKING_COMPLETE.md) - Phases 1-5 overview
- [HYBRID_TREE_SHAKING_GUIDE.md](../../packages/core/HYBRID_TREE_SHAKING_GUIDE.md) - Implementation patterns
- [PHASE3_4_COMPLETE.md](PHASE3_4_COMPLETE.md) - CommandAdapterV2 architecture
- [packages/core/CLAUDE_CODE_INTEGRATION.md](../../packages/core/CLAUDE_CODE_INTEGRATION.md) - Testing feedback

---

## Conclusion

This plan provides a clear roadmap for completing the hybrid tree-shaking initiative over 3 weeks. The systematic approach—prioritized by bundle impact, structured testing, and gated quality checks—minimizes risk while maximizing bundle reduction.

**Expected Outcome**: 16/16 commands standalone, 51-59% total bundle reduction, true command-level tree-shaking enabled, zero breaking changes.

**Recommendation**: Begin Week 3 immediately with toggle command (highest complexity). Success with toggle validates approach for remaining commands.

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
