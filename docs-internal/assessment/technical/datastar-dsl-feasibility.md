# Feasibility Assessment: DSL for Datastar

**Date:** 2026-02-16
**Status:** Research / Analysis
**Datastar version assessed:** v1.0.0-RC.7 (not "v5" — see clarification below)

---

## Executive Summary

Creating a DSL for Datastar is **technically feasible** and architecturally well-suited to HyperFixi's existing parser infrastructure. However, the value proposition is narrower than it was for \_hyperscript, because Datastar's expression language is already JavaScript — meaning a DSL would be an *alternative syntax layer*, not a replacement for something that doesn't exist. The strongest case for this work is **multilingual Datastar** (writing `data-on:click` handlers in natural language) and **declarative shorthand** (reducing boilerplate in common patterns).

**Feasibility rating: 7/10** — technically straightforward, architecturally aligned, but product-market fit requires careful scoping.

---

## 1. Clarification: Datastar Versioning

Datastar is at **v1.0.0-RC.7** (December 2025), not "v5." The version history:
- 0.x series → v1.0.0-beta.1 through beta.11 → v1.0.0-RC.1 through RC.7
- Created by Delaney Gillilan, maintained under Star Federation (501(c)(3) nonprofit)
- ~11 KB minified+gzipped, ~3.9k GitHub stars

The "v5" reference may come from podcast discussions about internal rewrites or confusion with another product.

---

## 2. What Datastar Currently Does (Expression Language)

Datastar uses **JavaScript expressions with syntactic sugar**:

| Syntax | Meaning |
|--------|---------|
| `$signal` | Read/write reactive signal |
| `@action()` | Call registered action (e.g., `@get('/api')`, `@post('/submit')`) |
| `el` | Current element |
| `evt` | Event object (in `data-on` handlers) |

Expressions are evaluated via `Function()` constructors in a sandboxed context. Full JS syntax works:

```html
<div data-signals="{count: 0, name: 'World'}">
  <span data-text="$count"></span>
  <input data-bind:name />
  <button data-on:click="$count++">+1</button>
  <button data-on:click__debounce.300ms="@post('/submit')">Submit</button>
</div>
```

**Key observation:** Datastar does *not* have a DSL problem the way \_hyperscript does. Its expressions are already familiar to anyone who knows JavaScript. The `$`/`@` sugar is minimal and intuitive.

---

## 3. What a "DSL for Datastar" Could Mean

There are several interpretations, each with different feasibility profiles:

### 3A. English-Like Alternative Syntax (Like \_hyperscript for Datastar)

Replace JS expressions with natural-language commands:

```html
<!-- Current Datastar -->
<button data-on:click="$count++; @post('/api/count')">

<!-- Hypothetical DSL -->
<button data-on:click="increment count then post to /api/count">
```

**Feasibility: 8/10** — HyperFixi's parser can handle this trivially.
**Value: 3/10** — Datastar users chose Datastar *because* it uses JS. An English DSL fights the library's identity. The `$count++` syntax is already more concise than any English equivalent.

### 3B. Multilingual Datastar Expressions

Write Datastar expressions in 24 languages:

```html
<!-- Japanese -->
<button data-on:click="$count を増加して /api/count にポスト">

<!-- Spanish -->
<button data-on:click="incrementar $count luego enviar a /api/count">

<!-- Arabic (RTL) -->
<button data-on:click="زيادة $count ثم إرسال إلى /api/count">
```

This would preprocess non-English expressions into valid Datastar JS before evaluation.

**Feasibility: 7/10** — Directly reuses HyperFixi's semantic parser + i18n grammar transformer.
**Value: 6/10** — Genuine gap. Datastar has zero i18n story for expressions. Non-English-speaking developers writing `$count++` is fine, but `@post('/endpoint')` with surrounding logic in JS is a barrier for some audiences.

### 3C. Declarative Shorthand / Macro System

Reduce boilerplate for common Datastar patterns:

```html
<!-- Current: verbose for a common pattern -->
<div data-signals="{loading: false}"
     data-indicator:loading>
  <button data-on:click="@post('/api/submit')"
          data-attr="{disabled: $loading}"
          data-class:opacity-50="$loading">
    <span data-show="!$loading">Submit</span>
    <span data-show="$loading">Loading...</span>
  </button>
</div>

<!-- Shorthand DSL -->
<button data-action="post /api/submit"
        data-loading-states="disabled opacity-50"
        data-loading-text="Loading...">
  Submit
</button>
```

