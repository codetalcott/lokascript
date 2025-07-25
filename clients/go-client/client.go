package hyperfixi

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"
)

// ClientError represents an error from the HyperFixi client
type ClientError struct {
	Message    string
	StatusCode int
	Err        error
}

func (e *ClientError) Error() string {
	if e.Err != nil {
		return fmt.Sprintf("hyperfixi client error (status %d): %s - %v", e.StatusCode, e.Message, e.Err)
	}
	return fmt.Sprintf("hyperfixi client error (status %d): %s", e.StatusCode, e.Message)
}

func (e *ClientError) Unwrap() error {
	return e.Err
}

// ClientConfig represents configuration for the HyperFixi client
type ClientConfig struct {
	BaseURL    string
	Timeout    time.Duration
	Retries    int
	AuthToken  string
	Headers    map[string]string
	HTTPClient *http.Client
}

// DefaultClientConfig returns a default client configuration
func DefaultClientConfig() *ClientConfig {
	return &ClientConfig{
		BaseURL: "http://localhost:3000",
		Timeout: 30 * time.Second,
		Retries: 3,
		Headers: make(map[string]string),
	}
}

// Client represents a HyperFixi HTTP client
type Client struct {
	config     *ClientConfig
	httpClient *http.Client
	baseURL    *url.URL
}

// NewClient creates a new HyperFixi client
func NewClient(config *ClientConfig) (*Client, error) {
	if config == nil {
		config = DefaultClientConfig()
	}

	baseURL, err := url.Parse(config.BaseURL)
	if err != nil {
		return nil, fmt.Errorf("invalid base URL: %w", err)
	}

	httpClient := config.HTTPClient
	if httpClient == nil {
		httpClient = &http.Client{
			Timeout: config.Timeout,
		}
	}

	return &Client{
		config:     config,
		httpClient: httpClient,
		baseURL:    baseURL,
	}, nil
}

// NewDefaultClient creates a new HyperFixi client with default configuration
func NewDefaultClient() (*Client, error) {
	return NewClient(DefaultClientConfig())
}

// request makes an HTTP request with retry logic
func (c *Client) request(ctx context.Context, method, endpoint string, body interface{}) (*http.Response, error) {
	var reqBody io.Reader
	
	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request body: %w", err)
		}
		reqBody = bytes.NewReader(jsonData)
	}

	endpointURL, err := c.baseURL.Parse(endpoint)
	if err != nil {
		return nil, fmt.Errorf("invalid endpoint: %w", err)
	}

	var lastErr error
	for attempt := 0; attempt <= c.config.Retries; attempt++ {
		if attempt > 0 {
			// Exponential backoff
			delay := time.Duration(attempt*attempt) * time.Second
			select {
			case <-ctx.Done():
				return nil, ctx.Err()
			case <-time.After(delay):
			}
		}

		// Reset body reader for retries
		if body != nil {
			jsonData, _ := json.Marshal(body)
			reqBody = bytes.NewReader(jsonData)
		}

		req, err := http.NewRequestWithContext(ctx, method, endpointURL.String(), reqBody)
		if err != nil {
			lastErr = fmt.Errorf("failed to create request: %w", err)
			continue
		}

		// Set headers
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("User-Agent", "hyperfixi-go-client/0.1.0")

		if c.config.AuthToken != "" {
			req.Header.Set("Authorization", "Bearer "+c.config.AuthToken)
		}

		for key, value := range c.config.Headers {
			req.Header.Set(key, value)
		}

		resp, err := c.httpClient.Do(req)
		if err != nil {
			lastErr = fmt.Errorf("request failed: %w", err)
			continue
		}

		// Check for successful response or non-retryable error
		if resp.StatusCode < 500 {
			return resp, nil
		}

		resp.Body.Close()
		lastErr = fmt.Errorf("server error: status %d", resp.StatusCode)
	}

	return nil, lastErr
}

// parseResponse parses an HTTP response into the target structure
func (c *Client) parseResponse(resp *http.Response, target interface{}) error {
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		var errResp ErrorResponse
		if err := json.NewDecoder(resp.Body).Decode(&errResp); err != nil {
			return &ClientError{
				Message:    fmt.Sprintf("HTTP %d", resp.StatusCode),
				StatusCode: resp.StatusCode,
				Err:        err,
			}
		}
		return &ClientError{
			Message:    errResp.Error,
			StatusCode: resp.StatusCode,
		}
	}

	if target != nil {
		if err := json.NewDecoder(resp.Body).Decode(target); err != nil {
			return fmt.Errorf("failed to decode response: %w", err)
		}
	}

	return nil
}

