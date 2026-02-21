/**
 * Voice/Accessibility Domain Types
 */

/**
 * Structured action spec extracted from a parsed voice command.
 * Useful for dispatchers that want typed access to command details
 * without re-parsing the SemanticNode.
 */
export interface VoiceActionSpec {
  action: string;
  target?: string;
  value?: string;
  direction?: string;
  amount?: string;
  metadata: {
    sourceLanguage: string;
  };
}
