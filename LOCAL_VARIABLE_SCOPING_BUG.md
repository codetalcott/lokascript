# Local Variable Scoping Bug Investigation

**Status**: In Progress
**Date**: 2025-12-04
**Test File**: `examples/advanced/test-state-machine-minimal.html`

## The Bug

Local variables (`:variable` syntax) set in `init` blocks are not accessible in event handlers triggered during init via `send`.

**Error**: `Member expression does not evaluate to a function: push`

This occurs when trying to call `:history.push(...)` in an event handler, where `:history` was set to `[]` in the init block.

## Reproduction

```hyperscript
init
  set :state to 'idle'
  set :history to []
  send addEntry('Started')   -- Event fires, but :history is undefined in handler
end

on addEntry(action)
  log :history               -- Logs undefined instead of []
  call :history.push({...})  -- Fails: "does not evaluate to a function: push"
end
```

## What We Verified Works

Individual features work in isolation:
- Object literals with `new Date().toLocaleTimeString()`
- Local variable method calls (`:history.push()`) within init itself
- Event sending (`send updateHistory`)
- `for` loops
- Template literals with `${entry.action}`
- if/else chains
- Possessive syntax (`#btn-action's disabled`)
- Dynamic getElementById

## Architecture Understanding

1. **Context Creation** ([context.ts:28](packages/core/src/core/context.ts#L28)): `createContext()` creates `locals: new Map()`

2. **Program Execution** ([runtime-base.ts:246-305](packages/core/src/runtime/runtime-base.ts#L246-L305)):
   - Phase 1: Event handlers registered (capture `context` by reference)
   - Phase 2: Init blocks execute (modify `context.locals`)
   - Same `context` object used for both phases

3. **Event Handler Execution** ([runtime-base.ts:480-567](packages/core/src/runtime/runtime-base.ts#L480-L567)):
   - Line 494: `const eventLocals = new Map(context.locals)` copies locals
   - Closure captures `context` from registration time
   - Should see modifications made during init...

4. **Command Adapter** ([command-adapter.ts:56-193](packages/core/src/runtime/command-adapter.ts#L56-L193)):
   - `ContextBridge.toTyped()` uses same Map reference: `locals: context.locals || new Map()`
   - After command, `Object.assign(context, fromTyped(...))` copies back

5. **SetCommand** ([set.ts:563](packages/core/src/commands/data/set.ts#L563)): `context.locals.set(variableName, value)`

## Key Question

The context should be the same object reference throughout. When `send` dispatches an event synchronously, the event handler's closure should see the current state of `context.locals`.

**Why isn't `:history` visible in the event handler?**

## Debug Code Added

Added debug logging at [expression-evaluator.ts:458-464](packages/core/src/core/expression-evaluator.ts#L458-L464):
```typescript
console.log(`[DEBUG] Looking for local var '${name}' in context.locals:`, {
  hasLocals: !!context.locals,
  localsKeys: context.locals ? Array.from(context.locals.keys()) : [],
  hasVariable: context.locals?.has(name),
  value: context.locals?.get(name)
});
```

## Next Steps

1. Rebuild and check console output to see what's actually in `context.locals` when the event handler tries to access `:history`
2. The issue may be:
   - Context not being shared properly between init and event handler
   - A new context being created somewhere unexpectedly
   - The event handler receiving a stale or empty locals Map

## Related Fix (Completed)

Fixed sortable list example - `first .selector in element` pattern wasn't being parsed correctly. Added Case 3 handling in [expression-evaluator.ts:649-670](packages/core/src/core/expression-evaluator.ts#L649-L670) for `callExpression` nodes where callee is 'first' or 'last'.
