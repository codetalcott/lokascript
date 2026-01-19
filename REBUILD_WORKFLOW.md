# Rebuild Workflow - LokaScript

## Overview

This document describes the standard process for rebuilding packages and bundles after code changes.

## Quick Reference

```bash
# Quick rebuild (most common)
npm run build                          # Build all packages

# Specific package
npm run build --workspace=@lokascript/core
npm run build --workspace=@lokascript/semantic

# Browser bundles
npm run build:browser --prefix packages/core
npm run build:browser --prefix packages/i18n

# Full verification
npm run build && npm run typecheck && npm test
```

## Build Architecture

### Package Types

1. **TypeScript Packages** (most packages)
   - Built with `tsup` or `tsc`
   - Output: `dist/*.js`, `dist/*.d.ts`
   - Examples: semantic, vite-plugin, ast-toolkit

2. **Browser Bundles** (core, i18n, behaviors)
   - Built with `rollup`
   - Output: Multiple bundle sizes and formats
   - Examples: hyperfixi-browser.js, hyperfixi-i18n.min.js

3. **Hybrid Packages** (core, i18n)
   - Build both TypeScript AND browser bundles
   - Two-step process

## Standard Workflows

### 1. After Modifying Source Code

**Single Package Changed:**

```bash
# Example: Modified @lokascript/core
cd packages/core
npm run build              # Builds TypeScript + browser bundles
npm run typecheck          # Verify types
npm test                   # Run tests
```

**Multiple Packages Changed:**

```bash
# From project root
npm run build              # Rebuild all packages
npm run typecheck          # Check all packages
npm test                   # Test all packages
```

### 2. After Modifying Core Runtime

The `@lokascript/core` package is special - it has many browser bundles:

```bash
cd packages/core

# Quick rebuild (default bundle)
npm run build:browser

# Rebuild specific bundles
npm run build:browser:lite
npm run build:browser:minimal
npm run build:browser:standard
npm run build:browser:hybrid-complete
npm run build:browser:hybrid-hx

# Rebuild ALL browser bundles (slow, ~2-3 minutes)
npm run build:browser:all
```

**When to rebuild each:**

- **lite/lite-plus**: Changed command implementations used in lite bundles
- **hybrid-complete/hybrid-hx**: Changed parser, expressions, or block commands
- **minimal/standard**: Changed core commands or expressions
- **browser (full)**: Any changes to core runtime
- **multilingual**: Changes to multilingual API or i18n integration

### 3. After Modifying Semantic Parser

```bash
cd packages/semantic
npm run build              # Rebuilds all semantic bundles

# Specific language bundles (if needed)
npm run build:browser      # Main bundle
```

### 4. After Modifying i18n/Grammar

```bash
cd packages/i18n
npm run build              # Rebuilds TypeScript + browser bundle
npm run build:browser      # Browser bundle only
```

### 5. After Modifying Vite Plugin

```bash
cd packages/vite-plugin
npm run build              # Rebuild plugin
```

## Full Rebuild (Nuclear Option)

When in doubt or after major changes:

```bash
# From project root

# 1. Clean everything
npm run clean              # Removes all dist/, node_modules
npm run clean:test         # Removes test outputs

# 2. Reinstall dependencies
npm install

# 3. Rebuild everything
npm run build              # All packages

# 4. Verify
npm run typecheck          # All TypeScript
npm test                   # All tests

# 5. Browser-specific rebuilds (if needed)
npm run build:browser --prefix packages/core
npm run build:browser --prefix packages/i18n
```

Time estimate: 3-5 minutes depending on machine

## Pre-Publication Workflow

Before publishing to npm:

```bash
# 1. Ensure clean state
git status                           # Should be clean

# 2. Full rebuild
npm run clean && npm install
npm run build

# 3. Validate
npm run version:validate             # Check version consistency
npm run changelog:validate           # Check changelog
npm run typecheck                    # Type checking
npm test                             # All tests

# 4. Dry-run publish (optional)
cd packages/core && npm publish --dry-run
cd ../semantic && npm publish --dry-run

# 5. Ready to publish!
npm run release:publish
```

