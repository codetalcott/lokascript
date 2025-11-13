# Cookbook Page Crash Investigation

## Problem Statement

The `cookbook/full-cookbook-test.html` page **crashes the browser** during page load, even after performance optimizations have been applied. This is a **critical blocker** for automated testing.

**Error Message**:
```
page.goto: Page crashed
navigating to "http://127.0.0.1:3000/cookbook/full-cookbook-test.html"
```

## Crash Timeline

1. **Page loads** (`http://127.0.0.1:3000/cookbook/full-cookbook-test.html`)
2. **HyperFixi bundle loads** (`hyperfixi-browser.js`)
3. **processNode() begins** processing _hyperscript attributes
4. **Browser crashes** before page load completes

## What We Know

### ✅ Performance Improvements Applied

The following fixes have been successfully implemented:

1. **Debug mode control** - Now off by default, preventing excessive logging
2. **Console size limit** - Prevents memory accumulation (100 message limit)
3. **Optional auto-run** - Prevents immediate test execution on load

**Result**: These fixes reduce CPU/memory usage significantly, but **the page still crashes**.

### ❌ Crash Persists

- Crash occurs **even without debug mode** (`?debug=false` or no parameter)
- Crash occurs **even without auto-run** (no test execution)
- Crash happens **during initial page load**, not during test execution

**Conclusion**: The crash is NOT caused by debug logging or test execution overhead.

## Suspected Root Cause

### Hypothesis: One or more _hyperscript attributes cause browser crash during compilation/binding

The page contains **17 _hyperscript attributes** being processed simultaneously:

```html
1.  _="on click set my.innerText to #first.innerText + ' ' + #second.innerText"
2.  _="on load set my.indeterminate to true"
3.  _="on click set .indeterminate.indeterminate to true"
4.  _="on click transition opacity to 0 then remove me"
5.  _="on click toggle .active on me"
6.  _="on click[event.altKey] remove .primary then settle then add .primary"
7.  _="on keyup if the event's key is 'Escape' set my value to '' trigger keyup else show <blockquote/> in #quotes when its textContent contains my value"
8.  _="on input show <tbody>tr/> in closest <table/> when its textContent.toLowerCase() contains my value.toLowerCase()"
9.  _="on dragstart call event.dataTransfer.setData('text/plain',target.textContent)"
10. _="on dragover or dragenter halt the event then set the target's style.background to 'lightgray'
      on dragleave or drop set the target's style.background to ''
      on drop get event.dataTransfer.getData('text/plain') then put it into the next <output/>"
11. _="on click if I match .active remove .active from me put 'Activate' into me else add .active to me put 'Deactivate' into me end"
```

### Most Complex/Suspicious Patterns

**Example 7 (Keyup with if/else)**:
```html
_="on keyup
    if the event's key is 'Escape'
      set my value to ''
      trigger keyup
    else
     show <blockquote/> in #quotes when its textContent contains my value"
```

**Potential Issues**:
- Uses `if/else` conditional (may not be fully implemented)
- Uses `trigger` command (may cause infinite recursion?)
- Uses `show...when` conditional syntax (may not be implemented)

**Example 8 (Table filtering)**:
```html
_="on input
   show <tbody>tr/> in closest <table/>
     when its textContent.toLowerCase() contains my value.toLowerCase()"
```

**Potential Issues**:
- Uses `show...when` conditional syntax
- Complex selector: `<tbody>tr/>` inside `closest <table/>`
- Method chaining: `.toLowerCase()`

**Example 10 (Drag & drop with multiple events)**:
```html
_="on dragover or dragenter halt the event
     then set the target's style.background to 'lightgray'
   on dragleave or drop set the target's style.background to ''
   on drop get event.dataTransfer.getData('text/plain')
     then put it into the next <output/>"
```

**Potential Issues**:
- Multiple event handlers in single attribute
- Uses `halt` command
- Uses `get` command
- Uses `put...into` command
- Complex event flow with multiple branches

**Example 11 (Complex if/else)**:
```html
_="on click
   if I match .active
     remove .active from me
     put 'Activate' into me
   else
     add .active to me
     put 'Deactivate' into me
   end"
```

**Potential Issues**:
- Uses `if/else/end` control flow
- Uses `match` operator
- Uses `put...into` command
- Multiple commands in each branch

## Investigation Steps

### Step 1: Isolate the Crashing Attribute

Create a minimal test page that loads attributes one-by-one to find which one crashes:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Crash Test - Minimal</title>
</head>
<body>
  <h1>Crash Test</h1>

  <!-- Test each attribute individually -->
  <div>
    <button id="test1" _="on click set my.innerText to #first.innerText + ' ' + #second.innerText">Test 1</button>
    <p id="first">Hello</p>
    <p id="second">World</p>
  </div>

  <script src="../packages/core/dist/hyperfixi-browser.js"></script>
