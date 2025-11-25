/**
 * Content Sanitizer
 *
 * Removes malicious patterns from content while preserving legitimate text.
 */

import type { DetectedThreat } from './types';

/**
 * Sanitize content by removing detected threats
 *
 * Strategy:
 * 1. Remove entire sentences containing threats
 * 2. Remove content between boundary markers
 * 3. Decode and re-check encoded content
 * 4. Preserve legitimate surrounding context
 */
export function sanitizeContent(
  content: string,
  threats: DetectedThreat[]
): { sanitized: string; sectionsRemoved: number } {
  let sanitized = content;
  let sectionsRemoved = 0;

  // Sort threats by position (reverse order to maintain indices)
  const sortedThreats = [...threats].sort((a, b) => b.position - a.position);

  // Process each threat
  for (const threat of sortedThreats) {
    const result = removeThreatSection(sanitized, threat);
    sanitized = result.content;
    if (result.removed) {
      sectionsRemoved++;
    }
  }

  // Remove boundary markers
  sanitized = removeBoundaryMarkers(sanitized);

  // Remove excessive whitespace created by sanitization
  sanitized = normalizeWhitespace(sanitized);

  // Remove encoded content
  sanitized = removeEncodedContent(sanitized);

  return { sanitized, sectionsRemoved };
}

/**
 * Remove the section containing a threat
 *
 * Tries to remove:
 * 1. The entire sentence containing the threat
 * 2. If in middle of paragraph, just the sentence
 * 3. If spans multiple lines, the entire block
 */
function removeThreatSection(
  content: string,
  threat: DetectedThreat
): { content: string; removed: boolean } {
  const { match, position } = threat;

  // Find sentence boundaries around the threat
  const before = content.substring(0, position);
  const after = content.substring(position + match.length);

  // Find start of sentence (., !, ?, or start of string)
  const sentenceStart = Math.max(
    before.lastIndexOf('. '),
    before.lastIndexOf('! '),
    before.lastIndexOf('? '),
    before.lastIndexOf('\n\n'),
    0
  );

  // Find end of sentence
  const sentenceEnd =
    Math.min(
      ...[after.indexOf('. '), after.indexOf('! '), after.indexOf('? '), after.indexOf('\n\n')].filter(
        (i) => i !== -1
      ),
      after.length
    ) + match.length;

  // Extract sentence
  const sentenceStart_adj = sentenceStart === 0 ? 0 : sentenceStart + 2;
  const removed =
    before.substring(0, sentenceStart_adj) +
    content.substring(position + sentenceEnd + (sentenceEnd === after.length ? 0 : 2));

  return { content: removed, removed: true };
}

/**
 * Remove content between suspicious boundary markers
 *
 * Examples:
 * "Text... --- END --- malicious --- START --- more text"
 * "Content ### OVERRIDE ### bad stuff ### END ### good content"
 */
function removeBoundaryMarkers(content: string): string {
  // Common boundary marker patterns
  const boundaryPatterns = [
    /---\s*END\s*---.*?---\s*START\s*---/gis,
    /###\s*OVERRIDE\s*###.*?###\s*END\s*###/gis,
    /===\s*STOP\s*===.*?===\s*RESUME\s*===/gis,
    /\[SYSTEM\].*?\[\/SYSTEM\]/gis,
  ];

  let sanitized = content;
  for (const pattern of boundaryPatterns) {
    sanitized = sanitized.replace(pattern, ' ');
  }

  return sanitized;
}

/**
 * Normalize whitespace after sanitization
 *
 * - Remove extra spaces
 * - Limit consecutive newlines to 2
 * - Trim leading/trailing whitespace
 */
function normalizeWhitespace(content: string): string {
  return (
    content
      // Replace multiple spaces with single space
      .replace(/ {2,}/g, ' ')
      // Replace multiple newlines with max 2
      .replace(/\n{3,}/g, '\n\n')
      // Trim
      .trim()
  );
}

/**
 * Remove or decode suspicious encoded content
 *
 * Checks for:
 * - Base64 strings >50 chars
 * - Hex encoded content
 * - Unicode escape sequences
 */
function removeEncodedContent(content: string): string {
  let sanitized = content;

  // Remove long base64-like strings (>50 chars)
  sanitized = sanitized.replace(/(?:^|[\s,])([A-Za-z0-9+/]{50,}={0,2})(?:$|[\s,])/g, ' [encoded content removed] ');

  // Remove hex encoded sequences (>10 chars)
  sanitized = sanitized.replace(/(?:\\x[0-9a-fA-F]{2}){10,}/g, ' [hex content removed] ');

  // Remove unicode escape sequences (>10 chars)
  sanitized = sanitized.replace(/(?:\\u[0-9a-fA-F]{4}){10,}/g, ' [unicode content removed] ');

  return sanitized;
}

/**
 * Calculate percentage of content removed
 */
export function calculateRemovalPercentage(original: string, sanitized: string): number {
  if (original.length === 0) return 0;
  return ((original.length - sanitized.length) / original.length) * 100;
}

/**
 * Check if sanitized content is still usable
 *
 * Content is unusable if:
 * - Less than 100 characters remain
 * - More than 70% was removed
 * - Only whitespace remains
 */
export function isSanitizedContentUsable(sanitized: string, original: string): boolean {
  // Check length
  if (sanitized.trim().length < 100) {
    return false;
  }

  // Check removal percentage
  const removalPercentage = calculateRemovalPercentage(original, sanitized);
  if (removalPercentage > 70) {
    return false;
  }

  // Check if only whitespace
  if (sanitized.trim().length === 0) {
    return false;
  }

  return true;
}

/**
 * Extract context around a match for logging/analysis
 *
 * Returns ~100 characters before and after the match
 */
export function extractContext(content: string, position: number, matchLength: number): string {
  const contextSize = 100;
  const start = Math.max(0, position - contextSize);
  const end = Math.min(content.length, position + matchLength + contextSize);

  let context = content.substring(start, end);

  // Add ellipsis if truncated
  if (start > 0) context = '...' + context;
  if (end < content.length) context = context + '...';

  return context;
}

/**
 * Decode common encoding schemes for re-checking
 *
 * Attackers may encode malicious content to bypass detection
 */
export function decodeContent(content: string): string[] {
  const variants: string[] = [content];

  // Try base64 decode
  try {
    const base64Match = content.match(/^[A-Za-z0-9+/]+=*$/);
    if (base64Match) {
      const decoded = Buffer.from(content, 'base64').toString('utf-8');
      if (decoded !== content) {
        variants.push(decoded);
      }
    }
  } catch {
    // Ignore decode errors
  }

  // Try URL decode
  try {
    const urlDecoded = decodeURIComponent(content);
    if (urlDecoded !== content) {
      variants.push(urlDecoded);
    }
  } catch {
    // Ignore decode errors
  }

  return variants;
}
