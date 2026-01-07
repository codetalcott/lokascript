/**
 * Thai Tokenizer
 *
 * Tokenizes Thai hyperscript input.
 * Thai is an isolating SVO language with:
 * - Thai script (U+0E00-U+0E7F)
 * - No spaces between words (like Chinese/Japanese)
 * - Prepositions for grammatical marking
 * - CSS selectors are embedded ASCII
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
  isAsciiIdentifierChar,
  isUrlStart,
} from './base';

// =============================================================================
// Thai Character Classification
// =============================================================================

/**
 * Check if character is in the Thai script range.
 * Thai: U+0E00-U+0E7F
 */
function isThai(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= 0x0E00 && code <= 0x0E7F;
}

// =============================================================================
// Thai Keywords
// =============================================================================

/**
 * Thai command keywords mapped to their English equivalents.
 * Ordered longest first for greedy matching.
 */
const THAI_KEYWORDS: [string, string][] = [
  // Commands - Class/Attribute operations
  ['สลับ', 'toggle'],
  ['เพิ่ม', 'add'],
  ['ลบ', 'remove'],
  ['ลบออก', 'remove'],

  // Commands - Content operations
  ['ใส่', 'put'],
  ['วาง', 'put'],
  ['รับ', 'take'],
  ['สร้าง', 'make'],
  ['คัดลอก', 'clone'],
  ['สำเนา', 'clone'],

  // Commands - Variable operations
  ['ตั้ง', 'set'],
  ['กำหนด', 'set'],
  ['รับค่า', 'get'],
  ['เพิ่มค่า', 'increment'],
  ['ลดค่า', 'decrement'],
  ['บันทึก', 'log'],

  // Commands - Visibility
  ['แสดง', 'show'],
  ['ซ่อน', 'hide'],
  ['เปลี่ยน', 'transition'],

  // Commands - Events
  ['เมื่อ', 'on'],
  ['ตอน', 'on'],
  ['เวลา', 'when'],

  // Commands - DOM focus
  ['โฟกัส', 'focus'],
  ['เบลอ', 'blur'],

  // Commands - Navigation
  ['ไป', 'go'],
  ['ไปที่', 'go'],

  // Commands - Async
  ['รอ', 'wait'],
  ['ดึงข้อมูล', 'fetch'],
  ['คงที่', 'settle'],

  // Commands - Control flow
  ['ถ้า', 'if'],
  ['หาก', 'if'],
  ['ไม่งั้น', 'else'],
  ['ไม่เช่นนั้น', 'else'],
  ['ทำซ้ำ', 'repeat'],
  ['สำหรับ', 'for'],
  ['ในขณะที่', 'while'],
  ['ต่อไป', 'continue'],
  ['หยุด', 'halt'],
  ['โยน', 'throw'],
  ['เรียก', 'call'],
  ['คืนค่า', 'return'],
  ['กลับ', 'return'],

  // Commands - Advanced
  ['เจเอส', 'js'],
  ['อะซิงค์', 'async'],
  ['บอก', 'tell'],
  ['ค่าเริ่มต้น', 'default'],
  ['เริ่มต้น', 'init'],
  ['พฤติกรรม', 'behavior'],

  // Control flow helpers
  ['แล้ว', 'then'],
  ['จบ', 'end'],

  // Modifiers
  ['ใน', 'into'],
  ['ไปยัง', 'to'],
  ['จาก', 'from'],
  ['ด้วย', 'with'],
  ['ก่อน', 'before'],
  ['หลัง', 'after'],
  ['จนถึง', 'until'],

  // Values
  ['จริง', 'true'],
  ['เท็จ', 'false'],
  ['ว่าง', 'null'],
  ['ไม่กำหนด', 'undefined'],
  ['ฉัน', 'me'],
  ['มัน', 'it'],
  ['ผลลัพธ์', 'result'],

  // Positional
  ['แรก', 'first'],
  ['สุดท้าย', 'last'],
  ['ถัดไป', 'next'],
  ['ก่อนหน้า', 'previous'],
  ['ใกล้สุด', 'closest'],
  ['ต้นทาง', 'parent'],

  // Events
  ['คลิก', 'click'],
  ['เปลี่ยนแปลง', 'change'],
  ['ส่ง', 'submit'],
  ['อินพุต', 'input'],
  ['โหลด', 'load'],
  ['เลื่อน', 'scroll'],
];

// Sort by length (longest first) for greedy matching
const SORTED_KEYWORDS = THAI_KEYWORDS.sort((a, b) => b[0].length - a[0].length);

// =============================================================================
// Thai Tokenizer Class
// =============================================================================

export class ThaiTokenizer extends BaseTokenizer {
  readonly language = 'th';
  readonly direction = 'ltr' as const;

