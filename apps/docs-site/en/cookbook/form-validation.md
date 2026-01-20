# Form Validation

Validate user input before submission.

## Basic Required Field

```html
<form
  _="on submit
  if #name.value is empty
    halt then
    add .error to #name then
    show #name-error
  end"
>
  <input id="name" required />
  <span id="name-error" class="error hidden">Name is required</span>
  <button type="submit">Submit</button>
</form>
```

## Email Validation

```html
<input
  type="email"
  id="email"
  _="on blur
    if my value is empty
      add .error to me then
      put 'Email is required' into #email-error
    else if not (my value contains '@')
      add .error to me then
      put 'Invalid email format' into #email-error
    else
      remove .error from me then
      put '' into #email-error
    end"
/>
<span id="email-error" class="error"></span>
```

## Password Requirements

```html
<input
  type="password"
  id="password"
  _="on input
    set :val to my value then
    set :errors to [] then

    if :val.length < 8
      call :errors.push('At least 8 characters')
    end then

    if not :val.match(/[A-Z]/)
      call :errors.push('One uppercase letter')
    end then

    if not :val.match(/[0-9]/)
      call :errors.push('One number')
    end then

    if :errors.length > 0
      put :errors.join(', ') into #password-errors then
      add .invalid to me
    else
      put '✓ Password is strong' into #password-errors then
      remove .invalid from me then
      add .valid to me
    end"
/>
<div id="password-errors"></div>
```

## Confirm Password

```html
<input type="password" id="password" placeholder="Password" />
<input
  type="password"
  id="confirm"
  _="on input
    if my value != #password.value
      add .error to me then
      show #confirm-error
    else
      remove .error from me then
      hide #confirm-error
    end"
  placeholder="Confirm password"
/>
<span id="confirm-error" class="error hidden">Passwords don't match</span>
```

## Real-time Validation

```html
<input
  id="username"
  _="on input.debounce(500)
    if my value.length < 3
      put 'Too short' into #username-status then
      add .error to me
    else
      put 'Checking...' into #username-status then
      fetch `/api/check-username?name=${my value}` as json then
      if it.available
        put '✓ Available' into #username-status then
        remove .error from me then
        add .valid to me
      else
        put '✗ Taken' into #username-status then
        remove .valid from me then
        add .error to me
      end
    end"
/>
<span id="username-status"></span>
```

## Full Form Validation

```html
<form
  _="on submit
  set :valid to true then

  -- Validate name
  if #name.value is empty
    add .error to #name then
    set :valid to false
  else
    remove .error from #name
  end then

  -- Validate email
  if not (#email.value contains '@')
    add .error to #email then
    set :valid to false
  else
    remove .error from #email
  end then

  -- Validate terms
  if not #terms.checked
    add .error to #terms-label then
    set :valid to false
  else
    remove .error from #terms-label
  end then

  -- Submit or show error
  if :valid
    show #loading then
    fetch /api/submit with method:'POST', body: me as FormData then
    hide #loading then
    show #success
  else
    halt then
    show #form-error
  end"
>
  <input id="name" name="name" placeholder="Name" />
  <input id="email" name="email" placeholder="Email" />
  <label id="terms-label">
    <input type="checkbox" id="terms" name="terms" />
    I agree to terms
  </label>

  <span id="form-error" class="error hidden">Please fix errors above</span>
  <span id="loading" class="hidden">Submitting...</span>
  <span id="success" class="hidden">Success!</span>

  <button type="submit">Submit</button>
</form>
```

## Number Range

```html
<input
  type="number"
  id="age"
  _="on blur
    set :val to my value as Int then
    if :val < 18
      add .error to me then
      put 'Must be 18 or older' into #age-error
    else if :val > 120
      add .error to me then
      put 'Invalid age' into #age-error
    else
      remove .error from me then
      put '' into #age-error
    end"
/>
<span id="age-error" class="error"></span>
```

## Credit Card Format

```html
<input
  id="card"
  _="on input
    set :raw to my value.replace(/\D/g, '') then
    set :formatted to :raw.match(/.{1,4}/g)?.join(' ') or '' then
    set my value to :formatted then

    if :raw.length == 16
      add .valid to me
    else
      remove .valid from me
    end"
  placeholder="1234 5678 9012 3456"
  maxlength="19"
/>
```

## Clear Errors on Focus

```html
<input _="on focus remove .error from me then hide #my-error" />
```

## CSS for Validation States

```css
input.error {
  border-color: #ef4444;
  background-color: #fef2f2;
}

input.valid {
  border-color: #22c55e;
  background-color: #f0fdf4;
}

.error {
  color: #ef4444;
  font-size: 14px;
}

.hidden {
  display: none;
}
```

## Next Steps

- [Fetch Data](/en/cookbook/fetch-data) - Submit to API
- [Input Mirroring](/en/cookbook/input-mirror) - Real-time preview
- [DOM Commands](/en/api/commands/dom) - Element manipulation
