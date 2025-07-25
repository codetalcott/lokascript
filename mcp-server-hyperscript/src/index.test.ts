// mcp-server-hyperscript/src/index.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { HyperscriptMCPServer } from './index';

describe('HyperscriptMCPServer', () => {
  let server: HyperscriptMCPServer;

  beforeEach(() => {
    server = new HyperscriptMCPServer();
  });

  describe('analyze_hyperscript', () => {
    it('should analyze valid hyperscript', async () => {
      const result = await server.analyzeHyperscript(
        'on click toggle .active'
      );
      
      expect(result.content[0].text).toContain('"valid": true');
      expect(result.content[0].text).toContain('"errors": []');
    });

    it('should detect syntax errors', async () => {
      const result = await server.analyzeHyperscript(
        'on click toggle' // Missing target
      );
      
      expect(result.content[0].text).toContain('"valid": false');
      expect(result.content[0].text).toContain('errors');
    });

    it('should analyze Spanish hyperscript', async () => {
      const result = await server.analyzeHyperscript(
        'en clic alternar .activo',
        'es'
      );
      
      expect(result.content[0].text).toContain('"valid": true');
    });
  });

  describe('generate_hyperscript', () => {
    it('should generate from natural language', async () => {
      const result = await server.generateHyperscript(
        'toggle a menu when clicking a button'
      );
      
      expect(result.content[0].text).toContain('click');
      expect(result.content[0].text).toContain('toggle');
    });

    it('should generate in Spanish', async () => {
      const result = await server.generateHyperscript(
        'toggle a menu when clicking a button',
        undefined,
        'es'
      );
      
      expect(result.content[0].text).toContain('clic');
      expect(result.content[0].text).toContain('alternar');
    });
  });

  describe('convert_to_hyperscript', () => {
    it('should convert jQuery to hyperscript', async () => {
      const result = await server.convertToHyperscript(
        `$('.btn').click(function() { $(this).toggleClass('active'); })`,
        'jquery'
      );
      
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.hyperscript).toContain('on click');
      expect(parsed.hyperscript).toContain('toggle .active');
    });

    it('should convert vanilla JS to hyperscript', async () => {
      const result = await server.convertToHyperscript(
        `document.querySelector('.btn').addEventListener('click', e => {
          e.target.classList.toggle('active');
        })`,
        'vanilla'
      );
      
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.hyperscript).toContain('on click');
      expect(parsed.hyperscript).toContain('toggle .active');
    });
  });

  describe('translate_hyperscript', () => {
    it('should translate between languages', async () => {
      const result = await server.translateHyperscript(
        'on click toggle .active',
        'en',
        'es'
      );
      
      expect(result.content[0].text).toBe('en clic alternar .active');
    });

    it('should handle complex translations', async () => {
      const result = await server.translateHyperscript(
        `on click
          if me matches .active
            remove .active from me
          else
            add .active to me
          end`,
        'en',
        'es'
      );
      
      expect(result.content[0].text).toContain('en clic');
      expect(result.content[0].text).toContain('si yo matches .active');
      expect(result.content[0].text).toContain('quitar .active de yo');
      expect(result.content[0].text).toContain('sino');
      expect(result.content[0].text).toContain('agregar .active a yo');
      expect(result.content[0].text).toContain('fin');
    });
  });

  describe('generate_tests', () => {
    it('should generate vitest tests', async () => {
      const result = await server.generateTests(
        'on click toggle .active',
        'vitest'
      );
      
      expect(result.content[0].text).toContain('describe');
      expect(result.content[0].text).toContain('it(');
      expect(result.content[0].text).toContain('expect(');
    });

    it('should generate playwright tests', async () => {
      const result = await server.generateTests(
        'on click toggle .active',
        'playwright'
      );
      
      expect(result.content[0].text).toContain('test(');
      expect(result.content[0].text).toContain('await page.');
    });
  });

  describe('resources', () => {
    it('should provide command documentation', async () => {
      const result = await server.readResource('hyperscript://docs/commands');
      
      expect(result.contents[0].text).toContain('# Hyperscript Commands Reference');
      expect(result.contents[0].text).toContain('on <event>');
      expect(result.contents[0].text).toContain('toggle');
    });

    it('should provide examples', async () => {
      const result = await server.readResource('hyperscript://examples');
      
      expect(result.contents[0].text).toContain('# Hyperscript Examples');
      expect(result.contents[0].text).toContain('Toggle Menu');
      expect(result.contents[0].text).toContain('Form Validation');
    });

    it('should provide i18n dictionaries', async () => {
      const result = await server.readResource('hyperscript://i18n/dictionaries');
      const dictionaries = JSON.parse(result.contents[0].text);
      
      expect(dictionaries).toHaveProperty('es');
      expect(dictionaries).toHaveProperty('ko');
      expect(dictionaries).toHaveProperty('zh');
      expect(dictionaries.es.clic).toBe('click');
    });
  });
});
