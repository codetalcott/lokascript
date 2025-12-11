/**
 * Language Profiles
 *
 * Defines grammatical properties for each supported language.
 * Used by the pattern generator to create language-specific patterns.
 */

import type { SemanticRole } from '../types';

// =============================================================================
// Language Profile Types
// =============================================================================

/**
 * Word order in a language (for declarative statements).
 */
export type WordOrder = 'SVO' | 'SOV' | 'VSO' | 'VOS' | 'OSV' | 'OVS';

/**
 * How grammatical relationships are marked.
 */
export type MarkingStrategy = 'preposition' | 'postposition' | 'particle' | 'case-suffix';

/**
 * A grammatical marker (preposition, particle, etc.) for a semantic role.
 */
export interface RoleMarker {
  /** Primary marker for this role */
  readonly primary: string;
  /** Alternative markers that also work */
  readonly alternatives?: string[];
  /** Position relative to the role value */
  readonly position: 'before' | 'after';
}

/**
 * Verb form configuration for a language.
 */
export interface VerbConfig {
  /** Position of verb in the sentence */
  readonly position: 'start' | 'end' | 'second';
  /** Common verb suffixes/conjugations to recognize */
  readonly suffixes?: string[];
  /** Whether the language commonly drops subjects */
  readonly subjectDrop?: boolean;
}

/**
 * Complete language profile for pattern generation.
 */
export interface LanguageProfile {
  /** ISO 639-1 language code */
  readonly code: string;
  /** Human-readable language name */
  readonly name: string;
  /** Native name */
  readonly nativeName: string;
  /** Text direction */
  readonly direction: 'ltr' | 'rtl';
  /** Primary word order */
  readonly wordOrder: WordOrder;
  /** How this language marks grammatical roles */
  readonly markingStrategy: MarkingStrategy;
  /** Markers for each semantic role */
  readonly roleMarkers: Partial<Record<SemanticRole, RoleMarker>>;
  /** Verb configuration */
  readonly verb: VerbConfig;
  /** Command keyword translations */
  readonly keywords: Record<string, KeywordTranslation>;
  /** Whether the language uses spaces between words */
  readonly usesSpaces: boolean;
  /** Special tokenization notes */
  readonly tokenization?: TokenizationConfig;
}

/**
 * Translation of a command keyword.
 */
export interface KeywordTranslation {
  /** Primary translation */
  readonly primary: string;
  /** Alternative forms (conjugations, synonyms) */
  readonly alternatives?: string[];
  /** Normalized form for matching */
  readonly normalized?: string;
}

/**
 * Special tokenization configuration.
 */
export interface TokenizationConfig {
  /** Particles to recognize (for particle languages) */
  readonly particles?: string[];
  /** Prefixes to recognize (for prefixing languages) */
  readonly prefixes?: string[];
  /** Word boundary detection strategy */
  readonly boundaryStrategy?: 'space' | 'particle' | 'character';
}

// =============================================================================
// Language Profile Definitions
// =============================================================================

/**
 * English language profile.
 * SVO word order, prepositions, space-separated.
 */
export const englishProfile: LanguageProfile = {
  code: 'en',
  name: 'English',
  nativeName: 'English',
  direction: 'ltr',
  wordOrder: 'SVO',
  markingStrategy: 'preposition',
  usesSpaces: true,
  verb: {
    position: 'start',
    subjectDrop: false,
  },
  roleMarkers: {
    destination: { primary: 'on', alternatives: ['to', 'from'], position: 'before' },
    source: { primary: 'from', position: 'before' },
    patient: { primary: '', position: 'before' }, // No marker, just position
    instrument: { primary: 'with', alternatives: ['by', 'using'], position: 'before' },
    manner: { primary: 'as', position: 'before' },
  },
  keywords: {
    toggle: { primary: 'toggle' },
    add: { primary: 'add' },
    remove: { primary: 'remove' },
    put: { primary: 'put' },
    set: { primary: 'set' },
    get: { primary: 'get' },
    show: { primary: 'show' },
    hide: { primary: 'hide' },
    on: { primary: 'on' },
    trigger: { primary: 'trigger', alternatives: ['send'] },
    wait: { primary: 'wait' },
    fetch: { primary: 'fetch' },
    increment: { primary: 'increment' },
    decrement: { primary: 'decrement' },
    append: { primary: 'append' },
    prepend: { primary: 'prepend' },
    into: { primary: 'into' },
    before: { primary: 'before' },
    after: { primary: 'after' },
  },
};

/**
 * Japanese language profile.
 * SOV word order, particles, no spaces.
 */
