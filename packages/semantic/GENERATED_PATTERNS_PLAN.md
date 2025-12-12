# Plan: Replace Hand-Crafted Patterns with Generated Patterns

## Executive Summary

The semantic package has complete infrastructure for programmatic pattern generation:
- **command-schemas.ts**: 40+ commands with full role definitions
- **language-profiles.ts**: 7 languages (en, ja, ar, es, ko, zh, tr) with word orders
- **pattern-generator.ts**: Full implementation of `generateAllPatterns()`

However, `patterns/index.ts` currently imports from hand-crafted files (`toggle.ts`, `put.ts`, `event-handler.ts`) instead of using the generator. This plan outlines an incremental process to close this gap.

## Goals

1. Validate generated patterns against official hyperscript examples
2. Replace hand-crafted patterns with generated ones (per-command)
3. Maintain backward compatibility at each step
4. Establish test coverage that ensures generated patterns work correctly

## Official Hyperscript Reference Examples

From hyperscript.org, the commonly demonstrated patterns are:

### Tier 1: Core Examples (Must Work)
```hyperscript
-- Toggle (most common demo)
on click toggle .red on me
on click toggle .active

-- Add/Remove classes
add .foo to .bar
remove .highlight

-- Put content
put "hello" into #output
put result into the next <output/>

-- Set variables
set x to 10

-- Show/Hide
hide me
show me

-- Wait
wait 1s
wait 2s

-- Send events
send hello to <form />
send foo to the next <output/>
```

### Tier 2: Important Examples
```hyperscript
-- Increment
increment :x
increment :x then put it into the next <output/>

-- Fetch
fetch /clickedMessage then put result into next <output/>
fetch https://stuff as json then put result into me

-- Transition
transition my *font-size to 30px
transition *background-color to initial

-- Log
log "Hello Console!"
log x

-- Go
go to the top of the body smoothly
```

### Tier 3: Advanced Patterns
```hyperscript
-- If/Else
if :x <= 3 put :x into the next <output/>
if intersecting transition opacity to 1

-- Repeat
repeat for x in [1, 2, 3] log x
repeat while x < 10 log x

-- Tell
tell <p/> in me add .highlight
tell <details /> in .article set you.open to false

-- Init
init transition my opacity to 100% over 3 seconds
init fetch https://stuff as json then put result into me
```

## Phase 1: Validation Framework

**Objective**: Create test infrastructure to compare generated vs hand-crafted patterns

### 1.1 Create Comparison Test Suite

Create `test/generated-patterns.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { generateAllPatterns, generatePattern } from '../src/generators';
import { togglePatterns } from '../src/patterns/toggle';
import { putPatterns } from '../src/patterns/put';
import { parse, canParse } from '../src';

describe('Generated Pattern Validation', () => {
  describe('Toggle Command', () => {
    // Test generated patterns produce same AST as hand-crafted
    const testCases = [
      { input: 'toggle .active', lang: 'en' },
      { input: 'toggle .active on #button', lang: 'en' },
      { input: '.active を 切り替え', lang: 'ja' },
      { input: '#button の .active を 切り替え', lang: 'ja' },
      { input: 'بدّل .active', lang: 'ar' },
      { input: 'alternar .active', lang: 'es' },
      { input: '.active 를 토글', lang: 'ko' },
      { input: '.active değiştir', lang: 'tr' },
    ];

    for (const { input, lang } of testCases) {
      it(`should parse "${input}" (${lang})`, () => {
        expect(canParse(input, lang)).toBe(true);
        const node = parse(input, lang);
        expect(node.action).toBe('toggle');
      });
    }
  });
});
```

### 1.2 Add Official Examples Test Suite

Create `test/official-examples.test.ts` to validate against hyperscript.org:

```typescript
describe('Official Hyperscript Examples', () => {
  describe('From hyperscript.org main page', () => {
    it('toggle .red on me', () => { /* ... */ });
    it('send hello to <form />', () => { /* ... */ });
    it('put result into the next <output/>', () => { /* ... */ });
    // ... all official examples
  });
});
```

### 1.3 AST Equivalence Tests

Verify that generated patterns produce identical semantic nodes:

```typescript
describe('AST Equivalence', () => {
  it('generated EN toggle matches hand-crafted', () => {
    const handCrafted = parse('toggle .active on #button', 'en');
    // Use generated pattern directly
    const generated = parse('toggle .active on #button', 'en'); // with generated patterns

    expect(generated.action).toBe(handCrafted.action);
    expect(generated.roles.get('patient')).toEqual(handCrafted.roles.get('patient'));
    expect(generated.roles.get('destination')).toEqual(handCrafted.roles.get('destination'));
  });
});
```

## Phase 2: Per-Command Migration

Migrate one command at a time, validating at each step.

### 2.1 Toggle Command (Reference Implementation)

**Status**: Hand-crafted patterns exist and are validated

1. Run generator for toggle: `generatePatternsForCommand(toggleSchema)`
2. Compare generated patterns with hand-crafted
3. Identify any discrepancies:
   - Missing alternatives?
   - Different token structure?
   - Priority differences?
4. Adjust generator or schema as needed
5. Replace hand-crafted with generated
6. Verify all tests pass

### 2.2 Add Command

**Complexity**: Low (same structure as toggle)

```typescript
// Expected generated pattern for English
// add {patient} [to {destination}]
```

