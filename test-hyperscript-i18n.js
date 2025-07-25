// test-hyperscript-i18n.js

const assert = require('assert');
const HyperscriptI18n = require('./hyperscript-i18n.js');

describe('HyperscriptI18n', () => {
  describe('Spanish translations', () => {
    let translator;
    
    beforeEach(() => {
      translator = new HyperscriptI18n('es');
    });
    
    it('should translate basic commands', () => {
      assert.strictEqual(
        translator.translate('en clic alternar .clicked'),
        'on click toggle .clicked'
      );
    });
    
    it('should translate wait statements', () => {
      assert.strictEqual(
        translator.translate('esperar 2 segundos'),
        'wait 2 seconds'
      );
    });
    
    it('should translate conditionals', () => {
      const input = 'si verdadero entonces registrar "hola" sino registrar "adiós" fin';
      const expected = 'if true then log "hola" else log "adiós" end';
      assert.strictEqual(translator.translate(input), expected);
    });
    
    it('should preserve untranslated content', () => {
      const input = 'en clic establecer miVariable a 42';
      const expected = 'on click set miVariable to 42';
      assert.strictEqual(translator.translate(input), expected);
    });
    
    it('should handle complex expressions', () => {
      const input = `en clic
        si yo.classList.contains('activo')
          quitar .activo de yo
        sino
          agregar .activo a yo
        fin`;
      const expected = `on click
        if me.classList.contains('activo')
          remove .activo from me
        else
          add .activo to me
        end`;
      assert.strictEqual(translator.translate(input), expected);
    });
  });
  
  describe('Korean translations', () => {
    let translator;
    
    beforeEach(() => {
      translator = new HyperscriptI18n('ko');
    });
    
    it('should translate Korean keywords', () => {
      assert.strictEqual(
        translator.translate('클릭 대기 2 초'),
        'click wait 2 seconds'
      );
    });
  });
  
  describe('Chinese translations', () => {
    let translator;
    
    beforeEach(() => {
      translator = new HyperscriptI18n('zh');
    });
    
    it('should translate Chinese keywords', () => {
      assert.strictEqual(
        translator.translate('点击 等待 2 秒'),
        'click wait 2 seconds'
      );
    });
    
    it('should translate conditionals', () => {
      assert.strictEqual(
        translator.translate('如果 真 否则 假'),
        'if true else false'
      );
    });
  });
  
  describe('Edge cases', () => {
    let translator;
    
    beforeEach(() => {
      translator = new HyperscriptI18n('es');
    });
    
    it('should handle mixed case', () => {
      assert.strictEqual(
        translator.translate('EN CLIC ALTERNAR .clicked'),
        'on click toggle .clicked'
      );
    });
    
    it('should not translate within strings', () => {
      const input = 'registrar "no traducir si dentro de comillas"';
      const expected = 'log "no traducir si dentro de comillas"';
      assert.strictEqual(translator.translate(input), expected);
    });
    
    it('should handle empty input', () => {
      assert.strictEqual(translator.translate(''), '');
    });
    
    it('should handle unknown locale gracefully', () => {
      translator = new HyperscriptI18n('unknown');
      assert.strictEqual(
        translator.translate('en clic alternar .clicked'),
        'en clic alternar .clicked'
      );
    });
  });
});

// Run tests if executed directly
if (require.main === module) {
  console.log('Running HyperscriptI18n tests...\n');
  
  const tests = [
    { locale: 'es', input: 'en clic alternar .clicked', expected: 'on click toggle .clicked' },
    { locale: 'es', input: 'esperar 2 segundos', expected: 'wait 2 seconds' },
    { locale: 'es', input: 'si verdadero entonces registrar "hola"', expected: 'if true then log "hola"' },
    { locale: 'ko', input: '클릭 대기 2 초', expected: 'click wait 2 seconds' },
    { locale: 'zh', input: '如果 真 否则 假', expected: 'if true else false' },
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach((test, index) => {
    const translator = new HyperscriptI18n(test.locale);
    const result = translator.translate(test.input);
    
    if (result === test.expected) {
      console.log(`✓ Test ${index + 1} passed`);
      passed++;
    } else {
      console.log(`✗ Test ${index + 1} failed`);
      console.log(`  Input: ${test.input}`);
      console.log(`  Expected: ${test.expected}`);
      console.log(`  Actual: ${result}`);
      failed++;
    }
  });
  
  console.log(`\nTests: ${passed} passed, ${failed} failed`);
}