export const japaneseProfile: LanguageProfile = {
  code: 'ja',
  name: 'Japanese',
  nativeName: '日本語',
  direction: 'ltr',
  wordOrder: 'SOV',
  markingStrategy: 'particle',
  usesSpaces: false,
  verb: {
    position: 'end',
    suffixes: ['る', 'て', 'た', 'ます', 'ない'],
    subjectDrop: true,
  },
  roleMarkers: {
    patient: { primary: 'を', position: 'after' },
    destination: { primary: 'に', alternatives: ['へ', 'で'], position: 'after' },
    source: { primary: 'から', position: 'after' },
    instrument: { primary: 'で', position: 'after' },
    // Possession marker for "X's Y" patterns
    // Note: の is used between target and patient: #button の .active
  },
  keywords: {
    toggle: { primary: '切り替え', alternatives: ['切り替える', 'トグル', 'トグルする'], normalized: 'toggle' },
    add: { primary: '追加', alternatives: ['追加する', '加える'], normalized: 'add' },
    remove: { primary: '削除', alternatives: ['削除する', '取り除く'], normalized: 'remove' },
    put: { primary: '置く', alternatives: ['入れる', 'セット'], normalized: 'put' },
    set: { primary: '設定', alternatives: ['設定する', 'セット'], normalized: 'set' },
    get: { primary: '取得', alternatives: ['取得する', 'ゲット'], normalized: 'get' },
    show: { primary: '表示', alternatives: ['表示する', '見せる'], normalized: 'show' },
    hide: { primary: '非表示', alternatives: ['非表示にする', '隠す'], normalized: 'hide' },
    on: { primary: 'で', alternatives: ['時', 'とき'], normalized: 'on' },
    trigger: { primary: '発火', alternatives: ['トリガー'], normalized: 'trigger' },
    wait: { primary: '待つ', alternatives: ['待機'], normalized: 'wait' },
    fetch: { primary: '取得', alternatives: ['フェッチ'], normalized: 'fetch' },
    increment: { primary: '増加', alternatives: ['増やす', 'インクリメント'], normalized: 'increment' },
    decrement: { primary: '減少', alternatives: ['減らす', 'デクリメント'], normalized: 'decrement' },
    append: { primary: '末尾に追加', alternatives: ['アペンド'], normalized: 'append' },
    prepend: { primary: '先頭に追加', alternatives: ['プリペンド'], normalized: 'prepend' },
  },
  tokenization: {
    particles: ['を', 'に', 'で', 'から', 'の', 'が', 'は', 'も', 'へ', 'と'],
    boundaryStrategy: 'particle',
  },
};

/**
 * Arabic language profile.
 * VSO word order, prepositions, RTL, space-separated.
 */
export const arabicProfile: LanguageProfile = {
  code: 'ar',
  name: 'Arabic',
  nativeName: 'العربية',
  direction: 'rtl',
  wordOrder: 'VSO',
  markingStrategy: 'preposition',
  usesSpaces: true,
  verb: {
    position: 'start',
    subjectDrop: true,
  },
  roleMarkers: {
    destination: { primary: 'على', alternatives: ['في', 'إلى', 'ب'], position: 'before' },
    source: { primary: 'من', position: 'before' },
    patient: { primary: '', position: 'before' },
    instrument: { primary: 'بـ', alternatives: ['باستخدام'], position: 'before' },
  },
  keywords: {
    toggle: { primary: 'بدّل', alternatives: ['بدل', 'غيّر', 'غير'], normalized: 'toggle' },
    add: { primary: 'أضف', alternatives: ['اضف', 'زِد'], normalized: 'add' },
    remove: { primary: 'أزل', alternatives: ['احذف', 'امسح'], normalized: 'remove' },
    put: { primary: 'ضع', alternatives: ['اجعل'], normalized: 'put' },
    set: { primary: 'عيّن', alternatives: ['اضبط', 'حدد'], normalized: 'set' },
    get: { primary: 'احصل', alternatives: ['خذ'], normalized: 'get' },
    show: { primary: 'أظهر', alternatives: ['اعرض'], normalized: 'show' },
    hide: { primary: 'أخفِ', alternatives: ['اخفي'], normalized: 'hide' },
    on: { primary: 'عند', alternatives: ['لدى', 'حين'], normalized: 'on' },
    trigger: { primary: 'أطلق', alternatives: ['فعّل'], normalized: 'trigger' },
    wait: { primary: 'انتظر', normalized: 'wait' },
    fetch: { primary: 'احضر', alternatives: ['جلب'], normalized: 'fetch' },
    increment: { primary: 'زِد', alternatives: ['ارفع'], normalized: 'increment' },
    decrement: { primary: 'انقص', alternatives: ['قلل'], normalized: 'decrement' },
    append: { primary: 'ألحق', normalized: 'append' },
    prepend: { primary: 'سبق', normalized: 'prepend' },
    into: { primary: 'في', alternatives: ['إلى'], normalized: 'into' },
  },
  tokenization: {
    prefixes: ['ال', 'و', 'ف', 'ب', 'ك', 'ل'],
  },
};

