package hyperfixi

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// GinMiddlewareConfig represents configuration for the Gin middleware
type GinMiddlewareConfig struct {
	Client                *Client
	CompileOnResponse     bool
	TemplateVarsHeader    string
	CompilationOptions    *CompilationOptions
	ErrorHandler          func(*gin.Context, error)
	SkipPaths             []string
	OnlyContentTypes      []string
}

// DefaultGinMiddlewareConfig returns a default Gin middleware configuration
func DefaultGinMiddlewareConfig(client *Client) *GinMiddlewareConfig {
	return &GinMiddlewareConfig{
		Client:                client,
		CompileOnResponse:     true,
		TemplateVarsHeader:    "X-Hyperscript-Template-Vars",
		CompilationOptions:    &CompilationOptions{},
		ErrorHandler:          defaultGinErrorHandler,
		SkipPaths:             []string{"/api/", "/static/"},
		OnlyContentTypes:      []string{"text/html"},
	}
}

// defaultGinErrorHandler is the default error handler for the middleware
func defaultGinErrorHandler(c *gin.Context, err error) {
	// Log the error but don't break the response
	gin.DefaultWriter.Write([]byte(fmt.Sprintf("HyperFixi middleware error: %v\n", err)))
}

// GinMiddleware returns a Gin middleware that automatically compiles hyperscript in HTML responses
func GinMiddleware(config *GinMiddlewareConfig) gin.HandlerFunc {
	if config == nil {
		panic("GinMiddlewareConfig cannot be nil")
	}
	if config.Client == nil {
		panic("Client cannot be nil in GinMiddlewareConfig")
	}

	return func(c *gin.Context) {
		// Add client to context for use in handlers
		c.Set("hyperfixi", config.Client)

		// Parse template variables from header
		var templateVars map[string]interface{}
		if headerValue := c.GetHeader(config.TemplateVarsHeader); headerValue != "" {
			if err := json.Unmarshal([]byte(headerValue), &templateVars); err == nil {
				c.Set("hyperfixi_template_vars", templateVars)
			}
		}

		if !config.CompileOnResponse {
			c.Next()
			return
		}

		// Check if we should skip this path
		path := c.Request.URL.Path
		for _, skipPath := range config.SkipPaths {
			if strings.HasPrefix(path, skipPath) {
				c.Next()
				return
			}
		}

		// Use a custom response writer to capture the response
		writer := &responseWriter{
			ResponseWriter: c.Writer,
			body:          &strings.Builder{},
		}
		c.Writer = writer

		c.Next()

		// Check if response should be processed
		if !shouldProcessResponse(writer, config.OnlyContentTypes) {
			return
		}

		// Compile hyperscript in the response
		originalBody := writer.body.String()
		compiledBody, err := compileHyperscriptInHTML(c.Request.Context(), config.Client, originalBody, templateVars, config.CompilationOptions)
		if err != nil {
			config.ErrorHandler(c, err)
			return
		}

		// Write the compiled response
		writer.ResponseWriter.Header().Set("Content-Length", fmt.Sprintf("%d", len(compiledBody)))
		writer.ResponseWriter.WriteString(compiledBody)
	}
}

// responseWriter captures the response body
type responseWriter struct {
	gin.ResponseWriter
	body *strings.Builder
}

func (w *responseWriter) Write(data []byte) (int, error) {
	w.body.Write(data)
	return len(data), nil
}

func (w *responseWriter) WriteString(s string) (int, error) {
	w.body.WriteString(s)
	return len(s), nil
}

// shouldProcessResponse checks if the response should be processed for hyperscript compilation
func shouldProcessResponse(w *responseWriter, onlyContentTypes []string) bool {
	if w.ResponseWriter.Status() >= 400 {
		return false
	}

	contentType := w.ResponseWriter.Header().Get("Content-Type")
	if contentType == "" {
		return false
	}

	for _, allowedType := range onlyContentTypes {
		if strings.HasPrefix(contentType, allowedType) {
			return true
		}
	}

	return false
}

// compileHyperscriptInHTML finds hyperscript attributes in HTML and compiles them
func compileHyperscriptInHTML(ctx context.Context, client *Client, html string, templateVars map[string]interface{}, options *CompilationOptions) (string, error) {
	// Find all hyperscript attributes
	hyperscriptPattern := regexp.MustCompile(`(?:_|data-hs)="([^"]*)"`)
	matches := hyperscriptPattern.FindAllStringSubmatch(html, -1)

	if len(matches) == 0 {
		return html, nil
	}

	// Create scripts map
	scripts := make(map[string]string)
	for i, match := range matches {
		if len(match) > 1 {
			scripts[fmt.Sprintf("script_%d", i)] = match[1]
		}
	}

	// Compile scripts
	parseContext := &ParseContext{}
	if templateVars != nil {
		parseContext.TemplateVars = templateVars
	}

	req := &CompileRequest{
		Scripts: scripts,
		Options: options,
		Context: parseContext,
	}

	result, err := client.Compile(ctx, req)
	if err != nil {
		// If compilation fails, return original HTML
		return html, nil
	}

	// Replace hyperscript with compiled JavaScript
	compiledHTML := html
	for i, match := range matches {
		if len(match) > 1 {
			scriptID := fmt.Sprintf("script_%d", i)
			if compiled, exists := result.Compiled[scriptID]; exists {
				oldAttr := match[0] // Full match like _="on click toggle .active"
				newAttr := fmt.Sprintf(`onclick="%s"`, compiled)
				compiledHTML = strings.Replace(compiledHTML, oldAttr, newAttr, 1)
			}
		}
	}

	return compiledHTML, nil
}

