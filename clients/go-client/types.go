package lokascript

import "time"

// CompatibilityMode represents JavaScript compatibility mode
type CompatibilityMode string

const (
	CompatibilityModern CompatibilityMode = "modern"
	CompatibilityLegacy CompatibilityMode = "legacy"
)

// ParseContext represents context for parsing hyperscript templates
type ParseContext struct {
	TemplateVars     map[string]interface{} `json:"templateVars,omitempty"`
	SourceLocale     string                 `json:"sourceLocale,omitempty"`
	TargetLocale     string                 `json:"targetLocale,omitempty"`
	PreserveOriginal bool                   `json:"preserveOriginal,omitempty"`
}

// CompilationOptions represents options for hyperscript compilation
type CompilationOptions struct {
	Minify        bool              `json:"minify,omitempty"`
	Compatibility CompatibilityMode `json:"compatibility,omitempty"`
	SourceMap     bool              `json:"sourceMap,omitempty"`
	Optimization  bool              `json:"optimization,omitempty"`
	TemplateVars  map[string]interface{} `json:"templateVars,omitempty"`
}

// ScriptMetadata represents metadata about a compiled hyperscript
type ScriptMetadata struct {
	Complexity        int      `json:"complexity"`
	Dependencies      []string `json:"dependencies"`
	Selectors         []string `json:"selectors"`
	Events            []string `json:"events"`
	Commands          []string `json:"commands"`
	TemplateVariables []string `json:"templateVariables"`
}

// CompilationError represents an error that occurred during compilation
type CompilationError struct {
	Type    string `json:"type"`
	Message string `json:"message"`
	Line    int    `json:"line"`
	Column  int    `json:"column"`
	Stack   string `json:"stack,omitempty"`
}

// CompilationWarning represents a warning that occurred during compilation
type CompilationWarning struct {
	Type    string `json:"type"`
	Message string `json:"message"`
	Line    int    `json:"line,omitempty"`
	Column  int    `json:"column,omitempty"`
}

// Timings represents compilation timing information
type Timings struct {
	Total   float64 `json:"total"`
	Parse   float64 `json:"parse"`
	Compile float64 `json:"compile"`
	Cache   float64 `json:"cache"`
}

// CompileRequest represents a request to compile hyperscript
type CompileRequest struct {
	Scripts map[string]string   `json:"scripts"`
	Options *CompilationOptions `json:"options,omitempty"`
	Context *ParseContext       `json:"context,omitempty"`
}

// CompileResponse represents a response from hyperscript compilation
type CompileResponse struct {
	Compiled map[string]string             `json:"compiled"`
	Metadata map[string]ScriptMetadata     `json:"metadata"`
	Timings  Timings                       `json:"timings"`
	Warnings []CompilationWarning          `json:"warnings"`
	Errors   []CompilationError            `json:"errors"`
}

// ValidateRequest represents a request to validate hyperscript
type ValidateRequest struct {
	Script  string        `json:"script"`
	Context *ParseContext `json:"context,omitempty"`
}

// ValidateResponse represents a response from hyperscript validation
type ValidateResponse struct {
	Valid    bool                  `json:"valid"`
	Errors   []CompilationError    `json:"errors"`
	Warnings []CompilationWarning  `json:"warnings"`
	Metadata *ScriptMetadata       `json:"metadata,omitempty"`
}

// ScriptDefinition represents a script definition for batch compilation
type ScriptDefinition struct {
	ID      string              `json:"id"`
	Script  string              `json:"script"`
	Options *CompilationOptions `json:"options,omitempty"`
	Context *ParseContext       `json:"context,omitempty"`
}

// BatchCompileRequest represents a request to compile multiple scripts in batch
type BatchCompileRequest struct {
	Definitions []ScriptDefinition `json:"definitions"`
}

// CacheStats represents cache statistics
type CacheStats struct {
	Hits     int     `json:"hits"`
	Misses   int     `json:"misses"`
	HitRatio float64 `json:"hitRatio"`
	Size     int     `json:"size"`
	MaxSize  int     `json:"maxSize"`
}

// HealthStatus represents health status of the LokaScript service
type HealthStatus struct {
	Status    string     `json:"status"`
	Version   string     `json:"version"`
	Uptime    int64      `json:"uptime"`
	Cache     CacheStats `json:"cache"`
	Timestamp time.Time  `json:"timestamp"`
}

// ErrorResponse represents an error response from the API
type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}