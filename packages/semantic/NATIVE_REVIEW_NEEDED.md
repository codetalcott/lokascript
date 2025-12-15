# Native Speaker Review Needed

This document tracks native idiom patterns that need validation from native speakers.
Patterns were implemented based on linguistic research but may benefit from real-world usage feedback.

**Deep research audit conducted December 2024** - See [Computational Linguistics Analysis](../../docs/multilingual/Computational%20Linguistics%20%26%20Localization%20Analysis.md) for authoritative findings.

## Status Legend

- ✅ **Verified** - Confirmed by research or native speaker
- ⚠️ **Needs Review** - Implemented but needs native validation
- ❓ **Uncertain** - May not be natural usage
- 🚨 **Critical Issue** - Implementation may be incorrect

---

## Arabic (ar)

### Proclitic Handling ✅ (Implemented December 2025)

**The "wa" (و) conjunction handling has been implemented.**

Arabic "wa" is a **proclitic** - it attaches directly to the following word with no space. The tokenizer now correctly separates proclitics from attached words:

| Input | Tokenization |
|-------|--------------|
| `والنقر` | `و` (conjunction) + `النقر` (the-click) |
| `فالتبديل` | `ف` (conjunction) + `التبديل` (the-toggle) |

**Implementation details:**
- `tryProclitic()` method in `arabic.ts` detects و and ف attached to following words
- Requires minimum 2 characters after proclitic to avoid false positives
- Emits conjunction token with normalized value (`and` / `then`)
- Enables polysyndetic coordination: `A وB وC` → `[A, و, B, و, C]`

