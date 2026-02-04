# @lokascript/hyperscript-adapter

Multilingual plugin for the original [\_hyperscript](https://hyperscript.org). Write hyperscript in any of 24 languages — the adapter translates to English before the standard parser runs.

## When to Use

| Scenario                                  | Package                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------- |
| Existing \_hyperscript project, want i18n | **@lokascript/hyperscript-adapter**                                                   |
| New project with full LokaScript runtime  | [@lokascript/core](/en/packages/core) + [@lokascript/semantic](/en/packages/semantic) |
| Translate code for docs/teaching          | [@lokascript/i18n](/en/packages/i18n)                                                 |

Use `@lokascript/hyperscript-adapter` when you already use the original `_hyperscript` and want to write attributes in your native language without switching runtimes.

## Installation

```bash
npm install @lokascript/hyperscript-adapter
```

Or load a self-contained browser bundle (no npm required):

```html
<script src="_hyperscript.js"></script>
<script src="hyperscript-i18n-es.global.js"></script>
```

## Quick Start

### Browser

```html
<script src="_hyperscript.js"></script>
<script src="hyperscript-i18n-es.global.js"></script>

<!-- Spanish -->
<button _="on click alternar .active on me" data-lang="es">Toggle</button>

<!-- Japanese -->
<button _="on click .active を me で 切り替え" data-lang="ja">Toggle</button>

<!-- Inherited language for all children -->
<div data-hyperscript-lang="fr">
  <button _="on click basculer .active on me">Basculer</button>
</div>
```

The plugin auto-registers when `_hyperscript` is available. No extra JS needed.

### Node.js / Bundlers

```javascript
import { hyperscriptI18n } from '@lokascript/hyperscript-adapter';

_hyperscript.use(hyperscriptI18n());

// With options
_hyperscript.use(
  hyperscriptI18n({
    defaultLanguage: 'ja',
    confidenceThreshold: 0.6,
    debug: true,
  })
);
```

### Programmatic

For `_hyperscript.evaluate()` or `_hyperscript("code")` calls (which bypass the plugin):

```javascript
import { preprocess } from '@lokascript/hyperscript-adapter';

const english = preprocess('トグル .active', 'ja');
_hyperscript(english); // "toggle .active"
```

## Bundle Options

All bundles auto-register with `_hyperscript` on load.

### Self-Contained (Single `<script>` Tag)

Each bundle includes the adapter + semantic parser for the specified languages.

| Bundle                                  | Languages      | Size   |
| --------------------------------------- | -------------- | ------ |
| `hyperscript-i18n.global.js`            | All 24         | 568 KB |
| `hyperscript-i18n-western.global.js`    | es, pt, fr, de | 146 KB |
| `hyperscript-i18n-east-asian.global.js` | ja, ko, zh     | 146 KB |
| `hyperscript-i18n-tr.global.js`         | tr             | 101 KB |
| `hyperscript-i18n-ko.global.js`         | ko             | 100 KB |
| `hyperscript-i18n-ar.global.js`         | ar             | 95 KB  |
| `hyperscript-i18n-ja.global.js`         | ja             | 95 KB  |
| `hyperscript-i18n-es.global.js`         | es             | 94 KB  |
| `hyperscript-i18n-zh.global.js`         | zh             | 88 KB  |
| `hyperscript-i18n-fr.global.js`         | fr             | 87 KB  |
| `hyperscript-i18n-de.global.js`         | de             | 86 KB  |
| `hyperscript-i18n-pt.global.js`         | pt             | 86 KB  |
| `hyperscript-i18n-id.global.js`         | id             | 85 KB  |

```html
<!-- Django / Flask / FastAPI: just pick your language -->
<script src="{% static '_hyperscript.js' %}"></script>
<script src="{% static 'hyperscript-i18n-es.global.js' %}"></script>
```

### Lite Adapter (Two `<script>` Tags)

A ~2 KB adapter that expects a `@lokascript/semantic` bundle loaded separately. Use when you already load `@lokascript/semantic` for other purposes.

```html
<script src="_hyperscript.js"></script>
<script src="lokascript-semantic-es.global.js"></script>
<script src="hyperscript-i18n-lite.global.js"></script>
```

## Language Resolution

The plugin resolves language per element in this order:

1. `data-lang` attribute on the element
2. `data-hyperscript-lang` on the element or closest ancestor
3. `<html lang="...">` on the document
4. `defaultLanguage` option (if configured)

English (`en`) and unresolved languages pass through without translation.

## Options

| Option                | Type                               | Default       | Description                                                   |
| --------------------- | ---------------------------------- | ------------- | ------------------------------------------------------------- |
| `defaultLanguage`     | `string`                           | --            | Default language for all elements                             |
| `languageAttribute`   | `string`                           | `"data-lang"` | Custom attribute name for per-element language                |
| `confidenceThreshold` | `number \| Record<string, number>` | `0.5`         | Min confidence (0--1). Per-language map supported (see below) |
| `strategy`            | `'semantic' \| 'i18n' \| 'auto'`   | `'semantic'`  | Translation strategy                                          |
| `debug`               | `boolean`                          | `false`       | Log translations to console                                   |
| `i18nToEnglish`       | `function`                         | --            | Optional `@lokascript/i18n` `toEnglish` function for fallback |

### Per-Language Confidence Thresholds

SOV languages (ja, ko, tr) produce inherently lower confidence scores than SVO languages (es, fr, de). Use a per-language map to tune thresholds:

```javascript
_hyperscript.use(
  hyperscriptI18n({
    confidenceThreshold: {
      es: 0.7, // SVO -- tighter gating
      ja: 0.1, // SOV -- more permissive
      ko: 0.05,
      '*': 0.5, // default for unlisted languages
    },
  })
);
```

## How It Works

The plugin overrides `runtime.getScript()` -- the method `_hyperscript` calls to read `_="..."` attributes. For each element:

1. Resolve language (see [Language Resolution](#language-resolution))
2. If non-English, translate to English via `@lokascript/semantic`
3. Return the English hyperscript to the original parser

No changes to `_hyperscript` internals. The original parser, lexer, and runtime are untouched.

## Limitations

- **Expressions** (`is`, `contains`, `matches`, etc.): expression operators embedded in commands are preserved as raw text and work fine. Standalone non-English boolean expressions outside a command context do not translate. Note: `has` is not yet implemented as an expression operator.
- **Feature declarations** (`def`, `worker`): these are original `_hyperscript` feature-level keywords not part of the adapter's translation layer -- keep them in English. Command bodies within features translate normally. (`behavior` IS supported.)
- **SOV/VSO accuracy**: Japanese, Korean, Turkish have lower pattern coverage -- confidence gating may trigger fallback to the original text
- **Programmatic calls**: `_hyperscript("code")` bypasses the plugin -- use `preprocess()` for those
- **Unsupported commands**: `beep`, `break`, `copy`, `exit`, `pick`, and `render` lack semantic schemas -- the parser cannot recognize them in non-English. Write these commands in English.

## Next Steps

- [Writing in Your Language](/en/guide/multilingual) -- Multilingual hyperscript guide
- [@lokascript/semantic](/en/packages/semantic) -- The parser powering translations
- [@lokascript/i18n](/en/packages/i18n) -- Grammar transformation for docs/teaching
