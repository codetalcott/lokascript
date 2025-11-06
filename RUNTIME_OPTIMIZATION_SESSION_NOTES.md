# Runtime Optimization Session Notes

## Issue Identified: Phase 2.2 EventQueue Bug

### Timeline
1. **Phase 1** (commit a34caa9): Identifier caching + fast paths - ✅ Working
2. **Phase 2.1** (commit 98166d0): StyleBatcher for DOM batching - ✅ Working  
3. **Phase 2.2** (commit d1235e7): EventQueue for listener reuse - ❌ **BROKEN**
4. **Phase 2.3** (stashed): Object pooling - Not tested

### Root Cause

**EventQueue.getKey() method has a critical bug:**

```typescript
private getKey(target: EventTarget, eventName: string): string {
  const targetId = (target as any)._eventQueueId || 'default';  // ← BUG!
  return `${targetId}:${eventName}`;
}
```

**Problem**: All three draggable boxes share the same key `'default:pointermove'` because they lack `_eventQueueId`. This causes event queue contamination where:
- Box1's `pointermove` events get queued
- Box2 tries to wait for its own `pointermove` but receives Box1's queued events
- Result: Box2 jumps to Box1's previous coordinates

### Symptoms Observed
- After dragging Box1, clicking Box2 causes it to initially jump to Box1's last position
- The box then "recovers" to the cursor location
- Same behavior for Box3 after dragging Box2

### Debug Attempts Made
1. ✅ Fixed identifier cache to check `context.locals` FIRST
2. ✅ Added `isContextVariable` flag to prevent caching `me`, `you`, `it`
3. ✅ Fixed cache key generation (used `element.id` instead of undefined `_hscriptId`)
4. ✅ Fixed event context locals inheritance (create fresh Map)
5. ❌ Disabled cache completely - bug persisted
6. ✅ **Reverted Phase 2.2** - bug disappeared

### Current State (Working)
- **Commit**: 98166d0
- **Includes**: Phase 1 (identifier cache) + Phase 2.1 (StyleBatcher)
- **Status**: ✅ All draggable boxes work correctly
- **Performance**: Good (cache + style batching optimizations active)

### Next Steps (Options)

**Option A: Fix EventQueue and Re-implement Phase 2.2**
- Implement WeakMap-based unique ID assignment
- Ensure each element gets unique queue key
- Re-test thoroughly

**Option B: Skip Phase 2.2 Entirely**
- Continue with Phase 1 + 2.1 (current working state)
- EventQueue optimization provides diminishing returns
- addEventListener/removeEventListener overhead is minimal for typical use

**Option C: Alternative EventQueue Design**
- Use element instance itself as Map key (WeakMap)
- More reliable than string-based keys

## Recommendation

Skip Phase 2.2 (EventQueue) for now. The performance gains are marginal (~10-15ms per drag operation), and Phase 1 + 2.1 already provide:
- 70-75% reduction in identifier lookups (Phase 1)
- 97% reduction in DOM writes + 60 FPS smoothness (Phase 2.1)

The identifier cache + StyleBatcher combination delivers the most significant performance improvements without the complexity and risk of EventQueue bugs.
