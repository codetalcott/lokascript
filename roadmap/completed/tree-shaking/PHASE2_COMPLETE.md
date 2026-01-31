# Phase 2 Complete: Command Wrappers with parseInput() ✅

**Date**: 2025-11-21
**Status**: ✅ **COMPLETE** - 5 core commands ready for RuntimeBase
**Time**: ~1.5 hours

## Summary

Successfully created non-destructive command wrappers for 5 core DOM commands, each with `parseInput()` methods that enable tree-shakable RuntimeBase usage. All original commands remain 100% untouched.

---

## What Was Accomplished

### 1. Commands V2 Directory Created

**Location**: `packages/core/src/commands-v2/`

- ✅ Non-destructive wrapper pattern established
- ✅ Original commands completely untouched (in `src/commands/`)
- ✅ Easy rollback (just delete `commands-v2/` directory)
- ✅ Clean separation for parallel testing

### 2. Five Core Commands Enhanced

#### **HideCommand** (`commands-v2/dom/hide.ts`)

- Extends `HideCommand` from `commands/dom/hide.ts`
- Adds `parseInput()` for argument evaluation
- Handles: `hide [<target>]` pattern
- Logic moved from `Runtime.executeCommand()` lines 1682-1688

#### **ShowCommand** (`commands-v2/dom/show.ts`)

- Extends `ShowCommand` from `commands/dom/show.ts`
- Adds `parseInput()` for argument evaluation
- Handles: `show [<target>]` pattern
- Logic moved from `Runtime.executeCommand()` lines 1690-1694

#### **AddCommand** (`commands-v2/dom/add.ts`)

- Extends `AddCommand` from `commands/dom/add.ts`
- Adds `parseInput()` for class name extraction
- Handles: `add .className` pattern
- Special logic: Extracts class names WITHOUT evaluating to elements
- Logic moved from `Runtime.executeCommand()` lines 1704-1713

#### **RemoveCommand** (`commands-v2/dom/remove.ts`)

- Extends `RemoveCommand` from `commands/dom/remove.ts`
- Adds `parseInput()` for class name extraction
- Handles: `remove .className` pattern
- Special logic: Extracts class names WITHOUT evaluating to elements
- Logic moved from `Runtime.executeCommand()` lines 1715-1724

#### **ToggleCommand** (`commands-v2/dom/toggle.ts`)

- Extends `ToggleCommand` from `commands/dom/toggle.ts`
- Adds `parseInput()` with complex pattern handling
- Handles multiple patterns:
  - `toggle .class` (implicit target: me)
  - `toggle .class on #target`
  - `toggle #dialog` (smart element detection)
  - `toggle #dialog modal`
- Logic moved from `Runtime.executeEnhancedCommand()` lines 844-1011

### 3. Index File for Easy Imports

**File**: `commands-v2/index.ts`

```typescript
export { HideCommand, createHideCommand } from './dom/hide';
export { ShowCommand, createShowCommand } from './dom/show';
export { AddCommand, createAddCommand } from './dom/add';
export { RemoveCommand, createRemoveCommand } from './dom/remove';
export { ToggleCommand, createToggleCommand } from './dom/toggle';
```

---

## Technical Architecture

### parseInput() Interface

```typescript
interface CommandWithParseInput {
  /**
   * Parse raw AST input into evaluated arguments
   *
   * @param raw - Raw AST nodes and modifiers from the parser
   * @param evaluator - Expression evaluator for resolving AST nodes
   * @param context - Execution context
   * @returns Evaluated arguments ready for execute()
   */
  parseInput(
    raw: { args: ASTNode[]; modifiers: Record<string, ASTNode> },
    evaluator: ExpressionEvaluator,
    context: ExecutionContext
  ): Promise<any[]>;
}
```

### Wrapper Pattern

```typescript
// Before (V1): Original command without parseInput()
export class HideCommand {
  async execute(context, ...args) {
    /* ... */
  }
}

// After (V2): Non-destructive wrapper WITH parseInput()
import { HideCommand as HideCommandV1 } from '../../commands/dom/hide';

export class HideCommand extends HideCommandV1 {
  async parseInput(raw, evaluator, context) {
    // Move parsing logic from Runtime here
    const evaluatedArgs = await Promise.all(raw.args.map(arg => evaluator.evaluate(arg, context)));
    return evaluatedArgs;
  }

  // execute() inherited from V1 - zero changes!
}
```

### Benefits of This Pattern