**Source:** [Lancaster Arabic Tagset](https://www.lancaster.ac.uk/staff/hardiea/arabic-annotation-guide.pdf)

### Polysyndetic Coordination

Arabic uses **polysyndetic coordination** (repeating conjunction between ALL items):
- **English:** A, B, and C
- **Arabic:** A wa-B wa-C (A وB وC)

There is **no Oxford comma** in Arabic - it is foreign to the rhetorical structure.

### Verified Patterns ✅

| Pattern | Meaning | Notes | Source |
|---------|---------|-------|--------|
| عندما (indama) | when (temporal) | Formal, suitable for UI text | [Gemini Analysis](../../docs/multilingual/Computational%20Linguistics%20%26%20Localization%20Analysis.md) |
| حين (hina) | at the time of | Classical Arabic (الفصحى) | Verified |
| إذا (idha) | if/when (conditional) | Standard conditional | Verified |

### Needs Review ⚠️

| Pattern | Meaning | Concern | Status |
|---------|---------|---------|--------|
| لمّا (lamma) | when (past) | **Dialectal/informal** - common in spoken Arabic, NOT in formal writing | ⚠️ |

### Disjunction Distinction (أو vs أم)

| Context | Particle | Use Case |
|---------|----------|----------|
| Declarative list | أو (aw) | "A, B, or C" - default for boolean OR |
| Imperative | أو (aw) | "Select A or B" |
| Interrogative (selection) | أم (am) | Only with Hamza (أ-) prefix - "Which: A or B?" |
| Interrogative (yes/no) | أو (aw) | Used with هل (hal) |

For event handlers, **أو (aw) is the correct pattern.**

### Missing Patterns to Consider

| Pattern | Meaning | Why Consider |
|---------|---------|--------------|
| كلما (kullama) | whenever | Common repetitive temporal |
| بمجرد (bimujjarrad) | as soon as | Immediate temporal |

---

## Turkish (tr)

### Critical Implementation Issue 🚨

**Static regex patterns fail due to vowel harmony.**

Turkish suffixes mutate based on the last vowel of the root word:
- **2-Way Harmony (A/E):** Suffixes take `a` or `e` (e.g., plural -lar/-ler)
- **4-Way Harmony (I/İ/U/Ü):** Suffixes take `ı`, `i`, `u`, or `ü` (e.g., -ip/-ıp/-up/-üp)

| Concept | Static (Incorrect) | Correct Pattern |
|---------|-------------------|-----------------|
| "With/And" (suffix) | `-la`, `-le` | `-(y)?(la\|le)` |
| "And" (sequential) | `-ip` | `-(ıp\|ip\|up\|üp)` |
| "With" (word) | `ile` | `\sile\s` (invariant) |
| "And" (word) | `ve` | `\sve\s` (invariant) |

### The "ile" Postposition Complexity

The postposition "ile" (with/and) can:
1. Stand alone as invariant word `ile`
2. Cliticize to preceding noun with:
   - Vowel loss (initial `i` drops)
   - Buffer `y` insertion (if noun ends in vowel)
   - Vowel harmony (`a` or `e`)

| Noun | + ile | Result |
|------|-------|--------|
| Masa (table) | + ile | Masa**yla** (back vowel → a) |
| Kedi (cat) | + ile | Kedi**yle** (front vowel → e) |
| El (hand) | + ile | El**le** (consonant, no buffer) |

**A parser looking only for `ve` or `ile` will miss these cliticized forms.**

### Suffix Classification

| Suffix | Function | Use in Event Handlers |
|--------|----------|----------------------|
| -ip/-ıp/-up/-üp | Sequential "and" | ✅ Valid - chains actions |
| -ince/-ınca | Temporal "when/upon" | ✅ Valid |
| -dığında | Temporal "when" | ✅ Valid |
| -ken | Temporal "while" | ✅ Valid (sets context) |
| -dikçe/-dıkça | Repetitive "whenever" | ✅ Valid |
| -sa/-se | Conditional "if" | ✅ Valid |
| -erek/-arak | Adverbial "by doing" | ❌ NOT a list separator |
| -meden/-madan | Negative "without" | ❌ NOT a list separator |

**Source:** [Turkish Wikibooks - Converbs](https://en.wikibooks.org/wiki/Turkish/Converbs)

### Verified Patterns ✅

| Pattern | Meaning | Notes |
|---------|---------|-------|
| -dığında | when | Temporal converb - inherits tense from final verb |
| -(y)ınca | when/upon | Temporal converb |
| -sa/-se | if | Conditional suffix |
| -ken | while | Simultaneity (invariant, accepts buffer -y) |
| -dikçe | whenever | Repetitive temporal |

---

## Portuguese (pt)

### Critical Finding: Capitalization 🚨

**Months and days are LOWERCASE in Portuguese.**

Unlike English, Portuguese treats month and day names as common nouns:
- **English:** January, Monday
- **Portuguese:** janeiro, segunda-feira

This is **CLDR standard** - Java/Python locale libraries output lowercase by default.

**Source:** [JDK-8017120](https://bugs.openjdk.org/browse/JDK-8017120)

**Implication:** Any NER trained on English capitalization features will fail on Portuguese temporal entities.

### Crasis for Time (às)

The distinction between `as` and `às` is the phenomenon of **Crasis**:

| Form | Meaning | Use |
|------|---------|-----|
| `às` | at (contraction: a + as) | **Required for time** - "às 14h" |
| `as` | the (article) | NOT for time |

- **Correct:** *A reunião é **às** 14h.* (The meeting is at 14h)
- **Incorrect:** *A reunião é **as** 14h.* (Ungrammatical)

**Singular exception:** For 1:00, use `à` (a + a = à): *À uma hora.*

### Date Preposition (de)

Portuguese dates **always** use `de` between components:
- **Pattern:** `d de MMMM de yyyy`
- **Example:** *25 de dezembro de 2023*

A parser expecting `25 dezembro` (no `de`) will fail.

### No Oxford Comma

Standard Portuguese grammar **prohibits** a comma before `e` in simple enumerations:
- **Correct:** A, B e C
- **Incorrect:** A, B, e C (grammatical error)

A comma before `e` is only valid if the subject changes.

### Verified Patterns ✅

| Pattern | Meaning | Notes |
|---------|---------|-------|
| quando | when | Standard temporal |
| ao + infinitive | upon/when doing | Native idiom (ao clicar) - **most idiomatic** |
| se | if | Standard conditional |

### Needs Review ⚠️

| Pattern | Meaning | Concern |
|---------|---------|---------|
| em clique | on click | May not be natural - "ao clicar" preferred |

---

## Implementation Recommendations

Based on the deep research audit:

### Arabic
1. Abandon whitespace-delimited patterns for `و` (wa)
2. Implement proclitic-aware pattern: `(?<=\s|^|\p{P})\u0648(?=\p{L})`
3. Adopt polysyndetic logic (A wa-B wa-C) as default

### Turkish
1. Replace static suffix matching with vowel harmony-aware patterns
2. Handle `ile` in both standalone and cliticized forms
3. Recognize `-ip` as a dependency marker (inherits tense from subsequent verb)

### Portuguese
1. Accept lowercase month/day names
2. Enforce `às` validation for time parsing
3. Ensure date parsing requires `de` preposition

---

## Research Sources

### Deep Research Audit
- [Computational Linguistics & Localization Analysis](../../docs/multilingual/Computational%20Linguistics%20%26%20Localization%20Analysis.md) - Comprehensive Gemini analysis

### Arabic
- [Lancaster Arabic Tagset](https://www.lancaster.ac.uk/staff/hardiea/arabic-annotation-guide.pdf)
- [Adros Verse - Arabic Conjunctions](https://www.adrosverse.com/modern-standard-arabic-4-6-conjunctions/)
- [Ultimate Arabic - العَطْف](https://ultimatearabic.com/conjunctions/)

### Turkish
- [Turkish Wikibooks - Converbs](https://en.wikibooks.org/wiki/Turkish/Converbs)
- [TurkishFluent - Sequential Actions](https://turkishfluent.com/blog/sequential-actions-turkish/)
- [ResearchGate - Turkish Morphological Analyzer](https://www.researchgate.net/publication/338060256)

### Portuguese
- [JDK-8017120 - Month capitalization](https://bugs.openjdk.org/browse/JDK-8017120)
- [Speaking Brazilian - Time](https://www.speakingbrazilian.com/how-to-tell-the-time-in-portuguese/)
- [Rio & Learn - Dates](https://rioandlearn.com/dates-in-portuguese/)

---

*Last updated: December 2025*
*Deep research audit conducted via Gemini*
