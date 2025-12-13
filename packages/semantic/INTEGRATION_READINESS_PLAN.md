# Semantic Package Integration Readiness Plan

## Goal

Prepare the semantic package for production integration with `@hyperfixi/core`, enabling multilingual hyperscript parsing with morphological support.

## Current State

- **Tests**: 546 passing
- **Pattern coverage**: 8/8 tier-1, 2/2 tier-2, 4/4 tier-3
- **Languages**: 7 (en, ja, ko, ar, es, tr, zh)
- **Morphology**: 5 normalizers (ja, ko, ar, es, tr)
- **Keyword sync**: Complete for en, ja; pending for ko, ar, es, tr, zh

---

## Phase 1: Complete Keyword Sync (1-2 days)

### Objective
Ensure all tokenizer keywords match language profile definitions.

### Tasks

1. **Korean tokenizer** (`tokenizers/korean.ts`)
   - Add missing: make, clone, focus, blur, go, fetch, settle, if, else, repeat, for, while, continue, halt, throw, js, async, tell, default, init, behavior, into, before, after
   - Update `language-building-schema.ts` documentation

2. **Arabic tokenizer** (`tokenizers/arabic.ts`)
   - Add missing: take, make, clone, get, increment, hide, transition, on, focus, blur, settle, if, else, repeat, for, while, continue, halt, throw, call, return, js, async, tell, default, init, behavior, into, before, after
   - Update documentation

3. **Spanish tokenizer** (`tokenizers/spanish.ts`)
   - Add missing: take, make, clone, transition, focus, blur, settle, if, else, repeat, while, continue, throw, js, async, tell, default, init, behavior, before, after
   - Update documentation

4. **Turkish tokenizer** (`tokenizers/turkish.ts`)
   - Add missing: make, clone, transition, on, focus, blur, go, settle, if, else, repeat, for, while, continue, halt, throw, js, async, tell, default, init, behavior, into, before, after
   - Update documentation

5. **Chinese tokenizer** (`tokenizers/chinese.ts`)
   - Add missing: if, else, repeat, for, continue, halt, throw, call, return, js, async, tell, default, init, behavior, into, before, after
   - Update documentation

### Validation
```bash
npm test -- --run test/language-building.test.ts
# Keyword Sync Report should show no missing keywords
```

---

## Phase 2: Integration Tests (2-3 days)

### Objective
Validate semantic parsing works end-to-end through core parser.

### Tasks

1. **Create integration test file**
   ```
   packages/semantic/test/integration/core-integration.test.ts
   ```

2. **Test cases for English**
   ```typescript
   describe('English Integration', () => {
     it('parses toggle command through semantic analyzer', async () => {
       const result = await parseWithSemantic('toggle .active on #button', 'en');
       expect(result.command).toBe('toggle');
       expect(result.args.patient).toBe('.active');
       expect(result.args.destination).toBe('#button');
     });

     // Test all 8 tier-1 commands
     // Test confidence fallback to traditional parsing
     // Test error handling
   });
   ```

3. **Test cases for Japanese**
   ```typescript
   describe('Japanese Integration', () => {
     it('parses with morphological normalization', async () => {
       // 切り替えた (past tense) should work
       const result = await parseWithSemantic('#button の .active を 切り替えた', 'ja');
       expect(result.command).toBe('toggle');
     });
   });
   ```

4. **Test cases for remaining languages**
   - Korean, Arabic, Spanish, Turkish, Chinese
   - Focus on tier-1 commands only initially

5. **Confidence threshold tests**
   ```typescript
   it('falls back to traditional parsing on low confidence', () => {
     // Malformed input should fall back gracefully
   });
   ```

### Validation
```bash
npm test -- --run test/integration/
```

---

## Phase 3: Type Unification (1 day)

### Objective
Eliminate SemanticRole duplication between packages.

### Current State
- `packages/i18n/src/grammar/types.ts` defines SemanticRole (11 roles)
- `packages/semantic/src/types.ts` defines SemanticRole (11 roles, slightly different)

### Tasks

1. **Compare role definitions**
   ```
   i18n: action, agent, patient, source, destination, event, condition, quantity, duration, method, style
   semantic: action, agent, patient, source, destination, event, condition, quantity, duration, method, style
   ```

2. **Choose canonical source**
   - Recommendation: Use i18n's definition (more mature package)
   - Re-export from semantic: `export type { SemanticRole } from '@hyperfixi/i18n'`

3. **Update imports**
   - Update all semantic package files to import from i18n
   - Run type checker: `npm run typecheck`

