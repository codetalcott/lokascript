# @hyperfixi/types-browser

TypeScript type definitions for HyperFixi browser globals.

## Installation

```bash
npm install --save-dev @hyperfixi/types-browser
```

## Usage

### Option 1: tsconfig.json

Add to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["@hyperfixi/types-browser"]
  }
}
```

### Option 2: Triple-slash directive

Add to the top of your TypeScript files:

```typescript
/// <reference types="@hyperfixi/types-browser" />
```

## Global APIs

### window.hyperfixi (Core API)

Available when `hyperfixi-browser.js` is loaded:

```typescript
// Execute hyperscript
await window.hyperfixi.execute('toggle .active')

// Shorthand functions
window.evalHyperScript('toggle .active')
await window.evalHyperScriptAsync('wait 1s then toggle .active')
await window.evalHyperScriptSmart('toggle .active')

// Compile
const result = window.hyperfixi.compile('toggle .active')

// Low-level access
const parser = new window.hyperfixi.Parser()
const runtime = new window.hyperfixi.Runtime()
```

### window.HyperFixiSemantic (Semantic Parser API)

Available when `hyperfixi-semantic.browser.global.js` is loaded:

```typescript
// Parse in any of 13 languages
const node = window.HyperFixiSemantic.parse('toggle .active', 'en')
const nodeJa = window.HyperFixiSemantic.parse('トグル .active', 'ja')

// Translate between languages
const korean = window.HyperFixiSemantic.translate('toggle .active', 'en', 'ko')

// Get all translations
const translations = window.HyperFixiSemantic.getAllTranslations('toggle .active', 'en')

// Supported languages
const languages = window.HyperFixiSemantic.getSupportedLanguages()
// ['en', 'ja', 'ar', 'es', 'ko', 'tr', 'zh', 'pt', 'fr', 'de', 'id', 'qu', 'sw']
```

### window.HyperFixiI18n (Grammar Transformation API)

Available when `hyperfixi-i18n.min.js` is loaded:

```typescript
// Transform between language word orders
const statement = window.HyperFixiI18n.parseStatement('on click toggle .active')
const japanese = window.HyperFixiI18n.translate(statement, 'en', 'ja')

// Direct transformations
const localized = window.HyperFixiI18n.toLocale('toggle .active', 'ja')
const english = window.HyperFixiI18n.toEnglish('トグル .active', 'ja')

// Supported locales
const locales = window.HyperFixiI18n.getSupportedLocales()
```

## Type Guards

Use type guards for safe access:

```typescript
import {
  isHyperFixiCoreAvailable,
  isHyperFixiSemanticAvailable,
  isHyperFixiI18nAvailable,
  getHyperFixiCore,
  getHyperFixiSemantic,
  getHyperFixiI18n
} from '@hyperfixi/types-browser'

// Check availability
if (isHyperFixiCoreAvailable(window.hyperfixi)) {
  window.hyperfixi.execute('toggle .active')
}

// Safe getter
const hyperfixi = getHyperFixiCore()
if (hyperfixi) {
  await hyperfixi.execute('toggle .active')
}

const semantic = getHyperFixiSemantic()
if (semantic) {
  const node = semantic.parse('toggle .active', 'en')
}
```

## Complete Example

```html
<!DOCTYPE html>
<html>
<head>
  <script src="node_modules/@hyperfixi/core/dist/hyperfixi-browser.js"></script>
  <script src="node_modules/@hyperfixi/semantic/dist/hyperfixi-semantic.browser.global.js"></script>
  <script src="node_modules/@hyperfixi/i18n/dist/hyperfixi-i18n.min.js"></script>
</head>
<body>
  <button id="btn" class="active">Click me</button>

  <script type="module">
    import { getHyperFixiCore, getHyperFixiSemantic } from '@hyperfixi/types-browser'

    const hyperfixi = getHyperFixiCore()
    const semantic = getHyperFixiSemantic()

    if (!hyperfixi) throw new Error('HyperFixi not loaded')

    // Execute hyperscript
    await hyperfixi.execute('toggle .active', document.querySelector('#btn'))

    // Parse in Japanese
    if (semantic) {
      const node = semantic.parse('トグル .active', 'ja')
      console.log('Parsed Japanese:', node)
    }
  </script>
</body>
</html>
```

## Supported Languages

### Semantic Parser (13 languages)
- English (en)
- Japanese (ja)
- Arabic (ar)
- Spanish (es)
- Korean (ko)
- Turkish (tr)
- Chinese (zh)
- Portuguese (pt)
- French (fr)
- German (de)
- Indonesian (id)
- Quechua (qu)
- Swahili (sw)

## License

MIT
