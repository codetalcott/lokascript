# LokaScript Go Client

A Go client library for [LokaScript](https://github.com/lokascript/lokascript) server-side hyperscript compilation, with native Gin integration and CLI tools.

## Features

- **HTTP Client** with retry logic and comprehensive error handling
- **Gin Middleware** for automatic hyperscript compilation in HTML responses
- **Template Helpers** for Gin templates with hyperscript support
- **CLI Tool** with Cobra framework for command-line operations
- **Context Support** for graceful request cancellation and timeouts
- **Template Variables** with `{{variable}}` substitution support
- **Type Safety** with comprehensive struct definitions
- **Testing** with full test coverage using testify

## Installation

```bash
go get github.com/lokascript/lokascript-go
```

## Quick Start

### Basic Client Usage

```go
package main

import (
    "context"
    "fmt"
    "log"

    "github.com/lokascript/lokascript-go"
)

func main() {
    // Create client with default configuration
    client, err := lokascript.NewDefaultClient()
    if err != nil {
        log.Fatal(err)
    }

    // Compile hyperscript
    scripts := map[string]string{
        "button": "on click toggle .active",
        "form":   "on submit fetch /api/save then put result into #status",
    }

    req := &lokascript.CompileRequest{
        Scripts: scripts,
        Options: &lokascript.CompilationOptions{
            Minify: true,
        },
    }

    ctx := context.Background()
    result, err := client.Compile(ctx, req)
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Compiled JavaScript: %s\n", result.Compiled["button"])
    fmt.Printf("Events detected: %v\n", result.Metadata["button"].Events)
}
```

### Custom Client Configuration

```go
config := &lokascript.ClientConfig{
    BaseURL:   "http://localhost:3000",
    Timeout:   30 * time.Second,
    Retries:   3,
    AuthToken: "your-auth-token",
    Headers: map[string]string{
        "X-Custom-Header": "value",
    },
}

client, err := lokascript.NewClient(config)
```

## Gin Integration

### Middleware Setup

```go
package main

import (
    "github.com/gin-gonic/gin"
    "github.com/lokascript/lokascript-go"
)

func main() {
    // Create LokaScript client
    client, err := lokascript.NewDefaultClient()
    if err != nil {
        panic(err)
    }

    // Create Gin router
    r := gin.Default()

    // Add LokaScript middleware
    config := lokascript.DefaultGinMiddlewareConfig(client)
    r.Use(lokascript.GinMiddleware(config))

    // Your routes will automatically compile hyperscript
    r.GET("/", func(c *gin.Context) {
        c.HTML(200, "index.html", gin.H{
            "title": "LokaScript Demo",
        })
    })

    r.Run(":8080")
}
```

### Template with Automatic Compilation

```html
<!-- templates/index.html -->
<!DOCTYPE html>
<html>
  <head>
    <title>{{.title}}</title>
  </head>
  <body>
    <!-- This hyperscript will be automatically compiled -->
    <button _="on click toggle .active">Toggle Active</button>

    <!-- This will also be compiled -->
    <form data-hs="on submit fetch /api/save then put result into #status">
      <input type="text" name="message" />
      <button type="submit">Save</button>
    </form>

    <div id="status"></div>
  </body>
</html>
```

### Advanced Middleware Configuration

```go
config := &lokascript.GinMiddlewareConfig{
    Client:                client,
    CompileOnResponse:     true,
    TemplateVarsHeader:    "X-Hyperscript-Template-Vars",
    CompilationOptions: &lokascript.CompilationOptions{
        Minify:        true,
        Compatibility: lokascript.CompatibilityModern,
    },
    SkipPaths:        []string{"/api/", "/static/"},
    OnlyContentTypes: []string{"text/html"},
    ErrorHandler: func(c *gin.Context, err error) {
        log.Printf("LokaScript error: %v", err)
    },
}

r.Use(lokascript.GinMiddleware(config))
```

### Template Helpers

```go
// Create template helpers
helpers := lokascript.NewGinHelpers(client)

// In your handler
r.GET("/user/:id", func(c *gin.Context) {
    userID := c.Param("id")

    // Compile hyperscript with template variables
    templateVars := map[string]interface{}{
        "userId": userID,
    }

    onclickAttr := helpers.CompileHyperscript(
        "on click fetch /api/users/{{userId}}",
        templateVars,
    )

    c.HTML(200, "user.html", gin.H{
        "userID":    userID,
        "onclick":   onclickAttr,
    })
})
```

### API Routes

```go
// Add LokaScript API routes to your Gin router
lokascript.SetupGinRoutes(r, client, "/hyperscript")

// This creates the following endpoints:
// POST /hyperscript/compile
// POST /hyperscript/validate
// POST /hyperscript/batch
// GET  /hyperscript/health
// GET  /hyperscript/cache/stats
// POST /hyperscript/cache/clear
```

### Using Client from Context

```go
r.GET("/compile-custom", func(c *gin.Context) {
    // Get LokaScript client from context
    client, exists := lokascript.GetHyperfixiClient(c)
    if !exists {
        c.JSON(500, gin.H{"error": "LokaScript client not available"})
        return
    }

    // Get template variables from context
    templateVars, _ := lokascript.GetTemplateVars(c)

    // Use client directly
    result, err := client.CompileScript(
        c.Request.Context(),
        "on click log 'Custom compilation'",
        nil,
    )
    if err != nil {
        c.JSON(500, gin.H{"error": err.Error()})
        return
    }

    c.JSON(200, gin.H{"compiled": result})
})
```

## Command Line Interface

### Installation

```bash
go install github.com/lokascript/lokascript-go/cmd/lokascript@latest
```

### Basic Usage

```bash
# Check service health
lokascript --url http://localhost:3000 health

# Compile hyperscript
lokascript compile "on click toggle .active"

# Multiple scripts
lokascript compile button="on click toggle .active" form="on submit halt"

# With options
lokascript --minify --compatibility legacy compile "on click log 'Hello'"

# Template variables
lokascript --template-vars '{"userId": 123}' compile "on click fetch /api/users/{{userId}}"

# Validate syntax
lokascript validate "on click toggle .active"

# Batch compilation
lokascript batch scripts.json

# Cache management
lokascript cache stats
lokascript cache clear
```

### Output Formats

```bash
# Default onclick format
lokascript compile "on click toggle .active"
# Output: onclick="document.addEventListener('click', ...)"

# JavaScript format
lokascript --output js compile "on click toggle .active"
# Output: document.addEventListener('click', ...)

# JSON format (full response)
lokascript --output json compile "on click toggle .active"
```

### Batch File Format

```json
[
  {
    "id": "button",
    "script": "on click toggle .active",
    "options": {
      "minify": true,
      "compatibility": "modern"
    },
    "context": {
      "templateVars": {
        "userId": 123
      }
    }
  },
  {
    "id": "form",
    "script": "on submit fetch /api/save",
    "options": {
      "minify": false
    }
  }
]
```

## API Reference

### Client Methods

```go
// Core compilation methods
func (c *Client) Compile(ctx context.Context, req *CompileRequest) (*CompileResponse, error)
func (c *Client) CompileScript(ctx context.Context, script string, options *CompilationOptions) (string, *ScriptMetadata, error)
func (c *Client) CompileWithTemplateVars(ctx context.Context, scripts map[string]string, templateVars map[string]interface{}, options *CompilationOptions) (*CompileResponse, error)

// Validation methods
func (c *Client) Validate(ctx context.Context, req *ValidateRequest) (*ValidateResponse, error)
func (c *Client) ValidateScript(ctx context.Context, script string) (bool, []CompilationError, error)

// Batch processing
func (c *Client) BatchCompile(ctx context.Context, req *BatchCompileRequest) (*CompileResponse, error)

// Service management
func (c *Client) Health(ctx context.Context) (*HealthStatus, error)
func (c *Client) CacheStats(ctx context.Context) (*CacheStats, error)
func (c *Client) ClearCache(ctx context.Context) error
```

### Types

```go
type CompilationOptions struct {
    Minify        bool              `json:"minify,omitempty"`
    Compatibility CompatibilityMode `json:"compatibility,omitempty"`
    SourceMap     bool              `json:"sourceMap,omitempty"`
    Optimization  bool              `json:"optimization,omitempty"`
    TemplateVars  map[string]interface{} `json:"templateVars,omitempty"`
}

type ParseContext struct {
    TemplateVars     map[string]interface{} `json:"templateVars,omitempty"`
    SourceLocale     string                 `json:"sourceLocale,omitempty"`
    TargetLocale     string                 `json:"targetLocale,omitempty"`
    PreserveOriginal bool                   `json:"preserveOriginal,omitempty"`
}

type ScriptMetadata struct {
    Complexity        int      `json:"complexity"`
    Dependencies      []string `json:"dependencies"`
    Selectors         []string `json:"selectors"`
    Events            []string `json:"events"`
    Commands          []string `json:"commands"`
    TemplateVariables []string `json:"templateVariables"`
}
```

## Error Handling

```go
result, err := client.Compile(ctx, req)
if err != nil {
    var clientErr *lokascript.ClientError
    if errors.As(err, &clientErr) {
        fmt.Printf("Client error (status %d): %s\n", clientErr.StatusCode, clientErr.Message)
        if clientErr.StatusCode >= 400 && clientErr.StatusCode < 500 {
            // Handle client error (bad request, etc.)
        } else {
            // Handle server error
        }
    } else {
        // Handle other errors (network, timeout, etc.)
        fmt.Printf("Request failed: %v\n", err)
    }
}

// Check compilation errors
if len(result.Errors) > 0 {
    fmt.Println("Compilation errors:")
    for _, err := range result.Errors {
        fmt.Printf("  Line %d: %s\n", err.Line, err.Message)
    }
}
```

## Template Variables

All methods support template variable substitution:

```go
// Variables are processed before compilation
templateVars := map[string]interface{}{
    "userId":    123,
    "apiUrl":    "/api/v1",
    "className": "btn-primary",
}

result, err := client.CompileWithTemplateVars(ctx,
    map[string]string{
        "script": "on click fetch {{apiUrl}}/users/{{userId}} then add .{{className}}",
    },
    templateVars,
    nil,
)
// Results in: "on click fetch /api/v1/users/123 then add .btn-primary"
```

## Testing

Run the test suite:

```bash
go test -v ./...
go test -race -coverprofile=coverage.out ./...
go tool cover -html=coverage.out
```

## Examples

### Complete Gin Application

```go
package main

import (
    "log"
    "net/http"

    "github.com/gin-gonic/gin"
    "github.com/lokascript/lokascript-go"
)

func main() {
    // Initialize LokaScript client
    client, err := lokascript.NewDefaultClient()
    if err != nil {
        log.Fatal("Failed to create LokaScript client:", err)
    }

    // Create Gin router
    r := gin.Default()

    // Load HTML templates
    r.LoadHTMLGlob("templates/*")

    // Add LokaScript middleware
    config := lokascript.DefaultGinMiddlewareConfig(client)
    config.CompilationOptions.Minify = true
    r.Use(lokascript.GinMiddleware(config))

    // Add LokaScript API routes
    lokascript.SetupGinRoutes(r, client, "/hyperscript")

    // Main page
    r.GET("/", func(c *gin.Context) {
        c.HTML(http.StatusOK, "index.html", gin.H{
            "title": "LokaScript Go Demo",
        })
    })

    // User page with template variables
    r.GET("/user/:id", func(c *gin.Context) {
        userID := c.Param("id")

        // Set template variables for hyperscript
        c.Header("X-Hyperscript-Template-Vars",
            fmt.Sprintf(`{"userId": "%s"}`, userID))

        c.HTML(http.StatusOK, "user.html", gin.H{
            "userID": userID,
        })
    })

    // Start server
    log.Println("Server starting on :8080")
    r.Run(":8080")
}
```

### Batch Processing

```go
func batchCompileExample(client *lokascript.Client) {
    ctx := context.Background()

    req := &lokascript.BatchCompileRequest{
        Definitions: []lokascript.ScriptDefinition{
            {
                ID:     "navigation",
                Script: "on click add .active to me then remove .active from siblings",
                Options: &lokascript.CompilationOptions{Minify: true},
            },
            {
                ID:     "modal",
                Script: "on click toggle .modal-open on body",
                Options: &lokascript.CompilationOptions{Minify: false},
            },
            {
                ID:     "form",
                Script: "on submit fetch /api/save then put result into #status",
                Context: &lokascript.ParseContext{
                    TemplateVars: map[string]interface{}{
                        "endpoint": "/api/save",
                    },
                },
            },
        },
    }

    result, err := client.BatchCompile(ctx, req)
    if err != nil {
        log.Fatal("Batch compilation failed:", err)
    }

    for id, compiled := range result.Compiled {
        fmt.Printf("%s: %s\n", id, compiled)
    }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass: `go test -v ./...`
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

- **Documentation**: [https://lokascript.dev/docs](https://lokascript.dev/docs)
- **Issues**: [GitHub Issues](https://github.com/lokascript/lokascript/issues)
- **Go Package**: [pkg.go.dev](https://pkg.go.dev/github.com/lokascript/lokascript-go)
