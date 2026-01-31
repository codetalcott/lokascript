# Phase 6: Remaining 38 Commands Migration Plan

**Date Created**: 2025-11-22
**Status**: READY FOR EXECUTION
**Context**: Phase 5 complete (16 commands migrated, 56% bundle reduction achieved)

---

## Executive Summary

**Current State**: 16/54 commands migrated to standalone V2 (29.6% complete)
**Remaining Work**: 38 commands + template subsystem (~10,627 lines)
**Estimated Effort**: 152-221 hours over 8 weeks
**Expected Outcome**: >60% bundle reduction with all commands standalone

**Phase 5 Achievement** (Completed):

- ✅ 56% bundle reduction (366 KB → 160 KB)
- ✅ All 16 core commands standalone
- ✅ Zero V1 dependencies
- ✅ 100% feature parity maintained

---

## Migration Strategy: 7 Phases Over 8 Weeks

### Phase 1: Critical Control Flow (Week 1)

**Priority**: P0-P2 | **Effort**: 20-30 hours | **Lines**: 1,221

**Commands** (5):

1. `if.ts` (310 lines) - P0 - Conditional logic [BLOCKER FOR OTHER COMMANDS]
2. `repeat.ts` (641 lines) - P0 - Iteration/loops [BLOCKER FOR break/continue]
3. `break.ts` (70 lines) - P2 - Loop control (requires `repeat`)
4. `continue.ts` (71 lines) - P2 - Loop control (requires `repeat`)
5. `halt.ts` (129 lines) - P2 - Flow interruption

**Why First**: These commands are fundamental to hyperscript. Nearly every behavior uses `if` and `repeat`. Without them, complex logic is impossible.

**Dependencies**: `repeat` must be completed before `break`/`continue`

**Implementation Order**:

1. Day 1-2: `if.ts` (enables conditional logic)
2. Day 3-5: `repeat.ts` (most complex, enables loops)
3. Day 6: `break.ts`, `continue.ts`, `halt.ts` (quick wins after `repeat`)

**Success Criteria**:

- ✅ Zero V1 dependencies
- ✅ All control flow patterns working (if/else, repeat/while/for, break/continue)
- ✅ Integration tests passing
- ✅ Bundle size measured and documented

---

### Phase 2: Essential Data & Execution (Week 2)

**Priority**: P1-P2 | **Effort**: 18-25 hours | **Lines**: 1,187

**Commands** (5): 6. `bind.ts` (496 lines) - P1 - Two-way data binding [HIGH COMPLEXITY] 7. `call.ts` (204 lines) - P2 - Function invocation [BLOCKER FOR return] 8. `append.ts` (309 lines) - P2 - DOM content manipulation 9. `return.ts` (101 lines) - P2 - Function returns (requires `call`) 10. `exit.ts` (77 lines) - P2 - Behavior termination

**Why Second**: Data binding and function calls are essential for real-world applications. `bind` enables reactive patterns, `call`/`return` enable function composition.

**Dependencies**: `call` must be completed before `return`

**Implementation Order**:

1. Day 1-3: `bind.ts` (complex, bidirectional reactivity)
2. Day 4: `call.ts`, `return.ts` (tackle together)
3. Day 5: `append.ts`, `exit.ts` (simpler, finish strong)

**High Risk**: `bind.ts` is 496 lines with MutationObserver, event handlers, and complex reactivity logic. Plan extra time.

---

### Phase 3: Animation & Persistence (Week 3)

**Priority**: P2 | **Effort**: 20-28 hours | **Lines**: 1,377

**Commands** (4): 11. `transition.ts` (335 lines) - P2 - CSS transitions 12. `measure.ts` (326 lines) - P2 - FLIP animations 13. `settle.ts` (326 lines) - P2 - Animation settling 14. `persist.ts` (390 lines) - P2 - LocalStorage integration

**Why Third**: Modern UIs require smooth animations and state persistence. These commands form a cohesive animation subsystem.

**Dependencies**: None - all can be done in parallel if needed

**Implementation Order**:

