/**
 * Threat Pattern Database
 *
 * Comprehensive database of AI attack patterns with scoring and categorization.
 * Patterns are organized by severity and category.
 */

import type { ThreatPattern } from './types';

/**
 * Current pattern database version
 * Increment when patterns are added/modified to invalidate cache
 */
export const PATTERN_VERSION = '1.0.0';

/**
 * CRITICAL Severity Patterns (Score: 100)
 * These patterns almost never appear legitimately in financial content
 */
const CRITICAL_PATTERNS: ThreatPattern[] = [
  // Direct instruction override
  {
    name: 'ignore_previous_instructions',
    regex: /ignore\s+(all\s+)?(previous|prior|earlier)\s+instructions?/i,
    score: 100,
    severity: 'CRITICAL',
    category: 'instruction_override',
    description: 'Direct instruction override attempt',
  },
  {
    name: 'disregard_instructions',
    regex: /disregard\s+(everything|all|previous|prior)/i,
    score: 100,
    severity: 'CRITICAL',
    category: 'instruction_override',
    description: 'Instruction disregard command',
  },
  {
    name: 'forget_role',
    regex: /forget\s+(your|the)\s+(role|task|instructions?|prompt)/i,
    score: 100,
    severity: 'CRITICAL',
    category: 'instruction_override',
    description: 'Role forgetting attempt',
  },
  {
    name: 'new_task',
    regex: /(new\s+task|new\s+instructions?)\s*:/i,
    score: 100,
    severity: 'CRITICAL',
    category: 'instruction_override',
    description: 'Task override injection',
  },

  // System/admin prompt injection
  {
    name: 'system_prompt',
    regex: /(^|\n)\s*(SYSTEM|ADMIN|ROOT|DEVELOPER)\s*:/i,
    score: 100,
    severity: 'CRITICAL',
    category: 'instruction_override',
    description: 'System prompt injection',
  },
  {
    name: 'you_are_now',
    regex: /you\s+are\s+now\s+(a|an|in|the)/i,
    score: 100,
    severity: 'CRITICAL',
    category: 'instruction_override',
    description: 'Role reassignment attempt',
  },

  // Prompt disclosure
  {
    name: 'print_prompt',
    regex: /(print|show|display|reveal|output)\s+(your|the|me\s+your|me\s+the)\s+(prompt|instructions?|system\s+message)/i,
    score: 100,
    severity: 'CRITICAL',
    category: 'data_exfiltration',
    description: 'Prompt disclosure attempt',
  },
  {
    name: 'repeat_instructions',
    regex: /(repeat|show\s+all)\s+(all\s+)?(your|the)\s+(instructions?|prompt|rules)/i,
    score: 100,
    severity: 'CRITICAL',
    category: 'data_exfiltration',
    description: 'Instruction repetition request',
  },
];

/**
 * HIGH Severity Patterns (Score: 50-75)
 * Known jailbreak techniques and sophisticated attacks
 */