1. **✅ Non-Destructive** - Original commands untouched
2. **✅ Inheritance** - Extends original, reuses all logic
3. **✅ Additive Only** - Only adds parseInput(), no modifications
4. **✅ Easy Rollback** - Delete commands-v2/ if needed
5. **✅ Parallel Testing** - Can test V2 without affecting V1
6. **✅ Zero Breaking Changes** - V1 commands still work everywhere

---

## Argument Parsing Patterns

### Pattern 1: Simple Evaluation (Hide/Show)

**Commands**: hide, show

```typescript
// Evaluate each arg as expression
const evaluatedArgs = await Promise.all(raw.args.map(arg => evaluator.evaluate(arg, context)));
```

### Pattern 2: String Extraction (Add/Remove)

**Commands**: add, remove

```typescript
// Extract class names WITHOUT evaluation
const classNames = raw.args.map(arg => {
  if (arg.type === 'selector' || arg.type === 'class_reference') {
    let className = arg.value;
    return className.startsWith('.') ? className.slice(1) : className;
  }
  return arg.value || arg.name || arg;
});
```

### Pattern 3: Complex Multi-Pattern (Toggle)

**Command**: toggle

```typescript
// Handle multiple syntax patterns
if (args.length === 3) {
  // "toggle .class on #target"
  evaluatedArgs = [classArg, target];
} else if (args.length === 1) {
  // "toggle .class" OR "toggle #dialog"
  const isSmartElement = classArg.startsWith('#') || ['dialog', 'details'].includes(classArg);
  evaluatedArgs = isSmartElement ? [classArg] : [classArg, context.me];
} else if (args.length >= 2) {
  // "toggle #dialog modal"
  evaluatedArgs = [selector, mode];
}
```

---

## Validation Results

### TypeScript Compilation

```bash
✅ All 5 commands compile with 0 errors
✅ All imports resolve correctly
✅ No unused variable warnings (fixed with _prefix)
```

### File Structure

```
packages/core/src/
├── commands/              (V1 - original, UNTOUCHED)
│   └── dom/
│       ├── hide.ts       ✅ Unchanged
│       ├── show.ts       ✅ Unchanged
│       ├── add.ts        ✅ Unchanged
│       ├── remove.ts     ✅ Unchanged
│       └── toggle.ts     ✅ Unchanged
│
├── commands-v2/           (V2 - new wrappers)
│   ├── index.ts          ✅ New
│   └── dom/
│       ├── hide.ts       ✅ New (extends V1)
│       ├── show.ts       ✅ New (extends V1)
│       ├── add.ts        ✅ New (extends V1)
│       ├── remove.ts     ✅ New (extends V1)
│       └── toggle.ts     ✅ New (extends V1)
│
└── runtime/
    └── runtime-base.ts   ✅ Ready to use commands-v2
```

---

## How RuntimeBase Will Use These Commands

```typescript
import { RuntimeBase } from '@lokascript/core/runtime/runtime-base';
import { EnhancedCommandRegistry } from '@lokascript/core/runtime/command-adapter';

// Import V2 commands with parseInput()
import { createHideCommand } from '@lokascript/core/commands-v2/dom/hide';
import { createShowCommand } from '@lokascript/core/commands-v2/dom/show';

// Create registry
const registry = new EnhancedCommandRegistry();

// Register V2 commands
registry.register(createHideCommand());
registry.register(createShowCommand());

// Create minimal runtime
const runtime = new RuntimeBase({ registry });

// RuntimeBase flow:
// 1. User code: "hide me"
// 2. RuntimeBase calls: command.parseInput(raw, evaluator, context)
// 3. parseInput() evaluates args: [context.me]
// 4. RuntimeBase calls: command.execute(context, context.me)
// 5. ✅ Element hidden!
```

---

## Files Created/Modified

### Created (Phase 2)

- ✅ `packages/core/src/commands-v2/index.ts`
- ✅ `packages/core/src/commands-v2/dom/hide.ts`
- ✅ `packages/core/src/commands-v2/dom/show.ts`
- ✅ `packages/core/src/commands-v2/dom/add.ts`
- ✅ `packages/core/src/commands-v2/dom/remove.ts`
- ✅ `packages/core/src/commands-v2/dom/toggle.ts`
- ✅ `roadmap/tree-shaking/PHASE2_COMPLETE.md` (this file)

### Modified (Phase 2)

- None ✅ (completely non-destructive)

### Untouched (Verified)