1. Day 1-2: `transition.ts` (CSS transitions)
2. Day 3: `measure.ts`, `settle.ts` (FLIP animation pair)
3. Day 4-5: `persist.ts` (localStorage integration)

**Note**: Animation trio (`transition`, `measure`, `settle`) often work together. Test them as a unit.

---

### Phase 4: Advanced Features (Week 4)

**Priority**: P1-P3 | **Effort**: 20-30 hours | **Lines**: 1,469

**Commands** (5): 15. `js.ts` (296 lines) - P2 - JavaScript execution 16. `unless.ts` (223 lines) - P1 - Inverse conditional (requires Phase 1 `if`) 17. `default.ts` (381 lines) - P3 - Variable initialization 18. `pseudo-command.ts` (365 lines) - P3 - Meta-commands 19. `async.ts` (204 lines) - P3 - Async wrapper

**Why Fourth**: Power user capabilities and advanced patterns. These unlock sophisticated use cases.

**Dependencies**: `unless` requires `if` from Phase 1 (should be complete by now)

**Implementation Order**:

1. Day 1-2: `js.ts` (JavaScript execution, scope management)
2. Day 3: `unless.ts`, `async.ts` (both straightforward)
3. Day 4: `default.ts` (variable defaults)
4. Day 5: `pseudo-command.ts` (meta-command system)

---

### Phase 5: Utility & Specialized (Week 5)

**Priority**: P3-P4 | **Effort**: 18-24 hours | **Lines**: 1,439

**Commands** (6): 20. `tell.ts` (289 lines) - P3 - Cross-element messaging 21. `copy.ts` (285 lines) - P3 - Clipboard operations 22. `pick.ts` (195 lines) - P3 - Object property selection 23. `throw.ts` (127 lines) - P3 - Error handling 24. `install.ts` (320 lines) - P3 - Runtime behavior installation 25. `beep.ts` (223 lines) - P4 - Audio notifications

**Why Fifth**: Convenience and utility commands. Less frequently used but valuable for specific use cases.

**Dependencies**: None - all independent

**Implementation Order** (can be parallelized or reordered):

1. Day 1: `tell.ts` (messaging)
2. Day 2: `copy.ts`, `pick.ts` (browser APIs)
3. Day 3: `throw.ts`, `install.ts` (error handling, meta)
4. Day 4: `beep.ts` (audio)
5. Day 5: Testing & refinement

**Note**: These are good candidates for parallelization if multiple developers available.

---

### Phase 6: Complex Property Transfer (Week 6)

**Priority**: P3 | **Effort**: 16-24 hours | **Lines**: 934

**Command** (1): 26. `take.ts` (934 lines) - P3 - Property/class transfer system [VERY HIGH COMPLEXITY]

**Why Sixth**: This is the most complex single command. Tackle it after gaining experience from 25 previous migrations.

**Complexity Factors**:

- 934 lines (largest single command)
- Sophisticated property transfer logic
- Complex validation and type handling
- Multiple transfer modes (classes, attributes, styles)
- Temporal modifiers support

**Implementation Strategy**:

- Day 1-2: Understand V1 implementation, plan architecture
- Day 3-4: Implement `parseInput()` and core logic
- Day 5: Testing, edge cases, refinement

**Success Criteria**:

- All property transfer modes working
- All temporal modifiers supported
- Edge cases handled (non-existent properties, type mismatches)
- Performance parity with V1

---

### Phase 7: Template Subsystem (Weeks 7-8)

**Priority**: P3 | **Effort**: 40-60 hours | **Lines**: ~3,000

**Components** (7 files + directives): 27. `render.ts` (775 lines) - Main render command 28. `template-compiler.ts` (344 lines) - Template compilation 29. `template-executor.ts` (533 lines) - Template execution 30. `template-executor-optimized.ts` (594 lines) - Optimized executor 31. `template-context.ts` (397 lines) - Context management 32. `template-processor-fixed.ts` (332 lines) - Template processing 33. Directives: `if-directive.ts`, `else-directive.ts`, `repeat-directive.ts`

