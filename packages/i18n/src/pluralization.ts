// packages/i18n/src/pluralization.ts

/**
 * Pluralization rules for different languages
 */
export type PluralRule = (n: number) => 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/**
 * Pluralization rules based on Unicode CLDR
 */
export const pluralRules: Record<string, PluralRule> = {
  // English, German, Dutch, Swedish, etc.
  en: (n) => n === 1 ? 'one' : 'other',
  de: (n) => n === 1 ? 'one' : 'other',
  nl: (n) => n === 1 ? 'one' : 'other',
  sv: (n) => n === 1 ? 'one' : 'other',
  
  // Spanish, Italian, Portuguese
  es: (n) => n === 1 ? 'one' : 'other',
  it: (n) => n === 1 ? 'one' : 'other',
  pt: (n) => n === 1 ? 'one' : 'other',
  
  // French
  fr: (n) => n >= 0 && n < 2 ? 'one' : 'other',
  
  // Russian, Polish
  ru: (n) => {
    if (n % 10 === 1 && n % 100 !== 11) return 'one';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'few';
    return 'many';
  },
  pl: (n) => {
    if (n === 1) return 'one';
    if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'few';
    return 'many';
  },
  
  // Arabic
  ar: (n) => {
    if (n === 0) return 'zero';
    if (n === 1) return 'one';
    if (n === 2) return 'two';
    if (n % 100 >= 3 && n % 100 <= 10) return 'few';
    if (n % 100 >= 11 && n % 100 <= 99) return 'many';
    return 'other';
  },
  
  // Chinese, Japanese, Korean (no pluralization)
  zh: () => 'other',
  ja: () => 'other',
  ko: () => 'other',
  
  // Czech
  cs: (n) => {
    if (n === 1) return 'one';
    if (n >= 2 && n <= 4) return 'few';
    return 'other';
  },
  
  // Lithuanian
  lt: (n) => {
    if (n % 10 === 1 && n % 100 !== 11) return 'one';
    if (n % 10 >= 2 && n % 10 <= 9 && (n % 100 < 11 || n % 100 > 19)) return 'few';
    return 'other';
  },
};

/**
 * Plural forms for hyperscript keywords
 */
export interface PluralForms {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

/**
 * Get the appropriate plural form for a locale and count
 */
export function getPlural(locale: string, count: number, forms: PluralForms): string {
  const rule = pluralRules[locale] || pluralRules.en;
  const key = rule(count);
  
  return forms[key] || forms.other;
}

/**
 * Plural-aware translation for time expressions
 */
export const pluralTimeExpressions: Record<string, Record<string, PluralForms>> = {
  en: {
    second: {
      one: 'second',
      other: 'seconds',
    },
    minute: {
      one: 'minute',
      other: 'minutes',
    },
    hour: {
      one: 'hour',
      other: 'hours',
    },
    day: {
      one: 'day',
      other: 'days',
    },
  },
  
  es: {
    second: {
      one: 'segundo',
      other: 'segundos',
    },
    minute: {
      one: 'minuto',
      other: 'minutos',
    },
    hour: {
      one: 'hora',
      other: 'horas',
    },
    day: {
      one: 'día',
      other: 'días',
    },
  },
  
  fr: {
    second: {
      one: 'seconde',
      other: 'secondes',
    },
    minute: {
      one: 'minute',
      other: 'minutes',
    },
    hour: {
      one: 'heure',
      other: 'heures',
    },
    day: {
      one: 'jour',
      other: 'jours',
    },
  },
  
  de: {
    second: {
      one: 'Sekunde',
      other: 'Sekunden',
    },
    minute: {
      one: 'Minute',
      other: 'Minuten',
    },
    hour: {
      one: 'Stunde',
      other: 'Stunden',
    },
    day: {
      one: 'Tag',
      other: 'Tage',
    },
  },
  
  ru: {
    second: {
      one: 'секунда',
      few: 'секунды',
      many: 'секунд',
      other: 'секунд',
    },
    minute: {
      one: 'минута',
      few: 'минуты',
      many: 'минут',
      other: 'минут',
    },
    hour: {
      one: 'час',
      few: 'часа',
      many: 'часов',
      other: 'часов',
    },
    day: {
      one: 'день',
      few: 'дня',
      many: 'дней',
      other: 'дней',
    },
  },
  
  ar: {
    second: {
      zero: 'ثوانِ',
      one: 'ثانية',
      two: 'ثانيتان',
      few: 'ثوانِ',
      many: 'ثانية',
      other: 'ثانية',
    },
    minute: {
      zero: 'دقائق',
      one: 'دقيقة',
      two: 'دقيقتان',
      few: 'دقائق',
      many: 'دقيقة',
      other: 'دقيقة',
    },
    hour: {
      zero: 'ساعات',
      one: 'ساعة',
      two: 'ساعتان',
      few: 'ساعات',
      many: 'ساعة',
      other: 'ساعة',
    },
    day: {
      zero: 'أيام',
      one: 'يوم',
      two: 'يومان',
      few: 'أيام',
      many: 'يوماً',
      other: 'يوم',
    },
  },
};

/**
 * Enhanced translator with pluralization support
 */
export class PluralAwareTranslator {
  /**
   * Translate time expressions with proper pluralization
   */
  static translateTimeExpression(
    value: number,
    unit: string,
    locale: string
  ): string {
    const expressions = pluralTimeExpressions[locale];
    if (!expressions || !expressions[unit]) {
      return `${value} ${unit}${value === 1 ? '' : 's'}`;
    }

    const pluralForm = getPlural(locale, value, expressions[unit]);
    return `${value} ${pluralForm}`;
  }

  /**
   * Parse and translate plural-aware hyperscript time expressions
   */
  static translateHyperscriptTime(text: string, locale: string): string {
    // Match patterns like "wait 5 seconds", "in 1 minute", etc.
    return text.replace(
      /(\d+)\s+(second|seconds|minute|minutes|hour|hours|day|days|ms|millisecond|milliseconds)/gi,
      (match, value, unit) => {
        const numValue = parseInt(value);
        const normalizedUnit = unit.replace(/s$/, '').toLowerCase();
        
        if (normalizedUnit === 'ms' || normalizedUnit === 'millisecond') {
          return this.translateTimeExpression(numValue, 'millisecond', locale);
        }
        
        return this.translateTimeExpression(numValue, normalizedUnit, locale);
      }
    );
  }

  /**
   * Get ordinal numbers (1st, 2nd, 3rd) in different languages
   */
  static getOrdinal(n: number, locale: string): string {
    const ordinals: Record<string, (n: number) => string> = {
      en: (n) => {
        if (n % 100 >= 11 && n % 100 <= 13) return `${n}th`;
        switch (n % 10) {
          case 1: return `${n}st`;
          case 2: return `${n}nd`;
          case 3: return `${n}rd`;
          default: return `${n}th`;
        }
      },
      es: (n) => `${n}º`,
      fr: (n) => n === 1 ? `${n}er` : `${n}e`,
      de: (n) => `${n}.`,
      ru: (n) => `${n}-й`,
      ar: (n) => `${n}`,
      zh: (n) => `第${n}`,
      ja: (n) => `${n}番目`,
      ko: (n) => `${n}번째`,
    };

    const ordinalFn = ordinals[locale] || ordinals.en;
    return ordinalFn(n);
  }
}