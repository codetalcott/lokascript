/**
 * French Tokenizer
 *
 * Tokenizes French hyperscript input.
 * French characteristics:
 * - SVO word order
 * - Space-separated words
 * - Prepositions
 * - Accent marks (é, è, ê, ë, à, â, ù, û, ô, î, ï, ç, œ, æ)
 */

import type { LanguageToken, TokenKind, TokenStream } from '../types';
import {
  BaseTokenizer,
  TokenStreamImpl,
  createToken,
  createPosition,
  createLatinCharClassifiers,
  isWhitespace,
  isSelectorStart,
  isQuote,
  isDigit,
  isUrlStart,
  type KeywordEntry,
} from './base';
import { frenchProfile } from '../generators/profiles/french';

// =============================================================================
// French Character Classification
// =============================================================================

const { isLetter: isFrenchLetter, isIdentifierChar: isFrenchIdentifierChar } =
  createLatinCharClassifiers(/[a-zA-ZàâäéèêëîïôùûüçœæÀÂÄÉÈÊËÎÏÔÙÛÜÇŒÆ]/);

// =============================================================================
// French Prepositions
// =============================================================================

const PREPOSITIONS = new Set([
  'à', // to, at
  'a', // to, at (no accent)
  'de', // of, from
  'du', // de + le
  'des', // de + les
  'dans', // in
  'sur', // on
  'sous', // under
  'avec', // with
  'sans', // without
  'par', // by
  'pour', // for
  'entre', // between
  'avant', // before
  'après', // after
  'apres', // after (no accent)
  'depuis', // since, from
  'vers', // towards
  'chez', // at (someone's place)
  'contre', // against
  'au', // à + le
  'aux', // à + les
]);

// =============================================================================
// French Extras (keywords not in profile)
// =============================================================================

/**
 * Extra keywords not covered by the profile:
 * - Literals (true, false, null, undefined)
 * - Positional words
 * - Event names
 * - Time units
 * - Accent-free variants for accessibility
 */
const FRENCH_EXTRAS: KeywordEntry[] = [
  // Values/Literals
  { native: 'vrai', normalized: 'true' },
  { native: 'faux', normalized: 'false' },
  { native: 'nul', normalized: 'null' },
  { native: 'indéfini', normalized: 'undefined' },
  { native: 'indefini', normalized: 'undefined' },

  // Positional
  { native: 'premier', normalized: 'first' },
  { native: 'première', normalized: 'first' },
  { native: 'premiere', normalized: 'first' },
  { native: 'dernier', normalized: 'last' },
  { native: 'dernière', normalized: 'last' },
  { native: 'derniere', normalized: 'last' },
  { native: 'suivant', normalized: 'next' },
  { native: 'précédent', normalized: 'previous' },
  { native: 'precedent', normalized: 'previous' },
  { native: 'plus proche', normalized: 'closest' },
  { native: 'parent', normalized: 'parent' },

  // Events
  { native: 'clic', normalized: 'click' },
  { native: 'click', normalized: 'click' },
  { native: 'entrée', normalized: 'input' },
  { native: 'entree', normalized: 'input' },
  { native: 'changement', normalized: 'change' },
  { native: 'soumission', normalized: 'submit' },
  { native: 'touche bas', normalized: 'keydown' },
  { native: 'touche haut', normalized: 'keyup' },
  { native: 'souris dessus', normalized: 'mouseover' },
  { native: 'souris dehors', normalized: 'mouseout' },
  { native: 'focus', normalized: 'focus' },
  { native: 'flou', normalized: 'blur' },
  { native: 'chargement', normalized: 'load' },
  { native: 'défilement', normalized: 'scroll' },
  { native: 'defilement', normalized: 'scroll' },

  // Additional references
  { native: 'je', normalized: 'me' },
  { native: 'mon', normalized: 'my' },
  { native: 'ma', normalized: 'my' },
  { native: 'mes', normalized: 'my' },
  { native: 'ça', normalized: 'it' },
  { native: 'ca', normalized: 'it' },
  { native: 'resultat', normalized: 'result' },
  { native: 'evenement', normalized: 'event' },

  // Time units
  { native: 'seconde', normalized: 's' },
  { native: 'secondes', normalized: 's' },
  { native: 'milliseconde', normalized: 'ms' },
  { native: 'millisecondes', normalized: 'ms' },
  { native: 'minute', normalized: 'm' },
  { native: 'minutes', normalized: 'm' },
  { native: 'heure', normalized: 'h' },
  { native: 'heures', normalized: 'h' },

  // Accent-free variants (for user convenience)
  { native: 'prefixer', normalized: 'prepend' },
  { native: 'creer', normalized: 'make' },
  { native: 'definir', normalized: 'set' },
  { native: 'etablir', normalized: 'set' },
  { native: 'incrementer', normalized: 'increment' },
  { native: 'decrementer', normalized: 'decrement' },
  { native: 'declencher', normalized: 'trigger' },
  { native: 'defocaliser', normalized: 'blur' },
  { native: 'recuperer', normalized: 'fetch' },
  { native: 'repeter', normalized: 'repeat' },
  { native: 'arreter', normalized: 'halt' },
  { native: 'defaut', normalized: 'default' },
  { native: 'jusqua', normalized: 'until' },
  { native: 'apres', normalized: 'after' },

  // Additional log synonyms
  { native: 'journaliser', normalized: 'log' },

  // Additional morph synonym
  { native: 'transmuter', normalized: 'morph' },

  // Multi-word phrases
  { native: 'tant que', normalized: 'while' },
];