4. **Verify no breaking changes**
   - All tests should pass
   - No API changes for consumers

---

## Phase 4: Performance Validation (1 day)

### Objective
Ensure semantic parsing doesn't significantly impact performance.

### Tasks

1. **Create benchmark**
   ```typescript
   // test/benchmarks/parsing-benchmark.ts
   const iterations = 1000;

   console.time('traditional');
   for (let i = 0; i < iterations; i++) {
     parse('toggle .active on #button');
   }
   console.timeEnd('traditional');

   console.time('semantic');
   for (let i = 0; i < iterations; i++) {
     parseWithSemantic('toggle .active on #button', 'en');
   }
   console.timeEnd('semantic');
   ```

2. **Acceptable thresholds**
   - Semantic parsing should be < 2x traditional parsing time
   - If slower, identify bottlenecks (pattern matching? tokenization?)

3. **Optimization if needed**
   - Cache compiled patterns
   - Pre-sort patterns by frequency
   - Lazy-load non-English tokenizers

---

## Phase 5: Documentation (1 day)

### Objective
Document how to use semantic parsing integration.

### Tasks

1. **Update package README**
   ```markdown
   ## Usage with Core Parser

   ```typescript
   import { createSemanticAnalyzer } from '@hyperfixi/semantic';
   import { parse } from '@hyperfixi/core';

   const analyzer = createSemanticAnalyzer();

   // English (recommended)
   const result = parse('toggle .active', {
     semanticAnalyzer: analyzer,
     language: 'en'
   });

   // Japanese with morphology
   const jaResult = parse('#button の .active を 切り替えた', {
     semanticAnalyzer: analyzer,
     language: 'ja'
   });
   ```
   ```

2. **Document confidence thresholds**
   - Default: 0.5
   - When to adjust
   - Fallback behavior

3. **Document supported languages**
   - Tier 1: en (fully tested)
   - Tier 2: ja (morphology tested)
   - Tier 3: ko, ar, es, tr, zh (basic testing)

4. **Migration guide from i18n approach**
   - When to use semantic vs i18n
   - How they can coexist

---

## Phase 6: Final Validation (1 day)

### Objective
Complete pre-integration checklist.

### Checklist

```
[ ] All 7 tokenizers have complete keyword coverage
[ ] Keyword Sync Report shows 0 missing keywords
[ ] Integration tests pass for all 7 languages
[ ] Type unification complete (SemanticRole from i18n)
[ ] Performance benchmark acceptable (< 2x overhead)
[ ] README documentation complete
[ ] No TypeScript errors
[ ] All 546+ tests passing
[ ] Example usage works in browser
```

### Browser Validation
```bash
npx http-server . -p 3000
# Open: http://localhost:3000/examples/multilingual/semantic-demo.html
# Test each language manually
```

---

## Timeline

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| 1. Keyword Sync | 1-2 days | None |
| 2. Integration Tests | 2-3 days | Phase 1 |
| 3. Type Unification | 1 day | Phase 1 |
| 4. Performance | 1 day | Phase 2 |
| 5. Documentation | 1 day | Phase 2, 3 |
| 6. Final Validation | 1 day | All phases |

**Total: 7-9 days**

---

## Success Criteria

1. **Zero keyword sync gaps** across all 7 languages
2. **Integration tests pass** for tier-1 commands in all languages
3. **Single SemanticRole type** shared between packages
4. **Performance overhead < 2x** traditional parsing
5. **Documentation complete** with usage examples
6. **Browser demo working** for all languages

---

## Files to Modify

### Tokenizers (Phase 1)
- `src/tokenizers/korean.ts`
- `src/tokenizers/arabic.ts`
- `src/tokenizers/spanish.ts`
- `src/tokenizers/turkish.ts`
- `src/tokenizers/chinese.ts`
- `src/language-building-schema.ts`

### Tests (Phase 2)
- `test/integration/core-integration.test.ts` (new)
- `test/integration/language-coverage.test.ts` (new)

### Types (Phase 3)
- `src/types.ts`
- Various import updates

### Documentation (Phase 5)
- `README.md`
- `INTEGRATION_READINESS_PLAN.md` (this file - update with results)

---

## Post-Integration

After successful integration:
1. Monitor for edge cases in production usage
2. Gather feedback on confidence threshold tuning
3. Plan Phase 2: Extend to remaining i18n languages (pt, fr, de, id, qu, sw)
4. Plan Phase 3: Unify tokenizers between i18n and semantic packages
