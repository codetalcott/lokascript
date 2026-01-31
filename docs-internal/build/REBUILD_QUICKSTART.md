# Rebuild Quick Start

## Most Common Commands

```bash
# Standard rebuild after code changes
npm run build                          # Build all packages

# Full rebuild with validation
npm run rebuild:full                   # Build + typecheck + test + validate

# Quick rebuild (skip tests)
npm run rebuild:fast                   # Build + typecheck + validate

# Clean rebuild
npm run rebuild:clean                  # Clean + build + validate
```

## By Package Type

### Core Package (main runtime)

```bash
cd packages/core
npm run build                          # Build everything
npm run build:browser                  # Browser bundles only
npm run build:types                    # TypeScript types only
```

### Semantic Package (multilingual parsing)

```bash
cd packages/semantic
npm run build                          # Build all bundles
```

### I18n Package (grammar transformation)

```bash
cd packages/i18n
npm run build                          # Build TypeScript + browser
npm run build:browser                  # Browser bundle only
```

### Other Packages

```bash
npm run build --workspace=@lokascript/PACKAGE_NAME
```

## When to Rebuild

| Change Type                | Command                                         | Time  |
| -------------------------- | ----------------------------------------------- | ----- |
| Single package code change | `npm run build --workspace=@lokascript/PACKAGE` | ~10s  |
| Multiple packages changed  | `npm run build`                                 | ~30s  |
| Core runtime changed       | `cd packages/core && npm run build`             | ~20s  |
| Browser bundles needed     | `npm run build:browser --prefix packages/core`  | ~15s  |
| Full validation needed     | `npm run rebuild:full`                          | ~2min |
| Before publishing          | `npm run prepublishOnly`                        | ~3min |

## Verification After Rebuild

```bash
# Quick verification
ls packages/core/dist/*.js             # Check bundles exist
npm run typecheck                      # Check types
npm test                               # Run tests

# Full verification
npm run rebuild:full                   # Everything
```

## Troubleshooting

**Build fails with "Cannot find module"**

```bash
npm run build --workspace=@lokascript/core  # Build dependency first
```

**Old files not updating**

```bash
npm run clean:test                     # Clean test outputs
npm run build                          # Rebuild
```

**Bundle sizes wrong**

```bash
cd packages/core
npm run build:browser:all              # Rebuild all bundles
```

## Pre-Publication Checklist

```bash
# 1. Clean rebuild
npm run rebuild:clean

# 2. Validate everything
npm run prepublishOnly

# 3. Check output
npm run packages:list:public           # Show packages
npm run version:validate               # Check versions
npm run changelog:validate             # Check changelog

# 4. Ready!
npm run release:publish
```

See [REBUILD_WORKFLOW.md](REBUILD_WORKFLOW.md) for complete documentation.
