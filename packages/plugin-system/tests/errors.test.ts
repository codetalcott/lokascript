/**
 * Tests for Plugin System Error Classes
 */

import { describe, it, expect } from 'vitest';
import {
  PluginSystemError,
  PluginLoadError,
  PluginExecutionError,
  PluginDependencyError,
  PluginRegistrationError,
  PluginInitError,
  PluginParseError,
  ErrorCodes,
  isPluginSystemError,
  isPluginError,
  wrapError,
} from '../src/errors';

describe('PluginSystemError', () => {
  it('should create error with message and code', () => {
    const error = new PluginSystemError('Test error', 'TEST_CODE');

    expect(error.message).toBe('Test error');
    expect(error.code).toBe('TEST_CODE');
    expect(error.name).toBe('PluginSystemError');
  });

  it('should preserve cause when provided', () => {
    const cause = new Error('Original error');
    const error = new PluginSystemError('Wrapped error', 'WRAP_CODE', cause);

    expect(error.cause).toBe(cause);
  });

  it('should be instanceof Error', () => {
    const error = new PluginSystemError('Test', 'CODE');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(PluginSystemError);
  });
});

describe('PluginLoadError', () => {
  it('should create error with plugin name and message', () => {
    const error = new PluginLoadError('my-plugin', 'Module not found');

    expect(error.message).toBe("Failed to load plugin 'my-plugin': Module not found");
    expect(error.code).toBe('PLUGIN_LOAD_ERROR');
    expect(error.pluginName).toBe('my-plugin');
    expect(error.name).toBe('PluginLoadError');
  });

  it('should preserve cause', () => {
    const cause = new Error('Network error');
    const error = new PluginLoadError('my-plugin', 'Failed to fetch', cause);

    expect(error.cause).toBe(cause);
  });
});

describe('PluginExecutionError', () => {
  it('should create error with plugin name and message', () => {
    const error = new PluginExecutionError('toggle', 'Target not found');

    expect(error.message).toBe("Plugin 'toggle' execution failed: Target not found");
    expect(error.code).toBe('PLUGIN_EXECUTION_ERROR');
    expect(error.pluginName).toBe('toggle');
    expect(error.name).toBe('PluginExecutionError');
  });

  it('should include element and action when provided', () => {
    const element = document.createElement('button');
    const error = new PluginExecutionError('toggle', 'Failed', {
      element,
      action: 'toggle .active',
    });

    expect(error.element).toBe(element);
    expect(error.action).toBe('toggle .active');
  });

  it('should preserve cause in options', () => {
    const cause = new TypeError('undefined is not a function');
    const error = new PluginExecutionError('call', 'Method failed', { cause });

    expect(error.cause).toBe(cause);
  });
});

describe('PluginDependencyError', () => {
  it('should create error with missing dependencies list', () => {
    const error = new PluginDependencyError('advanced-toggle', ['base-toggle', 'animations']);

    expect(error.message).toBe(
      "Plugin 'advanced-toggle' has missing dependencies: base-toggle, animations"
    );
    expect(error.code).toBe('PLUGIN_DEPENDENCY_ERROR');
    expect(error.pluginName).toBe('advanced-toggle');
    expect(error.missingDependencies).toEqual(['base-toggle', 'animations']);
    expect(error.name).toBe('PluginDependencyError');
  });

  it('should handle single missing dependency', () => {
    const error = new PluginDependencyError('my-plugin', ['core']);

    expect(error.missingDependencies).toEqual(['core']);
    expect(error.message).toContain('core');
  });
});

describe('PluginRegistrationError', () => {
  it('should create error with duplicate reason', () => {
    const error = new PluginRegistrationError('toggle', 'duplicate');

    expect(error.message).toBe("Plugin 'toggle' is already registered");
    expect(error.code).toBe('PLUGIN_REGISTRATION_ERROR');
    expect(error.reason).toBe('duplicate');
    expect(error.name).toBe('PluginRegistrationError');
  });

  it('should create error with invalid_type reason', () => {
    const error = new PluginRegistrationError('my-plugin', 'invalid_type');

    expect(error.message).toBe("Plugin 'my-plugin' has an invalid type");
    expect(error.reason).toBe('invalid_type');
  });

  it('should create error with invalid_config reason', () => {
    const error = new PluginRegistrationError('my-plugin', 'invalid_config');

    expect(error.message).toBe("Plugin 'my-plugin' has invalid configuration");
    expect(error.reason).toBe('invalid_config');
  });

  it('should create error with conflict reason', () => {
    const error = new PluginRegistrationError('my-plugin', 'conflict');

    expect(error.message).toBe("Plugin 'my-plugin' conflicts with an existing plugin");
    expect(error.reason).toBe('conflict');
  });

  it('should allow custom message', () => {
    const error = new PluginRegistrationError('my-plugin', 'duplicate', 'Custom error message');

    expect(error.message).toBe('Custom error message');
  });
});

