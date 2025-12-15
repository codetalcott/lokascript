# @hyperfixi/semantic

Semantic-first multilingual parser for HyperFixi. Parses hyperscript-like syntax from 13 languages into a language-agnostic semantic representation.

## Features

- **13 Languages**: English, Japanese, Korean, Arabic, Spanish, Chinese, Turkish, Portuguese, French, German, Indonesian, Quechua, Swahili
- **Semantic Roles**: Language-agnostic intermediate representation (patient, destination, source, etc.)
- **Confidence Scoring**: Graceful degradation with scored parse results
- **Morphological Normalization**: Handles verb conjugations in agglutinative languages

## Installation

```bash
npm install @hyperfixi/semantic
```

## Usage

```typescript
import { parse, translate, canParse } from '@hyperfixi/semantic';

// Parse from any language
const node = parse('toggle .active on #button', 'en');
const nodeJa = parse('.active を 切り替え', 'ja');

// Translate between languages
const arabic = translate('toggle .active', 'en', 'ar');
// → 'بدّل .active'

// Check if input can be parsed
const result = canParse('クリックしたら 増加', 'ja');
if (result.canParse) {
  console.log('Confidence:', result.confidence);
}
```

## Japanese Native Idioms

HyperFixi accepts multiple natural Japanese forms, following Nadeshiko's approach of "accepting multiple orthodox native Japanese expressions."

| Form | Example | Notes |
|------|---------|-------|
| Standard | `クリック で .active を 切り替え` | Instrumental particle (で) |
| Conditional (したら) | `クリックしたら .active を 切り替え` | Most natural - "if/when clicked" |
| Conditional (すると) | `クリックすると .active を 切り替え` | Habitual/expected outcome |
| Conditional (すれば) | `クリックすれば .active を 切り替え` | Hypothetical condition |
| Temporal (時に) | `クリック時に .active を 切り替え` | Formal - "at the time of click" |
| Compact | `.activeを切り替え` | No spaces - natural writing |

### Event Handlers

```typescript
// All parse to equivalent event handler nodes:
parse('クリック で 増加', 'ja')           // Standard (instrumental)
parse('クリックしたら 増加', 'ja')         // Conditional (native)
parse('クリック時に 増加', 'ja')           // Temporal (formal)

// With source filter:
parse('#button から クリックしたら 増加', 'ja')
```

### Toggle Commands

```typescript
// All parse to equivalent toggle nodes:
parse('.active を 切り替え', 'ja')         // Standard (spaced)
parse('.activeを切り替え', 'ja')           // Compact (no spaces)
parse('.active を 切り替える', 'ja')       // With verb ending (る)
parse('.active を トグルする', 'ja')       // With katakana loanword
```

### Morphological Normalization

The parser handles Japanese verb conjugations automatically:

| Conjugation | Example | Normalized |
|-------------|---------|------------|
| Dictionary | クリックする | クリック |
| Conditional (たら) | クリックしたら | クリック |
| Conditional (と) | クリックすると | クリック |
| Conditional (ば) | クリックすれば | クリック |
| て-form | 切り替えて | 切り替え |
| Past | 切り替えた | 切り替え |
| Polite | 切り替えます | 切り替え |
| Progressive | 切り替えている | 切り替え |

## API Reference

### Core Functions

- `parse(input, language)` - Parse input to semantic node
- `canParse(input, language)` - Check if input can be parsed with confidence
- `translate(input, fromLang, toLang)` - Translate between languages
- `tokenize(input, language)` - Get token stream for input
- `render(node, language)` - Render semantic node to language

### Supported Languages

| Code | Language | Word Order |
|------|----------|------------|
| en | English | SVO |
| ja | Japanese | SOV |
| ko | Korean | SOV |
| ar | Arabic | VSO |
| es | Spanish | SVO |
| zh | Chinese | SVO |
| tr | Turkish | SOV |
| pt | Portuguese | SVO |
| fr | French | SVO |
| de | German | SVO/SOV |
| id | Indonesian | SVO |
| qu | Quechua | SOV |
| sw | Swahili | SVO |

## License

MIT