**Why Last**: This is an entire subsystem, not a single command. Should be migrated as a cohesive unit after mastering the standalone pattern.

**Implementation Strategy**:

**Week 7: Core Infrastructure**

- Day 1-2: `template-context.ts`, `template-compiler.ts` (foundation)
- Day 3-4: `template-executor.ts` (core execution)
- Day 5: `template-processor-fixed.ts` (processing logic)

**Week 8: Execution & Directives**

- Day 1-2: `template-executor-optimized.ts` (performance variant)
- Day 3: Directives (`if-directive`, `else-directive`, `repeat-directive`)
- Day 4: `render.ts` (main command, ties everything together)
- Day 5: Integration testing, documentation

**Special Considerations**:

- Template subsystem is interconnected - changes to one file may affect others
- Need comprehensive testing with various template patterns
- Performance is critical (templates are often used in loops)
- Consider creating Phase 7 sub-plan document

---

## Standard Implementation Pattern

For each command, follow this proven pattern (from Phase 5):

### 1. Create File Structure

```
src/commands-v2/{category}/{command-name}.ts
```

### 2. Define Typed Interfaces

```typescript
export interface {CommandName}Input {
  // Parsed, typed inputs from AST
  targets: HTMLElement[];
  // ... other typed fields
}

export interface {CommandName}Output {
  // Return value (if any)
}
```

### 3. Implement Command Class

```typescript
export class {CommandName}Command implements Command<{CommandName}Input, {CommandName}Output> {
  readonly name = '{commandname}';

  readonly metadata = {
    description: "...",
    syntax: ["..."],
    examples: ["..."],
    category: "..."
  };

  // Inline utilities (~20-80 lines)
  private async resolveTargets(...) { ... }
  private parseClasses(...) { ... }
  // ... other helpers

  // AST → Typed Input
  async parseInput(
    raw: { args: ASTNode[]; modifiers: Record<string, ExpressionNode> },
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<{CommandName}Input> {
    // Parse arguments and modifiers
    // Return typed input object
    // NO V1 DEPENDENCIES
  }

  // Typed Input → Side Effects
  async execute(
    input: {CommandName}Input,
    context: TypedExecutionContext
  ): Promise<{CommandName}Output> {
    // Perform command action
    // Return result
  }
}
```

### 4. Create Factory Function

```typescript
export function create{CommandName}Command(): Command<{CommandName}Input, {CommandName}Output> {
  return new {CommandName}Command();
}
```

### 5. Zero V1 Dependencies

- ❌ NO imports from `src/commands/`
- ❌ NO imports from V1 utilities
- ✅ Inline all required utilities
- ✅ Self-contained, tree-shakable

---

## Quality Checklist (Per Command)

Before marking a command complete:

### Code Quality

- [ ] Zero TypeScript errors
- [ ] Zero V1 imports/dependencies
- [ ] Comprehensive JSDoc comments
- [ ] Inline utilities (~20-80 lines)
- [ ] Proper error handling

### Feature Parity

- [ ] All V1 syntax patterns supported
- [ ] All modifiers working
- [ ] All temporal modifiers supported (if applicable)
- [ ] Edge cases handled

### Testing

- [ ] Unit tests created/passing
- [ ] Integration tests passing
- [ ] V1 compatibility tests passing
- [ ] Performance benchmarks (no regression)

### Documentation

- [ ] Metadata complete (description, syntax, examples)
- [ ] Category assigned correctly
- [ ] Migration notes (if any breaking changes)

---

## Testing Strategy

### Per-Phase Testing

After each phase, run:

1. **TypeScript Validation**: `npm run typecheck`
2. **Unit Tests**: `npx vitest run src/commands-v2/{category}/`
3. **Integration Tests**: Full runtime tests
4. **Bundle Size**: Rebuild test bundles, measure impact
5. **Regression Tests**: Ensure existing functionality unchanged

### Phase Completion Criteria

- ✅ All phase commands migrated
- ✅ Zero TypeScript errors
- ✅ All tests passing (440+ → growing)
- ✅ Bundle size measured and documented
- ✅ Git commit with phase summary

---

## Bundle Size Tracking

