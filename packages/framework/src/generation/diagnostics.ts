/**
 * Structured Error Diagnostics
 *
 * Framework-level diagnostic types for reporting errors, warnings, and hints
 * during parsing, validation, and compilation. These provide richer feedback
 * than simple error strings, enabling:
 *
 * - Severity levels (error, warning, info)
 * - Machine-readable error codes
 * - Source location tracking
 * - Actionable suggestions
 * - Programmatic fix lookup
 */

// =============================================================================
// Diagnostic Types
// =============================================================================

/**
 * Severity level for a diagnostic.
 */
export type DiagnosticSeverity = 'error' | 'warning' | 'info';

/**
 * A structured diagnostic message.
 *
 * Diagnostics provide rich error information beyond simple strings.
 * They're used for parser errors, validation warnings, and hints.
 */
export interface Diagnostic {
  /** Human-readable message */
  readonly message: string;

  /** Severity level */
  readonly severity: DiagnosticSeverity;

  /** Machine-readable code for programmatic handling (e.g., 'parse-error', 'missing-role') */
  readonly code?: string;

  /** 1-based line number in source */
  readonly line?: number;

  /** 0-based column offset in line */
  readonly column?: number;

  /** Original source text that triggered the diagnostic */
  readonly source?: string;

  /** Actionable suggestions for fixing the issue */
  readonly suggestions?: readonly string[];
}

/**
 * Result of a diagnostic-aware validation.
 */
export interface DiagnosticResult {
  /** Whether validation passed (no errors, though warnings/info may exist) */
  readonly ok: boolean;

  /** All diagnostics, including errors, warnings, and info */
  readonly diagnostics: readonly Diagnostic[];

  /** Convenience: count of each severity level */
  readonly summary: DiagnosticSummary;
}

/**
 * Summary counts by severity.
 */
export interface DiagnosticSummary {
  readonly errors: number;
  readonly warnings: number;
  readonly infos: number;
}

// =============================================================================
// Diagnostic Collector
// =============================================================================

/**
 * Collects diagnostics during a parsing/validation/compilation pass.
 *
 * Use this in your domain's validate() or parse() to accumulate
 * structured feedback instead of throwing on the first error.
 *
 * @example
 * ```typescript
 * const collector = createDiagnosticCollector();
 *
 * // During parsing:
 * collector.error('Unknown command: foo', { code: 'unknown-command', line: 3 });
 * collector.warning('Low confidence match', { code: 'low-confidence', line: 5 });
 * collector.info('Consider using "select" instead of "get"', { line: 5 });
 *
 * // Get result:
 * const result = collector.toResult();
 * // { ok: false, diagnostics: [...], summary: { errors: 1, warnings: 1, infos: 1 } }
 * ```
 */
export interface DiagnosticCollector {
  /** Add an error diagnostic */
  error(message: string, options?: DiagnosticOptions): void;

  /** Add a warning diagnostic */
  warning(message: string, options?: DiagnosticOptions): void;

  /** Add an info diagnostic */
  info(message: string, options?: DiagnosticOptions): void;

  /** Add a diagnostic with explicit severity */
  add(diagnostic: Diagnostic): void;

  /** Whether any errors have been collected */
  hasErrors(): boolean;

  /** Get all collected diagnostics */
  getDiagnostics(): readonly Diagnostic[];

  /** Build a DiagnosticResult from collected diagnostics */
  toResult(): DiagnosticResult;
}

/**
 * Options for adding a diagnostic via the collector's convenience methods.
 */
export interface DiagnosticOptions {
  readonly code?: string;
  readonly line?: number;
  readonly column?: number;
  readonly source?: string;
  readonly suggestions?: readonly string[];
}

// =============================================================================
// Factory
// =============================================================================

/**
 * Create a new diagnostic collector.
 */
export function createDiagnosticCollector(): DiagnosticCollector {
  const diagnostics: Diagnostic[] = [];

  function addWithSeverity(
    severity: DiagnosticSeverity,
    message: string,
    options?: DiagnosticOptions
  ): void {
    const diag: Diagnostic = {
      message,
      severity,
      ...(options?.code != null && { code: options.code }),
      ...(options?.line != null && { line: options.line }),
      ...(options?.column != null && { column: options.column }),
      ...(options?.source != null && { source: options.source }),
      ...(options?.suggestions != null &&
        options.suggestions.length > 0 && { suggestions: options.suggestions }),
    };
    diagnostics.push(diag);
  }

  return {
    error(message, options) {
      addWithSeverity('error', message, options);
    },

    warning(message, options) {
      addWithSeverity('warning', message, options);
    },

    info(message, options) {
      addWithSeverity('info', message, options);
    },

    add(diagnostic) {
      diagnostics.push(diagnostic);
    },

    hasErrors() {
      return diagnostics.some(d => d.severity === 'error');
    },

    getDiagnostics() {
      return diagnostics;
    },

    toResult(): DiagnosticResult {
      let errors = 0;
      let warnings = 0;
      let infos = 0;
      for (const d of diagnostics) {
        if (d.severity === 'error') errors++;
        else if (d.severity === 'warning') warnings++;
        else infos++;
      }

      return {
        ok: errors === 0,
        diagnostics,
        summary: { errors, warnings, infos },
      };
    },
  };
}

// =============================================================================
// Helpers
// =============================================================================

/**
 * Create a diagnostic from an Error object.
 * Useful for converting caught exceptions into structured diagnostics.
 */
export function fromError(
  error: unknown,
  options?: Omit<DiagnosticOptions, 'code'> & { code?: string }
): Diagnostic {
  const message = error instanceof Error ? error.message : String(error);
  return {
    message,
    severity: 'error',
    ...(options?.code != null && { code: options.code }),
    ...(options?.line != null && { line: options.line }),
    ...(options?.column != null && { column: options.column }),
    ...(options?.source != null && { source: options.source }),
    ...(options?.suggestions != null &&
      options.suggestions.length > 0 && { suggestions: options.suggestions }),
  };
}

/**
 * Filter diagnostics by severity.
 */
export function filterBySeverity(
  diagnostics: readonly Diagnostic[],
  severity: DiagnosticSeverity
): readonly Diagnostic[] {
  return diagnostics.filter(d => d.severity === severity);
}
