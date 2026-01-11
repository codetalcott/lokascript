/**
 * Plugin System Error Classes
 * Provides structured error handling for plugin operations
 */

/**
 * Base error class for all plugin system errors
 */
export class PluginSystemError extends Error {
  /** Error code for programmatic handling */
  readonly code: string;
  /** Original cause if this error wraps another */
  readonly cause?: Error;

  constructor(message: string, code: string, cause?: Error) {
    super(message);
    this.name = 'PluginSystemError';
    this.code = code;
    this.cause = cause;

    // Maintains proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when a plugin fails to load
 */
export class PluginLoadError extends PluginSystemError {
  /** Name of the plugin that failed to load */
  readonly pluginName: string;

  constructor(pluginName: string, message: string, cause?: Error) {
    super(`Failed to load plugin '${pluginName}': ${message}`, 'PLUGIN_LOAD_ERROR', cause);
    this.name = 'PluginLoadError';
    this.pluginName = pluginName;
  }
}

/**
 * Error thrown when plugin execution fails
 */
export class PluginExecutionError extends PluginSystemError {
  /** Name of the plugin that failed during execution */
  readonly pluginName: string;
  /** Element that was being processed (if applicable) */
  readonly element?: Element;
  /** The command or action that failed */
  readonly action?: string;

  constructor(
    pluginName: string,
    message: string,
    options?: {
      cause?: Error;
      element?: Element;
      action?: string;
    }
  ) {
    super(
      `Plugin '${pluginName}' execution failed: ${message}`,
      'PLUGIN_EXECUTION_ERROR',
      options?.cause
    );
    this.name = 'PluginExecutionError';
    this.pluginName = pluginName;
    this.element = options?.element;
    this.action = options?.action;
  }
}

/**
 * Error thrown when a plugin dependency is missing
 */
export class PluginDependencyError extends PluginSystemError {
  /** Plugin that has missing dependencies */
  readonly pluginName: string;
  /** List of missing dependencies */
  readonly missingDependencies: string[];

  constructor(pluginName: string, missingDependencies: string[]) {
    super(
      `Plugin '${pluginName}' has missing dependencies: ${missingDependencies.join(', ')}`,
      'PLUGIN_DEPENDENCY_ERROR'
    );
    this.name = 'PluginDependencyError';
    this.pluginName = pluginName;
    this.missingDependencies = missingDependencies;
  }
}

/**
 * Error thrown when plugin registration fails
 */
export class PluginRegistrationError extends PluginSystemError {
  /** Name of the plugin that failed to register */
  readonly pluginName: string;
  /** Reason for registration failure */
  readonly reason: 'duplicate' | 'invalid_type' | 'invalid_config' | 'conflict';

  constructor(
    pluginName: string,
    reason: 'duplicate' | 'invalid_type' | 'invalid_config' | 'conflict',
    message?: string
  ) {
    const defaultMessages = {
      duplicate: `Plugin '${pluginName}' is already registered`,
      invalid_type: `Plugin '${pluginName}' has an invalid type`,
      invalid_config: `Plugin '${pluginName}' has invalid configuration`,
      conflict: `Plugin '${pluginName}' conflicts with an existing plugin`,
    };

    super(message || defaultMessages[reason], 'PLUGIN_REGISTRATION_ERROR');
    this.name = 'PluginRegistrationError';
    this.pluginName = pluginName;
    this.reason = reason;
  }
}

/**
 * Error thrown when plugin initialization fails
 */
export class PluginInitError extends PluginSystemError {
  /** Name of the plugin that failed to initialize */
  readonly pluginName: string;
  /** Phase during which initialization failed */
  readonly phase: 'global' | 'element' | 'feature';

  constructor(
    pluginName: string,
    phase: 'global' | 'element' | 'feature',
    message: string,
    cause?: Error
  ) {
    super(
      `Plugin '${pluginName}' initialization failed during ${phase} phase: ${message}`,
      'PLUGIN_INIT_ERROR',
      cause
    );
    this.name = 'PluginInitError';
    this.pluginName = pluginName;
    this.phase = phase;
  }
}

/**
 * Error thrown when plugin parsing fails
 */
export class PluginParseError extends PluginSystemError {
  /** The input that failed to parse */
  readonly input: string;
  /** Position in the input where parsing failed */
  readonly position?: number;
  /** Expected token or pattern */
  readonly expected?: string;

  constructor(
    message: string,
    options?: {
      input?: string;
      position?: number;
      expected?: string;
      cause?: Error;
    }
  ) {
    super(message, 'PLUGIN_PARSE_ERROR', options?.cause);
    this.name = 'PluginParseError';
    this.input = options?.input || '';
    this.position = options?.position;
    this.expected = options?.expected;
  }
}

/**
 * Error codes for programmatic handling
 */
export const ErrorCodes = {
  PLUGIN_LOAD_ERROR: 'PLUGIN_LOAD_ERROR',
  PLUGIN_EXECUTION_ERROR: 'PLUGIN_EXECUTION_ERROR',
  PLUGIN_DEPENDENCY_ERROR: 'PLUGIN_DEPENDENCY_ERROR',
  PLUGIN_REGISTRATION_ERROR: 'PLUGIN_REGISTRATION_ERROR',
  PLUGIN_INIT_ERROR: 'PLUGIN_INIT_ERROR',
  PLUGIN_PARSE_ERROR: 'PLUGIN_PARSE_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

/**
 * Type guard to check if an error is a PluginSystemError
 */
export function isPluginSystemError(error: unknown): error is PluginSystemError {
  return error instanceof PluginSystemError;
}

/**
 * Type guard to check if an error is a specific plugin error type
 */
export function isPluginError<T extends PluginSystemError>(
  error: unknown,
  errorClass: new (...args: any[]) => T
): error is T {
  return error instanceof errorClass;
}

/**
 * Helper to wrap unknown errors in a PluginSystemError
 */
export function wrapError(error: unknown, context: string): PluginSystemError {
  if (error instanceof PluginSystemError) {
    return error;
  }

  if (error instanceof Error) {
    return new PluginSystemError(`${context}: ${error.message}`, 'UNKNOWN_ERROR', error);
  }

  return new PluginSystemError(`${context}: ${String(error)}`, 'UNKNOWN_ERROR');
}
