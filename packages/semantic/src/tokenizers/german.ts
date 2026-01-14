/**
 * German Tokenizer
 *
 * Tokenizes German hyperscript input.
 * German characteristics:
 * - SVO word order (V2 in main clauses, but SVO for our purposes)
 * - Space-separated words
 * - Prepositions
 * - Umlauts (ä, ö, ü) and ß
 * - Compound nouns
 */

import type { LanguageToken, TokenKind, TokenStream } from '../types';
import {
  BaseTokenizer,
  TokenStreamImpl,
  createToken,
  createPosition,
  isWhitespace,
  isSelectorStart,
  isQuote,
  isDigit,
  isUrlStart,
  type KeywordEntry,
} from './base';
import { germanProfile } from '../generators/profiles/german';

// =============================================================================
// German Character Classification
// =============================================================================

function isGermanLetter(char: string): boolean {
  return /[a-zA-ZäöüÄÖÜß]/.test(char);
}

function isGermanIdentifierChar(char: string): boolean {
  return isGermanLetter(char) || /[0-9_-]/.test(char);
}

// =============================================================================
// German Prepositions
// =============================================================================

const PREPOSITIONS = new Set([
  'an', // at, on
  'auf', // on
  'aus', // from, out of
  'bei', // at, near
  'durch', // through
  'für', // for
  'fur', // for (no umlaut)
  'gegen', // against
  'in', // in
  'mit', // with
  'nach', // after, to
  'ohne', // without
  'seit', // since
  'über', // over, about
  'uber', // over (no umlaut)
  'um', // around, at
  'unter', // under
  'von', // from, of
  'vor', // before, in front of
  'zu', // to
  'zwischen', // between
  'bis', // until
  'gegenüber', // opposite
  'gegenuber', // opposite (no umlaut)
  'während', // during
  'wahrend', // during (no umlaut)
  'wegen', // because of
  'trotz', // despite
  'statt', // instead of
  'innerhalb', // inside
  'außerhalb', // outside
  'ausserhalb', // outside (no umlaut)
]);

// =============================================================================
// German Extras (keywords not in profile)
// =============================================================================

/**
 * Extra keywords not covered by the profile:
 * - Literals (true, false, null, undefined)
 * - Positional words
 * - Event names
 * - Time units
 * - Umlaut-free variants for accessibility
 * - Verb conjugation variants (imperatives)
 */
const GERMAN_EXTRAS: KeywordEntry[] = [
  // Values/Literals
  { native: 'wahr', normalized: 'true' },
  { native: 'falsch', normalized: 'false' },
  { native: 'null', normalized: 'null' },
  { native: 'undefiniert', normalized: 'undefined' },

  // Positional
  { native: 'erste', normalized: 'first' },
  { native: 'erster', normalized: 'first' },
  { native: 'erstes', normalized: 'first' },
  { native: 'letzte', normalized: 'last' },
  { native: 'letzter', normalized: 'last' },
  { native: 'letztes', normalized: 'last' },
  { native: 'nächste', normalized: 'next' },
  { native: 'nachste', normalized: 'next' },
  { native: 'vorherige', normalized: 'previous' },
  { native: 'nächste', normalized: 'closest' },
  { native: 'eltern', normalized: 'parent' },

  // Events
  { native: 'klick', normalized: 'click' },
  { native: 'click', normalized: 'click' },
  { native: 'eingabe', normalized: 'input' },
  { native: 'änderung', normalized: 'change' },
  { native: 'anderung', normalized: 'change' },
  { native: 'absenden', normalized: 'submit' },
  { native: 'taste unten', normalized: 'keydown' },
  { native: 'taste oben', normalized: 'keyup' },
  { native: 'maus drüber', normalized: 'mouseover' },
  { native: 'maus druber', normalized: 'mouseover' },
  { native: 'maus weg', normalized: 'mouseout' },
  { native: 'fokus', normalized: 'focus' },
  { native: 'unschärfe', normalized: 'blur' },
  { native: 'unscharfe', normalized: 'blur' },
  { native: 'scrollen', normalized: 'scroll' },

  // Additional references
  { native: 'meine', normalized: 'my' },
  { native: 'meinen', normalized: 'my' },
  { native: 'ergebnis', normalized: 'result' },
  { native: 'ziel', normalized: 'target' },

  // Time units
  { native: 'sekunde', normalized: 's' },
  { native: 'sekunden', normalized: 's' },
  { native: 'millisekunde', normalized: 'ms' },
  { native: 'millisekunden', normalized: 'ms' },
  { native: 'minute', normalized: 'm' },
  { native: 'minuten', normalized: 'm' },
  { native: 'stunde', normalized: 'h' },
  { native: 'stunden', normalized: 'h' },

  // Umlaut-free variants (for user convenience)
  { native: 'hinzufugen', normalized: 'add' },
  { native: 'hinzufgen', normalized: 'add' },
  { native: 'loschen', normalized: 'remove' },
  { native: 'anhangen', normalized: 'append' },
  { native: 'erhohen', normalized: 'increment' },
  { native: 'ubergang', normalized: 'transition' },
  { native: 'auslosen', normalized: 'trigger' },
  { native: 'zuruckgeben', normalized: 'return' },
  { native: 'anschliessend', normalized: 'then' },

  // Verb conjugation variants (imperatives for test cases)
  { native: 'erhöhe', normalized: 'increment' },
  { native: 'erhohe', normalized: 'increment' },
  { native: 'verringere', normalized: 'decrement' },
];

// =============================================================================
// German Tokenizer Implementation
// =============================================================================

export class GermanTokenizer extends BaseTokenizer {
  readonly language = 'de';
  readonly direction = 'ltr' as const;

  constructor() {
    super();
    this.initializeKeywordsFromProfile(germanProfile, GERMAN_EXTRAS);
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

      if (isGermanLetter(input[pos])) {
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

    return new TokenStreamImpl(tokens, 'de');
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

    while (pos < input.length && isGermanIdentifierChar(input[pos])) {
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
    if (remaining.startsWith('millisekunden') || remaining.startsWith('millisekunde')) {
      number += 'ms';
      pos = unitPos + (remaining.startsWith('millisekunden') ? 13 : 12);
    } else if (remaining.startsWith('sekunden') || remaining.startsWith('sekunde')) {
      number += 's';
      pos = unitPos + (remaining.startsWith('sekunden') ? 8 : 7);
    } else if (remaining.startsWith('minuten') || remaining.startsWith('minute')) {
      number += 'm';
      pos = unitPos + (remaining.startsWith('minuten') ? 7 : 6);
    } else if (remaining.startsWith('stunden') || remaining.startsWith('stunde')) {
      number += 'h';
      pos = unitPos + (remaining.startsWith('stunden') ? 7 : 6);
    }

    if (!number || number === '-' || number === '+') return null;

    return createToken(number, 'literal', createPosition(startPos, pos));
  }

  private tryOperator(input: string, pos: number): LanguageToken | null {
    const twoChar = input.slice(pos, pos + 2);
    if (['==', '!=', '<=', '>=', '&&', '||', '->'].includes(twoChar)) {
      return createToken(twoChar, 'operator', createPosition(pos, pos + 2));
    }

    const oneChar = input[pos];
    if (['<', '>', '!', '+', '-', '*', '/', '='].includes(oneChar)) {
      return createToken(oneChar, 'operator', createPosition(pos, pos + 1));
    }

    if (['(', ')', '{', '}', ',', ';', ':'].includes(oneChar)) {
      return createToken(oneChar, 'punctuation', createPosition(pos, pos + 1));
    }

    return null;
  }
}

export const germanTokenizer = new GermanTokenizer();
