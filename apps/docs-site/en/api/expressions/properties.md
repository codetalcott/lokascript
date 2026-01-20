# Property Access

How to read and write element properties, attributes, and data.

## Dot Notation

Access properties with standard dot notation.

```html
<!-- Read properties -->
<button _="on click put #input.value into #output">Copy Value</button>
<button _="on click log me.innerHTML">Log HTML</button>
<button _="on click put #el.offsetWidth into #width">Get Width</button>

<!-- Write properties -->
<button _="on click set #output.innerHTML to 'Updated'">Update</button>
<button _="on click set me.style.color to 'red'">Turn Red</button>
```

## Possessive Syntax (`'s`)

Use `'s` for more readable property access.

```html
<!-- Read -->
<button _="on click put #input's value into #output">Copy Value</button>
<button _="on click log me's className">Log Classes</button>

<!-- Write -->
<button _="on click set #output's innerHTML to 'Done'">Update</button>
```

## `my` Shorthand

`my` is shorthand for `me's`.

```html
<button _="on click set my innerHTML to 'Clicked!'">Click Me</button>
<button _="on click put my dataset.count into #counter">Show Count</button>
<button _="on click toggle my disabled">Toggle Disabled</button>
```

## Attributes

### Reading Attributes

```html
<button _="on click put #link's @href into #url">Get URL</button>
<button _="on click log my @data-id">Log Data ID</button>
```

### Writing Attributes

```html
<button _="on click set @disabled of #submit to true">Disable</button>
<button _="on click set my @aria-expanded to 'true'">Expand</button>
```

### Toggling Attributes

```html
<button _="on click toggle @disabled on #input">Toggle Disabled</button>
<button _="on click toggle @hidden on #panel">Toggle Hidden</button>
```

## Dataset (data-\* attributes)

```html
<!-- Read -->
<button _="on click put my dataset.userId into #id">Get User ID</button>
<button _="on click log #item's dataset.status">Log Status</button>

<!-- Write -->
<button _="on click set my dataset.count to '5'">Set Count</button>
```

## Style Properties

```html
<!-- Read -->
<button _="on click put me's style.color into #current-color">Get Color</button>

<!-- Write -->
<button _="on click set me's style.backgroundColor to 'blue'">Blue BG</button>
<button _="on click set #box's style.display to 'none'">Hide</button>
<button _="on click set my style.transform to 'scale(1.1)'">Scale Up</button>
```

## Computed Styles

```html
<button
  _="on click
  set :style to getComputedStyle(#box) then
  put :style.width into #width"
>
  Get Computed Width
</button>
```

## Class Properties

```html
<!-- Check class -->
<button
  _="on click
  if me has .active
    put 'Active' into #status
  else
    put 'Inactive' into #status
  end"
>
  Check Status
</button>

<!-- classList methods -->
<button _="on click call me.classList.toggle('active')">Toggle Active</button>
```

## Form Values

```html
<!-- Input value -->
<button _="on click put #name.value into #preview">Preview Name</button>

<!-- Select value -->
<button _="on click put #country.value into #selected">Show Selected</button>

<!-- Checkbox checked -->
<button
  _="on click
  if #agree.checked
    show #continue-btn
  else
    hide #continue-btn
  end"
>
  Check Agreement
</button>

<!-- Form as object -->
<form
  _="on submit halt then
  set :data to me as Values then
  log :data"
>
  <input name="email" />
  <button type="submit">Submit</button>
</form>
```

## Object Properties

```html
<!-- Access object properties -->
<button
  _="on click
  set :user to { name: 'Alice', age: 30 } then
  put :user.name into #name then
  put :user.age into #age"
>
  Show User
</button>

<!-- Nested properties -->
<button
  _="on click
  fetch /api/user as json then
  put it.profile.avatar into #avatar's @src"
>
  Load Avatar
</button>
```

## Method Calls

```html
<!-- String methods -->
<button _="on click put #input.value.toUpperCase() into #output">Uppercase</button>

<!-- Array methods -->
<button _="on click put :items.length into #count">Count Items</button>

<!-- DOM methods -->
<button _="on click call #form.checkValidity()">Validate Form</button>
```

## Summary

| Syntax         | Description     | Example              |
| -------------- | --------------- | -------------------- |
| `.property`    | Dot notation    | `#el.value`          |
| `'s property`  | Possessive      | `#el's value`        |
| `my property`  | Self-reference  | `my innerHTML`       |
| `@attribute`   | Attribute       | `@href`, `@disabled` |
| `dataset.name` | Data attributes | `my dataset.id`      |
| `style.prop`   | Inline style    | `me's style.color`   |
| `.method()`    | Method call     | `.toUpperCase()`     |

## Next Steps

- [Type Conversion](/en/api/expressions/conversion) - Converting values
- [Selectors](/en/api/expressions/selectors) - Element selection
- [DOM Commands](/en/api/commands/dom) - Manipulating elements