// =============================================================================
// French Tokenizer Implementation
// =============================================================================

export class FrenchTokenizer extends BaseTokenizer {
  readonly language = 'fr';
  readonly direction = 'ltr' as const;

  constructor() {
    super();
    this.initializeKeywordsFromProfile(frenchProfile, FRENCH_EXTRAS);
  }

  tokenize(input: string): TokenStream {
    const tokens: LanguageToken[] = [];
    let pos = 0;

    while (pos < input.length) {
      if (isWhitespace(input[pos])) {
        pos++;
        continue;
      }

      if (isSelectorStart(input[pos])) {
        const selectorToken = this.trySelector(input, pos);
        if (selectorToken) {
          tokens.push(selectorToken);
          pos = selectorToken.position.end;
          continue;
        }
      }

      if (isQuote(input[pos])) {
        const stringToken = this.tryString(input, pos);
        if (stringToken) {
          tokens.push(stringToken);
          pos = stringToken.position.end;
          continue;
        }
      }

      if (isUrlStart(input, pos)) {
        const urlToken = this.tryUrl(input, pos);
        if (urlToken) {
          tokens.push(urlToken);
          pos = urlToken.position.end;
          continue;
        }
      }

      if (
        isDigit(input[pos]) ||
        (input[pos] === '-' && pos + 1 < input.length && isDigit(input[pos + 1]))
      ) {
        const numberToken = this.extractNumber(input, pos);
        if (numberToken) {
          tokens.push(numberToken);
          pos = numberToken.position.end;
          continue;
        }
      }

      const varToken = this.tryVariableRef(input, pos);
      if (varToken) {
        tokens.push(varToken);
        pos = varToken.position.end;
        continue;
      }

      if (isFrenchLetter(input[pos])) {
        const wordToken = this.extractWord(input, pos);
        if (wordToken) {
          tokens.push(wordToken);
          pos = wordToken.position.end;
          continue;
        }
      }

      const operatorToken = this.tryOperator(input, pos);
      if (operatorToken) {
        tokens.push(operatorToken);
        pos = operatorToken.position.end;
        continue;
      }

      pos++;
    }

    return new TokenStreamImpl(tokens, 'fr');
  }

  classifyToken(token: string): TokenKind {
    const lower = token.toLowerCase();
    if (PREPOSITIONS.has(lower)) return 'particle';
    // O(1) Map lookup instead of O(n) array search
    if (this.isKeyword(lower)) return 'keyword';
    if (token.startsWith('#') || token.startsWith('.') || token.startsWith('[')) return 'selector';
    if (token.startsWith('"') || token.startsWith("'")) return 'literal';
    if (/^\d/.test(token)) return 'literal';
    return 'identifier';
  }

  private extractWord(input: string, startPos: number): LanguageToken | null {
    let pos = startPos;
    let word = '';

    while (pos < input.length && isFrenchIdentifierChar(input[pos])) {
      word += input[pos++];
    }

    if (!word) return null;

    const lower = word.toLowerCase();

    // O(1) Map lookup instead of O(n) array search
    const keywordEntry = this.lookupKeyword(lower);
    if (keywordEntry) {
      return createToken(word, 'keyword', createPosition(startPos, pos), keywordEntry.normalized);
    }

    if (PREPOSITIONS.has(lower)) {
      return createToken(word, 'particle', createPosition(startPos, pos));
    }

    return createToken(word, 'identifier', createPosition(startPos, pos));
  }

  private extractNumber(input: string, startPos: number): LanguageToken | null {
    let pos = startPos;
    let number = '';

    if (input[pos] === '-' || input[pos] === '+') {
      number += input[pos++];
    }

    while (pos < input.length && isDigit(input[pos])) {
      number += input[pos++];
    }

    if (pos < input.length && input[pos] === '.') {
      number += input[pos++];
      while (pos < input.length && isDigit(input[pos])) {
        number += input[pos++];
      }
    }

    let unitPos = pos;
    while (unitPos < input.length && isWhitespace(input[unitPos])) {
      unitPos++;
    }

    const remaining = input.slice(unitPos).toLowerCase();
    if (remaining.startsWith('millisecondes') || remaining.startsWith('milliseconde')) {
      number += 'ms';
      pos = unitPos + (remaining.startsWith('millisecondes') ? 13 : 12);
    } else if (remaining.startsWith('secondes') || remaining.startsWith('seconde')) {
      number += 's';
      pos = unitPos + (remaining.startsWith('secondes') ? 8 : 7);
    } else if (remaining.startsWith('minutes') || remaining.startsWith('minute')) {
      number += 'm';
      pos = unitPos + (remaining.startsWith('minutes') ? 7 : 6);
    } else if (remaining.startsWith('heures') || remaining.startsWith('heure')) {
      number += 'h';
      pos = unitPos + (remaining.startsWith('heures') ? 6 : 5);
    }

    if (!number || number === '-' || number === '+') return null;

    return createToken(number, 'literal', createPosition(startPos, pos));
  }
}

export const frenchTokenizer = new FrenchTokenizer();
