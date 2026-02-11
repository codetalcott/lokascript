/**
 * Grammar Transformer - Dependency Injection Architecture
 *
 * Transforms statements between languages using injected dependencies.
 * This makes the transformer completely domain-agnostic.
 */

import type { LanguageProfile, ParsedElement, SemanticRole } from './types';
import { reorderRoles, insertMarkers, joinTokens } from './types';
import type { Dictionary } from '../interfaces/dictionary';
import type { ProfileProvider } from '../interfaces/profile-provider';

/**
 * Configuration for grammar transformer.
 */
export interface TransformerConfig {
  /** Dictionary for keyword translation */
  readonly dictionary: Dictionary;

  /** Profile provider for grammar rules */
  readonly profileProvider: ProfileProvider;
}

/**
 * Generic grammar transformer using dependency injection.
 *
 * @example
 * const transformer = new GrammarTransformer({
 *   dictionary: new InMemoryDictionary(translations),
 *   profileProvider: new InMemoryProfileProvider(profiles)
 * });
 *
 * const japanese = transformer.transform('select name from users', 'en', 'ja');
 * // → "users から name を 選択"
 */
export class GrammarTransformer {
  private dictionary: Dictionary;
  private profileProvider: ProfileProvider;

  constructor(config: TransformerConfig) {
    this.dictionary = config.dictionary;
    this.profileProvider = config.profileProvider;
  }

  /**
   * Transform a statement from one language to another.
   *
   * @param input - Statement in source language
   * @param fromLanguage - Source language code
   * @param toLanguage - Target language code
   * @returns Transformed statement in target language
   *
   * @throws Error if profiles not found or translation fails
   */
  transform(input: string, fromLanguage: string, toLanguage: string): string {
    // Get language profiles
    const fromProfile = this.profileProvider.getProfile(fromLanguage);
    const toProfile = this.profileProvider.getProfile(toLanguage);

    if (!fromProfile) {
      throw new Error(`No profile found for language: ${fromLanguage}`);
    }
    if (!toProfile) {
      throw new Error(`No profile found for language: ${toLanguage}`);
    }

    // Parse statement to semantic roles
    const parsed = this.parseStatement(input, fromLanguage, fromProfile);

    // Translate each word
    const translated = this.translateRoles(parsed, fromLanguage, toLanguage);

    // Reorder and insert markers
    const reordered = reorderRoles(translated, toProfile.canonicalOrder);

    const withMarkers = insertMarkers(reordered, toProfile.markers, toProfile.adpositionType);

    return joinTokens(withMarkers);
  }

  /**
   * Parse statement into semantic roles.
   * This is a simplified generic parser - DSLs can provide custom parsers.
   */
  private parseStatement(
    input: string,
    language: string,
    profile: LanguageProfile
  ): Map<SemanticRole, string> {
    const roles = new Map<SemanticRole, string>();
    const tokens = input.split(/\s+/);

    // Simple parsing: extract roles based on markers
    let i = 0;
    while (i < tokens.length) {
      const token = tokens[i];

      // Check if token is a marker
      const marker = profile.markers.find(m => m.form === token);

      if (marker) {
        // Next token is the value for this role
        if (i + 1 < tokens.length) {
          roles.set(marker.role, tokens[i + 1]);
          i += 2;
        } else {
          i++;
        }
      } else {
        // Look up token in dictionary to find its role
        const canonical = this.dictionary.lookup(token, language);

        if (canonical) {
          // Assume it's the action (command keyword)
          roles.set('action', canonical);
        } else {
          // Assume it's a value (selector, identifier, etc.)
          // Try to guess the role based on syntax
          if (token.startsWith('#') || token.startsWith('.')) {
            roles.set('patient', token);
          } else {
            // Default to patient for unknown values
            roles.set('patient', token);
          }
        }

        i++;
      }
    }

    return roles;
  }

  /**
   * Translate roles using injected dictionary.
   * Returns a Map of ParsedElement objects expected by reorderRoles.
   */
  private translateRoles(
    roles: Map<SemanticRole, string>,
    _fromLanguage: string,
    toLanguage: string
  ): Map<SemanticRole, ParsedElement> {
    const result = new Map<SemanticRole, ParsedElement>();

    for (const [role, value] of roles) {
      // Translate using dictionary
      const translated = this.dictionary.translate(value, toLanguage);

      // Create ParsedElement with role, value, and translated
      result.set(role, {
        role,
        value, // Original value
        translated: translated ?? value, // Translated value or original if no translation
      });
    }

    return result;
  }
}
