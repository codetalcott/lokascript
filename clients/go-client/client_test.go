package hyperfixi

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func createTestServer(t *testing.T) *httptest.Server {
	mux := http.NewServeMux()

	// Health endpoint
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "GET" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		response := HealthStatus{
			Status:  "healthy",
			Version: "0.1.0",
			Uptime:  12345,
			Cache: CacheStats{
				Hits:     100,
				Misses:   20,
				HitRatio: 0.83,
				Size:     50,
				MaxSize:  100,
			},
			Timestamp: time.Now(),
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	// Compile endpoint
	mux.HandleFunc("/compile", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req CompileRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		// Mock compilation response
		compiled := make(map[string]string)
		metadata := make(map[string]ScriptMetadata)

		for name, _ := range req.Scripts {
			compiled[name] = `document.addEventListener('click', function(e) { console.log('compiled'); });`
			metadata[name] = ScriptMetadata{
				Complexity:        1,
				Dependencies:      []string{},
				Selectors:         []string{".active"},
				Events:            []string{"click"},
				Commands:          []string{"toggle"},
				TemplateVariables: []string{},
			}
		}

		response := CompileResponse{
			Compiled: compiled,
			Metadata: metadata,
			Timings: Timings{
				Total:   10.5,
				Parse:   2.1,
				Compile: 7.4,
				Cache:   1.0,
			},
			Warnings: []CompilationWarning{},
			Errors:   []CompilationError{},
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	// Validate endpoint
	mux.HandleFunc("/validate", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req ValidateRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		// Mock validation response
		valid := req.Script != "invalid script"
		var errors []CompilationError
		
		if !valid {
			errors = append(errors, CompilationError{
				Type:    "SyntaxError",
				Message: "Invalid hyperscript syntax",
				Line:    1,
				Column:  1,
			})
		}

		response := ValidateResponse{
			Valid:  valid,
			Errors: errors,
			Warnings: []CompilationWarning{},
			Metadata: &ScriptMetadata{
				Complexity:        1,
				Dependencies:      []string{},
				Selectors:         []string{".active"},
				Events:            []string{"click"},
				Commands:          []string{"toggle"},
				TemplateVariables: []string{},
			},
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	// Batch endpoint
	mux.HandleFunc("/batch", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var req BatchCompileRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}

		// Mock batch compilation response
		compiled := make(map[string]string)
		metadata := make(map[string]ScriptMetadata)

		for _, def := range req.Definitions {
			compiled[def.ID] = `document.addEventListener('click', function(e) { console.log('compiled'); });`
			metadata[def.ID] = ScriptMetadata{
				Complexity:        1,
				Dependencies:      []string{},
				Selectors:         []string{".active"},
				Events:            []string{"click"},
				Commands:          []string{"toggle"},
				TemplateVariables: []string{},
			}
		}

		response := CompileResponse{
			Compiled: compiled,
			Metadata: metadata,
			Timings: Timings{
				Total:   15.2,
				Parse:   3.1,
				Compile: 10.1,
				Cache:   2.0,
			},
			Warnings: []CompilationWarning{},
			Errors:   []CompilationError{},
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	// Cache stats endpoint
	mux.HandleFunc("/cache/stats", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "GET" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		response := CacheStats{
			Hits:     150,
			Misses:   30,
			HitRatio: 0.83,
			Size:     75,
			MaxSize:  100,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
	})

	// Clear cache endpoint
	mux.HandleFunc("/cache/clear", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "Cache cleared successfully"})
	})

	return httptest.NewServer(mux)
}

func TestNewClient(t *testing.T) {
	config := &ClientConfig{
		BaseURL: "http://test.example.com",
		Timeout: 10 * time.Second,
		Retries: 2,
	}

	client, err := NewClient(config)
	require.NoError(t, err)
	assert.NotNil(t, client)
	assert.Equal(t, "http://test.example.com", client.baseURL.String())
}

func TestNewDefaultClient(t *testing.T) {
	client, err := NewDefaultClient()
	require.NoError(t, err)
	assert.NotNil(t, client)
	assert.Equal(t, "http://localhost:3000", client.baseURL.String())
}

func TestClient_Health(t *testing.T) {
	server := createTestServer(t)
	defer server.Close()

	config := &ClientConfig{BaseURL: server.URL}
	client, err := NewClient(config)
	require.NoError(t, err)

	ctx := context.Background()
	health, err := client.Health(ctx)
	require.NoError(t, err)

	assert.Equal(t, "healthy", health.Status)
	assert.Equal(t, "0.1.0", health.Version)
	assert.Equal(t, int64(12345), health.Uptime)
	assert.Equal(t, 100, health.Cache.Hits)
	assert.Equal(t, 20, health.Cache.Misses)
	assert.Equal(t, 0.83, health.Cache.HitRatio)
}

func TestClient_Compile(t *testing.T) {
	server := createTestServer(t)
	defer server.Close()

	config := &ClientConfig{BaseURL: server.URL}
	client, err := NewClient(config)
	require.NoError(t, err)

	req := &CompileRequest{
		Scripts: map[string]string{
			"button": "on click toggle .active",
		},
		Options: &CompilationOptions{
			Minify: true,
		},
	}

	ctx := context.Background()
	result, err := client.Compile(ctx, req)
	require.NoError(t, err)

	assert.Contains(t, result.Compiled, "button")
	assert.Contains(t, result.Metadata, "button")
	assert.Equal(t, 1, result.Metadata["button"].Complexity)
	assert.Contains(t, result.Metadata["button"].Events, "click")
	assert.Contains(t, result.Metadata["button"].Commands, "toggle")
	assert.Equal(t, 10.5, result.Timings.Total)
}

func TestClient_CompileScript(t *testing.T) {
	server := createTestServer(t)
	defer server.Close()

	config := &ClientConfig{BaseURL: server.URL}
	client, err := NewClient(config)
	require.NoError(t, err)

	ctx := context.Background()
	compiled, metadata, err := client.CompileScript(ctx, "on click toggle .active", nil)
	require.NoError(t, err)

	assert.Contains(t, compiled, "addEventListener")
	assert.Equal(t, 1, metadata.Complexity)
	assert.Contains(t, metadata.Events, "click")
}

func TestClient_Validate(t *testing.T) {
	server := createTestServer(t)
	defer server.Close()

	config := &ClientConfig{BaseURL: server.URL}
	client, err := NewClient(config)
	require.NoError(t, err)

	ctx := context.Background()

	// Test valid script
	req := &ValidateRequest{Script: "on click toggle .active"}
	result, err := client.Validate(ctx, req)
	require.NoError(t, err)
	assert.True(t, result.Valid)
	assert.Empty(t, result.Errors)

	// Test invalid script
	req = &ValidateRequest{Script: "invalid script"}
	result, err = client.Validate(ctx, req)
	require.NoError(t, err)
	assert.False(t, result.Valid)
	assert.NotEmpty(t, result.Errors)
	assert.Equal(t, "SyntaxError", result.Errors[0].Type)
}

func TestClient_ValidateScript(t *testing.T) {
	server := createTestServer(t)
	defer server.Close()

	config := &ClientConfig{BaseURL: server.URL}
	client, err := NewClient(config)
	require.NoError(t, err)

	ctx := context.Background()

	// Test valid script
	valid, errors, err := client.ValidateScript(ctx, "on click toggle .active")
	require.NoError(t, err)
	assert.True(t, valid)
	assert.Empty(t, errors)

	// Test invalid script
	valid, errors, err = client.ValidateScript(ctx, "invalid script")
	require.NoError(t, err)
	assert.False(t, valid)
	assert.NotEmpty(t, errors)
}

func TestClient_BatchCompile(t *testing.T) {
	server := createTestServer(t)
	defer server.Close()

	config := &ClientConfig{BaseURL: server.URL}
	client, err := NewClient(config)
	require.NoError(t, err)

	req := &BatchCompileRequest{
		Definitions: []ScriptDefinition{
			{
				ID:     "button",
				Script: "on click toggle .active",
			},
			{
				ID:     "form",
				Script: "on submit halt",
			},
		},
	}

	ctx := context.Background()
	result, err := client.BatchCompile(ctx, req)
	require.NoError(t, err)

	assert.Contains(t, result.Compiled, "button")
	assert.Contains(t, result.Compiled, "form")
	assert.Contains(t, result.Metadata, "button")
	assert.Contains(t, result.Metadata, "form")
	assert.Equal(t, 15.2, result.Timings.Total)
}

func TestClient_CacheStats(t *testing.T) {
	server := createTestServer(t)
	defer server.Close()

	config := &ClientConfig{BaseURL: server.URL}
	client, err := NewClient(config)
	require.NoError(t, err)

	ctx := context.Background()
	stats, err := client.CacheStats(ctx)
	require.NoError(t, err)

	assert.Equal(t, 150, stats.Hits)
	assert.Equal(t, 30, stats.Misses)
	assert.Equal(t, 0.83, stats.HitRatio)
	assert.Equal(t, 75, stats.Size)
	assert.Equal(t, 100, stats.MaxSize)
}

func TestClient_ClearCache(t *testing.T) {
	server := createTestServer(t)
	defer server.Close()

	config := &ClientConfig{BaseURL: server.URL}
	client, err := NewClient(config)
	require.NoError(t, err)

	ctx := context.Background()
	err = client.ClearCache(ctx)
	require.NoError(t, err)
}

func TestClient_CompileWithTemplateVars(t *testing.T) {
	server := createTestServer(t)
	defer server.Close()

	config := &ClientConfig{BaseURL: server.URL}
	client, err := NewClient(config)
	require.NoError(t, err)

	scripts := map[string]string{
		"button": "on click fetch /api/users/{{userId}}",
	}
	templateVars := map[string]interface{}{
		"userId": 123,
	}

	ctx := context.Background()
	result, err := client.CompileWithTemplateVars(ctx, scripts, templateVars, nil)
	require.NoError(t, err)

	assert.Contains(t, result.Compiled, "button")
	assert.Contains(t, result.Metadata, "button")
}

func TestClientError(t *testing.T) {
	err := &ClientError{
		Message:    "Test error",
		StatusCode: 400,
	}

	assert.Equal(t, "hyperfixi client error (status 400): Test error", err.Error())

	// Test with wrapped error
	wrappedErr := &ClientError{
		Message:    "Test error",
		StatusCode: 500,
		Err:        assert.AnError,
	}

	assert.Contains(t, wrappedErr.Error(), "Test error")
	assert.Contains(t, wrappedErr.Error(), "500")
	assert.Equal(t, assert.AnError, wrappedErr.Unwrap())
}