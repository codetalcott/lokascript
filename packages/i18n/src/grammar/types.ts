/**
 * Generalized Grammar System for Multilingual Hyperscript
 *
 * This system abstracts grammatical patterns across language families,
 * enabling deep multilingual support without per-language hardcoding.
 *
 * Key Linguistic Concepts:
 * - Word Order: SVO, SOV, VSO (and variations)
 * - Adposition Type: Preposition (English) vs Postposition (Japanese/Korean)
 * - Morphology: Isolating (Chinese) vs Agglutinative (Turkish) vs Fusional (Arabic)
 * - Text Direction: LTR vs RTL
 */

// =============================================================================
// Core Types
// =============================================================================

/**
 * Semantic roles in hyperscript commands
 * These are universal across all languages - only the surface form changes
 */
export type SemanticRole =
  | 'action'       // The command/verb (increment, put, toggle)
  | 'agent'        // Who/what performs action (me, the button)
  | 'patient'      // What is acted upon (the counter, .active)
  | 'source'       // Origin (from #input)
  | 'destination'  // Target location (into #output, to .class)
  | 'instrument'   // How (with animation, by 5)
  | 'event'        // Trigger (click, input, keydown)
  | 'condition'    // Boolean expression
  | 'quantity'     // Amount (by 5, 2 seconds)
  | 'manner'       // How something is done (quickly, over 500ms);

/**
 * Word order patterns
 * These represent the major typological categories
 */
export type WordOrder = 'SVO' | 'SOV' | 'VSO' | 'VOS' | 'OVS' | 'OSV' | 'free';

/**
 * Where grammatical markers appear relative to their noun/verb
 */
export type AdpositionType = 'preposition' | 'postposition' | 'circumposition' | 'none';

/**
 * Morphological typology - how words are constructed
 */
export type MorphologyType =
  | 'isolating'      // Chinese - no inflection, word order matters
  | 'agglutinative'  // Turkish, Japanese - morphemes stack predictably
  | 'fusional'       // Arabic, Spanish - morphemes blend together
  | 'polysynthetic'; // Quechua - complex words encode full sentences

/**
 * A grammatical marker (particle, case ending, preposition)
 */
export interface GrammaticalMarker {
  form: string;              // The actual text (を, に, to, 的)
  role: SemanticRole;        // What semantic role it marks
  position: AdpositionType;  // Where it appears
  required: boolean;         // Is it mandatory?
  alternatives?: string[];   // Alternative forms (e.g., 을/를 in Korean)
}

// =============================================================================
// Language Profile
// =============================================================================

/**
 * Complete grammatical profile for a language
 * This captures the essential typological features needed for transformation
 */
export interface LanguageProfile {
  code: string;           // ISO 639-1 code
  name: string;           // Native name

  // Typological features
  wordOrder: WordOrder;
  adpositionType: AdpositionType;
  morphology: MorphologyType;
  direction: 'ltr' | 'rtl';

  // Grammatical markers for each semantic role
  markers: GrammaticalMarker[];

  // Role ordering - which semantic roles come in what order
  // E.g., Japanese: ['patient', 'source', 'destination', 'action']
  // E.g., English: ['action', 'patient', 'source', 'destination']
  canonicalOrder: SemanticRole[];

  // Special rules
  rules?: GrammarRule[];
}

/**
 * Pattern for transforming hyperscript structures
 */
export interface GrammarRule {
  name: string;
  description: string;

  // Pattern matching (in canonical English form)
  match: PatternMatcher;

  // How to transform for this language
  transform: PatternTransform;

  // Priority (higher = checked first)
  priority: number;
}

/**
 * Matches a hyperscript pattern
 */
export interface PatternMatcher {
  // Command type(s) this matches
  commands?: string[];

  // Required semantic roles
  requiredRoles: SemanticRole[];

  // Optional roles
  optionalRoles?: SemanticRole[];

  // Custom predicate for complex matching
  predicate?: (parsed: ParsedStatement) => boolean;
}

/**
 * Defines how to transform a matched pattern
 */
export interface PatternTransform {
  // Reorder roles for target language
  roleOrder: SemanticRole[];

  // Insert markers between roles
  insertMarkers?: boolean;

  // Custom transformation function
  custom?: (parsed: ParsedStatement, profile: LanguageProfile) => string;
}

// =============================================================================
// Parsed Structures
// =============================================================================

/**
 * A parsed hyperscript statement broken into semantic components
 */
export interface ParsedStatement {
  type: 'event-handler' | 'command' | 'conditional' | 'loop';
  roles: Map<SemanticRole, ParsedElement>;
  original: string;
}

/**
 * A single element with its semantic role
 */
export interface ParsedElement {
  role: SemanticRole;
  value: string;           // Original English value
  translated?: string;     // Translated value
  isSelector?: boolean;    // CSS selector (don't translate)
  isLiteral?: boolean;     // Literal value (don't translate)
}

// =============================================================================
// Universal Pattern Templates
// =============================================================================

/**
 * Universal templates for common hyperscript patterns
 * These define the semantic structure independent of surface form
 */
export const UNIVERSAL_PATTERNS = {
  // on click increment #count
  eventIncrement: {
    name: 'event-increment',
    roles: ['event', 'action', 'patient'] as SemanticRole[],
    english: 'on {event} {action} {patient}',
  },

  // put X into Y
  putInto: {
    name: 'put-into',
    roles: ['action', 'patient', 'destination'] as SemanticRole[],
    english: '{action} {patient} into {destination}',
  },

  // add .class to element
  addTo: {
    name: 'add-to',
    roles: ['action', 'patient', 'destination'] as SemanticRole[],
    english: '{action} {patient} to {destination}',
  },

  // toggle .class on element
  toggleOn: {
    name: 'toggle-on',
    roles: ['action', 'patient', 'destination'] as SemanticRole[],
    english: '{action} {patient} on {destination}',
  },

  // wait 2 seconds
  waitDuration: {
    name: 'wait-duration',
    roles: ['action', 'quantity'] as SemanticRole[],
    english: '{action} {quantity}',
  },

  // if condition then ... end
  conditional: {
    name: 'conditional',
    roles: ['action', 'condition'] as SemanticRole[],
    english: '{action} {condition} then ... end',
  },

  // fetch URL as type
  fetchAs: {
    name: 'fetch-as',
    roles: ['action', 'source', 'manner'] as SemanticRole[],
    english: '{action} {source} as {manner}',
  },
} as const;

