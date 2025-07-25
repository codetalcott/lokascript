# Hyperscript Internationalization (i18n)

A plugin system that enables writing hyperscript in multiple languages, making it accessible to non-English speaking developers.

## Overview

This solution provides multiple approaches to internationalize hyperscript:

1. **Runtime Translation**: Translates keywords on-the-fly in the browser
2. **Build-time Translation**: Converts non-English hyperscript to English during build
3. **IDE Support**: Provides autocomplete and validation in multiple languages
4. **LSP Integration**: Full language server protocol support for enhanced development

## Quick Start

### Basic Usage (Spanish Example)

```html
<!-- Include hyperscript and i18n plugin -->
<script src="https://unpkg.com/hyperscript.org@0.9.14"></script>
<script src="hyperscript-i18n.js"></script>

<!-- Write hyperscript in Spanish -->
<button _="en clic alternar .activo">
  Hazme clic
</button>

<script>
  // Initialize translator
  const i18n = new HyperscriptI18n('es');
  i18n.install(_hyperscript);
  _hyperscript.processNode(document.body);
</script>
```

## Supported Languages

Currently supported languages with example translations:

### Spanish (es)
```javascript
en clic → on click
esperar 2 segundos → wait 2 seconds  
si...entonces...sino → if...then...else
alternar → toggle
```

### Korean (ko)
```javascript
클릭 → click
대기 2 초 → wait 2 seconds
만약...아니면 → if...else
```

### Chinese (zh)
```javascript
点击 → click
等待 2 秒 → wait 2 seconds
如果...否则 → if...else
```

## Build Tool Integration

### Webpack Plugin

```javascript
const { HyperscriptI18nWebpackPlugin } = require('hyperscript-i18n-build');

module.exports = {
  plugins: [
    new HyperscriptI18nWebpackPlugin({
      sourceLocale: 'es',
      targetLocale: 'en',
      preserveOriginal: true
    })
  ]
};
```

### Vite Plugin

```javascript
import { hyperscriptI18nVitePlugin } from 'hyperscript-i18n-build';

export default {
  plugins: [
    hyperscriptI18nVitePlugin({
      sourceLocale: 'es',
      targetLocale: 'en'
    })
  ]
};
```

### CLI Tool

```bash
# Process single file
node hyperscript-i18n-build.js input.html output.html es en

# Process directory
node hyperscript-i18n-build.js src/ dist/ es en
```

## IDE Support

The LSP integration provides:

- **Autocomplete**: Suggests keywords in your language
- **Hover Info**: Shows English equivalent on hover
- **Validation**: Warns about unknown keywords
- **Documentation**: Inline help in your language

### VSCode Extension Setup

```json
{
  "hyperscript.locale": "es",
  "hyperscript.enableI18n": true
}
```

## Adding New Languages

To add support for a new language:

1. Add translations to the dictionary:

```javascript
// In hyperscript-i18n.js
dictionaries: {
  fr: {  // French
    'sur': 'on',
    'cliquer': 'click',
    'attendre': 'wait',
    'secondes': 'seconds',
    // ... more translations
  }
}
```

2. Test your translations:

```javascript
const translator = new HyperscriptI18n('fr');
console.log(translator.translate('sur cliquer attendre 2 secondes'));
// Output: "on click wait 2 seconds"
```

## Architecture

The i18n system works by:

1. **Tokenization**: Identifying keywords in the source language
2. **Translation**: Mapping keywords to English equivalents
3. **Preservation**: Optionally keeping original source for debugging
4. **Integration**: Hooking into hyperscript's processing pipeline

## Testing

Run the test suite:

```bash
node test-hyperscript-i18n.js
```

## Limitations

- String literals are not translated
- Comments preserve original language
- Complex expressions may need manual adjustment
- Some language-specific constructs may not map perfectly

## Future Enhancements

- [ ] Support for more languages (Hindi, Arabic, Japanese, etc.)
- [ ] Context-aware translations
- [ ] Phrase-level translations (e.g., "hacer clic" → "click")
- [ ] Integration with translation services
- [ ] Community-contributed dictionaries
- [ ] Playground with live translation

## Contributing

To contribute translations for your language:

1. Fork the repository
2. Add your language dictionary
3. Include test cases
4. Submit a pull request

## License

MIT License - Same as hyperscript
