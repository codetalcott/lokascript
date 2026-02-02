# Context & Variables

Understanding `me`, `you`, `it`, and local variables in hyperscript.

## Context Variables

### `me`

The element where the `_` attribute is defined.

```html
<button _="on click toggle .active on me">Toggle Self</button>
<button _="on click set my innerHTML to 'Clicked!'">Update Self</button>
<button _="on click hide me">Hide Self</button>
```

### `my`

Shorthand for `me's` - possessive access to own properties.

```html
<button _="on click put my textContent into #output">Copy Text</button>
<input _="on input put my value into #preview" />
```

### `it` / `result`

The result of the previous operation.

```html
<button
  _="on click
  fetch /api/data as json then
  put it.name into #name"
>
  Fetch Data
</button>

<button
  _="on click
  get #input.value then
  put it into #output"
>
  Copy Value
</button>
```

### `you`

In delegated event handlers, `you` is the element that triggered the event.

```html
<ul _="on click from li toggle .selected on you">
  <li>Item 1</li>
  <!-- you = this li when clicked -->
  <li>Item 2</li>
  <li>Item 3</li>
</ul>
```

- `me` = the `<ul>` (element with `_` attribute)
- `you` = the clicked `<li>` (event target)

### `event`

The current DOM event object.

```html
<button _="on click log event.type">Log Click</button>
<input _="on keydown log event.key" />
<form _="on submit halt the event">Prevent submit</form>
```

## Local Variables

Use `:` prefix for local variables:

```html
<button
  _="on click
  set :count to 0 then
  repeat 5 times
    increment :count
  end then
  put :count into #result"
>
  Count to 5
</button>
```

### Variable Scope

Local variables exist for the duration of the handler:

```html
<button
  _="on click
  set :name to #input.value then
  set :greeting to 'Hello, ' + :name then
  put :greeting into #output"
>
  Greet
</button>
```

### Persist Across Events

Use element properties or data attributes:

```html
<button
  _="on click
  set my @data-count to (my @data-count as Int + 1) then
  put my @data-count into me"
  data-count="0"
>
  0
</button>
```

## Global Variables

Access globals through context:

```javascript
const ctx = hyperscript.createContext(element);
ctx.globals.set('apiUrl', '/api');
ctx.globals.set('userName', 'Alice');
```

```html
<button _="on click fetch ${apiUrl}/user">Use Global</button>
```

## Context Inheritance

Child contexts inherit from parents:

```javascript
const parent = hyperscript.createContext();
parent.globals.set('theme', 'dark');

const child = hyperscript.createContext(element, parent);
// child can access 'theme' from parent
```

## Accessing Properties

### Dot Notation

```html
<button _="on click put #input.value into #output">Dot</button>
```

### Possessive Syntax

```html
<button _="on click put #input's value into #output">Possessive</button>
```

### Attribute Access

```html
<button _="on click put my @data-id into #output">Get Attribute</button>
<button _="on click set my @disabled to true">Set Attribute</button>
```

## Execution Context API

When using the JavaScript API:

```javascript
// Create context bound to element
const ctx = hyperscript.createContext(element);

// Access context variables
ctx.me; // The element
ctx.it; // Previous result
ctx.locals; // Map of :variables
ctx.globals; // Map of global variables
ctx.event; // Current DOM event

// Set variables before execution
ctx.locals.set('userName', 'Alice');
ctx.globals.set('apiUrl', '/api');

// Execute with context
await hyperscript.eval('put :userName into #name', ctx);
```

## Patterns

### Counter with State

```html
<div id="counter">
  <span id="count">0</span>
  <button
    _="on click
    set :val to #count's textContent as Int then
    increment :val then
    put :val into #count"
  >
    +1
  </button>
</div>
```

### Form State

```html
<form
  _="on input from input
  set :valid to me.checkValidity() then
  if :valid
    remove @disabled from #submit
  else
    set @disabled of #submit to true
  end"
>
  <input required />
  <button id="submit" disabled>Submit</button>
</form>
```

### Toggle State

```html
<button
  _="on click
  if me has .active
    remove .active from me then
    put 'Activate' into me
  else
    add .active to me then
    put 'Deactivate' into me
  end"
>
  Activate
</button>
```

## Summary

| Variable        | Meaning                    |
| --------------- | -------------------------- |
| `me`            | Element with `_` attribute |
| `my`            | Shorthand for `me's`       |
| `it` / `result` | Previous operation result  |
| `you`           | Event target (delegated)   |
| `event`         | DOM event object           |
| `:varName`      | Local variable             |
| `@attrName`     | HTML attribute             |

## Next Steps

- [Events](/en/guide/events) - Event handling
- [Expressions](/en/guide/expressions) - Property access
- [Commands](/en/guide/commands) - Available commands