**Feasibility: 6/10** — Requires understanding Datastar's attribute expansion semantics. The DSL would compile to multiple `data-*` attributes or inline JS.
**Value: 7/10** — Real pain point. Datastar's attribute-per-concern model gets verbose for common UI patterns (loading states, optimistic updates, form validation).

### 3D. Type-Safe Expression Language

Replace raw JS strings with a typed, validated expression language:

```html
<!-- Current: no validation until runtime -->
<div data-text="$cont.toUpperCase()">  <!-- typo: $cont instead of $count -->

<!-- Typed DSL: caught at build time -->
<div data-text="upper($count)">  <!-- validator knows $count exists, upper() is valid -->
```

**Feasibility: 5/10** — Requires static analysis of signal definitions, understanding scope.
**Value: 8/10** — Datastar's biggest DX weakness is that expression errors are silent or cryptic at runtime. A typed layer with build-time validation would be genuinely valuable.

---

## 4. Technical Architecture

### 4.1 Preprocessing Approach (Recommended)

The most viable architecture mirrors HyperFixi's hyperscript-adapter: **preprocess DSL → emit valid Datastar JS expressions**.

```
DSL Source → Tokenizer → Parser → AST → Emitter → Datastar JS Expression
                                                         ↓
                                              data-* attribute values
                                                         ↓
                                              Datastar runtime (unchanged)
```

**Advantages:**
- Datastar runtime stays untouched (no fork needed)
- Works with any Datastar version (decoupled)
- Can be a Vite plugin, build step, or runtime preprocessor
- Datastar's own plugin system doesn't need modification

**Implementation complexity:**
- Tokenizer: ~200-400 lines (simpler than \_hyperscript — fewer keywords)
- Parser: ~500-1000 lines (Datastar has ~15 attributes vs 48 commands)
- Emitter: ~300-500 lines (output is JS strings, not AST)
- Total: **~1000-2000 lines** of new code

### 4.2 Reusable HyperFixi Components

| HyperFixi Component | Reuse for Datastar | Effort |
|---------------------|-------------------|--------|
| `ParserInterface` abstraction | Define DSL parser contract | Low |
| Regex parser pattern | Simple expression parsing | Low |
| Hybrid parser pattern | Complex expression parsing | Medium |
| i18n grammar transformer | Multilingual expressions | Medium |
| Semantic parser (24 languages) | Multilingual parsing | Low (direct reuse) |
| Vite plugin scanner | Detect DSL usage in templates | Low |
| Vite plugin aggregator | Collect usage across files | Low |
| Command decorator system | Define DSL commands | Low |
| Expression base class | Expression type system | Medium |
| htmx attribute processor | `data-*` attribute lifecycle | High relevance |

### 4.3 Datastar-Specific Challenges

**Signal resolution:** Datastar signals use `$` prefix and can be nested (`$form.name`). A DSL must preserve signal reactivity — the output JS must still reference `$signals` so Datastar's reactive engine tracks dependencies.

```javascript
// DSL input:  "if count > 10 then post to /api/alert"
// Must emit:  "$count > 10 && @post('/api/alert')"
// NOT:        "count > 10 && post('/api/alert')"  ← breaks reactivity
```

**Modifier syntax:** Datastar uses `__` (double underscore) for modifiers on attributes:
```
data-on:click__debounce.300ms__prevent="..."
```
A DSL could offer alternative syntax but must compile back to this format for the attribute processor.

**SSE integration:** Datastar's backend SDKs send `datastar-patch-signals` and `datastar-patch-elements` events. A DSL layer wouldn't affect this — it only transforms the frontend expression language.

### 4.4 Vite Plugin Integration

A Datastar DSL Vite plugin would follow HyperFixi's scanner/aggregator/generator pattern:

```javascript
// vite.config.js
import { datastarDSL } from '@hyperfixi/datastar-dsl';

export default {
  plugins: [
    datastarDSL({
      language: 'en',        // or 'ja', 'es', etc.
      shorthand: true,       // enable macro expansion
      validate: true,        // build-time expression validation
    })
  ]
};
```

**Scanner phase:** Detect `data-*` attributes in HTML/Vue/Svelte/JSX files.
**Transform phase:** Preprocess DSL expressions → valid Datastar JS.
**Validate phase:** Check signal references, action calls, type consistency.

---

## 5. Scope Comparison

