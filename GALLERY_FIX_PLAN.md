# Gallery Test Remaining Issues - Fix Plan

## Current Status (After Session Fixes)

**Completed Fixes:**
- CSS selector property mismatch in add/remove/toggle commands
- Keyword preposition filtering in resolveTargets
- Install command identifier evaluation
- If command args-based format support
- Set command variable node type support

**Test Results:**
- Basics: 5/5 (100%)
- Intermediate: 4/6 (67%)
- Advanced: 4/5 (80%)

## Remaining Issues

### 1. Fetch Data - Put Command Variable Handling

**Error:**
```
Invalid CSS selector: "todoData" - No elements found matching selector: "todoData"
```

**Root Cause:**
The `put` command in `put todoData into #result` is treating `todoData` (a variable) as a CSS selector instead of evaluating it as a variable reference.

**Fix Location:** `packages/core/src/commands/data/put.ts`

**Solution:**
Similar to the set command fix - detect identifier/variable nodes and evaluate them as variable references rather than CSS selectors:
```typescript
// In parseInput, check if value arg is an identifier node
const valueArg = raw.args[0] as any;
if (valueArg?.type === 'identifier' && typeof valueArg.name === 'string') {
  // Look up variable value from context
  value = context.locals?.get(valueArg.name) ??
          context.globals?.get(valueArg.name) ??
          context.variables?.get(valueArg.name);
} else {
  value = await evaluator.evaluate(valueArg, context);
}
```

**Priority:** High - affects common data binding patterns

---

### 2. Color Cycling - Repeat Forever Loop Type

**Error:**
```
repeat command requires a loop type (for/times/while/until/forever)
```

**Root Cause:**
The V2 repeat command's `parseInput` method doesn't recognize the `forever` keyword from the parsed AST.

**Fix Location:** `packages/core/src/commands/control-flow/repeat.ts`

**Solution:**
Check for `forever` in the loop type detection logic. The parser likely outputs this differently than expected:
```typescript
// In parseInput, add forever detection
const loopTypeArg = raw.args[0] as any;
if (loopTypeArg?.type === 'identifier' && loopTypeArg.name === 'forever') {
  return { type: 'forever', body: raw.args[1] };
}
// Also check modifiers
if (raw.modifiers?.forever) {
  return { type: 'forever', body: thenBlock };
}
```

**Priority:** High - affects animation and polling patterns

---

### 3. Form Validation - Unknown Issue

**Error:** Test fails but no error logged

**Investigation Needed:**
1. Check what hyperscript is used in the form validation example
2. Run with verbose logging to capture the specific failure point
3. Likely related to form element handling or validation API calls

**Fix Location:** TBD after investigation

**Priority:** Medium - requires investigation first

---

### 4. State Machine - Timeout/Hanging

**Error:** Test never completes

**Root Cause (Suspected):**
- Infinite loop in state transition
- Async operation never resolving
- Event listener not properly triggering

**Investigation Needed:**
1. Check state machine example for `wait for` or `repeat until` patterns
2. Verify event dispatching works correctly
3. Add timeout guards to prevent infinite loops

**Fix Location:** TBD after investigation

**Priority:** Medium - complex debugging required

---

## Implementation Order

1. **Put Command** (Fetch Data) - Similar pattern to set command fix, quick win
2. **Repeat Forever** (Color Cycling) - Localized fix in repeat.ts
3. **Form Validation** - Investigate first, then fix
4. **State Machine** - Deep investigation, may require multiple fixes

## Estimated Effort

| Issue | Effort | Confidence |
|-------|--------|------------|
| Put Command | 30 min | High |
| Repeat Forever | 30 min | High |
| Form Validation | 1-2 hr | Medium |
| State Machine | 2-4 hr | Low |

## Notes

- All fixes follow the same pattern: V2 commands need to handle AST node types correctly
- The parser creates consistent node structures, but V2 commands weren't updated to match
- Consider creating a shared utility for identifier/variable node evaluation
