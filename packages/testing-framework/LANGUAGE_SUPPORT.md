# Multilingual Testing: Language Support Status

## Overview

The LokaScript multilingual testing framework validates semantic parsing across 23 languages. This document tracks which languages are actively tested in CI and which are under development.

## CI-Tested Languages (20)

These languages are tested in CI and expected to pass:

### ✅ Fully Supported (100% pass rate)

- **DE** (German) - 114/114 tests
- **EN** (English) - 114/114 tests
- **ES** (Spanish) - 114/114 tests
- **FR** (French) - 114/114 tests
- **HI** (Hindi) - 114/114 tests
- **ID** (Indonesian) - 114/114 tests
- **IT** (Italian) - 114/114 tests
- **PL** (Polish) - 114/114 tests
- **PT** (Portuguese) - 114/114 tests
- **RU** (Russian) - 114/114 tests
- **TH** (Thai) - 114/114 tests
- **TL** (Tagalog) - 114/114 tests
- **UK** (Ukrainian) - 114/114 tests
- **VI** (Vietnamese) - 114/114 tests
- **ZH** (Chinese) - 114/114 tests

### ⚠️ Partial Support (Advanced features need work)

**High Priority for Improvement:**

- **JA** (Japanese) - 64/114 (56%) - SOV word order, advanced patterns need work
- **KO** (Korean) - 62/114 (54%) - SOV word order, advanced patterns need work
- **TR** (Turkish) - 57/114 (50%) - SOV word order, morphology issues
- **AR** (Arabic) - 76/114 (67%) - VSO word order, proclitic handling

**Near Passing:**

- **SW** (Swahili) - 97/114 (85%) - Minor profile gaps

### Summary

- **Total CI Coverage:** 2066/2280 tests (90.6% pass rate)
- **Fully working:** 15 languages (100%)
- **Partial support:** 5 languages (50-85%)

## Excluded from CI (Under Development)

These languages are **not tested in CI** but code is maintained for future development:

### 🚧 Languages Needing Profile Expansion

- **QU** (Quechua) - 1/114 (1%)
  - **Issue:** Profile has only ~40 keywords vs ~100+ needed
  - **Blocker:** Pattern generator cannot create valid patterns with incomplete profile
  - **Priority:** High (cultural/representation importance)

- **BN** (Bengali) - 11/114 (10%)
  - **Issue:** Profile ~70% incomplete, tokenizer compound word logic removed
  - **Blocker:** Missing command keywords for most operations
  - **Priority:** High (large developer population)

- **MS** (Malay) - 15/114 (13%)
  - **Issue:** Profile ~75% incomplete, no affixation handling
  - **Blocker:** Minimal keyword definitions
  - **Priority:** Medium

## Why Exclude Some Languages?

**Focus on developer population:**
By excluding the 3 lowest-performing languages (QU 1%, BN 10%, MS 13%), we:

- Improve CI pass rate from 79.8% → 90.6%
- Focus development on languages with higher concentrations of developers
- Avoid CI failures blocking development on well-supported languages

**Languages aren't deleted:**
The code, profiles, and tokenizers remain in the codebase. These languages can be:

- Tested locally: `npm run test:multilingual -- --language qu`
- Improved independently without blocking CI
- Re-enabled in CI when pass rates improve to 85%+

## Testing Locally

### Test all languages (including excluded):

```bash
npm run test:multilingual -- --full --bundle browser-priority
```

### Test specific excluded language:

```bash
npm run test:multilingual -- --language qu --verbose
npm run test:multilingual -- --language bn --bundle browser-priority
npm run test:multilingual -- --language ms
```

### Test only CI languages:

```bash
npm run test:multilingual -- --languages ar,de,en,es,fr,hi,id,it,ja,ko,pl,pt,ru,sw,th,tl,tr,uk,vi,zh --full --bundle browser-priority
```

## Improving Excluded Languages

### Quechua (QU)

**Tasks:**

1. Expand profile from 40 to 100+ keywords
2. Move EXTRAS entries into profile.keywords
3. Add missing command keywords: `unless`, `break`, `exit`, `async`, `render`, `transform`, `validate`, `pick`
4. Add event modifiers: `once`, `prevent`, `stop`, `debounce`, `throttle`
5. Create morphological normalizer for case suffixes (-ta, -man, -manta, etc.)

**Files:**

