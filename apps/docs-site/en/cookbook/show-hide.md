# Show/Hide Elements

Control element visibility with `show`, `hide`, and `toggle`.

## Basic Show/Hide

```html
<button _="on click show #modal">Open Modal</button>
<button _="on click hide #modal">Close Modal</button>
```

## Toggle Visibility

```html
<button _="on click toggle #content">Toggle Content</button>

<div id="content">This content can be toggled.</div>
```

## Two Approaches

### 1. Display Property Commands

Use `show`, `hide`, and `toggle *display`:

```html
<button _="on click show #box">Show</button>
<button _="on click hide #box">Hide</button>
<button _="on click toggle *display on #box">Toggle</button>
```

These manipulate the inline `display` style directly.

### 2. Class-Based Toggle

Use class manipulation with CSS:

```html
<button _="on click remove .hidden from #box">Show</button>
<button _="on click add .hidden to #box">Hide</button>
<button _="on click toggle .hidden on #box">Toggle</button>
```

```css
.hidden {
  display: none;
}
```

::: tip Choose One Approach
Don't mix `show`/`hide` with class-based toggling on the same element. They use different mechanisms and can get out of sync.
:::

## Show/Hide Multiple

```html
<button _="on click show .notification">Show All</button>
<button _="on click hide .notification">Dismiss All</button>
```

## Chained Show/Hide

```html
<button _="on click hide #loading then show #content">Load</button>
```

## Conditional Visibility

```html
<button
  _="on click
  if #panel has .hidden
    remove .hidden from #panel then
    put 'Hide' into me
  else
    add .hidden to #panel then
    put 'Show' into me
  end"
>
  Show
</button>
```

## Modal Pattern

```html
<button _="on click show #modal">Open Modal</button>

<div id="modal" class="modal hidden">
  <div class="modal-content">
    <h2>Modal Title</h2>
    <p>Modal content here.</p>
    <button _="on click hide #modal">Close</button>
  </div>
</div>
```

```css
.modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal.hidden {
  display: none;
}
```

## Dropdown Pattern

```html
<div class="dropdown">
  <button _="on click toggle .open on the closest .dropdown">Menu</button>
  <div class="dropdown-content">
    <a href="#">Item 1</a>
    <a href="#">Item 2</a>
    <a href="#">Item 3</a>
  </div>
</div>
```

```css
.dropdown-content {
  display: none;
}

.dropdown.open .dropdown-content {
  display: block;
}
```

## Collapse/Expand

```html
<button _="on click toggle .collapsed on #panel">Toggle Panel</button>

<div id="panel">
  <p>Panel content that can collapse.</p>
</div>
```

```css
#panel {
  max-height: 500px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

#panel.collapsed {
  max-height: 0;
}
```

## Loading State Pattern

```html
<button
  _="on click
  show #loading then
  hide #content then
  fetch /api/data then
  hide #loading then
  show #content then
  put it into #content"
>
  Load Data
</button>

<div id="loading" class="hidden">Loading...</div>
<div id="content">Content here</div>
```

## Tabbed Content

```html
<div class="tabs">
  <button
    _="on click
    take .active from .tab-btn for me then
    hide .tab-panel then
    show #panel1"
  >
    Tab 1
  </button>
  <button
    _="on click
    take .active from .tab-btn for me then
    hide .tab-panel then
    show #panel2"
  >
    Tab 2
  </button>
</div>

<div id="panel1" class="tab-panel">Panel 1 content</div>
<div id="panel2" class="tab-panel" style="display: none">Panel 2 content</div>
```

## Click Outside to Close

```html
<div id="modal" class="modal hidden" _="on click if event.target is me hide me">
  <div class="modal-content" _="on click halt">Modal content (clicking here won't close)</div>
</div>
```

## Next Steps

- [Toggle Classes](/en/cookbook/toggle-classes) - Class manipulation
- [Form Validation](/en/cookbook/form-validation) - Form handling
- [Animation](/en/api/commands/animation) - Transitions