## Build Dependencies

### Package Build Order

Most packages can build in parallel, but some have dependencies:

```
@lokascript/core (no dependencies)
├── @lokascript/semantic (depends on core)
├── @lokascript/i18n (depends on core)
├── @lokascript/vite-plugin (depends on core)
├── @lokascript/behaviors (depends on core)
└── @lokascript/testing-framework (depends on core, semantic)
```

**Important**: `npm run build` handles this automatically via workspace dependencies.

## Troubleshooting

### Build Errors

**"Cannot find module '@lokascript/core'"**

- Core package not built yet
- Solution: `npm run build --workspace=@lokascript/core`

**"Type errors in packages/semantic"**

- Core types not generated
- Solution: `npm run build:types --prefix packages/core`

**"Rollup error in browser bundle"**

- Missing dependencies or TypeScript errors
- Solution: Check `npm run typecheck`, then rebuild

### Bundle Size Regressions

After changes, check bundle sizes:

```bash
cd packages/core
ls -lh dist/hyperfixi-*.js

# Expected sizes (gzipped):
# lite:             ~1.9 KB
# lite-plus:        ~2.6 KB
# hybrid-complete:  ~7.3 KB
# hybrid-hx:        ~9.5 KB
# minimal:          ~58 KB
# standard:         ~63 KB
# browser (full):   ~203 KB
```

If sizes increased significantly, investigate:

1. New dependencies added?
2. Dead code elimination working?
3. Tree-shaking configured correctly?

## Quick Commands Cheat Sheet

```bash
# Build
npm run build                                    # All packages
npm run build --workspace=@lokascript/core      # Single package
npm run build:browser --prefix packages/core    # Browser bundles

# Validate
npm run typecheck                                # All TypeScript
npm run changelog:validate                       # Changelog check
npm run version:validate                         # Version consistency

# Test
npm test                                         # All tests
npm run test:core                               # Core only
npm run test:semantic                           # Semantic only
npm run test:integration                        # Integration tests

# Clean
npm run clean                                    # Everything
npm run clean:test                              # Test outputs only

# Pre-publish
npm run prepublishOnly                          # Full validation

# Publish
npm run release:publish                         # Publish all packages
```

## Development Mode

For active development with auto-rebuild:

```bash
# Core package - watch mode
cd packages/core
npm run dev                    # Auto-rebuild on changes

# Test in watch mode
npm run test:watch

# Run local dev server
npm run dev                    # Serves examples on http://localhost:3000
```

## CI/CD Integration

The build workflow is suitable for CI/CD:

```yaml
# Example GitHub Actions workflow
- name: Install dependencies
  run: npm install

- name: Build all packages
  run: npm run build

- name: Type check
  run: npm run typecheck

- name: Run tests
  run: npm test

- name: Validate versions
  run: npm run version:validate

- name: Validate changelog
  run: npm run changelog:validate
```

## Post-Build Verification

After any build, verify:

1. **TypeScript outputs exist:**

   ```bash
   ls packages/core/dist/*.d.ts
   ls packages/semantic/dist/*.d.ts
   ```

2. **Browser bundles exist:**

   ```bash
   ls packages/core/dist/hyperfixi-*.js
   ls packages/i18n/dist/hyperfixi-i18n*.js
   ```

3. **No build errors in logs**

4. **Bundle sizes reasonable** (see troubleshooting section)

## Advanced: Custom Bundles

Generate custom minimal bundles:

```bash
cd packages/core

# From config file
npm run generate:bundle -- --config bundle-configs/my-app.config.json

# From command line
npm run generate:bundle -- --commands toggle,add,remove --output src/custom-bundle.ts

# Then build it
npm run build:browser
```

See [bundle-configs/README.md](packages/core/bundle-configs/README.md) for details.

---

**Last Updated**: 2026-01-19
**Status**: ✅ Verified for v1.0.0