  tokenize(input: string): TokenStream {
    const tokens: LanguageToken[] = [];
    let pos = 0;

    while (pos < input.length) {
      // Skip whitespace (Thai can have spaces for readability)
      if (isWhitespace(input[pos])) {
        pos++;
        continue;
      }

      // Try CSS selector first
      if (isSelectorStart(input[pos])) {
        const selectorToken = this.trySelector(input, pos);
        if (selectorToken) {
          tokens.push(selectorToken);
          pos = selectorToken.position.end;
          continue;
        }
      }

      // Try string literal
      if (isQuote(input[pos])) {
        const stringToken = this.tryString(input, pos);
        if (stringToken) {
          tokens.push(stringToken);
          pos = stringToken.position.end;
          continue;
        }
      }

      // Try URL
      if (isUrlStart(input, pos)) {
        const urlToken = this.tryUrl(input, pos);
        if (urlToken) {
          tokens.push(urlToken);
          pos = urlToken.position.end;
          continue;
        }
      }

      // Try number
      if (isDigit(input[pos]) || (input[pos] === '-' && pos + 1 < input.length && isDigit(input[pos + 1]))) {
        const numberToken = this.extractNumber(input, pos);
        if (numberToken) {
          tokens.push(numberToken);
          pos = numberToken.position.end;
          continue;
        }
      }

      // Variable references (:name)
      if (input[pos] === ':') {
        const startPos = pos;
        pos++;
        let varName = '';
        while (pos < input.length && (isAsciiIdentifierChar(input[pos]) || isThai(input[pos]))) {
          varName += input[pos];
          pos++;
        }
        if (varName) {
          tokens.push(
            createToken(':' + varName, 'identifier', createPosition(startPos, pos), ':' + varName)
          );
          continue;
        }
        pos = startPos;
      }

      // Thai text - try keyword matching (longest match first)
      if (isThai(input[pos])) {
        const startPos = pos;
        let matched = false;

        // Try to match keywords (longest first)
        for (const [keyword, normalized] of SORTED_KEYWORDS) {
          if (input.slice(pos).startsWith(keyword)) {
            tokens.push(
              createToken(keyword, 'keyword', createPosition(startPos, pos + keyword.length), normalized)
            );
            pos += keyword.length;
            matched = true;
            break;
          }
        }

        if (!matched) {
          // Unknown Thai word - read until non-Thai or known keyword
          let word = '';
          while (pos < input.length && isThai(input[pos])) {
            // Check if we're at the start of a known keyword
            const remaining = input.slice(pos);
            let foundKeyword = false;
            for (const [keyword] of SORTED_KEYWORDS) {
              if (remaining.startsWith(keyword)) {
                foundKeyword = true;
                break;
              }
            }
            if (foundKeyword && word.length > 0) {
              break;
            }
            word += input[pos];
            pos++;
          }
          if (word) {
            tokens.push(
              createToken(word, 'identifier', createPosition(startPos, pos))
            );
          }
        }
        continue;
      }

      // ASCII identifiers
      if (isAsciiIdentifierChar(input[pos])) {
        const startPos = pos;
        let word = '';
        while (pos < input.length && isAsciiIdentifierChar(input[pos])) {
          word += input[pos];
          pos++;
        }
        tokens.push(
          createToken(word, 'identifier', createPosition(startPos, pos), word.toLowerCase())
        );
        continue;
      }

      // Operators and punctuation
      const startPos = pos;
      tokens.push(
        createToken(input[pos], 'operator', createPosition(startPos, pos + 1))
      );
      pos++;
    }

    return new TokenStreamImpl(tokens, this.language);
  }

  classifyToken(value: string): TokenKind {
    for (const [keyword] of SORTED_KEYWORDS) {
      if (value === keyword) return 'keyword';
    }
    if (value.startsWith('.') || value.startsWith('#') || value.startsWith('[')) return 'selector';
    if (value.startsWith(':')) return 'identifier';
    if (value.startsWith('"') || value.startsWith("'")) return 'literal';
    if (/^-?\d/.test(value)) return 'literal';
    return 'identifier';
  }

  private extractNumber(input: string, start: number): LanguageToken | null {
    let pos = start;
    let num = '';

    if (input[pos] === '-') {
      num += '-';
      pos++;
    }

    while (pos < input.length && isDigit(input[pos])) {
      num += input[pos];
      pos++;
    }

    if (pos < input.length && input[pos] === '.') {
      num += '.';
      pos++;
      while (pos < input.length && isDigit(input[pos])) {
        num += input[pos];
        pos++;
      }
    }

    if (num === '-') {
      return null;
    }

    return createToken(num, 'literal', createPosition(start, pos));
  }
}

export const thaiTokenizer = new ThaiTokenizer();
