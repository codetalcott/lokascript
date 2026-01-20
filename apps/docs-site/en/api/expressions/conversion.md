# Type Conversion

Convert values between types using the `as` keyword.

## Basic Conversions

### Numbers

```html
<!-- String to integer -->
<button
  _="on click
  set :num to #input.value as Int then
  put :num + 1 into #output"
>
  Increment
</button>

<!-- String to float -->
<button
  _="on click
  set :price to #amount.value as Float then
  put :price * 1.1 into #total"
>
  Add 10%
</button>

<!-- Number to string -->
<button
  _="on click
  set :count to 42 then
  put :count as String into #output"
>
  Convert to String
</button>
```

### Strings

```html
<!-- To uppercase -->
<button _="on click put #input.value.toUpperCase() into #output">Uppercase</button>

<!-- To lowercase -->
<button _="on click put #input.value.toLowerCase() into #output">Lowercase</button>
```

## HTTP Response Conversions

### `as json`

Parse response as JSON.

```html
<button
  _="on click
  fetch /api/user as json then
  put it.name into #name then
  put it.email into #email"
>
  Load User
</button>
```

### `as text`

Get response as plain text.

```html
<button
  _="on click
  fetch /api/message as text then
  put it into #message"
>
  Load Message
</button>
```

### `as html`

Get response as HTML (ready for DOM insertion).

```html
<button
  _="on click
  fetch /partial.html as html then
  put it into #container"
>
  Load Partial
</button>
```

### `as response`

Get the raw Response object.

```html
<button
  _="on click
  fetch /api/data as response then
  log it.status then
  log it.headers"
>
  Check Response
</button>
```

## Form Conversions

### `as Values`

Convert a form to an object of name/value pairs.

```html
<form
  _="on submit halt then
  set :data to me as Values then
  log :data then
  fetch /api/submit with method:'POST', body: JSON.stringify(:data)"
>
  <input name="email" type="email" />
  <input name="password" type="password" />
  <button type="submit">Submit</button>
</form>
```

Result: `{ email: "user@example.com", password: "secret" }`

### `as FormData`

Convert a form to FormData (for file uploads).

```html
<form
  _="on submit halt then
  fetch /api/upload with method:'POST', body: me as FormData"
>
  <input name="file" type="file" />
  <button type="submit">Upload</button>
</form>
```

## Array Conversions

### `as Array`

Convert array-like objects to arrays.

```html
<button
  _="on click
  set :items to <.item/> as Array then
  log :items.length"
>
  Count Items
</button>
```

## Boolean Conversions

```html
<button
  _="on click
  set :enabled to #checkbox.checked then
  if :enabled
    show #panel
  else
    hide #panel
  end"
>
  Toggle Based on Checkbox
</button>
```

## Checking Types

```html
<button
  _="on click
  set :val to #input.value as Int then
  if :val is a Number
    put 'Valid number' into #status
  else
    put 'Not a number' into #status
  end"
>
  Validate Number
</button>
```

## Conversion Reference

| Conversion    | Description         | Example                    |
| ------------- | ------------------- | -------------------------- |
| `as Int`      | Parse integer       | `"42" as Int` → `42`       |
| `as Float`    | Parse float         | `"3.14" as Float` → `3.14` |
| `as String`   | Convert to string   | `42 as String` → `"42"`    |
| `as json`     | Parse JSON response | `fetch /api as json`       |
| `as text`     | Get text response   | `fetch /msg as text`       |
| `as html`     | Get HTML response   | `fetch /partial as html`   |
| `as response` | Get raw Response    | `fetch /api as response`   |
| `as Values`   | Form to object      | `form as Values`           |
| `as FormData` | Form to FormData    | `form as FormData`         |
| `as Array`    | To array            | `nodeList as Array`        |

## Common Patterns

### Form Validation with Type Conversion

```html
<form
  _="on submit halt then
  set :age to #age.value as Int then
  if :age < 18
    put 'Must be 18+' into #age-error then
    show #age-error
  else
    hide #age-error then
    submit me
  end"
>
  <input id="age" name="age" type="number" />
  <span id="age-error" hidden></span>
  <button type="submit">Submit</button>
</form>
```

### Price Calculations

```html
<input
  id="quantity"
  type="number"
  value="1"
  _="on input
    set :qty to my value as Int then
    set :price to 9.99 then
    set :total to :qty * :price then
    put '$' + :total.toFixed(2) into #total"
/>
```

### JSON API Response

```html
<button
  _="on click
  fetch /api/products as json then
  for each product in it
    append `<div class='product'>
      <h3>${product.name}</h3>
      <p>$${product.price as String}</p>
    </div>` to #products
  end"
>
  Load Products
</button>
```

## Next Steps

- [Properties](/en/api/expressions/properties) - Accessing values
- [Selectors](/en/api/expressions/selectors) - Element references
- [Async Commands](/en/api/commands/async) - Fetching data
