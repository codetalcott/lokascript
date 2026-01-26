# htmx & fixi Compatibility

The `hybrid-hx` bundle provides htmx-style and fixi-style declarative attributes for AJAX operations.

## Installation

Use the `hybrid-hx` bundle (9.7 KB gzipped):

```html
<script src="https://unpkg.com/@lokascript/core/dist/lokascript-hybrid-hx.js"></script>
```

Or with Vite:

```javascript
// vite.config.js
import { lokascript } from '@lokascript/vite-plugin';

export default {
  plugins: [
    lokascript({
      htmx: true, // Enable htmx compatibility
    }),
  ],
};
```

## Basic Attributes

### `hx-get`

Make a GET request and swap content.

```html
<button hx-get="/api/users" hx-target="#users-list">Load Users</button>

<div hx-get="/partials/content.html" hx-trigger="load">Loading...</div>
```

### `hx-post`

Make a POST request.

```html
<form hx-post="/api/submit" hx-target="#result">
  <input name="email" type="email" />
  <button type="submit">Submit</button>
</form>
```

### `hx-put` / `hx-patch` / `hx-delete`

Other HTTP methods.

```html
<button hx-put="/api/users/123" hx-vals='{"status": "active"}'>Activate</button>

<button hx-delete="/api/users/123" hx-confirm="Delete this user?">Delete</button>
```

## Target and Swap

### `hx-target`

Specify where to put the response.

```html
<!-- Target by ID -->
<button hx-get="/api/data" hx-target="#output">Load</button>

<!-- Target by CSS selector -->
<button hx-get="/api/data" hx-target=".content-area">Load</button>

<!-- Target self -->
<button hx-get="/api/data" hx-target="this">Load into Self</button>

<!-- Target closest ancestor -->
<button hx-get="/api/data" hx-target="closest div">Load</button>
```

### `hx-swap`

Control how content is swapped.

```html
<!-- Replace innerHTML (default) -->
<button hx-get="/api/data" hx-swap="innerHTML">Replace Content</button>

<!-- Replace entire element -->
<button hx-get="/api/data" hx-swap="outerHTML">Replace Element</button>

<!-- Insert before/after -->
<button hx-get="/api/item" hx-swap="beforeend" hx-target="#list">Append</button>
<button hx-get="/api/item" hx-swap="afterbegin" hx-target="#list">Prepend</button>

<!-- Delete element -->
<button hx-delete="/api/item/1" hx-swap="delete">Remove</button>
```

## Triggers

### `hx-trigger`

Control when requests are made.

```html
<!-- On click (default for buttons) -->
<button hx-get="/api/data" hx-trigger="click">Click</button>

<!-- On change -->
<select hx-get="/api/filter" hx-trigger="change">
  <option value="all">All</option>
  <option value="active">Active</option>
</select>

<!-- On load -->
<div hx-get="/api/initial" hx-trigger="load">Loading...</div>

<!-- On input with delay -->
<input hx-get="/api/search" hx-trigger="input delay:300ms" />

<!-- On intersection (lazy load) -->
<div hx-get="/api/more" hx-trigger="intersect">Load when visible</div>
```

## Request Data

### `hx-vals`

Add extra values to the request.

```html
<button hx-post="/api/action" hx-vals='{"action": "approve", "id": 123}'>Approve</button>

<!-- Dynamic values using JavaScript -->
<button hx-post="/api/action" hx-vals="js:{timestamp: Date.now()}">Submit with Time</button>
```

### `hx-include`

Include values from other elements.

```html
<input id="search" name="q" />
<button hx-get="/api/search" hx-include="#search">Search</button>

<!-- Include entire form -->
<button hx-post="/api/submit" hx-include="closest form">Submit Form</button>
```

## Headers

### `hx-headers`

Add custom headers.

```html
<button hx-get="/api/data" hx-headers='{"X-Custom": "value"}'>With Headers</button>
```

## Indicators

### `hx-indicator`

Show loading indicator during requests.

```html
<button hx-get="/api/slow" hx-indicator="#spinner">
  Load Data
  <span id="spinner" class="htmx-indicator">Loading...</span>
</button>

<style>
  .htmx-indicator {
    display: none;
  }
  .htmx-request .htmx-indicator {
    display: inline;
  }
</style>
```

## Lifecycle Events

The htmx compatibility layer dispatches events at key points:

### `htmx:configuring`

After attributes are collected, before translation.

```javascript
document.addEventListener('htmx:configuring', e => {
  // Modify config before processing
  e.detail.config.headers = { 'X-Custom': 'value' };
});
```

### `htmx:beforeRequest`

Before the request is made. Cancelable.

```javascript
document.addEventListener('htmx:beforeRequest', e => {
  // Cancel if needed
  if (someCondition) {
    e.preventDefault();
  }
  console.log('Request:', e.detail.url, e.detail.method);
});
```

### `htmx:afterSettle`

After successful response and DOM update.

```javascript
document.addEventListener('htmx:afterSettle', e => {
  console.log('Content updated:', e.detail.target);
});
```

### `htmx:error`

When an error occurs.

```javascript
document.addEventListener('htmx:error', e => {
  console.error('Request failed:', e.detail.error);
  // Show error notification
});
```

## Inline Hyperscript

### `hx-on:*`

Execute hyperscript in response to events.

