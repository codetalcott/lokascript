/**
 * Profile Provider Interface - Language Profile Access
 *
 * Provides language profiles for grammar transformation.
 * DSLs implement this to provide their domain-specific profiles.
 */

import type { LanguageProfile } from '../grammar';

/**
 * Provides language profiles for transformation.
 */
export interface ProfileProvider {
  /**
   * Get language profile by code.
   *
   * @param language - ISO 639-1 code (e.g., 'en', 'ja', 'es')
   * @returns Language profile or undefined if not supported
   *
   * @example
   * const profile = provider.getProfile('ja');
   * console.log(profile.wordOrder); // 'SOV'
   */
  getProfile(language: string): LanguageProfile | undefined;

  /**
   * Get all supported language codes.
   *
   * @returns Array of ISO 639-1 codes
   *
   * @example
   * provider.getSupportedLanguages() // → ['en', 'ja', 'es', 'ko']
   */
  getSupportedLanguages(): string[];

  /**
   * Check if a language is supported.
   *
   * @param language - Language code to check
   * @returns True if language is supported
   */
  hasLanguage(language: string): boolean;
}

/**
 * Simple in-memory profile provider.
 */
export class InMemoryProfileProvider implements ProfileProvider {
  /**
   * @param profiles - Map of language code to profile
   *
   * @example
   * new InMemoryProfileProvider({
   *   en: { code: 'en', wordOrder: 'SVO', ... },
   *   ja: { code: 'ja', wordOrder: 'SOV', ... }
   * })
   */
  constructor(private profiles: Record<string, LanguageProfile>) {}

  getProfile(language: string): LanguageProfile | undefined {
    return this.profiles[language];
  }

  getSupportedLanguages(): string[] {
    return Object.keys(this.profiles);
  }

  hasLanguage(language: string): boolean {
    return language in this.profiles;
  }
}

/**
 * Null profile provider - for DSLs that don't need grammar transformation.
 */
export class NullProfileProvider implements ProfileProvider {
  getProfile(_language: string): LanguageProfile | undefined {
    return undefined;
  }

  getSupportedLanguages(): string[] {
    return [];
  }

  hasLanguage(_language: string): boolean {
    return false;
  }
}