// GinHelpers provides helper functions for Gin templates
type GinHelpers struct {
	client *Client
}

// NewGinHelpers creates new Gin template helpers
func NewGinHelpers(client *Client) *GinHelpers {
	return &GinHelpers{client: client}
}

// CompileHyperscript compiles hyperscript and returns an onclick attribute
func (h *GinHelpers) CompileHyperscript(script string, templateVars map[string]interface{}) string {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	compiled, _, err := h.client.CompileScript(ctx, script, nil)
	if err != nil {
		return fmt.Sprintf(`onclick="/* HyperFixi compilation error: %v */"`, err)
	}

	return fmt.Sprintf(`onclick="%s"`, compiled)
}

// CompileHyperscriptWithOptions compiles hyperscript with custom options
func (h *GinHelpers) CompileHyperscriptWithOptions(script string, templateVars map[string]interface{}, options *CompilationOptions) string {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	parseContext := &ParseContext{}
	if templateVars != nil {
		parseContext.TemplateVars = templateVars
	}

	req := &CompileRequest{
		Scripts: map[string]string{"template_script": script},
		Options: options,
		Context: parseContext,
	}

	result, err := h.client.Compile(ctx, req)
	if err != nil {
		return fmt.Sprintf(`onclick="/* HyperFixi compilation error: %v */"`, err)
	}

	if compiled, exists := result.Compiled["template_script"]; exists {
		return fmt.Sprintf(`onclick="%s"`, compiled)
	}

	return `onclick="/* HyperFixi compilation failed */"`
}

// ValidateHyperscript validates hyperscript syntax
func (h *GinHelpers) ValidateHyperscript(script string) bool {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	valid, _, err := h.client.ValidateScript(ctx, script)
	if err != nil {
		return false
	}

	return valid
}

// SetupGinRoutes adds hyperscript compilation routes to a Gin router
func SetupGinRoutes(router *gin.Engine, client *Client, basePath string) {
	if basePath == "" {
		basePath = "/hyperscript"
	}

	group := router.Group(basePath)

	// Compile endpoint
	group.POST("/compile", func(c *gin.Context) {
		var req CompileRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		result, err := client.Compile(c.Request.Context(), &req)
		if err != nil {
			if clientErr, ok := err.(*ClientError); ok && clientErr.StatusCode == 400 {
				c.JSON(http.StatusBadRequest, gin.H{"error": clientErr.Message})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Compilation failed"})
			return
		}

		c.JSON(http.StatusOK, result)
	})

	// Validate endpoint
	group.POST("/validate", func(c *gin.Context) {
		var req ValidateRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		result, err := client.Validate(c.Request.Context(), &req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Validation failed"})
			return
		}

		c.JSON(http.StatusOK, result)
	})

	// Batch compile endpoint
	group.POST("/batch", func(c *gin.Context) {
		var req BatchCompileRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
			return
		}

		result, err := client.BatchCompile(c.Request.Context(), &req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Batch compilation failed"})
			return
		}

		c.JSON(http.StatusOK, result)
	})

	// Health endpoint
	group.GET("/health", func(c *gin.Context) {
		result, err := client.Health(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusServiceUnavailable, gin.H{"error": "Service unavailable"})
			return
		}

		c.JSON(http.StatusOK, result)
	})

	// Cache stats endpoint
	group.GET("/cache/stats", func(c *gin.Context) {
		result, err := client.CacheStats(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cache stats"})
			return
		}

		c.JSON(http.StatusOK, result)
	})

	// Clear cache endpoint
	group.POST("/cache/clear", func(c *gin.Context) {
		err := client.ClearCache(c.Request.Context())
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cache"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Cache cleared successfully"})
	})
}

// GetHyperfixiClient is a helper to get the client from Gin context
func GetHyperfixiClient(c *gin.Context) (*Client, bool) {
	client, exists := c.Get("hyperfixi")
	if !exists {
		return nil, false
	}
	
	hyperfixiClient, ok := client.(*Client)
	return hyperfixiClient, ok
}

// GetTemplateVars is a helper to get template variables from Gin context
func GetTemplateVars(c *gin.Context) (map[string]interface{}, bool) {
	vars, exists := c.Get("hyperfixi_template_vars")
	if !exists {
		return nil, false
	}
	
	templateVars, ok := vars.(map[string]interface{})
	return templateVars, ok
}