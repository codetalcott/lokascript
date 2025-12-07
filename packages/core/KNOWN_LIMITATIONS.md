# Known Limitations

## CSS Function Values in Transitions

### Recommended: Quote CSS function values

CSS functions like `hsl()`, `rgb()`, `calc()`, etc. should be quoted when used as values in hyperscript commands. This ensures clean parsing and matches how hyperscript treats CSS as opaque values passed to the browser.

**Recommended Syntax:**

```hyperscript
-- Use quoted strings for CSS function values
transition *background-color to 'hsl(265 60% 65%)'
transition *color to "rgb(255 128 0)"
set my *width to 'calc(100% - 20px)'

-- Template literals work great for dynamic values
transition *background-color to `hsl(${hue} 60% 65%)`
```

**Not Recommended:**

```hyperscript
-- Unquoted CSS functions cause internal parsing warnings
transition *background-color to hsl(265 60% 65%)
```

### Why Quote CSS Values?

1. **Hyperscript doesn't parse CSS** - It passes values through to the browser
2. **Future-proof** - Works with any CSS function (current and future)
3. **Clean parsing** - No internal error recovery needed
4. **Consistency** - Same pattern for all CSS values

### What Happens Without Quotes?

When CSS functions are unquoted, the parser attempts to interpret them as hyperscript function calls. This triggers error recovery which:

- ✅ Successfully recovers and executes the command
- ✅ All tests pass
- ⚠️ Logs internal parsing warnings (debug only)
- ⚠️ AST nodes may be partially parsed

**Bottom line:** Unquoted CSS functions work but quoted is cleaner.

---

## Summary

All functionality is **production-ready**. Quote CSS function values for the cleanest experience.
