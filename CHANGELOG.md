# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Tracking unreleased changes here

## [1.0.0] - 2026-01-19

### Added

- **Initial Release**: First public release of LokaScript
- **Core Package** (@lokascript/core): Full hyperscript runtime with 43 commands
- **Semantic Package** (@lokascript/semantic): Multilingual parsing for 23 languages
- **I18n Package** (@lokascript/i18n): Grammar transformation for SOV/VSO/SVO word orders
- **Vite Plugin** (@lokascript/vite-plugin): Zero-config Vite integration
- **MCP Server** (@lokascript/mcp-server): Model Context Protocol server for LLM integration
- **Browser Bundles**: 7 size-optimized bundles (lite, lite-plus, hybrid-complete, hybrid-hx, minimal, standard, full)
- **23 Language Support**: English, Spanish, Japanese, Korean, Arabic, Chinese, French, German, Portuguese, Indonesian, Turkish, Swahili, Quechua, and more
- **4046 Tests**: Comprehensive test suite with >95% coverage
- **Etymology**: "LokaScript" from Sanskrit "loka" (world/realm/universe) reflecting multilingual scope

### Changed

- **Rebrand**: Project renamed from HyperFixi to LokaScript
- **NPM Organization**: Published under @lokascript/\* scope
- **Browser API**: Primary global changed to window.lokascript (with window.hyperfixi backward compatibility)
- **Lifecycle Events**: Renamed to lokascript:_ prefix (dual dispatch with hyperfixi:_ for compatibility)

### Fixed

- Workspace dependency resolution using wildcard versions (\*)
- TypeScript compilation across all 20+ packages
- Build system for browser bundles

### Backward Compatibility

- window.hyperfixi available as deprecated alias to window.lokascript
- hyperfixi:_ events still dispatched alongside lokascript:_ events
- File names kept for compatibility (e.g., hyperfixi-browser.js)

### Documentation

- Complete rebrand of all README files
- Updated CLAUDE.md with project context
- NPM organization setup guide
- Version management documentation

### Security

- npm access token stored in GitHub Secrets
- 2FA recommended for npm organization

---

## Version History

### Versioning Strategy

All @lokascript/\* packages are released together with synchronized versions:

- **1.0.0**: Initial public release (2026-01-19)

### Compatibility Promise

- All packages at the same version are tested together
- Mixing versions (e.g., core@1.0.0 + i18n@1.1.0) is not supported
- Always upgrade all packages together

### Breaking Changes Policy

We follow [Semantic Versioning](https://semver.org/):

- **Major (2.0.0)**: Breaking API changes, upgrade guide provided
- **Minor (1.1.0)**: New features, fully backward compatible
- **Patch (1.0.1)**: Bug fixes only

---

[Unreleased]: https://github.com/codetalcott/lokascript/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/codetalcott/lokascript/releases/tag/v1.0.0
