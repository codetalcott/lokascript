# Navigation Commands

Commands for browser navigation, URL manipulation, and scrolling.

## Browser Navigation

### `go`

Navigate to URLs, scroll to elements, or navigate browser history.

```html
<!-- Go back in history -->
<button _="on click go back">Back</button>

<!-- Navigate to URL -->
<button _="on click go to url '/page'">Go to Page</button>

<!-- Open in new window -->
<button _="on click go to url 'https://example.com' in new window">Open Link</button>

<!-- Navigate to hash -->
<button _="on click go to url '#section'">Jump to Section</button>
```

## Element Scrolling

### Scroll with `go to`

Scroll smoothly to any element on the page.

```html
<!-- Scroll to element -->
<button _="on click go to #content">Scroll to Content</button>

<!-- Scroll to top of element -->
<button _="on click go to top of #header">Scroll to Header</button>

<!-- Scroll to middle of element -->
<button _="on click go to middle of #article">Center Article</button>

<!-- Scroll to bottom -->
<button _="on click go to bottom of #footer">Scroll to Footer</button>
```

### Scroll Positions

```html
<!-- Vertical positions -->
<button _="on click go to top of #element">Top</button>
<button _="on click go to middle of #element">Middle</button>
<button _="on click go to bottom of #element">Bottom</button>

<!-- Horizontal positions -->
<button _="on click go to left of #element">Left</button>
<button _="on click go to center of #element">Center</button>
<button _="on click go to right of #element">Right</button>
```

### Scroll Options

```html
<!-- Instant scroll (no animation) -->
<button _="on click go to #section instantly">Jump</button>

<!-- With pixel offset -->
<button _="on click go to top of #header -50px">Scroll with Offset</button>
```

## URL History

### `push url`

Add a new entry to browser history without page reload.

```html
<!-- Push new URL -->
<button _="on click push url '/page/2'">Next Page</button>

<!-- Push with title -->
<button _="on click push url '/search' with title 'Search Results'">Search</button>

<!-- Dynamic URL -->
<button _="on click push url `/products/${:productId}`">View Product</button>
```

### `replace url`

Replace the current history entry without adding a new one.

```html
<!-- Replace current URL -->
<button _="on click replace url '/current-state'">Update URL</button>

<!-- Replace with title -->
<button _="on click replace url '/page' with title 'Updated Page'">Update</button>
```

## Common Patterns

### SPA-Style Navigation

```html
<nav>
  <button
    _="on click
    push url '/home' then
    fetch '/partials/home.html' then
    put it into #content"
  >
    Home
  </button>
  <button
    _="on click
    push url '/about' then
    fetch '/partials/about.html' then
    put it into #content"
  >
    About
  </button>
</nav>
```

### Back to Top

```html
<button id="back-to-top" _="on click go to top of body">Back to Top</button>
```

### Smooth Section Navigation

```html
<nav class="section-nav">
  <a _="on click.prevent go to #section1" href="#section1">Section 1</a>
  <a _="on click.prevent go to #section2" href="#section2">Section 2</a>
  <a _="on click.prevent go to #section3" href="#section3">Section 3</a>
</nav>
```

### Pagination with URL

```html
<button
  _="on click
  set :page to :page + 1 then
  push url `/products?page=${:page}` then
  fetch `/api/products?page=${:page}` as json then
  for each product in it
    append `<div>${product.name}</div>` to #products
  end"
>
  Load More
</button>
```

## History Events

The `push url` and `replace url` commands dispatch events:

```javascript
window.addEventListener('lokascript:pushurl', e => {
  console.log('URL pushed:', e.detail.url);
});

window.addEventListener('lokascript:replaceurl', e => {
  console.log('URL replaced:', e.detail.url);
});
```

## Summary Table

| Command       | Description                 | Example                  |
| ------------- | --------------------------- | ------------------------ |
| `go back`     | Navigate back in history    | `go back`                |
| `go to url`   | Navigate to URL             | `go to url '/page'`      |
| `go to`       | Scroll to element           | `go to top of #header`   |
| `push url`    | Add to browser history      | `push url '/page'`       |
| `replace url` | Replace current history URL | `replace url '/updated'` |

## Next Steps

- [DOM Commands](/en/api/commands/dom) - Element manipulation
- [Async Commands](/en/api/commands/async) - fetch, wait
- [Control Flow](/en/api/commands/control-flow) - Conditionals and loops
