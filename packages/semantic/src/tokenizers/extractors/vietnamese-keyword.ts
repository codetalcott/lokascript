/**
 * Vietnamese Keyword Extractor (Context-Aware)
 *
 * Handles Vietnamese-specific identifier and keyword extraction with:
 * - Tone mark handling (à, á, ả, ã, ạ, etc.)
 * - Vowel modifications (ă, â, ê, ô, ơ, ư, đ)
 * - Preposition detection (21 prepositions)
 * - Multi-word phrase support
 */

import type { ExtractionResult } from '../value-extractor-types';
import type { ContextAwareExtractor, TokenizerContext } from '../context-aware-extractor';

function createLatinCharClassifiers(pattern: RegExp) {
  const isLetter = (char: string) => pattern.test(char);
  const isIdentifierChar = (char: string) => /[0-9]/.test(char) || pattern.test(char);
  return { isLetter, isIdentifierChar };
}

const { isLetter: isVietnameseLetter, isIdentifierChar: isVietnameseIdentifierChar } =
  createLatinCharClassifiers(
    /[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴĐ]/
  );

/**
 * Vietnamese prepositions that mark grammatical roles.
 */
const PREPOSITIONS = new Set([
  'trong', // in, inside
  'ngoài', // outside
  'trên', // on, above
  'dưới', // under, below
  'vào', // into
  'ra', // out
  'đến', // to
  'từ', // from
  'với', // with
  'cho', // for, to
  'bởi', // by
  'qua', // through
  'trước', // before
  'sau', // after
  'giữa', // between
  'bên', // beside
  'theo', // according to, along
  'về', // about, towards
  'tới', // to, towards
  'lên', // up
  'xuống', // down
]);

/**
 * VietnameseKeywordExtractor - Context-aware extractor for Vietnamese identifiers and keywords.
 */
export class VietnameseKeywordExtractor implements ContextAwareExtractor {
  readonly name = 'vietnamese-keyword';

  private context?: TokenizerContext;

  setContext(context: TokenizerContext): void {
    this.context = context;
  }

  canExtract(input: string, position: number): boolean {
    return isVietnameseLetter(input[position]);
  }

  extract(input: string, position: number): ExtractionResult | null {
    if (!this.context) {
      throw new Error('VietnameseKeywordExtractor: context not set');
    }

    // Try multi-word phrase first
    const phraseResult = this.tryMultiWordPhrase(input, position);
    if (phraseResult) {
      return phraseResult;
    }

    // Fall back to single word
    let pos = position;
    let word = '';

    while (pos < input.length && isVietnameseIdentifierChar(input[pos])) {
      word += input[pos++];
    }

    if (!word) return null;

    const lower = word.toLowerCase();

    // Check if it's a preposition
    const isPreposition = PREPOSITIONS.has(lower);

    // Look up keyword entry
    const keywordEntry = this.context.lookupKeyword(lower);
    const normalized =
      keywordEntry && keywordEntry.normalized !== keywordEntry.native
        ? keywordEntry.normalized
        : undefined;

    return {
      value: word,
      length: pos - position,
      metadata: {
        normalized,
        isPreposition,
      },
    };
  }

  /**
   * Try to match a multi-word phrase.
   * Vietnamese has many multi-word keywords like "chuyển đổi" (toggle), "hiển thị" (show).
   */
  private tryMultiWordPhrase(input: string, position: number): ExtractionResult | null {
    if (!this.context) return null;

    // Common Vietnamese multi-word phrases
    const multiWordPhrases = [
      'chuyển đổi', // toggle
      'bật tắt', // toggle (alt)
      'hiển thị', // show
      'gỡ bỏ', // remove
      'loại bỏ', // remove (alt)
      'bổ sung', // add (alt)
      'thêm vào đầu', // prepend
      'hoán đổi', // swap
      'biến đổi', // morph
      'thiết lập', // set (alt)
      'lấy giá trị', // get
      'tăng lên', // increment (alt)
      'giảm đi', // decrement (alt)
      'in ra', // log
      'chuyển tiếp', // transition
      'kích hoạt', // trigger
      'tập trung', // focus
      'mất tập trung', // blur
      'nhấp chuột', // click
      'di chuột', // hover
      'rê chuột', // hover (alt)
      'nhập liệu', // input (alt)
      'thay đổi', // change
      'đi đến', // go
      'chờ đợi', // wait (alt)
      'ổn định', // settle
      'nếu không', // else (alt)
      'không thì', // else
      'lặp lại', // repeat
      'với mỗi', // for
      'trong khi', // while
      'tiếp tục', // continue
      'dừng lại', // halt (alt)
      'trả về', // return
      'sau đó', // then (alt)
      'kết thúc', // end
      'bất đồng bộ', // async
      'nói với', // tell
      'mặc định', // default
      'khởi tạo', // init
      'hành vi', // behavior
      'cài đặt', // install
      'đo lường', // measure
      'sao chép', // copy
      'thoát ra', // exit
      'kết xuất', // render
      'vào trong', // into (alt)
      'trước khi', // before (alt)
      'sau khi', // after (alt)
      'cho đến khi', // until
      'sự kiện', // event
      'kết quả', // result
      'mục tiêu', // target
      'của tôi', // my
      'của nó', // its
      'của bạn', // your
      'của anh', // your (male formal)
      'của chị', // your (female formal)
      'không xác định', // undefined
      'đầu tiên', // first
      'cuối cùng', // last
      'tiếp theo', // next
      'trước đó', // previous
      'gần nhất', // closest
      'nhấp đúp', // dblclick
      'gửi biểu mẫu', // submit
      'phím xuống', // keydown
      'phím lên', // keyup
      'chuột vào', // mouseover
      'chuột ra', // mouseout
      'tải trang', // load
      'mili giây', // milliseconds (time unit)
      'thêm vào cuối', // append
      'nhân bản', // clone
      'tạo ra', // make
      'đặt giá trị', // set (alt)
      'ghi nhật ký', // log (alt)
      'chuyển tới', // go (alt)
      'ngược lại', // else (alt)
    ];

    for (const phrase of multiWordPhrases) {
      const candidate = input.slice(position, position + phrase.length).toLowerCase();
      if (candidate === phrase.toLowerCase()) {
        // Check word boundary
        const nextPos = position + phrase.length;
        if (
          nextPos >= input.length ||
          !/[a-zA-Zàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/.test(
            input[nextPos]
          )
        ) {
          // Look up the normalized form
          const keywordEntry = this.context.lookupKeyword(phrase);
          return {
            value: input.slice(position, nextPos),
            length: phrase.length,
            metadata: {
              normalized: keywordEntry?.normalized,
              isPreposition: false,
            },
          };
        }
      }
    }

    return null;
  }
}

/**
 * Create Vietnamese-specific extractors.
 */
export function createVietnameseExtractors(): ContextAwareExtractor[] {
  return [new VietnameseKeywordExtractor()];
}
