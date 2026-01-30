import { describe, it, expect, beforeEach } from 'vitest';
import {
  validateUrl,
  isExternalUrl,
  isSafeUrl,
  normalizeUrl,
  extractSearchParams,
  buildUrlWithParams,
} from '../url-validation';

describe('url-validation', () => {
  beforeEach(() => {
    // Mock window.location.origin
    Object.defineProperty(window, 'location', {
      value: {
        origin: 'http://example.com',
      },
      writable: true,
    });
  });

  describe('validateUrl', () => {
    it('should validate valid URL string', () => {
      const result = validateUrl('/page', 'push-url');
      expect(result).toBe('/page');
    });

    it('should throw on null', () => {
      expect(() => validateUrl(null, 'push-url')).toThrow('URL is required');
    });

    it('should throw on undefined', () => {
      expect(() => validateUrl(undefined, 'push-url')).toThrow('URL is required');
    });

    it('should throw on empty string', () => {
      expect(() => validateUrl('', 'push-url')).toThrow('URL cannot be empty');
      expect(() => validateUrl('   ', 'push-url')).toThrow('URL cannot be empty');
    });

    it('should throw on literal "undefined" string', () => {
      expect(() => validateUrl('undefined', 'push-url')).toThrow(
        "URL evaluated to string 'undefined'"
      );
    });

    it('should throw on literal "null" string', () => {
      expect(() => validateUrl('null', 'push-url')).toThrow("URL evaluated to string 'null'");
    });

    it('should throw on non-string types', () => {
      expect(() => validateUrl(42, 'push-url')).toThrow('URL must be a string');
      expect(() => validateUrl({}, 'push-url')).toThrow('URL must be a string');
    });

    it('should include debug info in error messages', () => {
      expect(() => validateUrl(null, 'push-url', 'test-info')).toThrow('Debug: test-info');
    });
  });

  describe('isExternalUrl', () => {
    it('should detect external URLs', () => {
      expect(isExternalUrl('http://other.com/page')).toBe(true);
      expect(isExternalUrl('https://other.com/page')).toBe(true);
    });

    it('should detect same-origin URLs as not external', () => {
      expect(isExternalUrl('http://example.com/page')).toBe(false);
      expect(isExternalUrl('/page')).toBe(false);
      expect(isExternalUrl('#hash')).toBe(false);
    });

    it('should return false for invalid URLs', () => {
      expect(isExternalUrl('not-a-url')).toBe(false);
    });
  });

  describe('isSafeUrl', () => {
    it('should allow safe URLs', () => {
      expect(isSafeUrl('/page')).toBe(true);
      expect(isSafeUrl('http://example.com')).toBe(true);
      expect(isSafeUrl('#hash')).toBe(true);
    });

    it('should block javascript: URLs', () => {
      expect(isSafeUrl('javascript:alert(1)')).toBe(false);
      expect(isSafeUrl('JAVASCRIPT:alert(1)')).toBe(false);
      expect(isSafeUrl('  javascript:alert(1)  ')).toBe(false);
    });

    it('should block data: URLs', () => {
      expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
      expect(isSafeUrl('DATA:text/html,test')).toBe(false);
    });

    it('should block vbscript: URLs', () => {
      expect(isSafeUrl('vbscript:alert(1)')).toBe(false);
    });
  });

  describe('normalizeUrl', () => {
    it('should preserve hash-only URLs', () => {
      expect(normalizeUrl('#section')).toBe('#section');
    });

    it('should preserve relative URLs starting with /', () => {
      expect(normalizeUrl('/page')).toBe('/page');
    });

    it('should extract path from same-origin absolute URLs', () => {
      const result = normalizeUrl('http://example.com/page?q=1#hash');
      expect(result).toBe('/page?q=1#hash');
    });

    it('should preserve external URLs', () => {
      const url = 'http://other.com/page';
      expect(normalizeUrl(url)).toBe(url);
    });

    it('should handle invalid URLs gracefully', () => {
      const url = 'not-a-valid-url';
      // normalizeUrl treats relative URLs as paths and prepends /
      expect(normalizeUrl(url)).toBe('/not-a-valid-url');
    });
  });

  describe('extractSearchParams', () => {
    it('should extract search params from URL', () => {
      const params = extractSearchParams('/page?a=1&b=2');
      expect(params.get('a')).toBe('1');
      expect(params.get('b')).toBe('2');
    });

    it('should return empty params for URL without query string', () => {
      const params = extractSearchParams('/page');
      expect(Array.from(params.keys())).toHaveLength(0);
    });

    it('should handle invalid URLs gracefully', () => {
      const params = extractSearchParams('not-a-url');
      expect(Array.from(params.keys())).toHaveLength(0);
    });
  });

  describe('buildUrlWithParams', () => {
    it('should build URL with params object', () => {
      const url = buildUrlWithParams('/search', { q: 'test', page: '1' });
      expect(url).toContain('/search?');
      expect(url).toContain('q=test');
      expect(url).toContain('page=1');
    });

    it('should build URL with URLSearchParams', () => {
      const params = new URLSearchParams();
      params.append('q', 'test');
      const url = buildUrlWithParams('/search', params);
      expect(url).toBe('/search?q=test');
    });

    it('should build URL with FormData', () => {
      const formData = new FormData();
      formData.append('q', 'test');
      const url = buildUrlWithParams('/search', formData);
      expect(url).toBe('/search?q=test');
    });

    it('should return base path if no params', () => {
      expect(buildUrlWithParams('/page', {})).toBe('/page');
    });

    it('should append to existing query string', () => {
      const url = buildUrlWithParams('/search?existing=1', { q: 'test' });
      expect(url).toBe('/search?existing=1&q=test');
    });
  });
});
