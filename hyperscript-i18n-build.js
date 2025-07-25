// hyperscript-i18n-build.js - Build-time translation for hyperscript

const fs = require('fs');
const path = require('path');
const { parse } = require('node-html-parser');

class HyperscriptI18nBuilder {
  constructor(options = {}) {
    this.sourceLocale = options.sourceLocale || 'es';
    this.targetLocale = options.targetLocale || 'en';
    this.preserveOriginal = options.preserveOriginal !== false;
    this.translator = new HyperscriptI18n(this.sourceLocale);
  }
  
  // Process a single file
  async processFile(inputPath, outputPath) {
    const content = await fs.promises.readFile(inputPath, 'utf8');
    const processed = this.processHtml(content);
    
    await fs.promises.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.promises.writeFile(outputPath, processed, 'utf8');
    
    return {
      input: inputPath,
      output: outputPath,
      translations: this.lastTranslationCount
    };
  }
  
  // Process HTML content
  processHtml(html) {
    const root = parse(html);
    const attributes = ['_', 'script', 'data-script'];
    let translationCount = 0;
    
    // Find all elements with hyperscript attributes
    attributes.forEach(attr => {
      const elements = root.querySelectorAll(`[${attr}]`);
      
      elements.forEach(element => {
        const original = element.getAttribute(attr);
        if (original) {
          const translated = this.translator.translate(original);
          
          if (original !== translated) {
            if (this.preserveOriginal) {
              element.setAttribute(`${attr}-${this.sourceLocale}`, original);
            }
            element.setAttribute(attr, translated);
            translationCount++;
          }
        }
      });
    });
    
    this.lastTranslationCount = translationCount;
    return root.toString();
  }
  
  // Process entire directory
  async processDirectory(inputDir, outputDir, options = {}) {
    const { pattern = '**/*.html', exclude = ['node_modules/**'] } = options;
    const results = [];
    
    const processRecursive = async (dir) => {
      const entries = await fs.promises.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        const relativePath = path.relative(inputDir, fullPath);
        
        if (entry.isDirectory()) {
          if (!exclude.some(pattern => relativePath.match(pattern))) {
            await processRecursive(fullPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
          const outputPath = path.join(outputDir, relativePath);
          const result = await this.processFile(fullPath, outputPath);
          results.push(result);
        }
      }
    };
    
    await processRecursive(inputDir);
    return results;
  }
  
  // Generate translation report
  generateReport(results) {
    const report = {
      summary: {
        filesProcessed: results.length,
        totalTranslations: results.reduce((sum, r) => sum + r.translations, 0),
        sourceLocale: this.sourceLocale,
        targetLocale: this.targetLocale
      },
      files: results
    };
    
    return report;
  }
}

// Webpack plugin
class HyperscriptI18nWebpackPlugin {
  constructor(options = {}) {
    this.builder = new HyperscriptI18nBuilder(options);
  }
  
  apply(compiler) {
    compiler.hooks.emit.tapAsync('HyperscriptI18nPlugin', (compilation, callback) => {
      const promises = [];
      
      Object.keys(compilation.assets).forEach(filename => {
        if (filename.endsWith('.html')) {
          const asset = compilation.assets[filename];
          const source = asset.source();
          const processed = this.builder.processHtml(source);
          
          compilation.assets[filename] = {
            source: () => processed,
            size: () => processed.length
          };
        }
      });
      
      callback();
    });
  }
}

// Vite plugin
function hyperscriptI18nVitePlugin(options = {}) {
  const builder = new HyperscriptI18nBuilder(options);
  
  return {
    name: 'hyperscript-i18n',
    transformIndexHtml(html) {
      return builder.processHtml(html);
    }
  };
}

// CLI tool
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('Usage: node hyperscript-i18n-build.js <input> <output> [source-locale] [target-locale]');
    process.exit(1);
  }
  
  const [input, output, sourceLocale = 'es', targetLocale = 'en'] = args;
  
  const builder = new HyperscriptI18nBuilder({
    sourceLocale,
    targetLocale,
    preserveOriginal: true
  });
  
  async function run() {
    try {
      const stats = await fs.promises.stat(input);
      let results;
      
      if (stats.isDirectory()) {
        results = await builder.processDirectory(input, output);
        console.log(`Processed ${results.length} files`);
      } else {
        const result = await builder.processFile(input, output);
        results = [result];
        console.log(`Processed: ${result.input} → ${result.output}`);
      }
      
      const report = builder.generateReport(results);
      console.log(`Total translations: ${report.summary.totalTranslations}`);
      
      // Save report
      const reportPath = path.join(output, 'i18n-report.json');
      await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
      console.log(`Report saved to: ${reportPath}`);
      
    } catch (error) {
      console.error('Error:', error.message);
      process.exit(1);
    }
  }
  
  run();
}

module.exports = {
  HyperscriptI18nBuilder,
  HyperscriptI18nWebpackPlugin,
  hyperscriptI18nVitePlugin
};
