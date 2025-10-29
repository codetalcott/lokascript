# Architecture Note: Legacy vs Enhanced Command Patterns

**Date**: 2025-10-29
**Context**: Discovered during Session 12 continuation (repeat command debugging)

## Key Finding: Two Command Architectures Still Exist

Despite the successful codebase consolidation that removed all "legacy" and "enhanced-" **naming**, the codebase still maintains **two distinct command implementation patterns** at the architectural level.

## The Two Patterns

### 1. Legacy Command Pattern

**Signature**: `execute(context: ExecutionContext, ...args: unknown[]): Promise<unknown>`

**Registration**: Via `Runtime.registerLegacyCommand()`

**Wrapper**: The registration creates an adapter that wraps the command:
```typescript
async execute(context: ExecutionContext, ...args: unknown[]): Promise<unknown> {
  return await command.execute(context, ...args);
}
```

**Function Length**: The wrapper has `execute.length === 1` (rest params don't count)

**Commands Using This Pattern** (as of 2025-10-29):
- IfCommand
- HaltCommand
- BreakCommand
- ContinueCommand
- ReturnCommand
- ThrowCommand
- UnlessCommand
- MeasureCommand
- SettleCommand
- TakeCommand
- DefaultCommand
- AsyncCommand
- MakeCommand
- AppendCommand
- CallCommand
- JSCommand
- TellCommand
- PickCommand
- TransitionCommand (sometimes - appears to be in both!)
- RenderCommand (conditional registration)

### 2. Enhanced Command Pattern

**Signature**: `execute(input: TInput, context: TypedExecutionContext): Promise<TOutput>`

**Registration**: Via `EnhancedCommandRegistry.register()` → creates `CommandAdapter`

**Function Length**: Has `execute.length === 2` (both params count)

**Type Safety**: Full TypeScript types with `CommandImplementation<TInput, TOutput, TContext>`

**Commands Using This Pattern** (from ENHANCED_COMMAND_FACTORIES):
- increment, decrement, set, default
- make
- append
- call, get, pseudo-command
- if, halt, return, throw, **repeat**, unless, continue, break
- pick, log
- tell, js, beep, async
- settle, measure, transition
- render
- add, remove, toggle, show, hide, put
- send, trigger
- go
- install

## The Problem Discovered

**RepeatCommand was registered TWICE**:
1. ✅ In `ENHANCED_COMMAND_FACTORIES` (correct)
2. ❌ Via `registerLegacyCommand()` in runtime.ts line 256 (incorrect - bug!)

The legacy registration **overrode** the enhanced registration, causing:
- CommandAdapter to detect `execute.length === 1` (legacy wrapper)
- Using legacy execution path: passing context as first arg
- RepeatCommand.execute() receiving context object instead of RepeatCommandInput
- Error: "Unknown repeat type: undefined"

## Implications for Future Work

### Current State
- **Naming**: ✅ Consolidated (no more "legacy-" or "enhanced-" prefixes)
- **Architecture**: ⚠️ Dual-pattern system still exists
- **Consistency**: ❌ Some commands appear in both registries

### Potential Issues
1. **Accidental Double Registration**: Easy to register a command in both places (as happened with RepeatCommand)
2. **Inconsistent Behavior**: Same command class behaves differently depending on how it's registered
3. **Type Safety Gaps**: Legacy commands lack the type safety of enhanced commands
4. **Maintenance Confusion**: Developers must know which pattern each command uses

### Migration Status

Looking at the code, it appears the project is **mid-migration** from legacy to enhanced pattern:

- Some commands exist in both registries (repeat, transition, etc.)
- Some commands are only in legacy registry (if, halt, break, continue, return, throw, unless)
- Enhanced registry is the "new" way, but legacy is still heavily used

### Recommendations for Future Sessions

#### Option 1: Complete Migration (High Effort, High Value)
Migrate all remaining legacy commands to enhanced pattern:
- Convert execute signatures: `(context, ...args)` → `(input, context)`
- Define proper TypeScript input/output types
- Remove all `registerLegacyCommand()` calls
- Update command-adapter.ts to remove legacy path
- Delete `registerLegacyCommand()` method entirely

**Benefits**:
- Single, consistent command architecture
- Full type safety across all commands
- No risk of double registration
- Cleaner, more maintainable codebase

**Estimated Effort**: 2-4 sessions (15-20 commands to migrate)

#### Option 2: Formalize Dual Architecture (Medium Effort, Medium Value)
Accept that both patterns will coexist, but prevent issues:
- Add runtime checks to prevent double registration
- Clear documentation on which pattern each command uses
- Automated tests to detect registration conflicts
- Update CLAUDE.md to explain the architectural split

**Benefits**:
- Lower effort than full migration
- Prevents the bug we just fixed from recurring
- Maintains backward compatibility

**Estimated Effort**: 1 session

#### Option 3: Gradual Migration (Low Effort, Low Risk)
Continue converting commands opportunistically:
- When a legacy command needs changes, convert it to enhanced
- No mass conversion effort
- Eventually all commands will be enhanced

**Benefits**:
- No dedicated migration effort required
- Low risk (changes happen gradually)
- Maintains momentum on other features

**Estimated Effort**: Ongoing over many sessions

## Recommendation

**Suggested Approach**: **Option 2** (Formalize Dual Architecture) followed by **Option 3** (Gradual Migration)

**Rationale**:
1. Prevents immediate bugs (like the one we just fixed)
2. Doesn't block other feature work
3. Natural path to eventually achieving Option 1
4. Low risk of introducing new issues

### Specific Next Steps (Option 2)

1. **Add Double Registration Check** in Runtime constructor:
   ```typescript
   private checkDuplicateRegistration(name: string): void {
     if (this.commands.has(name) && this.enhancedRegistry.has(name)) {
       console.warn(`⚠️ Command "${name}" is registered in both legacy and enhanced registries!`);
     }
   }
   ```

2. **Document Command Registration** in CLAUDE.md:
   - List which commands use which pattern
   - Explain when to use each pattern
   - Note that migration is in progress

3. **Add Test** to detect registration conflicts:
   ```typescript
   test('no commands registered in both legacy and enhanced registries', () => {
     const runtime = new Runtime();
     const legacyCommands = Array.from(runtime.commands.keys());
     const enhancedCommands = runtime.getEnhancedRegistry().getCommandNames();
     const duplicates = legacyCommands.filter(cmd => enhancedCommands.includes(cmd));
     expect(duplicates).toEqual([]);
   });
   ```

## Related Files

- [runtime.ts](packages/core/src/runtime/runtime.ts) - Both registration methods
- [command-adapter.ts](packages/core/src/runtime/command-adapter.ts) - CommandAdapter and EnhancedCommandRegistry
- [command-registry.ts](packages/core/src/commands/command-registry.ts) - ENHANCED_COMMAND_FACTORIES
- [CONSOLIDATION_COMPLETE.md](CONSOLIDATION_COMPLETE.md) - Naming consolidation (didn't address architecture)

## Conclusion

The codebase is **architecturally split** between legacy and enhanced command patterns, even though the **naming** has been successfully consolidated. This split is not inherently problematic, but:

1. ⚠️ Requires awareness to prevent bugs (like RepeatCommand double registration)
2. ⚠️ Makes the architecture more complex than necessary
3. ✅ Can be addressed gradually without major refactoring

The immediate fix (removing RepeatCommand's legacy registration) resolves the critical bug. Future sessions should consider formalizing this architectural split or completing the migration to enhanced commands only.

---

**For Next Session**: Consider implementing Option 2 (formalize dual architecture) to prevent similar bugs in the future.
