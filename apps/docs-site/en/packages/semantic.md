# @lokascript/semantic

Semantic-first multilingual parser for LokaScript. Parses hyperscript from 24 languages into executable code.

## Installation

```bash
npm install @lokascript/semantic
```

## Quick Start

```javascript
import { parse, translate, canParse } from '@lokascript/semantic';

// Parse from any language
const node = parse('toggle .active', 'en');
const nodeJa = parse('.active を 切り替え', 'ja');

// Translate between languages
const japanese = translate('toggle .active', 'en', 'ja');
// → '.active を 切り替え'

// Check parsability with confidence
const result = canParse('クリックしたら 増加', 'ja');
if (result.canParse) {
  console.log('Confidence:', result.confidence);
}
```

## Supported Languages (24)

| Tier                       | Languages                                                                             |
| -------------------------- | ------------------------------------------------------------------------------------- |
| **Tier 1** (native idioms) | English, Japanese, Korean, Spanish, Chinese                                           |
| **Tier 2** (full grammar)  | Arabic, Hebrew, Turkish, German, French, Portuguese                                   |
| **Tier 3** (functional)    | Indonesian, Quechua, Swahili                                                          |
| **Additional**             | Bengali, Hindi, Italian, Malay, Polish, Russian, Thai, Tagalog, Ukrainian, Vietnamese |

Regional variants (e.g., es-MX for Mexican Spanish) are also supported via the language variant system.

## Bundle Selection

Choose the smallest bundle that covers your languages:

### Single Language (~14-20 KB)

```html
<script src="@lokascript/semantic/dist/browser-en.en.global.js"></script>
<script src="@lokascript/semantic/dist/browser-es.es.global.js"></script>
<script src="@lokascript/semantic/dist/browser-ja.ja.global.js"></script>
```

### Regional Bundles

| Bundle                                    | Size   | Languages          | Global Variable               |
| ----------------------------------------- | ------ | ------------------ | ----------------------------- |
| `browser-es-en.es-en.global.js`           | ~25 KB | en, es             | `LokaScriptSemanticEsEn`      |
| `browser-western.western.global.js`       | ~30 KB | en, es, pt, fr, de | `LokaScriptSemanticWestern`   |
| `browser-east-asian.east-asian.global.js` | ~24 KB | ja, zh, ko         | `LokaScriptSemanticEastAsian` |
| `browser-priority.priority.global.js`     | ~48 KB | 11 languages       | `LokaScriptSemanticPriority`  |
| `browser.global.js`                       | ~90 KB | All 24             | `LokaScriptSemantic`          |

### Lazy Loading (~15 KB initial)

```javascript
const { loadLanguage, parse } = LokaScriptSemanticLazy;

// Load languages on demand
await loadLanguage('en');
await loadLanguage('ja');

// Parse works for loaded languages
parse('toggle .active', 'en');
parse('トグル .active', 'ja');
```

## API Reference

### `parse(input, language)`

Parse hyperscript code to a semantic node.

```javascript
const node = parse('toggle .active on #button', 'en');
// {
//   type: 'command',
//   action: 'toggle',
//   patient: '.active',
//   destination: '#button'
// }
```

### `translate(input, from, to)`

Translate hyperscript between languages.

```javascript
const japanese = translate('toggle .active', 'en', 'ja');
// → '.active を 切り替え'

const english = translate('.active を 切り替え', 'ja', 'en');
// → 'toggle .active'
```

### `canParse(input, language)`

Check if input can be parsed with confidence score.

```javascript
const result = canParse('クリックしたら .active 切り替え', 'ja');
// {
//   canParse: true,
//   confidence: 0.92,
//   language: 'ja'
// }
```

### `tokenize(input, language)`

Get token stream for debugging.

```javascript
const tokens = tokenize('toggle .active', 'en');
// [
//   { type: 'COMMAND', value: 'toggle' },
//   { type: 'SELECTOR', value: '.active' }
// ]
```

### `render(node, language)`

Render a semantic node back to hyperscript in a language.

```javascript
const node = parse('toggle .active', 'en');
const korean = render(node, 'ko');
// → '.active 토글'
```

### `buildAST(node)`

Build an executable AST from a semantic node.

```javascript
const semantic = parse('toggle .active', 'en');
const ast = buildAST(semantic);
// Ready for execution by @lokascript/core
```

## Native Idiom Support

The parser accepts natural expressions in each language:

### English

```javascript
parse('when clicked toggle .active', 'en'); // Temporal
parse('flip .active', 'en'); // Synonym
parse('toggle the active class', 'en'); // Natural article
```

### Japanese

```javascript
parse('クリックしたら 増加', 'ja'); // Conditional
parse('.activeを切り替え', 'ja'); // Compact (no spaces)
parse('クリック時に 増加', 'ja'); // Temporal
```

### Korean

```javascript
parse('클릭하면 .active 토글', 'ko'); // Conditional
parse('클릭하시면 .active 토글', 'ko'); // Honorific
```

## Tree-Shaking (Bundlers)

For optimal tree-shaking, import specific languages:

```javascript
// Only load English and Japanese
import '@lokascript/semantic/languages/en';
import '@lokascript/semantic/languages/ja';

import { parse } from '@lokascript/semantic';
```

## Custom Bundle Generation

Generate a custom bundle with only the languages you need:

```bash
cd node_modules/@lokascript/semantic

# Preview size estimate
node scripts/generate-bundle.mjs --estimate ja ko zh

# Generate bundle
node scripts/generate-bundle.mjs --auto es pt fr
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { parse, SemanticNode, ParseResult } from '@lokascript/semantic';

const node: SemanticNode = parse('toggle .active', 'en');
```

## Next Steps

- [Multilingual Guide](/en/guide/multilingual) - Writing in your language
- [Semantic Parser](/en/guide/semantic-parser) - How it works
- [Vite Plugin](/en/packages/vite-plugin) - Auto-configuration
