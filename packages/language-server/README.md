# @lokascript/language-server

Language Server Protocol (LSP) implementation for LokaScript/hyperscript with support for 21 human languages.

## Features

- **Diagnostics**: Real-time error detection and warnings
- **Completions**: Context-aware keyword and selector suggestions
- **Hover**: Documentation on hover for commands and keywords
- **Document Symbols**: Outline view showing event handlers, behaviors, and functions
- **Code Actions**: Quick fixes for common issues
- **Multilingual**: Works with hyperscript written in any of 21 supported languages

## Supported Languages

The language server supports hyperscript written in:

en (English), es (Spanish), pt (Portuguese), fr (French), de (German), it (Italian), ru (Russian), pl (Polish), uk (Ukrainian), ja (Japanese), ko (Korean), zh (Chinese), ar (Arabic), he (Hebrew), tr (Turkish), id (Indonesian), ms (Malay), th (Thai), vi (Vietnamese), tl (Tagalog), sw (Swahili)

## Installation

```bash
npm install @lokascript/language-server
```

## Usage

### As a standalone server

```bash
# Start with stdio transport (default)
npx lokascript-language-server --stdio

# Or run directly
node dist/server.js --stdio
```

### With VS Code

Use the companion extension `lokascript-vscode` which automatically starts this server.

### With other editors

Configure your editor's LSP client to start the language server with stdio transport.

#### Neovim (nvim-lspconfig)

```lua
require('lspconfig.configs').lokascript = {
  default_config = {
    cmd = { 'npx', 'lokascript-language-server', '--stdio' },
    filetypes = { 'html', 'hyperscript' },
    root_dir = function() return vim.loop.cwd() end,
  },
}
require('lspconfig').lokascript.setup{}
```

#### Emacs (lsp-mode)

```elisp
(lsp-register-client
 (make-lsp-client
  :new-connection (lsp-stdio-connection '("npx" "lokascript-language-server" "--stdio"))
  :activation-fn (lsp-activate-on "html" "hyperscript")
  :server-id 'lokascript))
```

## Configuration

The server accepts configuration via the LSP `workspace/configuration` mechanism:

```json
{
  "lokascript": {
    "language": "en",
    "maxDiagnostics": 100
  }
}
```

| Setting          | Default | Description                              |
| ---------------- | ------- | ---------------------------------------- |
| `language`       | `"en"`  | Primary language for keyword suggestions |
| `maxDiagnostics` | `100`   | Maximum diagnostics per file             |

## Dependencies

The language server works best with these optional peer dependencies installed:

- `@lokascript/semantic` - Enables 21-language support and semantic analysis
- `@lokascript/ast-toolkit` - Enables AST-based analysis and complexity metrics
- `@lokascript/core` - Enables full hyperscript parsing

Without these dependencies, the server falls back to pattern-based analysis (English only).

## Development

```bash
# Build
npm run build

# Run in development
npm run dev

# Type check
npm run typecheck

# Test
npm test
```

## License

MIT