- ✅ All files in `src/commands/` (0 changes)
- ✅ `src/runtime/runtime.ts` (0 changes)
- ✅ `src/runtime/runtime-base.ts` (0 changes)
- ✅ All test files (0 changes)

---

## Next Steps (Gate 2 Validation)

Phase 2 is complete. Next: Gate 2 validation to test these commands with RuntimeBase.

### Gate 2 Success Criteria

- [ ] Create test runtime using RuntimeBase + commands-v2
- [ ] Test hide command: `on click hide me`
- [ ] Test show command: `on click show #element`
- [ ] Test add command: `add .active`
- [ ] Test remove command: `remove .loading`
- [ ] Test toggle command: `toggle .selected`
- [ ] Verify identical behavior to Runtime
- [ ] Verify bundle only includes registered commands

### After Gate 2 Passes

If validation succeeds:

- ✅ Proceed to Phase 3 (Refactor CommandAdapter)
- ✅ Add parseInput() to remaining 15+ commands
- ✅ Create comprehensive test suite

If validation fails:

- ❌ Investigate discrepancies
- ❌ Fix command wrappers
- ❌ Re-test before proceeding

---

## Risk Assessment

| Risk               | Status          | Mitigation                                       |
| ------------------ | --------------- | ------------------------------------------------ |
| Breaking changes   | ✅ **ZERO**     | Original commands untouched, wrappers extend     |
| TypeScript errors  | ✅ **ZERO**     | All commands compile cleanly                     |
| Logic differences  | ⚠️ **UNKNOWN**  | Requires Gate 2 testing                          |
| Missing edge cases | ⚠️ **POSSIBLE** | Toggle has complex logic, needs thorough testing |

---

## Code Quality Metrics

### Commands V2 Statistics

- **Total files**: 6 (5 commands + 1 index)
- **Total lines**: ~500 lines
- **Inheritance**: All extend V1 commands
- **New methods**: 1 per command (parseInput)
- **Modified methods**: 0 (all inherited)
- **Test coverage**: Pending (Gate 2)

### Complexity Analysis

- **HideCommand**: Low (simple evaluation)
- **ShowCommand**: Low (simple evaluation)
- **AddCommand**: Medium (string extraction + strip)
- **RemoveCommand**: Medium (string extraction + strip)
- **ToggleCommand**: High (4 pattern variants + smart detection)

---

## Developer Notes

### Why Wrappers Instead of Direct Modifications?

**Option A (Rejected)**: Modify original commands directly

- ❌ Risk: Breaking existing functionality
- ❌ Risk: Hard to rollback
- ❌ Risk: Affects all Runtime users immediately

**Option B (Chosen)**: Create wrappers in commands-v2

- ✅ Zero risk: Original commands untouched
- ✅ Easy rollback: Delete commands-v2/
- ✅ Parallel testing: Can test both versions
- ✅ Gradual migration: Move commands one-by-one
- ✅ Clear separation: Easy to see what changed

### Migration Path

```
Week 1: Phase 2 (COMPLETE)
  ├─ Create 5 core command wrappers
  └─ Gate 2 validation

Week 2: Expand to all commands
  ├─ Add parseInput() to remaining 15+ commands
  ├─ Test each individually
  └─ Create comprehensive test suite

Week 3: Integration
  ├─ Update CommandAdapter to call parseInput()
  ├─ Create RuntimeExperimental using commands-v2
  └─ Validate identical behavior

Week 4: Cleanup (if successful)
  ├─ Move commands-v2 → commands
  ├─ Archive old commands as commands-v1-backup
  └─ Update all imports
```

---

## Conclusion

**Phase 2 is a complete success**. We've created:

1. ✅ **5 command wrappers** - Non-destructive, extend originals
2. ✅ **parseInput() methods** - Move parsing from Runtime to commands
3. ✅ **Zero TypeScript errors** - All compile cleanly
4. ✅ **Zero breaking changes** - Original commands untouched
5. ✅ **Clean architecture** - Clear separation, easy rollback

**Ready for Gate 2**: Test these commands with RuntimeBase to validate behavior.

---

## Sign-Off

- ✅ TypeScript: 0 errors in commands-v2
- ✅ Original commands: 100% untouched
- ✅ Inheritance: All wrappers extend V1
- ✅ Exports: Clean index file
- ✅ Risk: ZERO (completely additive)

**Phase 2 Status**: ✅ **COMPLETE**

**Next Action**: Gate 2 validation (test commands with RuntimeBase)
