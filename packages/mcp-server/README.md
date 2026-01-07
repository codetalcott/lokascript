# @hyperfixi/mcp-server

MCP (Model Context Protocol) server for hyperscript development assistance. Provides 15 tools and 5 resources for code analysis, pattern lookup, validation, and LSP-compatible features.

## Installation

### From Source

```bash
cd packages/mcp-server
npm install
npm run build
```

### Using npx

```bash
npx @hyperfixi/mcp-server
```

## Claude Desktop Configuration

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "hyperfixi": {
      "command": "node",
      "args": ["/path/to/hyperfixi/packages/mcp-server/dist/index.js"]
    }
  }
}
```

Or if installed globally:

```json
{
  "mcpServers": {
    "hyperfixi": {
      "command": "hyperfixi-mcp"
    }
  }
}
```

## Available Tools (15)

### Validation Tools

| Tool | Description |
|------|-------------|
| `validate_hyperscript` | Validate syntax, detect errors and warnings |
| `suggest_command` | Suggest the best command for a task |
| `get_bundle_config` | Get recommended Vite plugin configuration |

### Pattern Tools

| Tool | Description |
|------|-------------|
| `get_examples` | Get few-shot examples for a task |
| `search_patterns` | Search pattern database |
| `translate_hyperscript` | Translate between 13 languages |
| `get_pattern_stats` | Get database statistics |

### Analysis Tools

| Tool | Description |
|------|-------------|
| `analyze_complexity` | Calculate cyclomatic, cognitive, Halstead metrics |
| `analyze_metrics` | Comprehensive code analysis |
| `explain_code` | Natural language code explanation |
| `recognize_intent` | Classify code purpose |

### LSP Bridge Tools

| Tool | Description |
|------|-------------|
| `get_diagnostics` | LSP-compatible error/warning diagnostics |
| `get_completions` | Context-aware code completions |
| `get_hover_info` | Hover documentation |
| `get_document_symbols` | Document outline symbols |

## Available Resources (5)

| URI | Description |
|-----|-------------|
| `hyperscript://docs/commands` | Command reference (markdown) |
| `hyperscript://docs/expressions` | Expression syntax guide |
| `hyperscript://docs/events` | Event handling reference |
| `hyperscript://examples/common` | Common patterns |
| `hyperscript://languages` | 13 supported languages (JSON) |

## Example Usage

### Validate Code

```
User: Validate this hyperscript: on click put 'hello into #output

Claude: [uses validate_hyperscript]
The code has an error: Unbalanced single quotes
```

### Suggest Commands

```
User: What hyperscript command should I use to show a modal?

Claude: [uses suggest_command]
Use the `show` command: show #modal with *opacity
```

### Get Examples

```
User: Show me examples of toggle patterns

Claude: [uses get_examples]
Here are examples:
- on click toggle .active
- on click toggle .open on #menu
```

### Translate

```
User: Translate "on click toggle .active" to Japanese

Claude: [uses translate_hyperscript]
Japanese: クリック で .active を トグル
```

## Optional Dependencies

For full functionality, install these peer dependencies:

```bash
npm install @hyperfixi/ast-toolkit @hyperfixi/patterns-reference @hyperfixi/semantic
```

Without these, the server uses built-in fallbacks with reduced functionality.

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Type check
npm run typecheck

# Build
npm run build
```

## License

MIT
