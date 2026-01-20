# Input Mirroring

Display input values in real-time as users type.

## Basic Mirror

```html
<input id="name" _="on input put my value into #preview" />
<div id="preview">Type something...</div>
```

## Character Counter

```html
<textarea id="message" _="on input put my value.length + '/280' into #counter"></textarea>
<span id="counter">0/280</span>
```

## Live Search Preview

```html
<input id="search" _="on input put 'Searching for: ' + my value into #search-preview" />
<div id="search-preview">Searching for:</div>
```

## Format as You Type

### Uppercase

```html
<input _="on input put my value.toUpperCase() into #preview" />
<div id="preview"></div>
```

### Currency Format

```html
<input
  type="number"
  id="price"
  _="on input put '$' + (my value as Float).toFixed(2) into #formatted"
/>
<div id="formatted">$0.00</div>
```

## Debounced Input

Wait for user to stop typing:

```html
<input _="on input.debounce(300) put my value into #preview" />
<div id="preview"></div>
```

## Mirror Multiple Fields

```html
<form>
  <input id="firstName" placeholder="First name" _="on input call updatePreview()" />
  <input id="lastName" placeholder="Last name" _="on input call updatePreview()" />
</form>

<div id="fullName">Your name</div>

<script>
  function updatePreview() {
    const first = document.getElementById('firstName').value;
    const last = document.getElementById('lastName').value;
    document.getElementById('fullName').textContent = `${first} ${last}`.trim() || 'Your name';
  }
</script>
```

Or with pure hyperscript:

```html
<input
  id="firstName"
  placeholder="First name"
  _="on input put #firstName.value + ' ' + #lastName.value into #fullName"
/>
<input
  id="lastName"
  placeholder="Last name"
  _="on input put #firstName.value + ' ' + #lastName.value into #fullName"
/>

<div id="fullName">Your name</div>
```

## Password Strength Indicator

```html
<input
  type="password"
  id="password"
  _="on input
    set :len to my value.length then
    if :len < 6
      put 'Weak' into #strength then
      set #strength.style.color to 'red'
    else if :len < 10
      put 'Medium' into #strength then
      set #strength.style.color to 'orange'
    else
      put 'Strong' into #strength then
      set #strength.style.color to 'green'
    end"
/>
<span id="strength"></span>
```

## Live Validation

```html
<input
  type="email"
  id="email"
  _="on input
    if my value contains '@' and my value contains '.'
      remove .invalid from me then
      add .valid to me
    else
      remove .valid from me then
      add .invalid to me
    end"
/>
```

## Mirror to Multiple Targets

```html
<input
  id="title"
  _="on input
    put my value into #preview-title then
    put my value into #sidebar-title then
    set document.title to 'Editing: ' + my value"
/>
```

## Range Slider

```html
<input type="range" min="0" max="100" value="50" _="on input put my value + '%' into #percent" />
<span id="percent">50%</span>
```

## Color Picker Preview

```html
<input type="color" value="#667eea" _="on input set #preview.style.backgroundColor to my value" />
<div id="preview" style="width: 100px; height: 100px;"></div>
```

## Markdown Preview

```html
<textarea
  id="markdown"
  _="on input.debounce(500)
    fetch `/api/preview` with method:'POST', body: my value as text then
    put it into #preview"
></textarea>
<div id="preview"></div>
```

## Form Template

```html
<form>
  <input id="name" placeholder="Name" _="on input put my value into #template-name" />
  <input id="email" placeholder="Email" _="on input put my value into #template-email" />
  <input id="company" placeholder="Company" _="on input put my value into #template-company" />
</form>

<div class="email-template">
  <p>Dear <span id="template-name">___</span>,</p>
  <p>Thank you for your interest.</p>
  <p>
    Best regards,<br />
    <span id="template-company">___</span><br />
    <span id="template-email">___</span>
  </p>
</div>
```

## Next Steps

- [Form Validation](/en/cookbook/form-validation) - Validate user input
- [Fetch Data](/en/cookbook/fetch-data) - Load data dynamically
- [Expressions](/en/guide/expressions) - Value manipulation
