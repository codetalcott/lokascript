# Fetch Data

Load data from APIs with the `fetch` command.

## Basic Fetch

```html
<button _="on click fetch /api/greeting then put it into #output">Load Greeting</button>
<div id="output"></div>
```

## Fetch as JSON

```html
<button _="on click fetch /api/user as json then put it.name into #name">Load User</button>
<div id="name"></div>
```

## Fetch with Loading State

```html
<button
  _="on click
  add .loading to me then
  set @disabled to true then
  fetch /api/data as json then
  remove .loading from me then
  set @disabled to false then
  put it.message into #result"
>
  Load Data
</button>
<div id="result"></div>
```

## POST Request

```html
<form
  _="on submit halt then
  fetch /api/submit with method:'POST', body: me as FormData then
  put 'Submitted!' into #status"
>
  <input name="email" type="email" />
  <button type="submit">Submit</button>
</form>
<div id="status"></div>
```

## POST JSON

```html
<button
  _="on click
  set :data to { name: #name.value, email: #email.value } then
  fetch /api/users with {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(:data)
  } as json then
  put 'Created user: ' + it.id into #result"
>
  Create User
</button>
```

## Delete Request

```html
<button
  _="on click
  fetch /api/item/123 with method:'DELETE' then
  remove the closest .item from me"
>
  Delete
</button>
```

## Fetch HTML Partial

```html
<button _="on click fetch /partials/modal.html as html then put it into #container">
  Load Modal
</button>
<div id="container"></div>
```

## Error Handling

```html
<button
  _="on click
  fetch /api/data as json
    on success put it.message into #result
    on error put 'Failed to load' into #result"
>
  Load with Error Handling
</button>
```

## Sequential Fetches

```html
<button
  _="on click
  fetch /api/user as json then
  set :user to it then
  fetch `/api/user/${:user.id}/posts` as json then
  put it.length + ' posts found' into #result"
>
  Load User Posts
</button>
```

## Parallel Fetches

```html
<button
  _="on click
  async do fetch /api/users as json then put it into #users end
  async do fetch /api/products as json then put it into #products end
  put 'Loading...' into #status"
>
  Load Both
</button>
```

## Infinite Scroll

```html
<div id="list"
  _="on scroll
    if my scrollTop + my clientHeight >= my scrollHeight - 100
      if not (me has .loading)
        add .loading to me then
        set :page to (:page or 0) + 1 then
        fetch `/api/items?page=${:page}` as json then
        for each item in it
          append `<div class="item">${item.name}</div>` to me
        end then
        remove .loading from me
      end
    end">
</div>
```

## Search with Debounce

```html
<input
  _="on input.debounce(300)
  if my value.length > 2
    fetch `/api/search?q=${my value}` as json then
    set #results.innerHTML to '' then
    for each item in it
      append `<div>${item.name}</div>` to #results
    end
  end"
/>
<div id="results"></div>
```

## Polling

```html
<div
  id="status"
  _="on load
    repeat forever
      fetch /api/status as json then
      put it.status into me then
      wait 5s
    end"
>
  Loading...
</div>
```

## File Upload

```html
<form
  _="on submit halt then
  fetch /api/upload with method:'POST', body: me as FormData then
  put 'Uploaded!' into #status"
>
  <input type="file" name="file" />
  <button type="submit">Upload</button>
</form>
<div id="status"></div>
```

## With Authentication

```html
<button
  _="on click
  fetch /api/protected with {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  } as json then
  put it.data into #result"
>
  Fetch Protected
</button>
```

## Response Types

| Type          | Usage         | Returns        |
| ------------- | ------------- | -------------- |
| `as json`     | JSON API      | Parsed object  |
| `as text`     | Plain text    | String         |
| `as html`     | HTML fragment | HTML string    |
| `as response` | Raw Response  | Fetch Response |
| (none)        | Default       | Response body  |

## Next Steps

- [Form Validation](/en/cookbook/form-validation) - Validate before submit
- [Async Commands](/en/api/commands/async) - More async patterns
- [Control Flow](/en/api/commands/control-flow) - Loops and conditions
