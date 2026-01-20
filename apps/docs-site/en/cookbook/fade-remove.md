# Fade and Remove

Animate elements before removing them from the DOM.

## Basic Fade Out

```html
<div
  class="notification"
  _="on click
    transition opacity to 0 over 300ms then
    remove me"
>
  Click to dismiss
</div>
```

## Class-Based Fade

Using CSS transitions:

```html
<div
  class="notification"
  _="on click
    add .fade-out to me then
    settle then
    remove me"
>
  Click to dismiss
</div>
```

```css
.notification {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.notification.fade-out {
  opacity: 0;
  transform: translateY(-10px);
}
```

## Slide Out

```html
<div
  class="item"
  _="on click
    add .slide-out to me then
    settle then
    remove me"
>
  Slide to remove
</div>
```

```css
.item {
  transition: all 0.3s ease;
}

.item.slide-out {
  transform: translateX(100%);
  opacity: 0;
}
```

## Dismiss Button

```html
<div class="alert">
  <span>This is an alert</span>
  <button
    _="on click
    add .fade-out to the closest .alert then
    settle then
    remove the closest .alert"
  >
    ×
  </button>
</div>
```

## Auto-Dismiss

```html
<div
  class="toast"
  _="on load
    wait 3s then
    add .fade-out to me then
    settle then
    remove me"
>
  This will disappear in 3 seconds
</div>
```

## Shrink and Remove

```html
<div
  class="item"
  _="on click
    transition height to 0 over 200ms then
    transition opacity to 0 over 100ms then
    remove me"
>
  Click to shrink
</div>
```

Or with CSS:

```html
<div
  class="item"
  _="on click
    add .shrink to me then
    settle then
    remove me"
>
  Click to shrink
</div>
```

```css
.item {
  transition: all 0.3s ease;
  overflow: hidden;
}

.item.shrink {
  height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
  opacity: 0;
}
```

## List Item Removal

```html
<ul id="list">
  <li
    class="list-item"
    _="on click
      add .removing to me then
      settle then
      remove me"
  >
    Item 1
  </li>
  <li
    class="list-item"
    _="on click
      add .removing to me then
      settle then
      remove me"
  >
    Item 2
  </li>
</ul>
```

```css
.list-item {
  transition: all 0.3s ease;
}

.list-item.removing {
  opacity: 0;
  height: 0;
  padding: 0;
  margin: 0;
  transform: translateX(-100%);
}
```

## Flash Before Remove

```html
<div
  class="item"
  _="on click
    add .flash to me then
    wait 200ms then
    remove .flash from me then
    add .fade-out to me then
    settle then
    remove me"
>
  Flash then remove
</div>
```

```css
.flash {
  background-color: #fef08a !important;
}
```

## Confirm Before Remove

```html
<div class="item">
  <span>Important item</span>
  <button
    _="on click
    if confirm('Are you sure?')
      add .fade-out to the closest .item then
      settle then
      remove the closest .item
    end"
  >
    Delete
  </button>
</div>
```

## Undo Remove

```html
<div class="item" id="item-1">
  <span>Item content</span>
  <button
    _="on click
    add .fade-out to the closest .item then
    settle then
    set :html to the closest .item's outerHTML then
    remove the closest .item then
    put `<div class='undo'>Removed. <button _='on click put :html before me then remove me'>Undo</button></div>` at end of #list"
  >
    Remove
  </button>
</div>
```

## Staggered Removal

Remove multiple items with delay:

```html
<button
  _="on click
  for each item in .item
    add .fade-out to item then
    wait 100ms
  end then
  wait 300ms then
  remove .item"
>
  Remove All
</button>
```

## Modal Close Animation

```html
<div
  id="modal"
  class="modal"
  _="on closeModal
    add .fade-out to me then
    settle then
    add .hidden to me then
    remove .fade-out from me"
>
  <div class="modal-content">
    <button _="on click send closeModal to #modal">Close</button>
  </div>
</div>
```

```css
.modal {
  transition: opacity 0.2s ease;
}

.modal.fade-out {
  opacity: 0;
}

.modal.hidden {
  display: none;
}
```

## Common CSS Patterns

```css
/* Fade */
.fade-out {
  opacity: 0;
}

/* Slide left */
.slide-out-left {
  transform: translateX(-100%);
  opacity: 0;
}

/* Slide right */
.slide-out-right {
  transform: translateX(100%);
  opacity: 0;
}

/* Scale down */
.scale-out {
  transform: scale(0);
  opacity: 0;
}

/* Combined */
.animate-out {
  opacity: 0;
  transform: translateY(-10px) scale(0.95);
}
```

## Next Steps

- [Animation Commands](/en/api/commands/animation) - More animation techniques
- [Toggle Classes](/en/cookbook/toggle-classes) - Class manipulation
- [Show/Hide](/en/cookbook/show-hide) - Visibility control
