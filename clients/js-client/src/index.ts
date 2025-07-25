/**
 * HyperFixi JavaScript/TypeScript Client
 * 
 * A comprehensive client library for HyperFixi server-side hyperscript compilation
 * with Express.js middleware integration and TypeScript support.
 */

// Core client exports
export { Client, createClient, createDefaultClient } from './client';

// Type definitions
export type {
  ClientConfig,
  ParseContext,
  CompilationOptions,
  CompatibilityMode,
  CompileRequest,
  ValidateRequest,
  ScriptDefinition,
  BatchCompileRequest,
  ScriptMetadata,
  Timings,
  CompilationWarning,
  CompilationError,
  CompileResponse,
  ValidateResponse,
  CacheStats,
  HealthStatus,
  HyperfixiClient,
  ExpressMiddlewareConfig,
  TemplateHelpers,
} from './types';

// Error classes
export {
  HyperfixiError,
  NetworkError,
  ValidationError,
  CompilationFailedError,
} from './types';

// Constants
export const DEFAULT_BASE_URL = 'http://localhost:3000';
export const DEFAULT_TIMEOUT = 30000;
export const DEFAULT_RETRIES = 3;

/**
 * Client version
 */
export const VERSION = '0.1.0';