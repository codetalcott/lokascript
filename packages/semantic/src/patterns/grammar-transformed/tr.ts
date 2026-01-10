/**
 * Turkish Grammar-Transformed Patterns
 *
 * These patterns match the hybrid output from GrammarTransformer where
 * event and command are combined in SOV order with attached suffixes:
 *   English: "on click toggle .active"
 *   Grammar output: ".activei tıklamade değiştir"
 *
 * Format: {patient}i tıklamade {action}
 * Note: Turkish uses agglutinative suffixes attached directly:
 *   - -i/-ı/-u/-ü: accusative (patient)
 *   - -de/-da: locative (event)
 *   - -e/-a: dative (destination)
 *
 * Tree-shakeable: Only included when Turkish is imported.
 */

import type { LanguagePattern } from '../../types';

/**
 * Get Turkish grammar-transformed patterns.
 */
export function getGrammarTransformedPatternsTr(): LanguagePattern[] {
  return [
    // ==========================================================================
    // Click + Toggle
    // ==========================================================================
    {
      id: 'grammar-tr-click-toggle',
      language: 'tr',
      command: 'on',
      priority: 75,
      template: {
        // Matches: ".activei tıklamade değiştir"
        format: '{patient} tıklamade değiştir',
        tokens: [
          { type: 'role', role: 'patient' },  // Captures ".activei" (with suffix)
          { type: 'literal', value: 'tıklamade', alternatives: ['tıklamada'] },
          { type: 'literal', value: 'değiştir', alternatives: ['değiştirmek', 'aç/kapat'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'toggle' } },
      },
    },

    // ==========================================================================
    // Click + Add
    // ==========================================================================
    {
      id: 'grammar-tr-click-add',
      language: 'tr',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} tıklamade ekle',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'tıklamade', alternatives: ['tıklamada'] },
          { type: 'literal', value: 'ekle', alternatives: ['eklemek', 'koy'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'add' } },
      },
    },

    // ==========================================================================
    // Click + Remove
    // ==========================================================================
    {
      id: 'grammar-tr-click-remove',
      language: 'tr',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} tıklamade kaldır',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'tıklamade', alternatives: ['tıklamada'] },
          { type: 'literal', value: 'kaldır', alternatives: ['kaldırmak', 'sil', 'çıkar'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'remove' } },
      },
    },

    // ==========================================================================
    // Click + Increment
    // ==========================================================================
    {
      id: 'grammar-tr-click-increment',
      language: 'tr',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} tıklamade artır',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'tıklamade', alternatives: ['tıklamada'] },
          { type: 'literal', value: 'artır', alternatives: ['artırmak', 'arttır'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'increment' } },
      },
    },

    // ==========================================================================
    // Click + Show
    // ==========================================================================
    {
      id: 'grammar-tr-click-show',
      language: 'tr',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} tıklamade göster',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'tıklamade', alternatives: ['tıklamada'] },
          { type: 'literal', value: 'göster', alternatives: ['göstermek', 'görüntüle'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'show' } },
      },
    },

    // ==========================================================================
    // Click + Hide
    // ==========================================================================
    {
      id: 'grammar-tr-click-hide',
      language: 'tr',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} tıklamade gizle',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'tıklamade', alternatives: ['tıklamada'] },
          { type: 'literal', value: 'gizle', alternatives: ['gizlemek', 'sakla'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'hide' } },
      },
    },

    // ==========================================================================
    // Click + Set
    // ==========================================================================
    {
      id: 'grammar-tr-click-set',
      language: 'tr',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} tıklamade ayarla',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'tıklamade', alternatives: ['tıklamada'] },
          { type: 'literal', value: 'ayarla', alternatives: ['ayarlamak', 'belirle'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'set' } },
      },
    },

    // ==========================================================================
    // Click + Decrement
    // ==========================================================================
    {
      id: 'grammar-tr-click-decrement',
      language: 'tr',
      command: 'on',
      priority: 75,
      template: {
        format: '{patient} tıklamade azalt',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'tıklamade', alternatives: ['tıklamada'] },
          { type: 'literal', value: 'azalt', alternatives: ['azaltmak', 'düşür'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'decrement' } },
      },
    },

    // ==========================================================================
    // THEN-CHAIN PATTERNS (with continuation marker)
    // Turkish uses "sonra" for "then"
    // ==========================================================================

    // Click + Wait then: "{duration} tıklamade bekle sonra"
    {
      id: 'grammar-tr-click-wait-then',
      language: 'tr',
      command: 'on',
      priority: 85,
      template: {
        format: '{duration} tıklamade bekle sonra',
        tokens: [
          { type: 'role', role: 'duration' },
          { type: 'literal', value: 'tıklamade', alternatives: ['tıklamada'] },
          { type: 'literal', value: 'bekle', alternatives: ['beklemek'] },
          { type: 'literal', value: 'sonra', alternatives: ['ardından'] },
        ],
      },
      extraction: {
        duration: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'wait' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // Click + Toggle then: "{patient} tıklamade değiştir sonra"
    {
      id: 'grammar-tr-click-toggle-then',
      language: 'tr',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} tıklamade değiştir sonra',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'tıklamade', alternatives: ['tıklamada'] },
          { type: 'literal', value: 'değiştir', alternatives: ['değiştirmek'] },
          { type: 'literal', value: 'sonra', alternatives: ['ardından'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'toggle' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // Click + Add then: "{patient} tıklamade ekle sonra"
    {
      id: 'grammar-tr-click-add-then',
      language: 'tr',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} tıklamade ekle sonra',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'tıklamade', alternatives: ['tıklamada'] },
          { type: 'literal', value: 'ekle', alternatives: ['eklemek'] },
          { type: 'literal', value: 'sonra', alternatives: ['ardından'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'add' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // Click + Remove then: "{patient} tıklamade kaldır sonra"
    {
      id: 'grammar-tr-click-remove-then',
      language: 'tr',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} tıklamade kaldır sonra',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'tıklamade', alternatives: ['tıklamada'] },
          { type: 'literal', value: 'kaldır', alternatives: ['kaldırmak'] },
          { type: 'literal', value: 'sonra', alternatives: ['ardından'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'remove' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // Click + Show then: "{patient} tıklamade göster sonra"
    {
      id: 'grammar-tr-click-show-then',
      language: 'tr',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} tıklamade göster sonra',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'tıklamade', alternatives: ['tıklamada'] },
          { type: 'literal', value: 'göster', alternatives: ['göstermek'] },
          { type: 'literal', value: 'sonra', alternatives: ['ardından'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'show' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // Click + Hide then: "{patient} tıklamade gizle sonra"
    {
      id: 'grammar-tr-click-hide-then',
      language: 'tr',
      command: 'on',
      priority: 85,
      template: {
        format: '{patient} tıklamade gizle sonra',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'tıklamade', alternatives: ['tıklamada'] },
          { type: 'literal', value: 'gizle', alternatives: ['gizlemek'] },
          { type: 'literal', value: 'sonra', alternatives: ['ardından'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        event: { default: { type: 'literal', value: 'click' } },
        action: { default: { type: 'literal', value: 'hide' } },
        continues: { default: { type: 'literal', value: 'then' } },
      },
    },

    // ==========================================================================
    // CONTINUATION PATTERNS (for body after then)
    // These match commands that follow the "sonra" keyword
    // ==========================================================================

    // Remove continuation: "{patient} kaldır"
    {
      id: 'grammar-tr-remove-continuation',
      language: 'tr',
      command: 'remove',
      priority: 70,
      template: {
        format: '{patient} kaldır',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'kaldır', alternatives: ['kaldırmak', 'sil', 'çıkar'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        action: { default: { type: 'literal', value: 'remove' } },
      },
    },

    // Toggle continuation: "{patient} değiştir"
    {
      id: 'grammar-tr-toggle-continuation',
      language: 'tr',
      command: 'toggle',
      priority: 70,
      template: {
        format: '{patient} değiştir',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'değiştir', alternatives: ['değiştirmek', 'aç/kapat'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        action: { default: { type: 'literal', value: 'toggle' } },
      },
    },

    // Add continuation: "{patient} ekle"
    {
      id: 'grammar-tr-add-continuation',
      language: 'tr',
      command: 'add',
      priority: 70,
      template: {
        format: '{patient} ekle',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'ekle', alternatives: ['eklemek', 'koy'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        action: { default: { type: 'literal', value: 'add' } },
      },
    },

    // Show continuation: "{patient} göster"
    {
      id: 'grammar-tr-show-continuation',
      language: 'tr',
      command: 'show',
      priority: 70,
      template: {
        format: '{patient} göster',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'göster', alternatives: ['göstermek', 'görüntüle'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        action: { default: { type: 'literal', value: 'show' } },
      },
    },

    // Hide continuation: "{patient} gizle"
    {
      id: 'grammar-tr-hide-continuation',
      language: 'tr',
      command: 'hide',
      priority: 70,
      template: {
        format: '{patient} gizle',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'literal', value: 'gizle', alternatives: ['gizlemek', 'sakla'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        action: { default: { type: 'literal', value: 'hide' } },
      },
    },

    // Put continuation: "{patient} {destination} koy"
    {
      id: 'grammar-tr-put-continuation',
      language: 'tr',
      command: 'put',
      priority: 72,
      template: {
        format: '{patient} {destination} koy',
        tokens: [
          { type: 'role', role: 'patient' },
          { type: 'role', role: 'destination' },
          { type: 'literal', value: 'koy', alternatives: ['koymak', 'yerleştir'] },
        ],
      },
      extraction: {
        patient: { position: 0 },
        destination: { position: 1 },
        action: { default: { type: 'literal', value: 'put' } },
      },
    },
  ];
}