// =============================================================================
// Language Family Defaults
// =============================================================================

/**
 * Default profiles for major language families
 * Individual languages inherit and override these
 */
export const LANGUAGE_FAMILY_DEFAULTS: Record<string, Partial<LanguageProfile>> = {
  // Germanic (English, German, Dutch)
  germanic: {
    wordOrder: 'SVO',
    adpositionType: 'preposition',
    morphology: 'fusional',
    direction: 'ltr',
    canonicalOrder: ['action', 'patient', 'source', 'destination', 'instrument'],
  },

  // Romance (Spanish, French, Italian, Portuguese)
  romance: {
    wordOrder: 'SVO',
    adpositionType: 'preposition',
    morphology: 'fusional',
    direction: 'ltr',
    canonicalOrder: ['action', 'patient', 'source', 'destination', 'instrument'],
  },

  // Japonic (Japanese)
  japonic: {
    wordOrder: 'SOV',
    adpositionType: 'postposition',
    morphology: 'agglutinative',
    direction: 'ltr',
    canonicalOrder: ['patient', 'source', 'destination', 'instrument', 'action'],
  },

  // Koreanic (Korean)
  koreanic: {
    wordOrder: 'SOV',
    adpositionType: 'postposition',
    morphology: 'agglutinative',
    direction: 'ltr',
    canonicalOrder: ['patient', 'source', 'destination', 'instrument', 'action'],
  },

  // Turkic (Turkish, Azerbaijani)
  turkic: {
    wordOrder: 'SOV',
    adpositionType: 'postposition',
    morphology: 'agglutinative',
    direction: 'ltr',
    canonicalOrder: ['patient', 'source', 'destination', 'instrument', 'action'],
  },

  // Sinitic (Chinese, Cantonese)
  sinitic: {
    wordOrder: 'SVO',  // Topic-prominent, flexible
    adpositionType: 'preposition',
    morphology: 'isolating',
    direction: 'ltr',
    canonicalOrder: ['action', 'patient', 'source', 'destination', 'instrument'],
  },

  // Semitic (Arabic, Hebrew)
  semitic: {
    wordOrder: 'VSO',
    adpositionType: 'preposition',
    morphology: 'fusional',  // Root-pattern system
    direction: 'rtl',
    canonicalOrder: ['action', 'agent', 'patient', 'destination', 'source'],
  },

  // Austronesian (Indonesian, Tagalog)
  austronesian: {
    wordOrder: 'SVO',
    adpositionType: 'preposition',
    morphology: 'agglutinative',
    direction: 'ltr',
    canonicalOrder: ['action', 'patient', 'source', 'destination', 'instrument'],
  },

  // Quechuan (Quechua)
  quechuan: {
    wordOrder: 'SOV',
    adpositionType: 'postposition',
    morphology: 'agglutinative',  // Actually polysynthetic but simplified
    direction: 'ltr',
    canonicalOrder: ['patient', 'source', 'destination', 'instrument', 'action'],
  },

  // Bantu (Swahili)
  bantu: {
    wordOrder: 'SVO',
    adpositionType: 'preposition',
    morphology: 'agglutinative',
    direction: 'ltr',
    canonicalOrder: ['action', 'patient', 'source', 'destination', 'instrument'],
  },
};

// =============================================================================
// Transformation Utilities
// =============================================================================

/**
 * Reorder semantic roles according to target language
 */
export function reorderRoles(
  roles: Map<SemanticRole, ParsedElement>,
  targetOrder: SemanticRole[]
): ParsedElement[] {
  const result: ParsedElement[] = [];

  for (const role of targetOrder) {
    const element = roles.get(role);
    if (element) {
      result.push(element);
    }
  }

  return result;
}

/**
 * Insert grammatical markers between elements
 */
export function insertMarkers(
  elements: ParsedElement[],
  markers: GrammaticalMarker[],
  adpositionType: AdpositionType
): string[] {
  const result: string[] = [];

  for (const element of elements) {
    const marker = markers.find(m => m.role === element.role);

    if (marker) {
      if (adpositionType === 'preposition') {
        // Marker before element: "to element"
        if (marker.form) result.push(marker.form);
        result.push(element.translated || element.value);
      } else if (adpositionType === 'postposition') {
        // Marker after element: "element を"
        result.push(element.translated || element.value);
        if (marker.form) result.push(marker.form);
      } else {
        result.push(element.translated || element.value);
      }
    } else {
      result.push(element.translated || element.value);
    }
  }

  return result;
}

/**
 * Transform a parsed statement to target language
 */
export function transformStatement(
  parsed: ParsedStatement,
  sourceProfile: LanguageProfile,
  targetProfile: LanguageProfile
): string {
  // 1. Reorder roles for target language
  const reordered = reorderRoles(parsed.roles, targetProfile.canonicalOrder);

  // 2. Insert grammatical markers
  const withMarkers = insertMarkers(
    reordered,
    targetProfile.markers,
    targetProfile.adpositionType
  );

  // 3. Join with appropriate spacing
  // (RTL languages may need special handling)
  return withMarkers.join(' ');
}
