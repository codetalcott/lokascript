# LokaScript Extensions

This document tracks syntax and features that are specific to LokaScript and may not be available in official \_hyperscript. These extensions are designed to improve readability, align with JavaScript conventions, or fill gaps in the standard syntax.

## Compatibility Notice

LokaScript maintains **~85% compatibility** with official \_hyperscript. The extensions documented here represent intentional enhancements that:

1. **Do not break** existing \_hyperscript code
2. **Improve readability** for native English speakers
3. **Align with JavaScript conventions** where appropriate
4. **Are fully tested** in the LokaScript test suite

## Extension Categories

| Category                                              | Status    | Description                           |
| ----------------------------------------------------- | --------- | ------------------------------------- |
| [Possessive Dot Notation](#possessive-dot-notation)   | ✅ Stable | `my.value`, `its.value`, `your.value` |
| [Enhanced Type Conversion](#enhanced-type-conversion) | ✅ Stable | Extended `as` keyword support         |
| [Multilingual Support](#multilingual-support)         | ✅ Stable | 13 language keyword translations      |

---

## Possessive Dot Notation

**Added:** v1.0.0
**Status:** ✅ Stable
**Official \_hyperscript:** ❌ Not supported

### Description

LokaScript allows JavaScript-style dot notation with possessive pronouns (`my`, `its`, `your`), providing a more familiar syntax for developers coming from JavaScript.

### Syntax Comparison

| LokaScript Extension   | Standard \_hyperscript | Equivalent             |
| ---------------------- | ---------------------- | ---------------------- |
| `my.textContent`       | `my textContent`       | `me.textContent`       |
| `my.value`             | `my value`             | `me.value`             |
| `my.parentElement.id`  | N/A (chained)          | `me.parentElement.id`  |
| `my.getAttribute("x")` | N/A (method call)      | `me.getAttribute("x")` |
| `my?.value`            | N/A (optional chain)   | `me?.value`            |
| `its.value`            | `its value`            | `it.value`             |
| `your.name`            | `your name`            | `you.name`             |

### Examples

```hyperscript
-- LokaScript extension (JavaScript-like)
on click set my.textContent to "Done!"

-- Standard _hyperscript (space syntax)
on click set my textContent to "Done!"

-- Both produce the same result
```

```hyperscript
-- Chained property access
on click set my.parentElement.style.display to "none"

-- Method calls
on input put my.value.toUpperCase() into #preview

-- Optional chaining (safe access)
on click log my?.dataset?.customValue
```

### Why This Extension?

1. **Familiar to JavaScript developers** - Reduces cognitive load
2. **Consistent with `me.property`** - Since `me.value` works, `my.value` should too
3. **Enables method chaining** - `my.getAttribute("x")` reads naturally
4. **Supports optional chaining** - `my?.value` for safe access

### Migration

No migration needed. Both syntaxes work:

```hyperscript
-- These are all equivalent in LokaScript:
set my.textContent to "Hello"
set my textContent to "Hello"
set me.textContent to "Hello"
```

---

## Enhanced Type Conversion

**Added:** v1.0.0
**Status:** ✅ Stable
**Official \_hyperscript:** ⚠️ Partial support

### Description

LokaScript provides extended type conversion with the `as` keyword, supporting additional types and conversion scenarios.

### Supported Conversions

| Conversion    | Example                | Notes                    |
| ------------- | ---------------------- | ------------------------ |
| `as Int`      | `"42" as Int`          | String to integer        |
| `as Number`   | `"3.14" as Number`     | String to float          |
| `as String`   | `42 as String`         | Any to string            |
| `as Boolean`  | `"true" as Boolean`    | Truthy conversion        |
| `as Array`    | `nodeList as Array`    | NodeList to Array        |
| `as JSON`     | `obj as JSON`          | Object to JSON string    |
| `as Object`   | `jsonStr as Object`    | JSON string to object    |
| `as Date`     | `"2024-01-01" as Date` | String to Date           |
| `as FormData` | `form as FormData`     | Form element to FormData |

---

## Multilingual Support

**Added:** v1.0.0
**Status:** ✅ Stable
**Official \_hyperscript:** ❌ Not supported

### Description

LokaScript supports writing hyperscript in 13 languages with automatic grammar transformation based on word order (SVO, SOV, VSO).

### Supported Languages

| Language   | Code | Word Order | Example                           |
| ---------- | ---- | ---------- | --------------------------------- |
| English    | `en` | SVO        | `on click toggle .active`         |
| Spanish    | `es` | SVO        | `en clic alternar .active`        |
| French     | `fr` | SVO        | `sur clic basculer .active`       |
| Portuguese | `pt` | SVO        | `em clique alternar .active`      |
| German     | `de` | V2         | `bei Klick umschalten .active`    |
| Japanese   | `ja` | SOV        | `クリック で .active を 切り替え` |
| Korean     | `ko` | SOV        | `클릭 에서 .active 를 토글`       |
| Chinese    | `zh` | SVO        | `点击 时 切换 .active`            |
| Arabic     | `ar` | VSO        | `عند النقر بدّل .active`          |
| Turkish    | `tr` | SOV        | `tıklamada .active değiştir`      |
| Indonesian | `id` | SVO        | `pada klik alihkan .active`       |
| Swahili    | `sw` | SVO        | `bonyeza badilisha .active`       |
| Quechua    | `qu` | SOV        | `ñit'iy .active t'ikray`          |

See the [semantic package documentation](../../semantic/README.md) for full details.

---

## Tracking Compatibility

### How Extensions Are Tested

Each extension includes:

1. **Unit tests** - Verify the syntax parses and evaluates correctly
2. **Equivalence tests** - Confirm extension produces same result as standard syntax
3. **Regression tests** - Ensure standard \_hyperscript syntax still works

### Reporting Issues

If you find an extension that breaks compatibility with official \_hyperscript:

1. Check if it's documented here as an intentional extension
2. If not, file an issue at [github.com/codetalcott/lokascript/issues](https://github.com/codetalcott/lokascript/issues)

---

## Future Extensions

Potential extensions under consideration:

| Extension                 | Description                          | Status         |
| ------------------------- | ------------------------------------ | -------------- |
| `within me` / `inside me` | Alternative to `in me` for iteration | 🔍 Considering |
| Enhanced `put` syntax     | More natural content placement       | 🔍 Considering |
| Shorthand event modifiers | `.once`, `.prevent` as suffixes      | 🔍 Considering |

---

## Changelog

### v1.0.0

- Added possessive dot notation (`my.value`, `its.value`, `your.value`)
- Added optional chaining support (`my?.value`)
- 13-language multilingual support
