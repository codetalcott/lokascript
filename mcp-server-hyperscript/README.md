# MCP Server for Hyperscript

This Model Context Protocol (MCP) server provides AI assistants with tools to understand, generate, and work with hyperscript code.

## Features

### Tools

1. **analyze_hyperscript** - Analyze hyperscript code for errors, warnings, and suggestions
2. **generate_hyperscript** - Generate hyperscript from natural language descriptions
3. **convert_to_hyperscript** - Convert jQuery/vanilla JS/React to hyperscript
4. **translate_hyperscript** - Translate hyperscript between languages (i18n)
5. **generate_tests** - Generate test suites for hyperscript behaviors

### Resources

- **hyperscript://docs/commands** - Command reference documentation
- **hyperscript://docs/expressions** - Expression syntax guide
- **hyperscript://examples** - Common patterns and examples
- **hyperscript://i18n/dictionaries** - Translation dictionaries

## Installation

### For Claude Desktop

1. Build the server:
```bash
npm install
npm run build
```

2. Add to Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json`):
```json
{
  "mcpServers": {
    "hyperscript": {
      "command": "node",
      "args": ["/path/to/mcp-server-hyperscript/dist/index.js"]
    }
  }
}
```

3. Restart Claude Desktop

### For Development

```bash
npm install
npm run dev
```

## Usage Examples

### Analyzing Hyperscript

Ask Claude: "Analyze this hyperscript code for issues"

```hyperscript
on click
  if me.classList.contains('active')
    remove .active from me
  else
    add .active to me
  end
```

### Generating Hyperscript

Ask Claude: "Generate hyperscript that toggles a dropdown menu on click"

### Converting Code

Ask Claude: "Convert this jQuery to hyperscript"

```javascript
$('.button').on('click', function() {
  $(this).toggleClass('active');
  $('#menu').slideToggle();
});
```

### Multi-Language Support

Ask Claude: "Translate this Spanish hyperscript to Korean"

```hyperscript
en clic
  alternar .activo en yo
  si yo matches .activo
    mostrar #menu
  sino
    ocultar #menu
  fin
```

## Architecture

The server is built with:
- TypeScript for type safety
- @modelcontextprotocol/sdk for MCP implementation
- @hyperfixi/core for hyperscript parsing and analysis

## Development

### Testing

```bash
npm test
```

### Adding New Tools

1. Add tool definition in `setupHandlers()`
2. Implement handler method
3. Update tests
4. Update documentation

## Contributing

See the main Hyperfixi contributing guide.

## License

MIT
