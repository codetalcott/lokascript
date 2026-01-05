# Repository Organization

This document provides an overview of the HyperFixi monorepo structure and organization.

## 📁 Directory Structure

```
hyperfixi/                           # Monorepo root
├── packages/                        # Publishable packages
│   ├── core/                        # @hyperfixi/core - Pure hyperscript engine
│   ├── i18n/                        # @hyperfixi/i18n - 13-language i18n
│   └── semantic/                    # @hyperfixi/semantic - Semantic parsing
├── apps/                            # Applications and demos
│   ├── docs-site/                   # Documentation website (planned)
│   └── patterns-browser/            # Pattern reference browser
├── docs/                            # Documentation
│   └── archive/                     # Historical development docs
├── roadmap/                         # Development planning
├── tools/                           # Development utilities
│   ├── debug/                       # Debug scripts and test files
│   ├── legacy/                      # Original research files
│   ├── build/                       # Shared build tools (planned)
│   └── testing/                     # Shared test utilities (planned)
├── package.json                     # Workspace configuration
├── lerna.json                       # Monorepo management
└── README.md                        # Project overview
```

## 📦 Packages

### Core Package (`@hyperfixi/core`)
- **Purpose**: Pure hyperscript expression evaluation engine
- **Size**: ~224KB (39% reduction from original)
- **Dependencies**: None
- **Features**: Parser, runtime, DOM manipulation, htmx compatibility, error handling

### i18n Package (`@hyperfixi/i18n`)
- **Purpose**: Grammar transformation for 13 languages
- **Size**: ~68KB gzipped
- **Dependencies**: `@hyperfixi/core`
- **Features**: SOV/VSO word order, agglutinative suffixes, native keyword support

### Semantic Package (`@hyperfixi/semantic`)
- **Purpose**: Semantic-first multilingual parsing
- **Size**: ~61KB gzipped (all 13 languages)
- **Dependencies**: None (standalone)
- **Features**: Language-specific tokenizers, confidence scoring, pattern matching

## 🛠️ Development Tools

### Debug Tools (`tools/debug/`)
Development debugging utilities from active development:
- Parser debugging scripts
- Browser-based test files
- Event handler debugging
- Test failure analysis tools

### Legacy Files (`tools/legacy/`)
Historical files preserved for reference:
- Original _hyperscript library files
- Database with hyperscript patterns
- JSON data files with commands/expressions
- Research and extraction tools

### Build Tools (`tools/build/`)
Shared build utilities (planned):
- Rollup configurations
- TypeScript compilation settings
- ESLint and Prettier configurations

### Testing Tools (`tools/testing/`)
Shared testing utilities (planned):
- Cross-package integration helpers
- Mock data generators
- Performance testing utilities

## 📚 Documentation

### Active Documentation (`docs/`)
- **README.md** - Documentation overview and navigation
- **Archive** - Historical implementation and design documents

### Package Documentation
- **Core**: `packages/core/docs/` - API reference, examples, coverage
- **i18n**: `packages/i18n/README.md` - Internationalization guide
- **Semantic**: `packages/semantic/README.md` - Semantic parsing documentation

### Development Planning (`roadmap/`)
- **README.md** - Current roadmap and phase status
- **plan.md** - Detailed development context and planning
- **considerations.md** - Technical decisions and architecture
- **syntax.md** - Language design and patterns
- **sketch.md** - Original project concept (historical)

## 🚀 Applications

### Examples Gallery (`examples/`)

Interactive testing environment for hyperscript expressions:

- Real-time expression evaluation
- Feature demonstrations
- Multilingual demos
- HTMX-like patterns

### Documentation Site (`apps/docs-site/`)
Future comprehensive documentation website:
- API documentation
- Interactive examples
- Tutorials and guides
- Performance benchmarks

### Patterns Browser (`apps/patterns-browser/`)

Pattern reference application:

- Searchable pattern database
- Translation examples
- LLM integration demos

## 🔧 Configuration Files

### Root Configuration
- **package.json** - Workspace and dependency management
- **lerna.json** - Monorepo version management and publishing
- **.gitignore** - Version control exclusions
- **CLAUDE.md** - AI development context and guidelines

### Package Configuration
Each package contains:
- **package.json** - Package-specific configuration
- **tsconfig.json** - TypeScript compilation settings
- **rollup.config.mjs** - Build configuration
- **vitest.config.ts** - Testing configuration

## 📋 File Organization Principles

### Clean Separation
- **Packages**: Publishable, production-ready code
- **Apps**: Development and demonstration tools
- **Tools**: Development utilities and historical files
- **Docs**: Documentation and planning

### Historical Preservation
- Debug files preserved in `tools/debug/` for reference
- Original research files in `tools/legacy/`
- Development history in `docs/archive/`

### Future Extensibility
- Framework integrations can be added as new packages
- Additional apps for specialized tools
- Plugin system through package structure

## 🎯 Benefits of This Organization

### Developer Experience
- Clear separation of concerns
- Easy navigation and discovery
- Comprehensive documentation
- Interactive testing environment

### Maintainability  
- Modular architecture
- Historical context preservation
- Clear development workflow
- Automated tooling support

### Scalability
- Independent package versioning
- Tree-shakable modules
- Plugin-ready architecture
- Framework integration points

This organization supports the project's evolution from a research prototype to a production-ready, modular hyperscript ecosystem.