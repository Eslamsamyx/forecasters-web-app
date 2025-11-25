/**
 * Password Strength Calculator
 *
 * Calculates password strength based on entropy (information theory).
 * Higher entropy = stronger password.
 */

export interface PasswordStrength {
  score: number; // 0-100
  rating: 'VERY_WEAK' | 'WEAK' | 'FAIR' | 'GOOD' | 'STRONG' | 'VERY_STRONG';
  entropy: number; // bits of entropy
  feedback: string[];
  estimatedCrackTime: string;
}

/**
 * Calculate password strength
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  const entropy = calculateEntropy(password);
  const feedback: string[] = [];

  // Analyze password composition
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigits = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const length = password.length;

  // Provide feedback
  if (length < 12) {
    feedback.push('Use at least 12 characters');
  }
  if (!hasLowercase) {
    feedback.push('Add lowercase letters');
  }
  if (!hasUppercase) {
    feedback.push('Add uppercase letters');
  }
  if (!hasDigits) {
    feedback.push('Add numbers');
  }
  if (!hasSpecial) {
    feedback.push('Add special characters (!@#$%^&*)');
  }

  // Check for common patterns
  if (hasCommonPattern(password)) {
    feedback.push('Avoid common patterns (123, abc, qwerty)');
  }

  // Check for repeated characters
  if (hasRepeatedCharacters(password)) {
    feedback.push('Avoid repeated characters');
  }

  // Determine rating based on entropy
  let rating: PasswordStrength['rating'];
  let score: number;

  if (entropy < 28) {
    rating = 'VERY_WEAK';
    score = Math.min((entropy / 28) * 20, 20);
  } else if (entropy < 36) {
    rating = 'WEAK';
    score = 20 + Math.min(((entropy - 28) / 8) * 20, 20);
  } else if (entropy < 60) {
    rating = 'FAIR';
    score = 40 + Math.min(((entropy - 36) / 24) * 20, 20);
  } else if (entropy < 80) {
    rating = 'GOOD';
    score = 60 + Math.min(((entropy - 60) / 20) * 20, 20);
  } else if (entropy < 100) {
    rating = 'STRONG';
    score = 80 + Math.min(((entropy - 80) / 20) * 15, 15);
  } else {
    rating = 'VERY_STRONG';
    score = 95 + Math.min((entropy - 100) / 20, 5);
  }

  // Calculate estimated crack time
  const estimatedCrackTime = estimateCrackTime(entropy);

  return {
    score: Math.round(score),
    rating,
    entropy: Math.round(entropy * 100) / 100,
    feedback,
    estimatedCrackTime,
  };
}

/**
 * Calculate Shannon entropy (bits)
 *
 * Entropy = log2(possible_combinations)
 * Higher entropy = more random = stronger
 */
function calculateEntropy(password: string): number {
  // Determine character space size
  let charSpace = 0;

  if (/[a-z]/.test(password)) charSpace += 26; // lowercase
  if (/[A-Z]/.test(password)) charSpace += 26; // uppercase
  if (/[0-9]/.test(password)) charSpace += 10; // digits
  if (/[^A-Za-z0-9]/.test(password)) charSpace += 32; // special chars (approx)

  // If no recognizable characters, assume minimal space
  if (charSpace === 0) charSpace = 10;

  // Entropy = length * log2(charSpace)
  // But adjust for patterns and repetition
  const baseEntropy = password.length * Math.log2(charSpace);

  // Penalty for patterns
  let penalty = 0;
  if (hasCommonPattern(password)) penalty += 10;
  if (hasRepeatedCharacters(password)) penalty += 5;
  if (hasSequentialCharacters(password)) penalty += 5;

  return Math.max(0, baseEntropy - penalty);
}

/**
 * Check for common patterns
 */
function hasCommonPattern(password: string): boolean {
  const commonPatterns = [
    /123/,
    /abc/i,
    /qwerty/i,
    /password/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
    /monkey/i,
    /dragon/i,
  ];

  return commonPatterns.some((pattern) => pattern.test(password));
}

/**
 * Check for repeated characters (aaa, 111, etc.)
 */
function hasRepeatedCharacters(password: string): boolean {
  return /(.)\1{2,}/.test(password);
}

/**
 * Check for sequential characters (abc, 123, etc.)
 */
function hasSequentialCharacters(password: string): boolean {
  for (let i = 0; i < password.length - 2; i++) {
    const char1 = password.charCodeAt(i);
    const char2 = password.charCodeAt(i + 1);
    const char3 = password.charCodeAt(i + 2);

    if (char2 === char1 + 1 && char3 === char2 + 1) {
      return true;
    }
    if (char2 === char1 - 1 && char3 === char2 - 1) {
      return true;
    }
  }
  return false;
}

/**
 * Estimate time to crack password using brute force
 * Assumes: 1 billion guesses per second (modern GPU)
 */
function estimateCrackTime(entropy: number): string {
  // Possible combinations = 2^entropy
  // Time = combinations / guesses_per_second
  const combinations = Math.pow(2, entropy);
  const guessesPerSecond = 1e9; // 1 billion
  const seconds = combinations / guessesPerSecond;

  // Convert to human-readable format
  if (seconds < 1) return 'Instant';
  if (seconds < 60) return `${Math.round(seconds)} seconds`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
  if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
  return `${Math.round(seconds / 31536000000)} centuries`;
}

/**
 * Generate a strong random password
 */
export function generateStrongPassword(length: number = 16): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const special = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  const allChars = lowercase + uppercase + digits + special;

  // Ensure at least one of each type
  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += special[Math.floor(Math.random() * special.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password
  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}