describe('PluginInitError', () => {
  it('should create error with global phase', () => {
    const error = new PluginInitError('state', 'global', 'Failed to initialize store');

    expect(error.message).toBe(
      "Plugin 'state' initialization failed during global phase: Failed to initialize store"
    );
    expect(error.code).toBe('PLUGIN_INIT_ERROR');
    expect(error.pluginName).toBe('state');
    expect(error.phase).toBe('global');
    expect(error.name).toBe('PluginInitError');
  });

  it('should create error with element phase', () => {
    const error = new PluginInitError('toggle', 'element', 'Invalid selector');

    expect(error.phase).toBe('element');
    expect(error.message).toContain('element phase');
  });

  it('should create error with feature phase', () => {
    const error = new PluginInitError('intersection', 'feature', 'Observer not supported');

    expect(error.phase).toBe('feature');
    expect(error.message).toContain('feature phase');
  });

  it('should preserve cause', () => {
    const cause = new Error('Original');
    const error = new PluginInitError('plugin', 'global', 'Failed', cause);

    expect(error.cause).toBe(cause);
  });
});

describe('PluginParseError', () => {
  it('should create error with message', () => {
    const error = new PluginParseError('Unexpected token');

    expect(error.message).toBe('Unexpected token');
    expect(error.code).toBe('PLUGIN_PARSE_ERROR');
    expect(error.name).toBe('PluginParseError');
  });

  it('should include input and position when provided', () => {
    const error = new PluginParseError('Unexpected token', {
      input: 'on click toggle',
      position: 9,
      expected: 'class name',
    });

    expect(error.input).toBe('on click toggle');
    expect(error.position).toBe(9);
    expect(error.expected).toBe('class name');
  });

  it('should preserve cause', () => {
    const cause = new SyntaxError('Invalid');
    const error = new PluginParseError('Parse failed', { cause });

    expect(error.cause).toBe(cause);
  });
});

describe('ErrorCodes', () => {
  it('should have all expected error codes', () => {
    expect(ErrorCodes.PLUGIN_LOAD_ERROR).toBe('PLUGIN_LOAD_ERROR');
    expect(ErrorCodes.PLUGIN_EXECUTION_ERROR).toBe('PLUGIN_EXECUTION_ERROR');
    expect(ErrorCodes.PLUGIN_DEPENDENCY_ERROR).toBe('PLUGIN_DEPENDENCY_ERROR');
    expect(ErrorCodes.PLUGIN_REGISTRATION_ERROR).toBe('PLUGIN_REGISTRATION_ERROR');
    expect(ErrorCodes.PLUGIN_INIT_ERROR).toBe('PLUGIN_INIT_ERROR');
    expect(ErrorCodes.PLUGIN_PARSE_ERROR).toBe('PLUGIN_PARSE_ERROR');
  });
});

describe('isPluginSystemError', () => {
  it('should return true for PluginSystemError', () => {
    const error = new PluginSystemError('Test', 'CODE');
    expect(isPluginSystemError(error)).toBe(true);
  });

  it('should return true for subclasses', () => {
    expect(isPluginSystemError(new PluginLoadError('p', 'msg'))).toBe(true);
    expect(isPluginSystemError(new PluginExecutionError('p', 'msg'))).toBe(true);
    expect(isPluginSystemError(new PluginDependencyError('p', ['d']))).toBe(true);
  });

  it('should return false for regular Error', () => {
    expect(isPluginSystemError(new Error('Test'))).toBe(false);
  });

  it('should return false for non-errors', () => {
    expect(isPluginSystemError(null)).toBe(false);
    expect(isPluginSystemError(undefined)).toBe(false);
    expect(isPluginSystemError('error string')).toBe(false);
    expect(isPluginSystemError({ message: 'fake error' })).toBe(false);
  });
});

describe('isPluginError', () => {
  it('should correctly identify specific error types', () => {
    const loadError = new PluginLoadError('p', 'msg');
    const execError = new PluginExecutionError('p', 'msg');

    expect(isPluginError(loadError, PluginLoadError)).toBe(true);
    expect(isPluginError(loadError, PluginExecutionError)).toBe(false);
    expect(isPluginError(execError, PluginExecutionError)).toBe(true);
  });

  it('should return false for non-plugin errors', () => {
    expect(isPluginError(new Error('Test'), PluginLoadError)).toBe(false);
    expect(isPluginError(null, PluginLoadError)).toBe(false);
  });
});

describe('wrapError', () => {
  it('should return PluginSystemError unchanged', () => {
    const original = new PluginSystemError('Original', 'CODE');
    const wrapped = wrapError(original, 'Context');

    expect(wrapped).toBe(original);
  });

  it('should wrap regular Error with context', () => {
    const original = new Error('Original message');
    const wrapped = wrapError(original, 'Loading plugin');

    expect(wrapped.message).toBe('Loading plugin: Original message');
    expect(wrapped.cause).toBe(original);
    expect(wrapped.code).toBe('UNKNOWN_ERROR');
  });

  it('should wrap non-Error values', () => {
    const wrapped = wrapError('string error', 'Context');

    expect(wrapped.message).toBe('Context: string error');
    expect(wrapped.code).toBe('UNKNOWN_ERROR');
  });

  it('should handle null and undefined', () => {
    expect(wrapError(null, 'Context').message).toBe('Context: null');
    expect(wrapError(undefined, 'Context').message).toBe('Context: undefined');
  });
});
