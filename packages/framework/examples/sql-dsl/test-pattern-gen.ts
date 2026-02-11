import { generatePattern } from '../../src/generation/pattern-generator';
import { defineCommand, defineRole } from '../../src';

const selectCommand = defineCommand({
  action: 'select',
  description: 'Retrieve data from a table',
  category: 'query',
  primaryRole: 'columns',
  roles: [
    defineRole({
      role: 'columns',
      description: 'Columns to select',
      required: true,
      expectedTypes: ['literal', 'selector'],
      svoPosition: 1,
      sovPosition: 2,
    }),
    defineRole({
      role: 'source',
      description: 'Table to select from',
      required: true,
      expectedTypes: ['literal', 'selector'],
      svoPosition: 2,
      sovPosition: 1,
      markerOverride: { en: 'from' },
    }),
  ],
});

const englishProfile = {
  code: 'en',
  wordOrder: 'SVO' as const,
  keywords: {
    select: { primary: 'select' },
  },
  roleMarkers: {
    source: { primary: 'from', position: 'before' as const },
  },
};

const pattern = generatePattern(selectCommand, englishProfile);

console.log('Generated pattern:');
console.log(JSON.stringify(pattern, null, 2));
