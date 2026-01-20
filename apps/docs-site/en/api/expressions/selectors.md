# Selectors

How to reference elements in hyperscript.

## CSS Selectors

Standard CSS selectors work directly:

```html
<!-- By ID -->
<button _="on click toggle .active on #sidebar">Toggle Sidebar</button>

<!-- By class -->
<button _="on click hide .notification">Hide All Notifications</button>

<!-- By tag -->
<button _="on click add .highlight to button">Highlight Buttons</button>

<!-- Complex selectors -->
<button _="on click show .card:first-child">Show First Card</button>
<button _="on click hide .item[data-status='inactive']">Hide Inactive</button>
<button _="on click toggle .active on nav > ul > li">Toggle Nav Items</button>
```

## HTML Literals

Use angle brackets `<.../>` for inline element references:

```html
<!-- Find by tag -->
<button _="on click put 'Hi' into the next <div/>">Update Next Div</button>

<!-- With class -->
<button _="on click toggle .active on the closest <div.card/>">Toggle Card</button>

<!-- With ID -->
<button _="on click show <#modal/>">Show Modal</button>

<!-- With attribute -->
<button _="on click focus <input[type="email"]/>">Focus Email</button>
```

## Context References

### `me`

The current element (where the `_` attribute is defined).

```html
<button _="on click toggle .active on me">Toggle Self</button>
<button _="on click set my innerHTML to 'Clicked!'">Update Self</button>
<button _="on click hide me">Hide Myself</button>
```

### `my`

Shorthand for `me's` - possessive access to own properties.

```html
<button _="on click set my textContent to 'Done'">Update Text</button>
<button _="on click put my dataset.count into #counter">Copy Data</button>
```

### `it` / `result`

The result of the previous operation.

```html
<button _="on click get #input.value then put it into #output">Copy Value</button>

<button _="on click fetch /api/data as json then put it.name into #name">Fetch and Display</button>
```

### `you`

The target element in delegated event handlers.

```html
<!-- Delegated handler: you = the clicked .item, me = the container -->
<div _="on click from .item toggle .selected on you">
  <div class="item">Item 1</div>
  <div class="item">Item 2</div>
  <div class="item">Item 3</div>
</div>
```

### `event`

The current DOM event object.

```html
<button _="on click log event.type">Log Event Type</button>
<input _="on input put event.target.value into #preview" />
<form _="on submit halt the event then process()"></form>
```

### `body`

The document body.

```html
<button _="on click add .dark-mode to body">Enable Dark Mode</button>
```

## Selector Scope

### `in` / `within`

Limit selector to descendants of an element.

```html
<button _="on click toggle .active on .item in #container">Toggle Items in Container</button>

<button _="on click hide .error within #form">Hide Errors in Form</button>
```

### `from`

Select from a specific container.

```html
<button _="on click get .selected from #list">Get Selected in List</button>
```

## Multiple Elements

Selectors that match multiple elements operate on all of them:

```html
<!-- Adds .highlight to ALL .card elements -->
<button _="on click add .highlight to .card">Highlight All</button>

<!-- Hides ALL .notification elements -->
<button _="on click hide .notification">Dismiss All</button>

<!-- Toggles .active on ALL matching elements -->
<button _="on click toggle .active on .toggle-item">Toggle All</button>
```

## Combining Selectors

```html
<button
  _="on click
  add .loading to me then
  hide .error in #form then
  show #submit-btn then
  fetch /api/submit"
>
  Multi-Element Operation
</button>
```

## Summary

| Selector    | Description     | Example           |
| ----------- | --------------- | ----------------- |
| `#id`       | By ID           | `#sidebar`        |
| `.class`    | By class        | `.card`           |
| `tag`       | By tag          | `button`          |
| `<tag/>`    | HTML literal    | `<div.card/>`     |
| `me`        | Current element | `me`              |
| `my`        | Own properties  | `my innerHTML`    |
| `it`        | Previous result | `it.name`         |
| `you`       | Event target    | `you` (delegated) |
| `event`     | DOM event       | `event.type`      |
| `body`      | Document body   | `body`            |
| `in/within` | Scoped selector | `.item in #list`  |

## Next Steps

- [Positional](/en/api/expressions/positional) - first, last, next, previous
- [Properties](/en/api/expressions/properties) - Accessing properties
- [Commands](/en/guide/commands) - What to do with elements