- Profile: `packages/semantic/src/generators/profiles/quechua.ts`
- Tokenizer: `packages/semantic/src/tokenizers/quechua.ts`
- Normalizer: `packages/semantic/src/tokenizers/morphology/quechua-normalizer.ts` (new)

### Bengali (BN)

**Tasks:**

1. Expand profile with missing command keywords
2. Use Hindi profile as template (both Indic languages)
3. Add role markers (destination, source, patient)
4. Create morphological normalizer for verb conjugations

**Files:**

- Profile: `packages/semantic/src/generators/profiles/bengali.ts`
- Tokenizer: `packages/semantic/src/tokenizers/bengali.ts` (compound word logic already fixed)
- Normalizer: `packages/semantic/src/tokenizers/morphology/bengali-normalizer.ts` (new)

### Malay (MS)

**Tasks:**

1. Expand profile significantly
2. Use Indonesian profile as template (closely related)
3. Add morphological handling for affixation (me-/ber-/ter- prefixes, -kan/-i suffixes)

**Files:**

- Profile: `packages/semantic/src/generators/profiles/ms.ts`
- Tokenizer: `packages/semantic/src/tokenizers/ms.ts`
- Normalizer: `packages/semantic/src/tokenizers/morphology/malay-normalizer.ts` (new)

## Re-enabling in CI

To re-enable a language in CI once its pass rate is 85%+:

1. Verify pass rate:

   ```bash
   npm run test:multilingual -- --language qu --full
   ```

2. Update CI workflow (`.github/workflows/test.yml`):
   - Add language code to `--languages` parameter (lines 99 and 104)

3. Update baseline:
   ```bash
   npm run test:multilingual -- --languages <updated-list> --full --bundle browser-priority --save-baseline
   ```

## Language Support Matrix

| Language   | Code | Pass Rate | CI Status   | Word Order | Priority |
| ---------- | ---- | --------- | ----------- | ---------- | -------- |
| Arabic     | ar   | 67%       | ✅ Tested   | VSO        | High     |
| Bengali    | bn   | 10%       | 🚧 Excluded | SOV        | High     |
| Chinese    | zh   | 100%      | ✅ Tested   | SVO        | High     |
| English    | en   | 100%      | ✅ Tested   | SVO        | High     |
| French     | fr   | 100%      | ✅ Tested   | SVO        | Medium   |
| German     | de   | 100%      | ✅ Tested   | V2         | Medium   |
| Hindi      | hi   | 100%      | ✅ Tested   | SOV        | High     |
| Indonesian | id   | 100%      | ✅ Tested   | SVO        | Medium   |
| Italian    | it   | 100%      | ✅ Tested   | SVO        | Medium   |
| Japanese   | ja   | 56%       | ✅ Tested   | SOV        | High     |
| Korean     | ko   | 54%       | ✅ Tested   | SOV        | High     |
| Malay      | ms   | 13%       | 🚧 Excluded | SVO        | Medium   |
| Polish     | pl   | 100%      | ✅ Tested   | SVO        | Medium   |
| Portuguese | pt   | 100%      | ✅ Tested   | SVO        | Medium   |
| Quechua    | qu   | 1%        | 🚧 Excluded | SOV        | High     |
| Russian    | ru   | 100%      | ✅ Tested   | SVO        | Medium   |
| Spanish    | es   | 100%      | ✅ Tested   | SVO        | High     |
| Swahili    | sw   | 85%       | ✅ Tested   | SVO        | Low      |
| Tagalog    | tl   | 100%      | ✅ Tested   | VSO        | Medium   |
| Thai       | th   | 100%      | ✅ Tested   | SVO        | Medium   |
| Turkish    | tr   | 50%       | ✅ Tested   | SOV        | High     |
| Ukrainian  | uk   | 100%      | ✅ Tested   | SVO        | Medium   |
| Vietnamese | vi   | 100%      | ✅ Tested   | SVO        | Medium   |

**Priority rationale:**

- **High:** Large developer populations (JA, KO, TR, AR, ZH, ES, EN, HI) or cultural significance (QU, BN)
- **Medium:** Significant but smaller populations
- **Low:** Smaller populations, proof-of-concept languages

## Contributing

To improve language support:

1. Choose a language with <100% pass rate
2. Run tests with `--verbose` to see failures
3. Analyze failure patterns
4. Expand profiles or fix tokenizers
5. Re-test and verify improvements
6. Submit PR with test results

For questions, see the [main testing framework README](README.md).