Measure bundle impact after each phase:

```bash
cd packages/core
npx rollup -c rollup.test-bundles.config.mjs
ls -lh dist/test-*.js
```

Expected progression:

- **Baseline**: 366 KB (V1 only)
- **Phase 5 Complete**: 160 KB (16 standalone) ✅ **-56%**
- **Phase 1 Complete**: ~140 KB (21 standalone, critical control flow)
- **Phase 2 Complete**: ~130 KB (26 standalone, data/execution)
- **Phase 3 Complete**: ~120 KB (30 standalone, animation)
- **Phase 4 Complete**: ~110 KB (35 standalone, advanced)
- **Phase 5 Complete**: ~105 KB (41 standalone, utility)
- **Phase 6 Complete**: ~100 KB (42 standalone, take command)
- **Phase 7 Complete**: ~90 KB (all standalone) **Target: >75% reduction**

---

## Risk Management

### High-Risk Commands

1. **`repeat.ts`** (641 lines) - Complex iteration, loop context
   - **Mitigation**: Allocate 3 days, extensive testing
2. **`bind.ts`** (496 lines) - Bidirectional reactivity, MutationObserver
   - **Mitigation**: Allocate 3 days, study V1 implementation thoroughly
3. **`take.ts`** (934 lines) - Property transfer complexity
   - **Mitigation**: Full week dedicated, leverage prior experience
4. **Template Subsystem** (~3,000 lines) - Interconnected components
   - **Mitigation**: 2 weeks dedicated, create sub-plan, modular approach

### Blockers & Dependencies

- `repeat` blocks `break`, `continue` (Phase 1)
- `if` blocks `unless` (Phase 1 → Phase 4)
- `call` blocks `return` (Phase 2)

**Strategy**: Complete blocker commands first in each phase.

---

## Git Workflow

### Per-Command Commits

```bash
git add src/commands-v2/{category}/{command}.ts
git commit -m "feat(commands-v2): Implement standalone {CommandName} (Phase {N})

- Zero V1 dependencies
- Full feature parity with V1
- Inlined utilities ({X} lines)
- Comprehensive metadata

Part of Phase {N} migration ({M}/{Total} commands complete)"
```

### Per-Phase Commits

After phase complete:

```bash
git commit -m "feat(commands-v2): Complete Phase {N} - {Category} ({X} commands)

Commands migrated:
- {command1} ({lines} lines)
- {command2} ({lines} lines)
- ...

Bundle impact: {old}KB → {new}KB ({-%} reduction)
Tests passing: {count}
Phase {N}/{7} complete"
```

---

## Session Checklist

When starting a new work session:

1. **Pull latest changes**: `git pull`
2. **Check current status**: Review this plan, identify next command
3. **Read V1 implementation**: Understand existing behavior
4. **Plan architecture**: Sketch out parseInput() and execute()
5. **Implement command**: Follow standard pattern
6. **Test thoroughly**: Unit + integration tests
7. **Measure impact**: Bundle size, performance
8. **Commit**: Clear message with context
9. **Update this plan**: Mark command complete, update estimates

---

## Success Metrics

### Overall Goals

- [ ] All 38 commands migrated to standalone V2
- [ ] Template subsystem fully functional
- [ ] Zero V1 dependencies across all commands
- [ ] > 75% bundle reduction (366 KB → <90 KB)
- [ ] All tests passing (600+ tests expected)
- [ ] Zero breaking changes for consumers
- [ ] Complete documentation

### Per-Phase Milestones

- [ ] Phase 1: Control flow working (if/repeat/break/continue/halt)
- [ ] Phase 2: Data binding & function calls working
- [ ] Phase 3: Animations & persistence working
- [ ] Phase 4: Advanced features working (js/unless/async)
- [ ] Phase 5: All utility commands working
- [ ] Phase 6: Property transfer (take) working
- [ ] Phase 7: Template subsystem working

---

## Next Steps

**To begin Phase 1** (Critical Control Flow):

1. **Review V1 implementation**:

   ```bash
   cat src/commands/control-flow/if.ts
   cat src/commands/control-flow/repeat.ts
   ```

