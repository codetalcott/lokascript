# String Expressions

String operations, interpolation, and manipulation.

## String Literals

### Single and Double Quotes

```html
<button _="on click put 'Hello World' into #output">Single Quotes</button>
<button _="on click put \"Hello World\" into #output">Double Quotes</button>
```

### Template Literals (Backticks)

Use backticks for string interpolation with `${expression}`:

```html
<button _="on click put `Hello, ${:username}!` into #greeting">Interpolated</button>

<button _="on click put `Count: ${:count}` into #counter">With Variable</button>

<button
  _="on click
  set :name to #name.value then
  put `Welcome, ${:name}!` into #message"
>
  Dynamic Greeting
</button>
```

### Multi-value Interpolation

```html
<button
  _="on click
  put `${:firstName} ${:lastName} (${:email})` into #profile"
>
  Format Profile
</button>
```

## String Concatenation

### Using `+` Operator

```html
<button
  _="on click
  set :greeting to 'Hello, ' + :name + '!' then
  put :greeting into #output"
>
  Concatenate
</button>
```

### Building URLs

```html
<button
  _="on click
  set :url to '/api/users/' + :userId then
  fetch :url as json"
>
  Build URL
</button>

<!-- Better: use template literals -->
<button _="on click fetch `/api/users/${:userId}` as json">Fetch User</button>
```

## String Conditions

### `contains`

Check if a string contains a substring.

```html
<input
  _="on input
  if my value contains '@'
    remove .invalid from me
  else
    add .invalid to me
  end"
/>
```

### `starts with`

Check if a string starts with a prefix.

```html
<input
  _="on input
  if my value starts with 'https://'
    add .secure to me
  else
    remove .secure from me
  end"
/>
```

### `ends with`

Check if a string ends with a suffix.

```html
<input
  _="on input
  if my value ends with '.pdf'
    show #pdf-preview
  else
    hide #pdf-preview
  end"
/>
```

### `matches`

Test against a regular expression.

```html
<!-- Email validation -->
<input
  _="on input
  if my value matches /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    remove .invalid from me
  else
    add .invalid to me
  end"
/>

<!-- Phone number -->
<input
  _="on input
  if my value matches /^\d{3}-\d{3}-\d{4}$/
    add .valid to me
  end"
/>
```

## String Methods

Access JavaScript string methods directly:

```html
<!-- toUpperCase -->
<button _="on click put my value.toUpperCase() into #output">Uppercase</button>

<!-- toLowerCase -->
<button _="on click put my value.toLowerCase() into #output">Lowercase</button>

<!-- trim -->
<button _="on click put my value.trim() into #output">Trim</button>

<!-- split -->
<button
  _="on click
  set :parts to my value.split(',') then
  for each part in :parts
    append `<li>${part.trim()}</li>` to #list
  end"
>
  Split CSV
</button>

<!-- substring -->
<button _="on click put my value.substring(0, 10) into #preview">First 10 Chars</button>

<!-- replace -->
<button _="on click put my value.replace('old', 'new') into #output">Replace</button>
```

## String Length

```html
<input
  _="on input
  put `${my value.length} characters` into #char-count"
/>

<input
  _="on input
  if my value.length > 100
    add .too-long to me
  else
    remove .too-long from me
  end"
/>
```

## Common Patterns

### Character Counter

```html
<textarea
  _="on input
  set :remaining to 280 - my value.length then
  put :remaining into #remaining then
  if :remaining < 0
    add .over-limit to #remaining
  else
    remove .over-limit from #remaining
  end"
></textarea>
<span id="remaining">280</span>
```

### Search Filtering

```html
<input
  _="on input.debounce(300)
  set :query to my value.toLowerCase() then
  for each item in .list-item
    if item.textContent.toLowerCase() contains :query
      show item
    else
      hide item
    end
  end"
/>
```

### URL Slug Generation

```html
<input
  id="title"
  _="on input
  set :slug to my value.toLowerCase() then
  set :slug to :slug.replace(/\s+/g, '-') then
  set :slug to :slug.replace(/[^a-z0-9-]/g, '') then
  put :slug into #slug"
/>
<input id="slug" readonly />
```

### Format Display

```html
<button
  _="on click
  set :price to 1234.56 then
  put `$${:price.toFixed(2)}` into #price"
>
  Format Price
</button>
```

### Truncate with Ellipsis

```html
<div
  _="on load
  if my textContent.length > 100
    set :text to my textContent.substring(0, 97) + '...' then
    put :text into me
  end"
>
  Long content here...
</div>
```

## Empty String Checks

```html
<!-- Check if empty -->
<input
  _="on input
  if my value is empty
    add .required to me
  else
    remove .required from me
  end"
/>

<!-- Check if not empty -->
<button
  _="on click
  if #search.value is not empty
    fetch `/api/search?q=${#search.value}`
  end"
>
  Search
</button>
```

## Summary Table

| Operation     | Syntax                      | Example                     |
| ------------- | --------------------------- | --------------------------- |
| Literal       | `'text'` or `"text"`        | `'Hello'`                   |
| Interpolation | `` `text ${var}` ``         | `` `Hello ${:name}` ``      |
| Concatenation | `str1 + str2`               | `'Hello, ' + :name`         |
| Contains      | `str contains 'sub'`        | `value contains '@'`        |
| Starts with   | `str starts with 'pre'`     | `url starts with 'https'`   |
| Ends with     | `str ends with 'suf'`       | `file ends with '.pdf'`     |
| Matches       | `str matches /pattern/`     | `email matches /^\S+@\S+$/` |
| Length        | `str.length`                | `value.length > 100`        |
| Uppercase     | `str.toUpperCase()`         | `name.toUpperCase()`        |
| Lowercase     | `str.toLowerCase()`         | `search.toLowerCase()`      |
| Trim          | `str.trim()`                | `input.trim()`              |
| Substring     | `str.substring(start, end)` | `text.substring(0, 10)`     |
| Replace       | `str.replace('old', 'new')` | `text.replace('-', '_')`    |
| Split         | `str.split(separator)`      | `csv.split(',')`            |

## Next Steps

- [Logical Expressions](/en/api/expressions/logical) - Comparisons and boolean logic
- [Type Conversion](/en/api/expressions/conversion) - Converting between types
- [Properties](/en/api/expressions/properties) - Accessing properties