```html
<button hx-on:click="toggle .active on me">Toggle</button>

<form hx-on:submit="add .submitting to me">Submit</form>

<div hx-on:htmx:afterSettle="remove .loading from me">Content</div>
```

## Combining with `_` Attribute

Use both htmx attributes and hyperscript together:

```html
<button
  hx-get="/api/data"
  hx-target="#output"
  _="on click add .loading to me
     on htmx:afterSettle remove .loading from me"
>
  Load with Animation
</button>
```

## Common Patterns

### Infinite Scroll

```html
<div id="content">
  <!-- Initial content -->
</div>
<div
  hx-get="/api/page/2"
  hx-trigger="intersect"
  hx-target="#content"
  hx-swap="beforeend"
  hx-indicator="#load-more-spinner"
>
  <span id="load-more-spinner" class="htmx-indicator">Loading more...</span>
</div>
```

### Live Search

```html
<input
  type="search"
  name="q"
  hx-get="/api/search"
  hx-trigger="input delay:300ms"
  hx-target="#results"
  hx-indicator="#search-spinner"
/>
<span id="search-spinner" class="htmx-indicator">Searching...</span>
<div id="results"></div>
```

### Form with Validation

```html
<form
  hx-post="/api/register"
  hx-target="#form-result"
  _="on htmx:beforeRequest
     if #email.value is empty
       add .error to #email then
       halt
     end"
>
  <input id="email" name="email" type="email" />
  <button type="submit">Register</button>
</form>
<div id="form-result"></div>
```

### Optimistic UI

```html
<button
  hx-delete="/api/item/123"
  hx-target="closest .item"
  hx-swap="outerHTML"
  _="on click
     add .deleting to closest .item then
     wait 300ms"
>
  Delete
</button>
```

## Attribute Reference

| Attribute      | Description          | Example                         |
| -------------- | -------------------- | ------------------------------- |
| `hx-get`       | GET request          | `hx-get="/api/data"`            |
| `hx-post`      | POST request         | `hx-post="/api/submit"`         |
| `hx-put`       | PUT request          | `hx-put="/api/update"`          |
| `hx-patch`     | PATCH request        | `hx-patch="/api/partial"`       |
| `hx-delete`    | DELETE request       | `hx-delete="/api/remove"`       |
| `hx-target`    | Response destination | `hx-target="#output"`           |
| `hx-swap`      | Swap strategy        | `hx-swap="innerHTML"`           |
| `hx-trigger`   | Event trigger        | `hx-trigger="click"`            |
| `hx-vals`      | Extra request values | `hx-vals='{"key": "value"}'`    |
| `hx-include`   | Include other inputs | `hx-include="#form"`            |
| `hx-headers`   | Custom headers       | `hx-headers='{"X-Key": "val"}'` |
| `hx-indicator` | Loading indicator    | `hx-indicator="#spinner"`       |
| `hx-confirm`   | Confirmation dialog  | `hx-confirm="Are you sure?"`    |
| `hx-on:*`      | Inline hyperscript   | `hx-on:click="toggle .active"`  |

## Fixi Compatibility

The `hybrid-hx` bundle also supports [fixi.js](https://github.com/bigskysoftware/fixi) attributes, a minimal alternative to htmx.

### Fixi Attributes

| Attribute    | Description                     | Default      |
| ------------ | ------------------------------- | ------------ |
| `fx-action`  | Request URL                     | -            |
| `fx-method`  | HTTP method                     | `GET`        |
| `fx-target`  | Response destination            | element self |
| `fx-swap`    | Swap strategy                   | `outerHTML`  |
| `fx-trigger` | Event trigger                   | `click`      |
| `fx-ignore`  | Exclude element from processing | -            |

### Basic Example

```html
<button fx-action="/api/users" fx-target="#users-list" fx-swap="innerHTML">Load Users</button>

<button fx-action="/api/submit" fx-method="POST" fx-target="#result">Submit</button>
```

### Fixi Events

Fixi dispatches a richer event lifecycle than htmx:

| Event        | When                             | Cancelable |
| ------------ | -------------------------------- | ---------- |
| `fx:init`    | Before element processed         | Yes        |
| `fx:config`  | Before request, config available | Yes        |
| `fx:before`  | Before fetch executes            | Yes        |
| `fx:after`   | After response, before swap      | Yes        |
| `fx:error`   | On fetch failure                 | No         |
| `fx:finally` | Always fires (success or error)  | No         |
| `fx:swapped` | After DOM swap complete          | No         |

```javascript
document.addEventListener('fx:config', e => {
  console.log('URL:', e.detail.cfg.action);
  console.log('Method:', e.detail.cfg.method);
});
```

### Request Dropping

Fixi-style request dropping prevents double-submit by ignoring new requests while one is pending:

```html
<!-- Clicking rapidly only triggers one request -->
<button fx-action="/api/submit" fx-method="POST">Submit</button>
```

### fx-ignore

Exclude elements (and descendants) from processing:

```html
<div fx-ignore>
  <!-- These buttons won't be processed -->
  <button fx-action="/api/a">Ignored</button>
  <button fx-action="/api/b">Also Ignored</button>
</div>
```

## Next Steps

- [Bundle Selection](/en/guide/bundles) - Choose the right bundle
- [Async Commands](/en/api/commands/async) - fetch, wait
- [Events](/en/guide/events) - Event handling
