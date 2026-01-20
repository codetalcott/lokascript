# Writing in Your Language

LokaScript supports writing hyperscript in 23 languages. Write in your native language and LokaScript understands it directly.

## Supported Languages

| Language   | Code | Word Order | Example                              |
| ---------- | ---- | ---------- | ------------------------------------ |
| English    | `en` | SVO        | `on click toggle .active`            |
| Spanish    | `es` | SVO        | `al hacer clic alternar .activo`     |
| French     | `fr` | SVO        | `au clic basculer .actif`            |
| German     | `de` | V2         | `bei Klick umschalten .aktiv`        |
| Portuguese | `pt` | SVO        | `ao clicar alternar .ativo`          |
| Japanese   | `ja` | SOV        | `クリックしたら .active を 切り替え` |
| Korean     | `ko` | SOV        | `클릭하면 .active 토글`              |
| Chinese    | `zh` | SVO        | `点击时 切换 .active`                |
| Arabic     | `ar` | VSO        | `عند النقر بدّل .active`             |
| Turkish    | `tr` | SOV        | `tıklandığında .active değiştir`     |
| Indonesian | `id` | SVO        | `saat klik alihkan .active`          |
| Quechua    | `qu` | SOV        | `ñit'ispa .active t'ikray`           |
| Swahili    | `sw` | SVO        | `ukibofya badilisha .active`         |

Plus: Bengali, Hindi, Italian, Malay, Polish, Russian, Thai, Tagalog, Ukrainian, Vietnamese.

## Quick Start

### With Vite Plugin (Recommended)

The Vite plugin auto-detects languages from your source files:

```javascript
// vite.config.js
import { lokascript } from '@lokascript/vite-plugin';

export default {
  plugins: [lokascript({ semantic: 'auto' })],
};
```

Then write in any language:

```html
<!-- Japanese -->
<button _="クリックしたら .active を 切り替え">切り替え</button>

<!-- Spanish -->
<button _="al hacer clic alternar .activo">Alternar</button>

<!-- Korean -->
<button _="클릭하면 .active 토글">토글</button>
```

### With CDN

Choose a bundle that includes your language:

```html
<!-- English only (~20 KB) -->
<script src="https://unpkg.com/@lokascript/semantic/dist/browser-en.en.global.js"></script>

<!-- Western languages (~30 KB) - en, es, pt, fr, de -->
<script src="https://unpkg.com/@lokascript/semantic/dist/browser-western.western.global.js"></script>

<!-- East Asian (~24 KB) - ja, zh, ko -->
<script src="https://unpkg.com/@lokascript/semantic/dist/browser-east-asian.east-asian.global.js"></script>

<!-- All languages (~61 KB) -->
<script src="https://unpkg.com/@lokascript/semantic/dist/browser.global.js"></script>
```

## Language Examples

### English

Standard hyperscript syntax with natural alternatives:

```html
<!-- Standard -->
<button _="on click toggle .active">Toggle</button>

<!-- Natural alternatives -->
<button _="when clicked toggle .active">Toggle</button>
<button _="flip .active">Toggle</button>
<button _="toggle the active class">Toggle</button>
```

### Japanese

SOV word order with native conditionals:

```html
<!-- Standard (with particles) -->
<button _="クリック で .active を 切り替え">切り替え</button>

<!-- Conditional (most natural) -->
<button _="クリックしたら .active を 切り替え">切り替え</button>

<!-- Compact (no spaces) -->
<button _=".activeを切り替え">切り替え</button>

<!-- Increment -->
<button _="クリックしたら #counter を 増加">+1</button>
```

### Spanish

SVO word order with natural expressions:

```html
<!-- Standard -->
<button _="en clic alternar .activo">Alternar</button>

<!-- Native form -->
<button _="al hacer clic alternar .activo">Alternar</button>

<!-- Conditional -->
<button _="si clic alternar .activo">Alternar</button>
```

### Korean

SOV word order with conditionals:

```html
<!-- Standard -->
<button _="클릭 토글 .active">토글</button>

<!-- Conditional -->
<button _="클릭하면 .active 토글">토글</button>

<!-- Honorific -->
<button _="클릭하시면 .active 토글">토글</button>
```

### Arabic (RTL)

VSO word order with right-to-left text:

```html
<button _="عند النقر بدّل .active" dir="rtl">بدّل</button>
```

## Bundle Selection

Choose the smallest bundle that covers your languages:

| Bundle                                    | Size   | Languages             |
| ----------------------------------------- | ------ | --------------------- |
| `browser-en.en.global.js`                 | ~20 KB | English               |
| `browser-es.es.global.js`                 | ~16 KB | Spanish               |
| `browser-es-en.es-en.global.js`           | ~25 KB | English + Spanish     |
| `browser-western.western.global.js`       | ~30 KB | en, es, pt, fr, de    |
| `browser-east-asian.east-asian.global.js` | ~24 KB | ja, zh, ko            |
| `browser-priority.priority.global.js`     | ~48 KB | 11 priority languages |
| `browser.global.js`                       | ~61 KB | All 23 languages      |

## Vite Plugin Options

```javascript
lokascript({
  // Auto-detect languages from source files
  semantic: 'auto',

  // Or specify languages explicitly
  languages: ['en', 'ja', 'ko'],

  // Or force a regional bundle
  region: 'western', // en, es, pt, fr, de
  region: 'east-asian', // ja, zh, ko
  region: 'priority', // 11 most common
  region: 'all', // all 23

  // Enable grammar transformation (SOV/VSO)
  grammar: true,
});
```

## How It Works

LokaScript's semantic parser:

1. **Tokenizes** input using language-specific rules
2. **Identifies** semantic roles (action, target, destination)
3. **Builds** an AST directly from semantic understanding
4. **Executes** the same way regardless of source language

No translation step means:

- Faster parsing
- Native idiom support
- Better error messages in your language

## Next Steps

- [Semantic Parser](/en/guide/semantic-parser) - How multilingual parsing works
- [Grammar Transformation](/en/guide/grammar) - SOV/VSO word order
- [@lokascript/semantic](/en/packages/semantic) - Package reference
