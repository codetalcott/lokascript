# @hyperfixi/i18n

Comprehensive internationalization (i18n) support for HyperFixi and _hyperscript applications.

## Installation

```bash
npm install @hyperfixi/i18n
```

## Features

- **🌍 Multi-language Support**: Built-in dictionaries for 8 languages (English, Spanish, French, German, Japanese, Korean, Chinese, Arabic)
- **🔄 Runtime Locale Switching**: Dynamic language switching in browser environments with automatic detection
- **⚡ SSR Integration**: Server-side rendering with locale detection, SEO optimization, and hydration support
- **📊 Pluralization**: CLDR-compliant pluralization rules for complex languages (Russian, Arabic, etc.)
- **💰 Formatting**: Locale-aware number, date, currency, and unit formatting with fallbacks
- **🛠️ Build Tool Integration**: Vite and Webpack plugins for build-time translation
- **🔍 Language Detection**: Automatically detect the language of hyperscript code from content
- **✅ Validation**: Comprehensive dictionary validation with coverage reports and warnings
- **🎯 Type Safety**: Full TypeScript support with comprehensive type definitions
- **⚡ Performance**: Caching, lazy loading, and optimized translation algorithms
- **📱 Browser Support**: Modern APIs with graceful fallbacks for legacy environments

## Quick Start

### Basic Translation

```typescript
import { HyperscriptTranslator } from '@hyperfixi/i18n';

const translator = new HyperscriptTranslator({ locale: 'es' });

// Translate from Spanish to English
const english = translator.translate(
  'en clic alternar .activo',
  { to: 'en' }
);
// Result: "on click toggle .activo"

// Translate from English to Korean
const korean = translator.translate(
  'on click toggle .active',
  { from: 'en', to: 'ko' }
);
// Result: "클릭 토글 .active"
```

### Language Detection

```typescript
const detectedLocale = translator.detectLanguage(
  'si verdadero entonces registrar "hola"'
);
// Result: "es"
```

### Build Tool Integration

#### Vite

```typescript
// vite.config.ts
import { hyperscriptI18nVitePlugin } from '@hyperfixi/i18n/plugins/vite';

export default {
  plugins: [
    hyperscriptI18nVitePlugin({
      sourceLocale: 'es',
      targetLocale: 'en',
      preserveOriginal: true
    })
  ]
};
```

#### Webpack

```javascript
// webpack.config.js
const { HyperscriptI18nWebpackPlugin } = require('@hyperfixi/i18n/plugins/webpack');

module.exports = {
  plugins: [
    new HyperscriptI18nWebpackPlugin({
      sourceLocale: 'es',
      targetLocale: 'en'
    })
  ]
};
```

## Supported Languages

| Language | Code | Status | Features | Example |
|----------|------|--------|----------|---------|
| English | `en` | ✅ Complete | Base language | `on click toggle .active` |
| Spanish | `es` | ✅ Complete | Full dictionary, pluralization | `en clic alternar .activo` |
| French | `fr` | ✅ Complete | Full dictionary, pluralization | `sur clic basculer .actif` |
| German | `de` | ✅ Complete | Full dictionary, pluralization | `bei klick umschalten .aktiv` |
| Japanese | `ja` | ✅ Complete | Full dictionary | `で クリック 切り替え .active` |
| Korean | `ko` | ✅ Complete | Full dictionary | `클릭 토글 .active` |
| Chinese | `zh` | ✅ Complete | Full dictionary | `当 点击 切换 .active` |
| Arabic | `ar` | ✅ Complete | Full dictionary, RTL support, pluralization | `على نقر بدل .active` |

## API Reference

### HyperscriptTranslator

```typescript
class HyperscriptTranslator {
  constructor(config: I18nConfig);
  
  // Translate hyperscript text
  translate(text: string, options: TranslationOptions): string;
  
  // Get detailed translation with token information
  translateWithDetails(text: string, options: TranslationOptions): TranslationResult;
  
  // Detect language of hyperscript text
  detectLanguage(text: string): string;
  
  // Add custom dictionary
  addDictionary(locale: string, dictionary: Dictionary): void;
  
  // Get supported locales
  getSupportedLocales(): string[];
  
  // Validate a dictionary
  validateDictionary(locale: string): ValidationResult;
  
  // Check if locale uses RTL
  isRTL(locale: string): boolean;
  
  // Get completions for IDE support
  getCompletions(context: CompletionContext): string[];
}
```

### Types

```typescript
interface I18nConfig {
  locale: string;
  fallbackLocale?: string;
  dictionaries?: Record<string, Dictionary>;
  detectLocale?: boolean;
  rtlLocales?: string[];
}

interface TranslationOptions {
  from?: string;
  to: string;
  preserveOriginal?: boolean;
  validate?: boolean;
}

interface Dictionary {
  commands: Record<string, string>;
  modifiers: Record<string, string>;
  events: Record<string, string>;
  logical: Record<string, string>;
  temporal: Record<string, string>;
  values: Record<string, string>;
  attributes: Record<string, string>;
}
```

## Advanced Usage

### Custom Dictionaries

```typescript
import { HyperscriptTranslator, Dictionary } from '@hyperfixi/i18n';

const customDictionary: Dictionary = {
  commands: {
    on: 'sur',
    click: 'cliquer',
    toggle: 'basculer'
  },
  // ... other categories
};

const translator = new HyperscriptTranslator({
  locale: 'fr',
  dictionaries: {
    fr: customDictionary
  }
});
```

### LSP Integration

```typescript
import { I18nLanguageProvider } from '@hyperfixi/i18n/lsp';

const provider = new I18nLanguageProvider('es');

// Get completions
const completions = await provider.provideCompletions(document, position);

// Get hover information
const hover = await provider.provideHover(document, position);
```

### CLI Usage

```bash
# Install globally
npm install -g @hyperfixi/i18n

# Translate a file
hyperfixi-translate input.html output.html --from es --to en

# Translate a directory
hyperfixi-translate src/ dist/ --from es --to en
```

## Contributing

We welcome contributions, especially new language dictionaries!

### Adding a New Language

1. Create a new dictionary file in `src/dictionaries/[locale].ts`
2. Follow the existing dictionary structure
3. Add comprehensive tests
4. Submit a pull request

Example dictionary structure:

```typescript
export const fr: Dictionary = {
  commands: {
    on: 'sur',
    tell: 'dire',
    trigger: 'déclencher',
    // ... all commands
  },
  modifiers: {
    to: 'à',
    from: 'de',
    // ... all modifiers
  },
  // ... other categories
};
```

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Validate dictionaries
npm run validate-dictionaries
```

## License

MIT
