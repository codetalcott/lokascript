# Data Commands

Commands for managing state, persistence, and data binding.

## Data Binding

### `bind`

Create two-way data binding between variables and DOM elements.

```html
<!-- Bind variable to input value -->
<input _="on load bind :username to my value" />

<!-- Bind from element to variable -->
<input _="on load bind :email from my value" />

<!-- Bidirectional binding -->
<input _="on load bind :message to my value bidirectional" />
```

### Binding Directions

```html
<!-- 'to' - Element changes update variable -->
<input _="on load bind :search to my value" />

<!-- 'from' - Variable changes update element -->
<span _="on load bind :count from my textContent">0</span>

<!-- 'bidirectional' - Both directions -->
<input _="on load bind :name to my value bidirectional" />
```

### Live Form Binding

```html
<form>
  <input id="name" _="on load bind :formName to my value" />
  <input id="email" _="on load bind :formEmail to my value" />

  <button
    _="on click
    log :formName, :formEmail"
  >
    Log Values
  </button>
</form>
```

## Persistence

### `persist`

Save values to browser storage (localStorage or sessionStorage) with optional TTL.

```html
<!-- Save to localStorage -->
<button _="on click persist :username to local as 'user-name'">Save Username</button>

<!-- Save to sessionStorage -->
<button _="on click persist :formDraft to session as 'form-draft'">Save Draft</button>

<!-- Save with TTL (expires after 1 hour) -->
<button _="on click persist :token to local as 'auth-token' ttl 3600000">Save Token</button>
```

### `restore`

Restore values from storage.

```html
<!-- Restore from localStorage -->
<div _="on load restore 'user-name' from local then put it into me">Loading...</div>

<!-- Restore with fallback -->
<div
  _="on load
  restore 'theme' from local then
  if it is null
    set :theme to 'light'
  else
    set :theme to it
  end"
>
  Loading theme...
</div>
```

### Storage Events

```javascript
// Listen for persist events
element.addEventListener('persist:save', e => {
  console.log('Saved:', e.detail.key, e.detail.value);
});

element.addEventListener('persist:restore', e => {
  console.log('Restored:', e.detail.key, e.detail.value);
});

element.addEventListener('persist:expired', e => {
  console.log('Expired:', e.detail.key);
});
```

## Default Values

### `default`

Set a value only if it doesn't already exist.

```html
<!-- Default variable value -->
<button _="on load default :count to 0">Initialize</button>

<!-- Default attribute -->
<button _="on load default @data-theme to 'light'">Set Theme</button>

<!-- Default element property -->
<input _="on load default my value to 'Enter text...'" />

<!-- Default innerHTML -->
<div _="on load default my innerHTML to 'No content yet'">Loading...</div>
```

### Conditional Initialization

```html
<button
  _="on load
  default :visits to 0 then
  increment :visits then
  persist :visits to local as 'visit-count'"
>
  Visit Counter
</button>
```

## Common Patterns

### Form State Persistence

```html
<form _="on load restore 'form-draft' from session then if it put it into #form-data end">
  <textarea
    id="form-data"
    _="on input.debounce(500) persist my value to session as 'form-draft'"
  ></textarea>

  <button _="on click remove 'form-draft' from session" type="submit">Submit</button>
</form>
```

### Theme Persistence

```html
<button
  _="on click
  if document.body has .dark
    remove .dark from document.body then
    persist 'light' to local as 'theme'
  else
    add .dark to document.body then
    persist 'dark' to local as 'theme'
  end"
>
  Toggle Theme
</button>

<body
  _="on load
  restore 'theme' from local then
  if it is 'dark'
    add .dark to me
  end"
></body>
```

### Counter with Persistence

```html
<div id="counter" _="on load restore 'counter' from local then put (it or 0) into me">0</div>

<button
  _="on click
  get #counter.textContent as Int then
  set :count to it + 1 then
  put :count into #counter then
  persist :count to local as 'counter'"
>
  Increment
</button>
```

### User Preferences

```html
<select
  _="on load
  restore 'user-lang' from local then
  if it set my value to it end"
>
  <option value="en">English</option>
  <option value="es">Spanish</option>
  <option value="ja">Japanese</option>
</select>

<select _="on change persist my value to local as 'user-lang'">
  <!-- options -->
</select>
```

## Summary Table

| Command   | Description                 | Example                           |
| --------- | --------------------------- | --------------------------------- |
| `bind`    | Two-way data binding        | `bind :name to my value`          |
| `persist` | Save to browser storage     | `persist :data to local as 'key'` |
| `restore` | Load from browser storage   | `restore 'key' from local`        |
| `default` | Set value only if undefined | `default :count to 0`             |

## Storage Types

| Storage   | Lifetime                  | Scope           |
| --------- | ------------------------- | --------------- |
| `local`   | Permanent (until cleared) | Same origin     |
| `session` | Until tab closes          | Same tab/window |

## Next Steps

- [DOM Commands](/en/api/commands/dom) - Element manipulation
- [Control Flow](/en/api/commands/control-flow) - Conditionals and loops
- [Async Commands](/en/api/commands/async) - fetch, wait
