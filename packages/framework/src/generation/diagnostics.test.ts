import { describe, it, expect } from 'vitest';
import { createDiagnosticCollector, fromError, filterBySeverity } from './diagnostics';
import type { Diagnostic } from './diagnostics';

// =============================================================================
// DiagnosticCollector
// =============================================================================

describe('createDiagnosticCollector', () => {
  it('starts with no diagnostics', () => {
    const collector = createDiagnosticCollector();
    expect(collector.getDiagnostics()).toHaveLength(0);
    expect(collector.hasErrors()).toBe(false);
  });

  it('collects errors', () => {
    const collector = createDiagnosticCollector();
    collector.error('Something went wrong', { code: 'parse-error', line: 3 });

    const diags = collector.getDiagnostics();
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe('error');
    expect(diags[0].message).toBe('Something went wrong');
    expect(diags[0].code).toBe('parse-error');
    expect(diags[0].line).toBe(3);
  });

  it('collects warnings', () => {
    const collector = createDiagnosticCollector();
    collector.warning('Low confidence', { code: 'low-confidence' });

    const diags = collector.getDiagnostics();
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe('warning');
  });

  it('collects info', () => {
    const collector = createDiagnosticCollector();
    collector.info('Consider using alternative', { suggestions: ['use select instead'] });

    const diags = collector.getDiagnostics();
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe('info');
    expect(diags[0].suggestions).toEqual(['use select instead']);
  });

  it('adds raw diagnostics', () => {
    const collector = createDiagnosticCollector();
    collector.add({
      message: 'Custom diagnostic',
      severity: 'warning',
      code: 'custom',
      line: 5,
      column: 10,
      source: 'some code',
    });

    const diags = collector.getDiagnostics();
    expect(diags).toHaveLength(1);
    expect(diags[0].column).toBe(10);
    expect(diags[0].source).toBe('some code');
  });

  it('hasErrors returns true when errors exist', () => {
    const collector = createDiagnosticCollector();
    collector.warning('just a warning');
    expect(collector.hasErrors()).toBe(false);

    collector.error('oops');
    expect(collector.hasErrors()).toBe(true);
  });

  it('toResult produces correct summary', () => {
    const collector = createDiagnosticCollector();
    collector.error('err1');
    collector.error('err2');
    collector.warning('warn1');
    collector.info('info1');
    collector.info('info2');
    collector.info('info3');

    const result = collector.toResult();
    expect(result.ok).toBe(false);
    expect(result.summary).toEqual({ errors: 2, warnings: 1, infos: 3 });
    expect(result.diagnostics).toHaveLength(6);
  });

  it('toResult.ok is true when no errors', () => {
    const collector = createDiagnosticCollector();
    collector.warning('just a warning');
    collector.info('just info');

    const result = collector.toResult();
    expect(result.ok).toBe(true);
    expect(result.summary.errors).toBe(0);
  });

  it('omits undefined optional fields', () => {
    const collector = createDiagnosticCollector();
    collector.error('bare error');

    const diag = collector.getDiagnostics()[0];
    expect(diag.code).toBeUndefined();
    expect(diag.line).toBeUndefined();
    expect(diag.column).toBeUndefined();
    expect(diag.source).toBeUndefined();
    expect(diag.suggestions).toBeUndefined();
  });

  it('omits suggestions when empty array', () => {
    const collector = createDiagnosticCollector();
    collector.error('msg', { suggestions: [] });

    const diag = collector.getDiagnostics()[0];
    expect(diag.suggestions).toBeUndefined();
  });
});

// =============================================================================
// fromError
// =============================================================================

describe('fromError', () => {
  it('converts Error to diagnostic', () => {
    const diag = fromError(new Error('Something broke'), { code: 'runtime-error', line: 42 });
    expect(diag.message).toBe('Something broke');
    expect(diag.severity).toBe('error');
    expect(diag.code).toBe('runtime-error');
    expect(diag.line).toBe(42);
  });

  it('converts string to diagnostic', () => {
    const diag = fromError('string error');
    expect(diag.message).toBe('string error');
    expect(diag.severity).toBe('error');
  });

  it('converts unknown to diagnostic', () => {
    const diag = fromError(12345);
    expect(diag.message).toBe('12345');
  });
});

// =============================================================================
// filterBySeverity
// =============================================================================

describe('filterBySeverity', () => {
  const diagnostics: Diagnostic[] = [
    { message: 'e1', severity: 'error' },
    { message: 'w1', severity: 'warning' },
    { message: 'e2', severity: 'error' },
    { message: 'i1', severity: 'info' },
  ];

  it('filters errors', () => {
    const errors = filterBySeverity(diagnostics, 'error');
    expect(errors).toHaveLength(2);
    expect(errors.every(d => d.severity === 'error')).toBe(true);
  });

  it('filters warnings', () => {
    const warnings = filterBySeverity(diagnostics, 'warning');
    expect(warnings).toHaveLength(1);
  });

  it('filters info', () => {
    const infos = filterBySeverity(diagnostics, 'info');
    expect(infos).toHaveLength(1);
  });
});
