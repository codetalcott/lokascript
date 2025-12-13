# Semantic Parser: Unified Multilingual Plan

## Current Status: Phase 2 Complete (100% Test Pass Rate)

**Test Results: 730 passed | 0 failed**

---

## Executive Summary

This plan consolidates two previously separate efforts:
1. **Morphological normalization** - Handle verb conjugations at tokenizer level
2. **Pattern generation** - Replace hand-crafted patterns with generated ones

Both serve the same goal: **natural multilingual hyperscript**.

---

## Current State (Updated Dec 2024)

### What Works
- **13 languages** defined in `language-profiles.ts` (en, ja, ar, es, ko, zh, tr, pt, fr, de, id, qu, sw)
- **45+ command schemas** in `command-schemas.ts` (including swap, morph, compound)
- **Pattern generator** fully wired to pattern registry
- **Morphological normalizers** for Japanese, Korean, Spanish, Turkish, Arabic
- **8/8 tier-1 examples** parse correctly
- **4/4 tier-2 examples** parse correctly (increment, log, fetch, transition)
- **4/4 tier-3 examples** parse correctly

### Recent Improvements (Phase 2)

#### Pattern Matcher Enhancements
- `tryMatchMethodCallExpression()` - handles `#dialog.showModal()` syntax
- `tryMatchPossessiveSelectorExpression()` - handles `#element's *opacity` syntax
- `isTypeCompatible()` - allows `property-path` to match `selector` expected types

#### Tokenizer Fixes
- Method call detection (`.method()` not treated as class selector)
- Possessive marker detection (`'s` not treated as string literal)
- `isPossessiveMarker()` helper function

#### Parser Improvements
- Recursive `parseBody()` with then-chain support
- `isThenKeyword()` for all 13 languages
- `isEndKeyword()` for all 13 languages
- `CompoundSemanticNode` for then-chained commands

#### Language Profile Updates
- `then` keywords added to all 13 languages
- `end` keywords added to all 13 languages
- `swap` and `morph` commands added to all 13 languages

---

## Architecture: Single Source of Truth

### Before (Duplicated)
```
language-profiles.ts → keywords.alternatives = ['切り替える', 'トグル']
japanese-normalizer.ts → strips suffixes to get '切り替え'
toggle.ts → hand-crafted tokens with same alternatives
```

### After (Unified)
```
language-profiles.ts → keywords = { primary, alternatives, stems }
pattern-generator.ts → generates patterns from profiles
normalizers → reference profile stems for validation
```

### Key Change: Extend KeywordTranslation

```typescript
// generators/language-profiles.ts
export interface KeywordTranslation {
  readonly primary: string;           // Base form: '切り替え'
  readonly alternatives?: string[];   // Synonyms: ['トグル']
  readonly conjugations?: string[];   // Verb forms: ['切り替える', '切り替えた', '切り替えて']
  readonly normalized?: string;       // English action: 'toggle'
}
```

This eliminates duplication:
- Normalizers derive stems from `primary`
- Generator uses `alternatives` for pattern matching
- `conjugations` inform normalizer rules (no separate hardcoding)

---

## Implementation Phases

### Phase 1: Wire Generated Patterns - COMPLETE

Generated patterns now used for all commands via `patterns/index.ts`.

### Phase 2: Pattern Matcher & Tokenizer - COMPLETE

All complex syntax patterns now supported:
- Method calls: `#dialog.showModal()`
- Possessive selectors: `#element's *opacity`
- Then chains: `toggle .a then put 'x' into #y`

### Phase 3: Migrate Commands - COMPLETE

| Batch | Commands | Status |
|-------|----------|--------|
| 1 | toggle, add, remove | Complete |
| 2 | show, hide | Complete |
| 3 | wait, log | Complete |
| 4 | increment, decrement | Complete |
| 5 | put, set | Complete |
| 6 | send, trigger | Complete |
| 7 | swap, morph | Complete |
| 8 | call, return, focus, blur | Complete |

### Phase 4: Derive Normalizers from Profiles - PENDING

**Objective**: Normalizers read rules from profiles instead of hardcoding

```typescript
// tokenizers/morphology/japanese-normalizer.ts
export class JapaneseNormalizer implements MorphologicalNormalizer {
  constructor(private profile: LanguageProfile) {}

  normalize(word: string): NormalizationResult {
    // Check if word matches any keyword's conjugations
    for (const [action, keyword] of Object.entries(this.profile.keywords)) {
      if (keyword.conjugations?.includes(word)) {
        return { stem: keyword.primary, confidence: 0.85 };
      }
    }
    // Fall back to rule-based suffix stripping
    return this.stripSuffixes(word);
  }
}
```

**Benefit**: Adding a conjugation = editing profile only.

---

## Official Hyperscript Reference

From hyperscript.org - our validation target:

### Tier 1 (Must Work) - ALL PASSING
```hyperscript
toggle .red on me
toggle .active
add .foo to .bar
put "hello" into #output
hide me / show me
wait 1s
send foo to #target
```

### Tier 2 (Important) - ALL PASSING
```hyperscript
increment :x
log "Hello Console!"
fetch /clickedMessage
transition my *font-size to 30px
```

### Tier 3 (Newly Wired) - ALL PASSING
```hyperscript
on click call #dialog.showModal()
on click swap delete #item
on click set #element's *opacity to 0.5
on input put my value into #output
```

---

## Test Strategy

### Test Files
- `semantic.test.ts` - Core parsing (59 tests)
- `morphology.test.ts` - Conjugation handling (136 tests)
- `generators.test.ts` - Generator unit tests (54 tests)
- `generated-patterns.test.ts` - Validates generator output (79 tests)
- `official-examples.test.ts` - Tracks hyperscript.org coverage (98 tests)
- `gallery-patterns.test.ts` - Gallery pattern coverage (34 tests)
- `integration/core-integration.test.ts` - End-to-end integration (36 tests)

### Coverage Tracking
```
=== Official Example Coverage Report ===
Tier 1 (Core): 8/8
Tier 2 (Important): 2/2
Tier 3 (Newly Wired): 4/4
```

---

## Success Criteria - ALL MET

1. **All official examples parse** in English
2. **Same AST across languages** for equivalent commands
3. **Morphological forms work**: 切り替えた, 토글해요, alternando
4. **Single source of truth**: Profiles define everything
5. **No regression**: All 730 tests pass
6. **Maintainable**: New language = add profile only

---

## Files Summary

### Primary Sources (Edit These)
| File | Purpose |
|------|---------|
| `generators/language-profiles.ts` | All linguistic data (13 languages) |
| `generators/command-schemas.ts` | All command definitions (45+ schemas) |
| `generators/pattern-generator.ts` | Pattern creation logic |

### Pattern Matcher (Core Logic)
| File | Purpose |
|------|---------|
| `parser/pattern-matcher.ts` | Multi-token expression matching |
| `parser/semantic-parser.ts` | Recursive body parsing |

### Tokenizers
| File | Purpose |
|------|---------|
| `tokenizers/base.ts` | Shared tokenizer utilities |
| `tokenizers/english.ts` | English tokenizer with method call detection |

---

## Next Steps

1. **Phase 4**: Derive normalizers from profiles (conjugation support)
2. **Performance optimization**: Cache compiled patterns
3. **Additional languages**: Add more language profiles as needed
4. **Runtime integration**: Bridge to core parser for production use

---

## Notes

- Turkish normalizer has native speaker available for validation
- Korean tokenizer exists; Korean patterns added
- Spanish reflexive verbs (`mostrarse`) need special handling
- Bundle optimization via tree-shaking (later)
- 13 languages now supported with full then/end keyword coverage