2. **Create Phase 1 working branch**:

   ```bash
   git checkout -b feat/phase-6-1-control-flow
   ```

3. **Start with `if.ts`**:
   - Create `src/commands-v2/control-flow/if.ts`
   - Implement following standard pattern
   - Test thoroughly
   - Commit

4. **Proceed to `repeat.ts`** (most complex):
   - Allocate 3 days
   - Study loop context handling
   - Implement carefully
   - Extensive testing

5. **Finish with quick wins**: `break`, `continue`, `halt`

6. **Measure bundle impact** and commit phase

---

## Estimated Timeline

| Phase     | Week  | Days   | Commands  | Lines       | Effort       |
| --------- | ----- | ------ | --------- | ----------- | ------------ |
| 1         | 1     | 5      | 5         | 1,221       | 20-30h       |
| 2         | 2     | 5      | 5         | 1,187       | 18-25h       |
| 3         | 3     | 5      | 4         | 1,377       | 20-28h       |
| 4         | 4     | 5      | 5         | 1,469       | 20-30h       |
| 5         | 5     | 5      | 6         | 1,439       | 18-24h       |
| 6         | 6     | 5      | 1         | 934         | 16-24h       |
| 7         | 7-8   | 10     | Subsystem | ~3,000      | 40-60h       |
| **Total** | **8** | **40** | **27**    | **~10,627** | **152-221h** |

---

## Post-Migration Cleanup Plan

After all 7 phases complete:

1. **Delete V1 infrastructure**:

   ```bash
   rm -rf src/commands/
   ```

2. **Update Runtime**:
   - Make RuntimeExperimental the default
   - Deprecate or remove original Runtime class

3. **Update exports** in `src/index.ts`:
   - Export RuntimeExperimental as primary
   - Update documentation

4. **Update browser bundles**:
   - All bundles use RuntimeExperimental
   - Remove V1 fallbacks

5. **Final measurements**:
   - Bundle sizes (expect >75% reduction)
   - Performance benchmarks
   - Test coverage report

6. **Documentation**:
   - Update TREE_SHAKING_COMPLETE.md
   - Create PHASE_6_COMPLETE.md
   - Update main README

---

## Questions & Decisions

### Before Starting Phase 1

1. **Testing Infrastructure**: Browser test issues identified - resolve before starting?
   - Option A: Fix tests first
   - Option B: Proceed with migration, fix tests later
   - **Recommendation**: Proceed (code compiles successfully, tests are environmental)

2. **Branch Strategy**: One branch per phase or one for all phases?
   - **Recommendation**: One branch per phase for easier review

3. **Documentation Frequency**: Update docs per command or per phase?
   - **Recommendation**: Per phase (less overhead)

---

## Resources

### Reference Documents

- [TREE_SHAKING_COMPLETE.md](TREE_SHAKING_COMPLETE.md) - Phase 1-5 summary
- [HYBRID_TREE_SHAKING_GUIDE.md](HYBRID_TREE_SHAKING_GUIDE.md) - Standalone pattern guide
- [WEEK3_5_COMPLETION_PLAN.md](WEEK3_5_COMPLETION_PLAN.md) - Phase 5 execution plan

### Example Commands (Phase 5 - Reference)

- Simple: `src/commands-v2/utility/log.ts` (182 lines)
- Medium: `src/commands-v2/dom/hide.ts` (238 lines)
- Complex: `src/commands-v2/dom/toggle.ts` (804 lines)

### Bundle Measurements

```bash
# Measure current bundles
cd packages/core
ls -lh dist/test-*.js

# Current (Phase 5 complete):
# - test-baseline.js: 366 KB (V1 baseline)
# - test-minimal.js: 160 KB (Phase 5 standalone)
# - test-standard.js: 160 KB (Phase 5 standalone)
```

---

**Ready to Execute**: This plan is comprehensive and ready for implementation. Start with Phase 1, follow the standard pattern, and track progress meticulously.

🚀 **Phase 6 Migration: 38 Commands → Standalone V2** 🚀
