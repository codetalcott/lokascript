# Packages

LokaScript is organized as a monorepo with multiple packages. Each package can be used independently or together.

## Core Packages

| Package                                       | Description                                       | Size   |
| --------------------------------------------- | ------------------------------------------------- | ------ |
| [@lokascript/core](/en/packages/core)         | Main runtime, parser, and 43 commands             | 224 KB |
| [@lokascript/semantic](/en/packages/semantic) | Semantic-first multilingual parser (23 languages) | 61 KB  |
| [@lokascript/i18n](/en/packages/i18n)         | Grammar transformation (13 languages)             | 68 KB  |

## Build Tools

| Package                                             | Description                                              |
| --------------------------------------------------- | -------------------------------------------------------- |
| [@lokascript/vite-plugin](/en/packages/vite-plugin) | Zero-config Vite plugin with automatic bundle generation |

## Choosing Packages

### Web Project (Client-Side Only)

```bash
npm install @lokascript/core
```

Or use the Vite plugin for automatic optimization:

```bash
npm install @lokascript/core @lokascript/vite-plugin
```

### Multilingual Support

```bash
npm install @lokascript/core @lokascript/semantic @lokascript/i18n
```

## Bundle Comparison

All packages provide multiple bundle options:

```
Full Bundle (224 KB)
├── lokascript-browser.js         # All features
├── lokascript-multilingual.js    # i18n support (250 KB)
└── lokascript-semantic.browser.global.js  # Semantic parser (61 KB)

Lite Bundles
├── lokascript-lite.js            # 1.9 KB - 8 commands
├── lokascript-lite-plus.js       # 2.6 KB - 14 commands
├── lokascript-hybrid-complete.js # 6.7 KB - 21+ commands
└── lokascript-hybrid-hx.js       # 9.7 KB - htmx compatibility
```