/**
 * Spanish language profile.
 * SVO word order, prepositions, space-separated.
 */
export const spanishProfile: LanguageProfile = {
  code: 'es',
  name: 'Spanish',
  nativeName: 'Español',
  direction: 'ltr',
  wordOrder: 'SVO',
  markingStrategy: 'preposition',
  usesSpaces: true,
  verb: {
    position: 'start',
    subjectDrop: true,
  },
  roleMarkers: {
    destination: { primary: 'en', alternatives: ['sobre', 'a'], position: 'before' },
    source: { primary: 'de', alternatives: ['desde'], position: 'before' },
    patient: { primary: '', position: 'before' },
    instrument: { primary: 'con', position: 'before' },
  },
  keywords: {
    toggle: { primary: 'alternar', alternatives: ['cambiar', 'conmutar'], normalized: 'toggle' },
    add: { primary: 'agregar', alternatives: ['añadir'], normalized: 'add' },
    remove: { primary: 'quitar', alternatives: ['eliminar', 'remover'], normalized: 'remove' },
    put: { primary: 'poner', alternatives: ['colocar'], normalized: 'put' },
    set: { primary: 'establecer', alternatives: ['fijar', 'definir'], normalized: 'set' },
    get: { primary: 'obtener', alternatives: ['conseguir'], normalized: 'get' },
    show: { primary: 'mostrar', alternatives: ['enseñar'], normalized: 'show' },
    hide: { primary: 'ocultar', alternatives: ['esconder'], normalized: 'hide' },
    on: { primary: 'en', alternatives: ['cuando', 'al'], normalized: 'on' },
    trigger: { primary: 'disparar', alternatives: ['activar'], normalized: 'trigger' },
    wait: { primary: 'esperar', normalized: 'wait' },
    fetch: { primary: 'obtener', alternatives: ['buscar'], normalized: 'fetch' },
    increment: { primary: 'incrementar', alternatives: ['aumentar'], normalized: 'increment' },
    decrement: { primary: 'decrementar', alternatives: ['disminuir'], normalized: 'decrement' },
    append: { primary: 'añadir al final', normalized: 'append' },
    prepend: { primary: 'añadir al inicio', normalized: 'prepend' },
    into: { primary: 'en', alternatives: ['dentro de'], normalized: 'into' },
  },
};

/**
 * Korean language profile.
 * SOV word order, particles, space-separated (between words).
 */
export const koreanProfile: LanguageProfile = {
  code: 'ko',
  name: 'Korean',
  nativeName: '한국어',
  direction: 'ltr',
  wordOrder: 'SOV',
  markingStrategy: 'particle',
  usesSpaces: true, // Korean uses spaces between words, but particles attach
  verb: {
    position: 'end',
    suffixes: ['다', '요', '니다', '세요'],
    subjectDrop: true,
  },
  roleMarkers: {
    patient: { primary: '을', alternatives: ['를'], position: 'after' },
    destination: { primary: '에', alternatives: ['으로', '로', '에서'], position: 'after' },
    source: { primary: '에서', alternatives: ['부터'], position: 'after' },
    instrument: { primary: '로', alternatives: ['으로'], position: 'after' },
  },
  keywords: {
    toggle: { primary: '전환', alternatives: ['토글'], normalized: 'toggle' },
    add: { primary: '추가', normalized: 'add' },
    remove: { primary: '제거', alternatives: ['삭제'], normalized: 'remove' },
    put: { primary: '넣기', alternatives: ['놓기'], normalized: 'put' },
    set: { primary: '설정', normalized: 'set' },
    get: { primary: '가져오기', normalized: 'get' },
    show: { primary: '표시', alternatives: ['보이기'], normalized: 'show' },
    hide: { primary: '숨기기', normalized: 'hide' },
    on: { primary: '시', alternatives: ['때', '할 때'], normalized: 'on' },
    trigger: { primary: '트리거', normalized: 'trigger' },
    wait: { primary: '대기', normalized: 'wait' },
    fetch: { primary: '가져오기', normalized: 'fetch' },
    increment: { primary: '증가', normalized: 'increment' },
    decrement: { primary: '감소', normalized: 'decrement' },
  },
  tokenization: {
    particles: ['을', '를', '이', '가', '은', '는', '에', '에서', '으로', '로', '와', '과', '도'],
    boundaryStrategy: 'space',
  },
};

