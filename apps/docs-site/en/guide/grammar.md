# Grammar Transformation

Transform hyperscript code between different word orders: SVO (English), SOV (Japanese, Korean, Turkish), and VSO (Arabic).

## Word Orders

Different languages have different natural word orders:

| Order   | Languages                 | Pattern             | Example      |
| ------- | ------------------------- | ------------------- | ------------ |
| **SVO** | English, Spanish, Chinese | Subject-Verb-Object | I eat apples |
| **SOV** | Japanese, Korean, Turkish | Subject-Object-Verb | I apples eat |
| **VSO** | Arabic, Welsh             | Verb-Subject-Object | Eat I apples |

LokaScript respects these natural orders.

## How It Works

The grammar transformer converts hyperscript between word orders:

```javascript
import { GrammarTransformer } from '@lokascript/i18n';

const transformer = new GrammarTransformer();

// SVO (English) to SOV (Japanese)
const japanese = transformer.transform('on click toggle .active on me', 'en', 'ja');
// → 'クリック で .active を me に 切り替え'

// SVO (English) to VSO (Arabic)
const arabic = transformer.transform('on click toggle .active', 'en', 'ar');
// → 'عند النقر بدّل .active'
```

## SVO Languages

Subject-Verb-Object order (English pattern):

```
on click toggle .active on me
   event  verb   object    target
```

Languages: English, Spanish, Portuguese, French, Chinese, Indonesian, Swahili

```html
<!-- English -->
<button _="on click toggle .active">Toggle</button>

<!-- Spanish -->
<button _="en clic alternar .activo">Alternar</button>

<!-- Chinese -->
<button _="点击时 切换 .active">切换</button>
```

## SOV Languages

Subject-Object-Verb order (Japanese pattern):

```
.active を me に 切り替え
object    target  verb
```

Languages: Japanese, Korean, Turkish, Quechua

```html
<!-- Japanese -->
<button _="クリック で .active を 切り替え">切り替え</button>
<button _=".active を me に 切り替え">切り替え</button>

<!-- Korean -->
<button _="클릭하면 .active 토글">토글</button>

<!-- Turkish -->
<button _="tıklandığında .active değiştir">Değiştir</button>
```

## VSO Languages

Verb-Subject-Object order (Arabic pattern):

```
بدّل .active عند النقر
verb  object   event
```

Languages: Arabic

```html
<!-- Arabic (RTL) -->
<button _="عند النقر بدّل .active" dir="rtl">بدّل</button>
```

## Particle Systems

SOV languages often use particles to mark grammatical roles:

### Japanese Particles

| Particle    | Role             | Example       |
| ----------- | ---------------- | ------------- |
| を (wo)     | Object marker    | `.active を`  |
| に (ni)     | Destination      | `me に`       |
| で (de)     | Instrument/event | `クリック で` |
| から (kara) | Source           | `#input から` |

```html
<button _=".active を me に 追加">Add</button> <button _="#input から 値 を 取得">Get</button>
```

### Korean Particles

| Particle | Role          | Example       |
| -------- | ------------- | ------------- |
| 을/를    | Object marker | `.active 를`  |
| 에       | Destination   | `me 에`       |
| 에서     | Source        | `#input 에서` |

```html
<button _=".active 를 me 에 추가">추가</button>
```

### Turkish Suffixes

Turkish uses agglutinative suffixes with vowel harmony:

| Suffix         | Role        | Example      |
| -------------- | ----------- | ------------ |
| -(y)i/-ı/-u/-ü | Object      | `.active'i`  |
| -e/-a          | Destination | `me'ye`      |
| -den/-dan      | Source      | `#input'tan` |

```html
<button _=".active'i değiştir">Değiştir</button>
```

## Enabling Grammar Transformation

### Vite Plugin

```javascript
import { lokascript } from '@lokascript/vite-plugin';

export default {
  plugins: [
    lokascript({
      semantic: true,
      grammar: true, // Enable grammar transformation
    }),
  ],
};
```

### Browser

```html
<script src="@lokascript/i18n/dist/lokascript-i18n.min.js"></script>
<script>
  const transformer = new LokaScriptI18n.GrammarTransformer();

  // Transform for display/documentation
  const japanese = transformer.transform('toggle .active', 'en', 'ja');
</script>
```

## Translation vs Parsing

| Package                | Purpose                     | Use Case                      |
| ---------------------- | --------------------------- | ----------------------------- |
| `@lokascript/semantic` | Parse multilingual code     | Users write in their language |
| `@lokascript/i18n`     | Transform between languages | Documentation, tutorials      |

**Semantic** (parsing): Input written in Japanese executes directly.

**i18n** (translation): Transform English docs to show Japanese equivalent.

## Next Steps

- [Semantic Parser](/en/guide/semantic-parser) - How parsing works
- [Multilingual](/en/guide/multilingual) - Language support overview
- [@lokascript/i18n](/en/packages/i18n) - Grammar package reference