### 2.3 Remove Command

**Complexity**: Low (same structure as toggle)

### 2.4 Put Command

**Complexity**: Medium (requires 'into'/'before'/'after' modifiers)

```typescript
// put {patient} into {destination}
// put {patient} before {destination}
// put {patient} after {destination}
```

**Challenge**: The `into`/`before`/`after` modifiers aren't fully modeled in current schema.

### 2.5 Show/Hide Commands

**Complexity**: Low (simple commands)

### 2.6 Set Command

**Complexity**: Medium (uses 'to' connector)

```typescript
// set {destination} to {patient}
```

### 2.7 Wait Command

**Complexity**: Low (single argument)

### 2.8 Send/Trigger Commands

**Complexity**: Medium (event + destination)

### 2.9 Log Command

**Complexity**: Low (single argument)

### 2.10 Increment/Decrement Commands

**Complexity**: Low (optional 'by' modifier)

## Phase 3: Generator Enhancements

Some patterns may require generator improvements:

### 3.1 Modifier Support

Add support for connecting words like `into`, `to`, `by`:

```typescript
// Current: put {patient} {destination}
// Needed:  put {patient} into {destination}

interface RoleSpec {
  // ... existing
  connector?: string;  // 'into', 'to', 'by', etc.
  connectorPosition?: 'before' | 'after';
}
```

### 3.2 Alternative Pattern Structures

Some commands have multiple valid structures:

```typescript
// "add .foo to .bar" - standard
// "add .foo" - implicit target
// These need separate pattern entries
```

### 3.3 Morphological Integration

Ensure generated patterns work with morphological normalization:

```typescript
// Japanese: 切り替えた → toggle (past tense)
// Korean: 토글해요 → toggle (polite)
// Spanish: alternando → toggle (gerund)
```

## Phase 4: Wire Generated Patterns

### 4.1 Create Hybrid Registry

Allow gradual migration by supporting both:

```typescript
// patterns/index.ts
import { generateAllPatterns } from '../generators';
import { eventHandlerPatterns } from './event-handler'; // Keep complex ones

// Generated patterns for simple commands
const generatedPatterns = generateAllPatterns({
  basePriority: 100,
  generateSimpleVariants: true,
});

// Filter to only include migrated commands
const migratedCommands = ['toggle', 'add', 'remove', 'show', 'hide'];
const activeGenerated = generatedPatterns.filter(
  p => migratedCommands.includes(p.command)
);

// Combine with hand-crafted
export const allPatterns: LanguagePattern[] = [
  ...activeGenerated,
  ...eventHandlerPatterns, // Keep complex ones hand-crafted
];
```

### 4.2 Feature Flag Approach

```typescript
const USE_GENERATED_PATTERNS = {
  toggle: true,   // Validated
  add: true,      // Validated
  remove: true,   // Validated
  put: false,     // Needs modifier support
  // ...
};
```

## Phase 5: Full Migration

### 5.1 Remove Hand-Crafted Files

Once all commands are validated:

1. Delete `patterns/toggle.ts`
2. Delete `patterns/put.ts`
3. Keep `patterns/event-handler.ts` if complex
4. Update `patterns/index.ts` to use only generated

### 5.2 Final Structure

```
patterns/
├── index.ts          # Uses generateAllPatterns()
└── overrides.ts      # Any special-case patterns (if needed)

generators/
├── command-schemas.ts
├── language-profiles.ts
├── pattern-generator.ts
└── index.ts
```

## Validation Checklist

For each command migration:

- [ ] Generated patterns parse all English examples from hyperscript.org
- [ ] Generated patterns parse equivalent forms in all 7 languages
- [ ] AST output matches hand-crafted patterns
- [ ] Morphological normalization works (conjugated verbs)
- [ ] Round-trip translation produces valid syntax
- [ ] All existing tests pass
- [ ] No regression in parse performance

## Implementation Order

1. **Phase 1** (Now): Create validation test suite
2. **Phase 2.1-2.3** (Batch 1): Toggle, Add, Remove - Simple class/attribute
3. **Phase 2.5** (Batch 2): Show, Hide - Simple visibility
4. **Phase 2.7, 2.9** (Batch 3): Wait, Log - Single argument
5. **Phase 2.10** (Batch 4): Increment, Decrement - With optional modifier
6. **Phase 2.4, 2.6** (Batch 5): Put, Set - Requires connector support
7. **Phase 2.8** (Batch 6): Send, Trigger - Event commands
8. **Phase 3**: Generator enhancements as needed
9. **Phase 4**: Wire generated patterns
10. **Phase 5**: Full migration

## Success Metrics

1. **Coverage**: All official hyperscript examples parse correctly
2. **Multilingual**: Same semantic AST across all 7 languages
3. **Maintainability**: Adding a new language = adding profile only
4. **Performance**: No measurable parse time regression
5. **Test Suite**: 100% pass rate on validation tests

## Risk Mitigation

1. **Regression Risk**: Keep hand-crafted patterns as fallback during transition
2. **Edge Cases**: Document any patterns that require manual override
3. **Native Speaker Review**: Flag patterns for review before production

## Next Steps

1. Create `test/generated-patterns.test.ts`
2. Create `test/official-examples.test.ts`
3. Run generator for toggle and compare with hand-crafted
4. Document any discrepancies
5. Proceed with migration per this plan