// Compile compiles hyperscript to JavaScript
func (c *Client) Compile(ctx context.Context, req *CompileRequest) (*CompileResponse, error) {
	if req.Scripts == nil || len(req.Scripts) == 0 {
		return nil, fmt.Errorf("scripts cannot be empty")
	}

	resp, err := c.request(ctx, "POST", "/compile", req)
	if err != nil {
		return nil, fmt.Errorf("compile request failed: %w", err)
	}

	var result CompileResponse
	if err := c.parseResponse(resp, &result); err != nil {
		return nil, err
	}

	if len(result.Errors) > 0 {
		return &result, &ClientError{
			Message: fmt.Sprintf("compilation failed with %d errors", len(result.Errors)),
		}
	}

	return &result, nil
}

// CompileScript is a convenience method to compile a single script
func (c *Client) CompileScript(ctx context.Context, script string, options *CompilationOptions) (string, *ScriptMetadata, error) {
	req := &CompileRequest{
		Scripts: map[string]string{"script": script},
		Options: options,
	}

	result, err := c.Compile(ctx, req)
	if err != nil {
		return "", nil, err
	}

	compiled := result.Compiled["script"]
	metadata := result.Metadata["script"]
	
	return compiled, &metadata, nil
}

// Validate validates hyperscript syntax
func (c *Client) Validate(ctx context.Context, req *ValidateRequest) (*ValidateResponse, error) {
	if req.Script == "" {
		return nil, fmt.Errorf("script cannot be empty")
	}

	resp, err := c.request(ctx, "POST", "/validate", req)
	if err != nil {
		return nil, fmt.Errorf("validate request failed: %w", err)
	}

	var result ValidateResponse
	if err := c.parseResponse(resp, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

// ValidateScript is a convenience method to validate a single script
func (c *Client) ValidateScript(ctx context.Context, script string) (bool, []CompilationError, error) {
	req := &ValidateRequest{Script: script}
	
	result, err := c.Validate(ctx, req)
	if err != nil {
		return false, nil, err
	}

	return result.Valid, result.Errors, nil
}

// BatchCompile compiles multiple scripts in a single batch request
func (c *Client) BatchCompile(ctx context.Context, req *BatchCompileRequest) (*CompileResponse, error) {
	if req.Definitions == nil || len(req.Definitions) == 0 {
		return nil, fmt.Errorf("definitions cannot be empty")
	}

	resp, err := c.request(ctx, "POST", "/batch", req)
	if err != nil {
		return nil, fmt.Errorf("batch compile request failed: %w", err)
	}

	var result CompileResponse
	if err := c.parseResponse(resp, &result); err != nil {
		return nil, err
	}

	if len(result.Errors) > 0 {
		return &result, &ClientError{
			Message: fmt.Sprintf("batch compilation failed with %d errors", len(result.Errors)),
		}
	}

	return &result, nil
}

// Health gets service health status
func (c *Client) Health(ctx context.Context) (*HealthStatus, error) {
	resp, err := c.request(ctx, "GET", "/health", nil)
	if err != nil {
		return nil, fmt.Errorf("health request failed: %w", err)
	}

	var result HealthStatus
	if err := c.parseResponse(resp, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

// CacheStats gets cache statistics
func (c *Client) CacheStats(ctx context.Context) (*CacheStats, error) {
	resp, err := c.request(ctx, "GET", "/cache/stats", nil)
	if err != nil {
		return nil, fmt.Errorf("cache stats request failed: %w", err)
	}

	var result CacheStats
	if err := c.parseResponse(resp, &result); err != nil {
		return nil, err
	}

	return &result, nil
}

// ClearCache clears the compilation cache
func (c *Client) ClearCache(ctx context.Context) error {
	resp, err := c.request(ctx, "POST", "/cache/clear", nil)
	if err != nil {
		return fmt.Errorf("clear cache request failed: %w", err)
	}

	return c.parseResponse(resp, nil)
}

// CompileWithTemplateVars is a convenience method to compile with template variables
func (c *Client) CompileWithTemplateVars(ctx context.Context, scripts map[string]string, templateVars map[string]interface{}, options *CompilationOptions) (*CompileResponse, error) {
	context := &ParseContext{
		TemplateVars: templateVars,
	}

	req := &CompileRequest{
		Scripts: scripts,
		Options: options,
		Context: context,
	}

	return c.Compile(ctx, req)
}