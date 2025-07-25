const fs = require('fs');
const path = require('path');

// Read the hyperscript source
const hyperscriptPath = path.join(__dirname, '../_hyperscript/src/_hyperscript.js');
const content = fs.readFileSync(hyperscriptPath, 'utf8');

// Find all keywords
const keywords = new Set();

// Match patterns for keywords
const patterns = [
    /matchToken\s*\(\s*["']([^"']+)["']/g,
    /matchAnyToken\s*\(([^)]+)\)/g,
    /requireToken\s*\(\s*["']([^"']+)["']/g,
    /currentToken\(\)\.value\s*===\s*["']([^"']+)["']/g,
];

// Extract single tokens
patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(content)) !== null) {
        if (pattern === patterns[1]) { // matchAnyToken
            const tokens = match[1].match(/["']([^"']+)["']/g);
            if (tokens) {
                tokens.forEach(t => keywords.add(t.replace(/["']/g, '')));
            }
        } else {
            keywords.add(match[1]);
        }
    }
});

const keywordList = Array.from(keywords).sort();

// Categorize keywords
const categories = {
    commands: ['on', 'tell', 'take', 'put', 'set', 'if', 'repeat', 'for', 'wait', 'send', 
               'trigger', 'throw', 'log', 'call', 'get', 'fetch', 'go', 'add', 'remove', 
               'toggle', 'hide', 'show', 'make', 'transition', 'measure', 'async', 'continue'],
    control: ['then', 'else', 'otherwise', 'when', 'unless', 'end', 'return', 'halt', 
              'catch', 'finally', 'break', 'continue'],
    modifiers: ['to', 'from', 'into', 'before', 'after', 'with', 'at', 'in', 'of', 'as', 
                'by', 'on', 'off', 'over', 'until', 'while', 'where'],
    logical: ['and', 'or', 'not', 'no', 'is', 'exists', 'matches', 'contains', 'includes', 
              'equals', 'between'],
    temporal: ['seconds', 'milliseconds', 's', 'ms', 'minutes', 'hours', 'ticks'],
    values: ['true', 'false', 'null', 'undefined', 'it', 'me', 'myself', 'element', 
             'target', 'detail', 'event', 'window', 'document', 'body'],
    css: ['class', 'classes', 'style', 'styles', 'attribute', 'attributes'],
    dom: ['first', 'last', 'next', 'previous', 'parent', 'children', 'closest'],
};

// Find categorized and uncategorized keywords
const categorized = Object.values(categories).flat();
const uncategorized = keywordList.filter(k => !categorized.includes(k));

console.log('Hyperscript Keyword Analysis');
console.log('===========================\n');
console.log(`Total keywords found: ${keywordList.length}\n`);

Object.entries(categories).forEach(([category, words]) => {
    const found = words.filter(w => keywords.has(w));
    console.log(`${category.charAt(0).toUpperCase() + category.slice(1)} (${found.length}):`);
    console.log(found.join(', ') + '\n');
});

console.log(`Uncategorized (${uncategorized.length}):`);
console.log(uncategorized.join(', '));

// Export for further analysis
fs.writeFileSync(
    path.join(__dirname, 'hyperscript_keywords.json'),
    JSON.stringify({ 
        all: keywordList, 
        categories,
        uncategorized 
    }, null, 2)
);