/**
 * Chinese (Simplified) language profile.
 * SVO word order, no markers (relies on word order), no spaces.
 */
export const chineseProfile: LanguageProfile = {
  code: 'zh',
  name: 'Chinese',
  nativeName: '中文',
  direction: 'ltr',
  wordOrder: 'SVO',
  markingStrategy: 'preposition', // Uses prepositions but often implicit
  usesSpaces: false,
  verb: {
    position: 'second',
    subjectDrop: true,
  },
  roleMarkers: {
    destination: { primary: '在', alternatives: ['到', '于'], position: 'before' },
    source: { primary: '从', alternatives: ['由'], position: 'before' },
    patient: { primary: '把', position: 'before' }, // BA construction
    instrument: { primary: '用', alternatives: ['以'], position: 'before' },
  },
  keywords: {
    toggle: { primary: '切换', normalized: 'toggle' },
    add: { primary: '添加', alternatives: ['加'], normalized: 'add' },
    remove: { primary: '移除', alternatives: ['删除', '去掉'], normalized: 'remove' },
    put: { primary: '放', alternatives: ['放入', '放置'], normalized: 'put' },
    set: { primary: '设置', alternatives: ['设定'], normalized: 'set' },
    get: { primary: '获取', alternatives: ['取得'], normalized: 'get' },
    show: { primary: '显示', alternatives: ['展示'], normalized: 'show' },
    hide: { primary: '隐藏', normalized: 'hide' },
    on: { primary: '当', alternatives: ['在...时'], normalized: 'on' },
    trigger: { primary: '触发', normalized: 'trigger' },
    wait: { primary: '等待', normalized: 'wait' },
    fetch: { primary: '获取', normalized: 'fetch' },
    increment: { primary: '增加', normalized: 'increment' },
    decrement: { primary: '减少', normalized: 'decrement' },
  },
  tokenization: {
    boundaryStrategy: 'character',
  },
};

/**
 * Turkish language profile.
 * SOV word order, case suffixes (agglutinative), space-separated.
 */
export const turkishProfile: LanguageProfile = {
  code: 'tr',
  name: 'Turkish',
  nativeName: 'Türkçe',
  direction: 'ltr',
  wordOrder: 'SOV',
  markingStrategy: 'case-suffix',
  usesSpaces: true,
  verb: {
    position: 'end',
    suffixes: ['mek', 'mak', 'yor', 'di', 'miş'],
    subjectDrop: true,
  },
  roleMarkers: {
    patient: { primary: 'i', alternatives: ['ı', 'u', 'ü'], position: 'after' }, // Accusative
    destination: { primary: 'e', alternatives: ['a', 'de', 'da', 'te', 'ta'], position: 'after' }, // Dative/Locative
    source: { primary: 'den', alternatives: ['dan', 'ten', 'tan'], position: 'after' }, // Ablative
    instrument: { primary: 'le', alternatives: ['la', 'yle', 'yla'], position: 'after' }, // Instrumental
  },
  keywords: {
    toggle: { primary: 'değiştir', alternatives: ['aç/kapat'], normalized: 'toggle' },
    add: { primary: 'ekle', normalized: 'add' },
    remove: { primary: 'kaldır', alternatives: ['sil'], normalized: 'remove' },
    put: { primary: 'koy', normalized: 'put' },
    set: { primary: 'ayarla', normalized: 'set' },
    get: { primary: 'al', normalized: 'get' },
    show: { primary: 'göster', normalized: 'show' },
    hide: { primary: 'gizle', normalized: 'hide' },
    on: { primary: 'olduğunda', alternatives: ['zaman'], normalized: 'on' },
    trigger: { primary: 'tetikle', normalized: 'trigger' },
    wait: { primary: 'bekle', normalized: 'wait' },
    fetch: { primary: 'getir', normalized: 'fetch' },
    increment: { primary: 'artır', normalized: 'increment' },
    decrement: { primary: 'azalt', normalized: 'decrement' },
  },
};

// =============================================================================
// Profile Registry
// =============================================================================

/**
 * All available language profiles.
 */
export const languageProfiles: Record<string, LanguageProfile> = {
  en: englishProfile,
  ja: japaneseProfile,
  ar: arabicProfile,
  es: spanishProfile,
  ko: koreanProfile,
  zh: chineseProfile,
  tr: turkishProfile,
};

/**
 * Get a language profile by code.
 */
export function getProfile(code: string): LanguageProfile | undefined {
  return languageProfiles[code];
}

/**
 * Get all supported language codes.
 */
export function getSupportedLanguages(): string[] {
  return Object.keys(languageProfiles);
}

/**
 * Check if a language is supported.
 */
export function isLanguageSupported(code: string): boolean {
  return code in languageProfiles;
}
