# Pattern Testing Quick Start

**Last Updated:** 2025-01-14 (Session 30+)
**Status:** ✅ Working - 106/106 patterns passing (100%)

---

## ⚡ Quick Commands

```bash
# From project root (/Users/williamtalcott/projects/hyperfixi)

# 1. Ensure HTTP server is running
npx http-server packages/core -p 3000 -c-1 &

# 2. Build browser bundle (if needed)
npm run build:browser --prefix packages/core

# 3. Generate test pages
node scripts/generate-pattern-tests.mjs

# 4. Run comprehensive tests
node scripts/test-all-patterns.mjs

# Results saved to: test-results/pattern-test-results-*.{json,md}
```

---

## 📁 Critical Path Configuration

### HTTP Server Configuration
- **Server Root**: `packages/core/`
- **Port**: 3000
- **Command**: `npx http-server packages/core -p 3000 -c-1`

### File Paths (Relative to HTTP Server Root)

| Resource | HTTP Path | File System Path |
|----------|-----------|------------------|
| **Browser Bundle** | `/dist/hyperfixi-browser.js` | `packages/core/dist/hyperfixi-browser.js` |
| **Test Pages** | `/cookbook/generated-tests/*.html` | `cookbook/generated-tests/*.html` (via symlink) |
| **Pattern Registry** | N/A (Node.js only) | `patterns-registry.mjs` (project root) |

### Required Symlink

```bash
# Create symlink (already exists, documented for reference)
cd packages/core
ln -sf ../../cookbook cookbook

# Verify
ls -la packages/core/cookbook  # Should show: cookbook -> ../../cookbook
```

---

## 🔧 File Locations

### Source Files
- **Pattern Registry**: `/Users/williamtalcott/projects/hyperfixi/patterns-registry.mjs`
- **Test Generator**: `/Users/williamtalcott/projects/hyperfixi/scripts/generate-pattern-tests.mjs`
- **Test Runner**: `/Users/williamtalcott/projects/hyperfixi/scripts/test-all-patterns.mjs`

### Generated Files
- **Test Pages**: `/Users/williamtalcott/projects/hyperfixi/cookbook/generated-tests/*.html`
- **Test Results**: `/Users/williamtalcott/projects/hyperfixi/test-results/pattern-test-results-*.{json,md}`

### Build Artifacts
- **Browser Bundle**: `/Users/williamtalcott/projects/hyperfixi/packages/core/dist/hyperfixi-browser.js`

---

## ⚠️ Common Path Issues & Solutions

### Issue 1: "404 Not Found" for Bundle

**Symptom**: Browser console shows "Failed to load resource: 404" for hyperfixi-browser.js

**Cause**: Incorrect bundle path in generated HTML

**Solution**: Verify test generator uses `/dist/hyperfixi-browser.js` (NOT `../../packages/core/dist/...`)

**Fix Location**: `scripts/generate-pattern-tests.mjs` lines 280, 449

```javascript
// ✅ CORRECT
<script src="/dist/hyperfixi-browser.js"></script>

// ❌ WRONG
<script src="../../packages/core/dist/hyperfixi-browser.js"></script>
```

### Issue 2: "404 Not Found" for Test Pages

**Symptom**: Test runner can't load `http://127.0.0.1:3000/cookbook/generated-tests/*.html`

**Cause**: Missing symlink in packages/core

**Solution**:
```bash
cd packages/core
ln -sf ../../cookbook cookbook
```

**Verification**:
```bash
curl -I http://127.0.0.1:3000/cookbook/generated-tests/test-commands.html
# Should return: HTTP/1.1 200 OK
```

### Issue 3: TypeScript Syntax Error in patterns-registry.mjs

**Symptom**: `SyntaxError: Unexpected token 'export'` or `interface`

**Cause**: TypeScript syntax in .mjs file

**Solution**: File must use JSDoc instead of TypeScript interfaces

```javascript
// ✅ CORRECT (.mjs file)
/**
 * @typedef {Object} Pattern
 * @property {string} syntax
 */
export const PATTERN_REGISTRY = { ... };

// ❌ WRONG (.mjs file)
export interface Pattern {
  syntax: string;
}
export const PATTERN_REGISTRY: Record<string, PatternCategory> = { ... };
```

### Issue 4: Running from Wrong Directory