| Dimension | \_hyperscript DSL (HyperFixi) | Datastar DSL |
|-----------|-------------------------------|-------------|
| Target expression language | Custom English-like DSL | JavaScript with `$`/`@` sugar |
| Number of commands/directives | 48 commands | ~15 attributes |
| Expression complexity | 6 categories, 60+ operators | Standard JS operators |
| Grammar transformation needed | Yes (SOV/VSO word order) | Only if multilingual |
| Parser complexity | High (3000+ line parser) | Low-Medium (~1000 lines) |
| Runtime integration | Deep (custom runtime) | Shallow (preprocessor only) |
| Bundle size concern | High (203 KB full) | Low (Datastar is 11 KB) |
| Existing ecosystem to maintain compat with | \_hyperscript (complex) | Datastar (simpler, stable API) |

---

## 6. Risk Assessment

### Low Risk
- **Technical implementation** — Preprocessing architecture is proven (hyperscript-adapter exists)
- **Datastar compatibility** — No fork needed, pure preprocessing
- **i18n reuse** — Semantic parser and grammar transformer are battle-tested

### Medium Risk
- **Datastar API stability** — Still at RC stage. Attribute names or expression evaluation could change before 1.0 final. Mitigation: wait for 1.0 stable, or design for easy adaptation.
- **Expression edge cases** — Datastar allows arbitrary JS. A DSL must handle or explicitly reject complex cases (ternaries, method chaining, destructuring, etc.)
- **Community adoption** — Datastar users self-select for JS comfort. A DSL may not appeal to the existing community.

### High Risk
- **Product-market fit** — The strongest version of this (multilingual + validation + shorthand) serves a different audience than current Datastar users. It may need its own community-building effort.
- **Maintenance burden** — Tracking Datastar releases, especially during RC→stable transition, requires ongoing attention.

---

## 7. Recommended Approach

If proceeding, build in phases:

### Phase 1: Vite Plugin with Build-Time Validation (~1000 LOC)
- Scan `data-*` attributes for expression errors
- Validate signal references (catch typos like `$cont` vs `$count`)
- Validate action calls (`@get`, `@post`, etc.)
- No DSL — just validation of existing Datastar JS expressions
- **Value:** Immediate utility, no new syntax to learn, builds trust

### Phase 2: Shorthand Macros (~500 LOC)
- Common patterns as higher-level attributes
- `data-action` → expands to `data-on` + `data-indicator` + `data-attr`
- Loading states, form validation, optimistic updates
- **Value:** Reduces boilerplate, stays close to Datastar idioms

### Phase 3: Multilingual Expressions (~1500 LOC, reuses semantic parser)
- Write `data-on:click` handlers in 24 languages
- Preprocesses to valid Datastar JS
- Reuses HyperFixi's semantic parser directly
- **Value:** Opens Datastar to non-English-speaking developers

### Phase 4: Full English-Like DSL (optional, ~2000 LOC)
- Only if Phase 1-3 demonstrate demand
- Natural language alternative to JS expressions
- `increment count then post to /api` → `$count++; @post('/api')`
- **Value:** Accessibility for non-programmers (low-code use case)

---

## 8. Effort Estimate

| Phase | New Code | Reused from HyperFixi | Package |
|-------|----------|----------------------|---------|
| Phase 1: Validation | ~1000 LOC | Vite plugin scanner, aggregator | `@hyperfixi/datastar-validate` |
| Phase 2: Shorthand | ~500 LOC | Attribute processor pattern | `@hyperfixi/datastar-shorthand` |
| Phase 3: Multilingual | ~1500 LOC | Semantic parser, i18n transformer, 24 tokenizers | `@lokascript/datastar-i18n` |
| Phase 4: Full DSL | ~2000 LOC | Parser interface, command system, expression base | `@hyperfixi/datastar-dsl` |

**Total if all phases:** ~5000 LOC new + significant reuse from existing packages.

---

## 9. Conclusion

A DSL for Datastar is feasible but should be scoped carefully. The highest-value, lowest-risk entry point is **build-time validation** (Phase 1), which provides immediate utility without introducing new syntax. Multilingual support (Phase 3) is the most differentiated offering, leveraging HyperFixi's unique 24-language infrastructure. A full English-like DSL (Phase 4) is the lowest priority — it fights Datastar's JS-first identity rather than complementing it.

The preprocessing architecture is proven, the parser infrastructure is reusable, and Datastar's simpler attribute model (15 attributes vs 48 commands) means the DSL surface area is manageable. The main question is not "can we build it" but "who wants it and which layer do they want."
