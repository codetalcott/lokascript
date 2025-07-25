/**
 * Tests for newly added language support
 * Turkish, Indonesian, Quechua, and Swahili
 */

import { describe, it, expect } from 'vitest';
import { HyperScriptTranslator } from './translator';
import { dictionaries } from './dictionaries';
import { PluralAwareTranslator, pluralRules } from './pluralization';

describe('New Language Support', () => {
  const translator = new HyperScriptTranslator();

  describe('Turkish (tr)', () => {
    it('should have complete dictionary coverage', () => {
      expect(dictionaries.tr).toBeDefined();
      expect(dictionaries.tr.commands.on).toBe('üzerinde');
      expect(dictionaries.tr.commands.add).toBe('ekle');
      expect(dictionaries.tr.commands.if).toBe('eğer');
      expect(dictionaries.tr.logical.and).toBe('ve');
      expect(dictionaries.tr.events.click).toBe('tıklama');
    });

    it('should translate basic commands', () => {
      const result = translator.translate('on click add .active to me', 'tr');
      expect(result).toContain('tıklama üzerinde');
      expect(result).toContain('ekle');
    });

    it('should handle conditional logic', () => {
      const result = translator.translate('if my value is empty then hide me else show me', 'tr');
      expect(result).toContain('eğer');
      expect(result).toContain('yoksa');
    });

    it('should translate time expressions', () => {
      const result = translator.translate('wait 3 seconds then continue', 'tr');
      expect(result).toContain('bekle');
      expect(result).toContain('saniye');
    });

    it('should handle events properly', () => {
      const result = translator.translate('on mouseenter add .hover', 'tr');
      expect(result).toContain('fare_gir');
      expect(result).toContain('ekle');
    });

    it('should support pluralization', () => {
      expect(pluralRules.tr).toBeDefined();
      expect(pluralRules.tr(1)).toBe('one');
      expect(pluralRules.tr(5)).toBe('other');
    });

    it('should handle plural time expressions', () => {
      const singular = PluralAwareTranslator.translateTimeExpression(1, 'second', 'tr');
      const plural = PluralAwareTranslator.translateTimeExpression(5, 'second', 'tr');
      expect(singular).toBe('1 saniye');
      expect(plural).toBe('5 saniye');
    });
  });

  describe('Indonesian (id)', () => {
    it('should have complete dictionary coverage', () => {
      expect(dictionaries.id).toBeDefined();
      expect(dictionaries.id.commands.on).toBe('pada');
      expect(dictionaries.id.commands.add).toBe('tambah');
      expect(dictionaries.id.commands.if).toBe('jika');
      expect(dictionaries.id.logical.and).toBe('dan');
      expect(dictionaries.id.events.click).toBe('klik');
    });

    it('should translate basic commands', () => {
      const result = translator.translate('on click toggle .selected', 'id');
      expect(result).toContain('klik pada');
      expect(result).toContain('ganti');
    });

    it('should handle form interactions', () => {
      const result = translator.translate('on submit take form data then send it', 'id');
      expect(result).toContain('wasilisha pada');
      expect(result).toContain('chukua');
      expect(result).toContain('kirim');
    });

    it('should translate async operations', () => {
      const result = translator.translate('fetch /api/data then put result into #content', 'id');
      expect(result).toContain('ambil');
      expect(result).toContain('taruh');
      expect(result).toContain('hasil');
    });

    it('should support simple pluralization (no actual plural forms)', () => {
      expect(pluralRules.id).toBeDefined();
      expect(pluralRules.id(1)).toBe('other');
      expect(pluralRules.id(5)).toBe('other');
    });

    it('should handle time expressions without pluralization', () => {
      const singular = PluralAwareTranslator.translateTimeExpression(1, 'minute', 'id');
      const plural = PluralAwareTranslator.translateTimeExpression(5, 'minute', 'id');
      expect(singular).toBe('1 menit');
      expect(plural).toBe('5 menit');
    });
  });

  describe('Quechua (qu)', () => {
    it('should have complete dictionary coverage', () => {
      expect(dictionaries.qu).toBeDefined();
      expect(dictionaries.qu.commands.on).toBe('kaqpi');
      expect(dictionaries.qu.commands.add).toBe('yapay');
      expect(dictionaries.qu.commands.if).toBe('sichus');
      expect(dictionaries.qu.logical.and).toBe('chaymanta');
      expect(dictionaries.qu.events.click).toBe('ñitiy');
    });

    it('should translate basic commands', () => {
      const result = translator.translate('on click put "Allin p\'unchaw" into #greeting', 'qu');
      expect(result).toContain('ñitiy kaqpi');
      expect(result).toContain('churay');
    });

    it('should handle complex expressions', () => {
      const result = translator.translate('if target matches .button then add .pressed', 'qu');
      expect(result).toContain('sichus');
      expect(result).toContain('tupan');
      expect(result).toContain('yapay');
    });

    it('should translate element references', () => {
      const result = translator.translate('tell closest .card to add .highlight', 'qu');
      expect(result).toContain('niy');
      expect(result).toContain('aswan_kaylla');
    });

    it('should support pluralization', () => {
      expect(pluralRules.qu).toBeDefined();
      expect(pluralRules.qu(1)).toBe('one');
      expect(pluralRules.qu(5)).toBe('other');
    });

    it('should handle plural time expressions', () => {
      const singular = PluralAwareTranslator.translateTimeExpression(1, 'hour', 'qu');
      const plural = PluralAwareTranslator.translateTimeExpression(3, 'hour', 'qu');
      expect(singular).toBe('1 hora');
      expect(plural).toBe('3 horakuna');
    });
  });

  describe('Swahili (sw)', () => {
    it('should have complete dictionary coverage', () => {
      expect(dictionaries.sw).toBeDefined();
      expect(dictionaries.sw.commands.on).toBe('kwenye');
      expect(dictionaries.sw.commands.add).toBe('ongeza');
      expect(dictionaries.sw.commands.if).toBe('kama');
      expect(dictionaries.sw.logical.and).toBe('na');
      expect(dictionaries.sw.events.click).toBe('bonyeza');
    });

    it('should translate basic commands', () => {
      const result = translator.translate('on click put "Habari za asubuhi" into .message', 'sw');
      expect(result).toContain('bonyeza kwenye');
      expect(result).toContain('weka');
    });

    it('should handle double-click events', () => {
      const result = translator.translate('on dblclick focus on me', 'sw');
      expect(result).toContain('bonyeza_mara_mbili');
      expect(result).toContain('zingatia');
    });

    it('should translate navigation commands', () => {
      const result = translator.translate('go to next .panel with transition', 'sw');
      expect(result).toContain('ijayo');
      expect(result).toContain('mpito');
    });

    it('should support pluralization', () => {
      expect(pluralRules.sw).toBeDefined();
      expect(pluralRules.sw(1)).toBe('one');
      expect(pluralRules.sw(5)).toBe('other');
    });

    it('should handle time expressions with special plural for hours', () => {
      const singularHour = PluralAwareTranslator.translateTimeExpression(1, 'hour', 'sw');
      const pluralHours = PluralAwareTranslator.translateTimeExpression(5, 'hour', 'sw');
      expect(singularHour).toBe('1 saa');
      expect(pluralHours).toBe('5 masaa');
    });
  });

  describe('Cross-language consistency', () => {
    const testExpressions = [
      'on click add .active',
      'if my value exists then show me',
      'wait 2 seconds then hide me',
      'on mouseenter tell closest .parent to add .hover',
      'fetch /api/data then put result into #content'
    ];

    const newLanguages = ['tr', 'id', 'qu', 'sw'];

    it('should translate all test expressions in all new languages', () => {
      for (const lang of newLanguages) {
        for (const expr of testExpressions) {
          expect(() => {
            const result = translator.translate(expr, lang);
            expect(result).toBeTruthy();
            expect(result.length).toBeGreaterThan(0);
          }).not.toThrow();
        }
      }
    });

    it('should maintain consistent command translations', () => {
      const commands = ['add', 'remove', 'show', 'hide', 'wait', 'put'];
      
      for (const lang of newLanguages) {
        const dict = dictionaries[lang];
        for (const cmd of commands) {
          expect(dict.commands[cmd]).toBeTruthy();
          expect(dict.commands[cmd].length).toBeGreaterThan(0);
        }
      }
    });

    it('should have consistent event translations', () => {
      const events = ['click', 'mouseenter', 'mouseleave', 'focus', 'blur', 'submit'];
      
      for (const lang of newLanguages) {
        const dict = dictionaries[lang];
        for (const event of events) {
          expect(dict.events[event]).toBeTruthy();
          expect(dict.events[event].length).toBeGreaterThan(0);
        }
      }
    });

    it('should support ordinal numbers in all new languages', () => {
      for (const lang of newLanguages) {
        const first = PluralAwareTranslator.getOrdinal(1, lang);
        const second = PluralAwareTranslator.getOrdinal(2, lang);
        const third = PluralAwareTranslator.getOrdinal(3, lang);
        
        expect(first).toBeTruthy();
        expect(second).toBeTruthy();
        expect(third).toBeTruthy();
        expect(first).not.toBe(second);
      }
    });
  });

  describe('Cultural and linguistic accuracy', () => {
    it('should use appropriate Turkish agglutination patterns', () => {
      const dict = dictionaries.tr;
      // Turkish typically uses suffixes, our translations should reflect this
      expect(dict.modifiers.to).toBe('e');
      expect(dict.modifiers.from).toBe('den');
      expect(dict.modifiers.in).toBe('içinde');
    });

    it('should use appropriate Indonesian word order', () => {
      const dict = dictionaries.id;
      // Indonesian follows SVO order, similar to English
      expect(dict.commands.if).toBe('jika');
      expect(dict.logical.then).toBe('lalu');
      expect(dict.logical.else).toBe('lainnya');
    });

    it('should reflect Quechua agglutinative nature', () => {
      const dict = dictionaries.qu;
      // Quechua uses complex suffixation
      expect(dict.modifiers.to).toBe('man');
      expect(dict.modifiers.from).toBe('manta');
      expect(dict.values.children).toBe('wawakuna'); // -kuna is plural marker
    });

    it('should use appropriate Swahili noun class system hints', () => {
      const dict = dictionaries.sw;
      // Swahili has noun classes, reflected in some translations
      expect(dict.attributes.children).toBe('watoto'); // wa- prefix for people
      expect(dict.values.window).toBe('dirisha'); // appropriate class
    });
  });

  describe('Real-world usage scenarios', () => {
    it('should handle e-commerce interactions in Turkish', () => {
      const expr = 'on click if stock exists then add product to cart else show out-of-stock message';
      const result = translator.translate(expr, 'tr');
      expect(result).toContain('tıklama üzerinde');
      expect(result).toContain('eğer');
      expect(result).toContain('yoksa');
    });

    it('should handle form validation in Indonesian', () => {
      const expr = 'on blur if my value is empty then add .error to closest .field';
      const result = translator.translate(expr, 'id');
      expect(result).toContain('blur pada');
      expect(result).toContain('jika');
      expect(result).toContain('kosong');
    });

    it('should handle social interactions in Quechua', () => {
      const expr = 'on click toggle .liked then send like-count to /api/likes';
      const result = translator.translate(expr, 'qu');
      expect(result).toContain('ñitiy kaqpi');
      expect(result).toContain('tikray');
      expect(result).toContain('kachay');
    });

    it('should handle dashboard updates in Swahili', () => {
      const expr = 'on load fetch /api/dashboard then for each item put item into next .widget';
      const result = translator.translate(expr, 'sw');
      expect(result).toContain('pakia kwenye');
      expect(result).toContain('leta');
      expect(result).toContain('kwa');
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle very long expressions efficiently', () => {
      const longExpr = 'on click if my value matches /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$/ then add .valid to closest .form-group then remove .invalid from closest .form-group then put "Valid email" into next .feedback else add .invalid to closest .form-group then remove .valid from closest .form-group then put "Invalid email format" into next .feedback';
      
      for (const lang of newLanguages) {
        expect(() => {
          const result = translator.translate(longExpr, lang);
          expect(result.length).toBeGreaterThan(0);
        }).not.toThrow();
      }
    });

    it('should handle expressions with mixed content', () => {
      const mixedExpr = 'on click put "Hello مرحبا Hola" into #multilingual-content';
      
      for (const lang of newLanguages) {
        const result = translator.translate(mixedExpr, lang);
        expect(result).toContain('"Hello مرحبا Hola"'); // String literals should be preserved
      }
    });

    it('should handle numeric expressions correctly', () => {
      const numericExpr = 'wait 1.5 seconds then set my opacity to 0.5';
      
      for (const lang of newLanguages) {
        const result = translator.translate(numericExpr, lang);
        expect(result).toContain('1.5');
        expect(result).toContain('0.5');
      }
    });
  });
});