**Symptom**: `Error: Cannot find module 'scripts/test-all-patterns.mjs'`

**Cause**: Running scripts from `packages/core/` instead of project root

**Solution**: Always run scripts from project root
```bash
# ✅ CORRECT
cd /Users/williamtalcott/projects/hyperfixi
node scripts/test-all-patterns.mjs

# ❌ WRONG
cd /Users/williamtalcott/projects/hyperfixi/packages/core
node scripts/test-all-patterns.mjs  # File not found
```

---

## 🧪 Testing Workflow

### Initial Setup (One-time)
```bash
# 1. Navigate to project root
cd /Users/williamtalcott/projects/hyperfixi

# 2. Ensure symlink exists
cd packages/core && ln -sf ../../cookbook cookbook && cd ../..

# 3. Start HTTP server (keep running in background)
npx http-server packages/core -p 3000 -c-1 &

# 4. Build browser bundle
npm run build:browser --prefix packages/core
```

### Regular Testing Workflow
```bash
# From project root

# 1. After modifying pattern registry
node scripts/generate-pattern-tests.mjs

# 2. After code changes to commands/expressions
npm run build:browser --prefix packages/core

# 3. Run tests
node scripts/test-all-patterns.mjs

# 4. View results
cat test-results/pattern-test-results-*.md | tail -50
```

### Debug Single Test Page
```bash
# From project root

# Create debug script
cat > test-single-page.mjs << 'EOF'
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.goto('http://127.0.0.1:3000/cookbook/generated-tests/test-commands.html');
await page.waitForTimeout(10000); // Keep open for inspection
await browser.close();
EOF

node test-single-page.mjs
```

---

## 📊 Current Status (Session 30+)

- **Total Patterns**: 106
- **Passing**: 106 (100%)
- **Categories**: 10
- **Test Execution Time**: ~56 seconds
- **Last Successful Run**: 2025-01-14

### Pattern Breakdown
| Category | Patterns | Status |
|----------|----------|--------|
| Commands | 31 | ✅ 100% |
| Operators | 19 | ✅ 100% (includes 3 new range patterns) |
| References | 14 | ✅ 100% |
| Event Handlers | 10 | ✅ 100% |
| Edge Cases | 8 | ✅ 100% |
| Property Access | 7 | ✅ 100% |
| Temporal Modifiers | 5 | ✅ 100% |
| Type Conversion | 5 | ✅ 100% |
| Context Switching | 4 | ✅ 100% |
| Control Flow | 3 | ✅ 100% |

---

## 🔍 Troubleshooting Checklist

Before opening an issue, verify:

- [ ] HTTP server is running on port 3000
- [ ] Server root is `packages/core/` (not project root)
- [ ] Symlink exists: `packages/core/cookbook -> ../../cookbook`
- [ ] Running scripts from project root (not `packages/core/`)
- [ ] Browser bundle exists at `packages/core/dist/hyperfixi-browser.js`
- [ ] Generated test pages exist in `cookbook/generated-tests/`
- [ ] patterns-registry.mjs uses JSDoc (not TypeScript interfaces)

**Quick Verification**:
```bash
# From project root
curl http://127.0.0.1:3000/dist/hyperfixi-browser.js | head -5
curl http://127.0.0.1:3000/cookbook/generated-tests/test-commands.html | head -5
ls -la packages/core/cookbook
cat patterns-registry.mjs | head -30
```

All should return valid content/paths.

---

## 📚 Related Documentation

- **[PATTERN_TESTING_GUIDE.md](PATTERN_TESTING_GUIDE.md)** - Comprehensive 30+ page guide
- **[PATTERN_TESTING_IMPLEMENTATION_SUMMARY.md](PATTERN_TESTING_IMPLEMENTATION_SUMMARY.md)** - Implementation details
- **[PATTERN_TESTING_INTEGRATION.md](PATTERN_TESTING_INTEGRATION.md)** - Claude Code integration
- **[SESSION_30_RECOMMENDATIONS_COMPLETE.md](SESSION_30_RECOMMENDATIONS_COMPLETE.md)** - Session 30 achievements

---

**Last Verified**: 2025-01-14
**Maintainer**: HyperFixi Development Team
**Status**: ✅ Production Ready - 106/106 patterns passing