</body>
</html>
```

Add attributes one by one until crash occurs.

### Step 2: Test Individual Commands

If a specific attribute crashes, test each command in isolation:

```html
<!-- Test 'show...when' syntax -->
<input _="on keyup show <blockquote/> in #quotes when its textContent contains my value">

<!-- Test 'if/else' syntax -->
<button _="on click if I match .active then remove .active from me end">

<!-- Test 'put...into' syntax -->
<button _="on click put 'test' into me">

<!-- Test 'halt' command -->
<div _="on dragover halt the event">

<!-- Test multiple event handlers -->
<div _="on dragover halt the event
        on drop get event.dataTransfer.getData('text/plain')">
```

### Step 3: Check Parser/Runtime Errors

Enable detailed error logging:

```javascript
window.__HYPERFIXI_DEBUG__ = true;

// Capture all errors
window.addEventListener('error', (event) => {
  console.error('❌ Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Unhandled promise rejection:', event.reason);
});
```

Look for:
- Parser errors (syntax not supported)
- Runtime errors (commands not implemented)
- Infinite loops (recursive evaluation)
- Stack overflow (too deep recursion)

## Recommended Workarounds

### Workaround 1: Simplify Complex Attributes

Replace complex multi-line attributes with simpler versions:

**Before**:
```html
_="on keyup
    if the event's key is 'Escape'
      set my value to ''
      trigger keyup
    else
     show <blockquote/> in #quotes when its textContent contains my value"
```

**After**:
```html
_="on keyup show <blockquote/> in #quotes when its textContent contains my value"
```

Remove `if/else` logic and let the filtering happen naturally.

### Workaround 2: Use JavaScript for Complex Logic

Replace unimplemented commands with JavaScript:

**Before**:
```html
<input _="on keyup show <blockquote/> in #quotes when its textContent contains my value">
```

**After**:
```html
<input id="search-input">
<script>
document.getElementById('search-input').addEventListener('keyup', (e) => {
  const searchTerm = e.target.value.toLowerCase();
  document.querySelectorAll('#quotes blockquote').forEach(q => {
    const show = q.textContent.toLowerCase().includes(searchTerm);
    q.style.display = show ? '' : 'none';
  });
});
</script>
```

### Workaround 3: Split into Multiple Test Pages

Create separate test pages for each category of examples:

1. `cookbook-basic.html` - Examples 1-4 (simple commands)
2. `cookbook-filtering.html` - Examples 5-7 (filtering/conditionals)
3. `cookbook-dragdrop.html` - Example 8 (drag & drop)
4. `cookbook-advanced.html` - Example 9 (complex control flow)

This isolates crashes to specific pages and makes debugging easier.

### Workaround 4: Use Simpler Test Approach

Instead of loading all examples at once, create a test page that:
1. Loads HyperFixi
2. Dynamically adds ONE test at a time
3. Processes it with `processNode()`
4. Checks for crashes
5. Moves to next test

```javascript
const tests = [
  { name: 'Test 1', html: '<button _="on click set my.innerText to \'clicked\'">Click</button>' },
  { name: 'Test 2', html: '<button _="on click toggle .active on me">Toggle</button>' },
  // ... more tests
];

async function runTests() {
  for (const test of tests) {
    const container = document.getElementById('test-container');
    container.innerHTML = test.html;
    try {
      window.hyperfixi.processNode(container.firstChild);
      console.log(`✅ ${test.name} passed`);
    } catch (e) {
      console.error(`❌ ${test.name} crashed:`, e);
      break; // Stop on first crash
    }
  }
}
```

## Next Steps

1. **Create minimal crash test page** (Step 1 above)
2. **Identify exact crashing attribute(s)**
3. **File issue with specific failing syntax**
4. **Implement workaround** (simplify or remove failing attributes)
5. **Update documentation** with unsupported syntax patterns

## Files to Create/Modify

1. `cookbook/crash-test-minimal.html` - Minimal test page for crash investigation
2. `cookbook/crash-test-incremental.html` - Add attributes one-by-one
3. Update `COOKBOOK_IMPLEMENTATION_SUMMARY.md` - Document unsupported patterns
4. Update `full-cookbook-test.html` - Remove/simplify crashing attributes

## Success Criteria

- ✅ Page loads without crashing
- ✅ Playwright tests can run against page
- ✅ Manual testing possible
- ✅ Documentation updated with workarounds

## References

- Main test page: [`/cookbook/full-cookbook-test.html`](cookbook/full-cookbook-test.html)
- Performance analysis: [`/COOKBOOK_PERFORMANCE_ANALYSIS.md`](COOKBOOK_PERFORMANCE_ANALYSIS.md)
- Validation script: [`/packages/core/validate-cookbook-demos.mjs`](packages/core/validate-cookbook-demos.mjs)