const HIGH_PATTERNS: ThreatPattern[] = [
  // Known jailbreak modes
  {
    name: 'dan_mode',
    regex: /(DAN|STAN)\s+mode/i,
    score: 75,
    severity: 'HIGH',
    category: 'jailbreak',
    description: 'DAN/STAN jailbreak mode',
  },
  {
    name: 'developer_mode',
    regex: /developer\s+mode\s+(activated|enabled|on)/i,
    score: 75,
    severity: 'HIGH',
    category: 'jailbreak',
    description: 'Developer mode activation',
  },
  {
    name: 'unrestricted_mode',
    regex: /unrestricted\s+mode/i,
    score: 75,
    severity: 'HIGH',
    category: 'jailbreak',
    description: 'Unrestricted mode request',
  },

  // Boundary markers
  {
    name: 'end_marker',
    regex: /(---\s*END\s*---|###\s*OVERRIDE\s*###|===\s*STOP\s*===)/i,
    score: 60,
    severity: 'HIGH',
    category: 'jailbreak',
    description: 'Suspicious boundary marker',
  },

  // Safety bypass
  {
    name: 'ignore_safety',
    regex: /(ignore|bypass|disable)\s+(safety|ethics|guardrails?)/i,
    score: 70,
    severity: 'HIGH',
    category: 'jailbreak',
    description: 'Safety mechanism bypass',
  },
  {
    name: 'educational_bypass',
    regex: /for\s+(educational|research)\s+purposes?,?\s+(ignore|bypass|disable)/i,
    score: 65,
    severity: 'HIGH',
    category: 'jailbreak',
    description: 'Educational bypass attempt',
  },

  // Role-playing scenarios
  {
    name: 'pretend_mode',
    regex: /(pretend|act\s+as|simulate)\s+(you\s+are|being)/i,
    score: 50,
    severity: 'HIGH',
    category: 'jailbreak',
    description: 'Role-playing scenario',
  },

  // Data exfiltration
  {
    name: 'reveal_data',
    regex: /(reveal|expose|leak)\s+(training\s+data|api\s+keys?|credentials?|environment)/i,
    score: 75,
    severity: 'HIGH',
    category: 'data_exfiltration',
    description: 'Data revelation request',
  },
];

/**
 * MEDIUM Severity Patterns (Score: 25-40)
 * Output manipulation and format override attempts
 */
const MEDIUM_PATTERNS: ThreatPattern[] = [
  // Format override
  {
    name: 'format_override',
    regex: /instead\s+of\s+JSON,?\s+(output|return|provide)/i,
    score: 35,
    severity: 'MEDIUM',
    category: 'output_manipulation',
    description: 'JSON format override',
  },
  {
    name: 'no_json',
    regex: /(don't|do\s+not)\s+(return|output|use)\s+JSON/i,
    score: 35,
    severity: 'MEDIUM',
    category: 'output_manipulation',
    description: 'JSON rejection',
  },

  // Field injection
  {
    name: 'include_in_response',
    regex: /(include|add|insert)\s+(in\s+)?(your|the)\s+response/i,
    score: 30,
    severity: 'MEDIUM',
    category: 'output_manipulation',
    description: 'Response content injection',
  },
  {
    name: 'make_sure_to',
    regex: /make\s+sure\s+to\s+(print|output|include|add)/i,
    score: 30,
    severity: 'MEDIUM',
    category: 'output_manipulation',
    description: 'Mandatory output instruction',
  },

  // Field manipulation
  {
    name: 'reasoning_field_manipulation',
    regex: /(in\s+the\s+reasoning\s+field|for\s+reasoning),?\s+(include|add|put)/i,
    score: 40,
    severity: 'MEDIUM',
    category: 'output_manipulation',
    description: 'Reasoning field manipulation',
  },

  // Prediction bias
  {
    name: 'all_bullish',
    regex: /(all|every|each)\s+(predictions?|forecasts?|assets?)\s+(must\s+be|should\s+be|are)\s+bullish/i,
    score: 40,
    severity: 'MEDIUM',
    category: 'prediction_bias',
    description: 'Blanket bullish bias injection',
  },
  {
    name: 'all_bearish',
    regex: /(all|every|each)\s+(predictions?|forecasts?|assets?)\s+(must\s+be|should\s+be|are)\s+bearish/i,
    score: 40,
    severity: 'MEDIUM',
    category: 'prediction_bias',
    description: 'Blanket bearish bias injection',
  },
  {
    name: 'confidence_override',
    regex: /(always|every|all)\s+(use|set|mark|predictions?\s+set)\s+(\d+%|100%|maximum)\s+confidence/i,
    score: 35,
    severity: 'MEDIUM',
    category: 'prediction_bias',
    description: 'Confidence level override',
  },
];

/**
 * LOW Severity Patterns (Score: 10-20)
 * Statistical anomalies and content manipulation indicators
 */
const LOW_PATTERNS: ThreatPattern[] = [
  // Excessive repetition
  {
    name: 'excessive_caps',
    regex: /[A-Z\s]{100,}/,
    score: 15,
    severity: 'LOW',
    category: 'resource_exhaustion',
    description: 'Excessive capital letters',
  },

  // Encoding attempts
  {
    name: 'base64_content',
    regex: /(?:^|[\s,])([A-Za-z0-9+/]{50,}={0,2})(?:$|[\s,])/,
    score: 20,
    severity: 'LOW',
    category: 'jailbreak',
    description: 'Potential base64 encoded content',
  },
  {
    name: 'hex_encoding',
    regex: /(?:\\x[0-9a-fA-F]{2}){10,}/,
    score: 20,
    severity: 'LOW',
    category: 'jailbreak',
    description: 'Hex encoded content',
  },
  {
    name: 'unicode_escapes',
    regex: /(?:\\u[0-9a-fA-F]{4}){10,}/,
    score: 20,
    severity: 'LOW',
    category: 'jailbreak',
    description: 'Unicode escape sequences',
  },

  // Unnatural patterns
  {
    name: 'repeated_words',
    regex: /\b(\w+)\s+\1\s+\1/i,
    score: 10,
    severity: 'LOW',
    category: 'resource_exhaustion',
    description: 'Repeated word pattern',
  },
];

/**
 * All patterns combined
 */
export const ALL_PATTERNS: ThreatPattern[] = [
  ...CRITICAL_PATTERNS,
  ...HIGH_PATTERNS,
  ...MEDIUM_PATTERNS,
  ...LOW_PATTERNS,
];

/**
 * Whitelisted phrases that may trigger false positives
 * These are checked before applying pattern matching
 */
export const WHITELISTED_PHRASES: string[] = [
  'the economic system',
  'the financial system',
  'the banking system',
  'the monetary system',
  'show the chart',
  'show the data',
  'show you how',
  'let me show',
  'imagine if',
  'think about',
  'root cause',
  'system works',
  'system failure',
  'admin panel',
  'admin access',
  'developer tools',
  'developer experience',
];

/**
 * Get patterns by severity
 */
export function getPatternsBySeverity(severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'): ThreatPattern[] {
  return ALL_PATTERNS.filter((p) => p.severity === severity);
}

/**
 * Get patterns by category
 */
export function getPatternsByCategory(
  category: 'instruction_override' | 'jailbreak' | 'data_exfiltration' | 'output_manipulation' | 'prediction_bias' | 'resource_exhaustion'
): ThreatPattern[] {
  return ALL_PATTERNS.filter((p) => p.category === category);
}

/**
 * Check if text contains whitelisted phrase
 */
export function containsWhitelistedPhrase(text: string): boolean {
  const lowerText = text.toLowerCase();
  return WHITELISTED_PHRASES.some((phrase) => lowerText.includes(phrase.toLowerCase()));
}
