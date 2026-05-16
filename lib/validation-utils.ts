/**
 * Data validation and sanitization utilities
 * Used to ensure data integrity and prevent common vulnerabilities
 */

import { isEmail, isUrl } from './string-utils';

/**
 * Sanitize string input to prevent XSS
 * @example
 * ```ts
 * sanitizeString('<script>alert("xss")</script>') // "scriptalert(xss)/script"
 * ```
 */
export function sanitizeString(input: string): string {
  if (!input) return '';

  return input
    .replace(/[<>]/g, '') // Remove < and >
    .trim();
}

/**
 * Sanitize object recursively
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    const value = sanitized[key];

    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value) as any;
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    }
  }

  return sanitized;
}

/**
 * Validate input against regex pattern
 * @example
 * ```ts
 * validatePattern('test123', /^[a-z0-9]+$/) // true
 * ```
 */
export function validatePattern(input: string, pattern: RegExp): boolean {
  return pattern.test(input);
}

/**
 * Validate email address
 * @example
 * ```ts
 * validateEmail('test@example.com') // true
 * ```
 */
export function validateEmail(email: string): boolean {
  return isEmail(email);
}

/**
 * Validate URL
 * @example
 * ```ts
 * validateUrl('https://example.com') // true
 * ```
 */
export function validateUrl(url: string): boolean {
  return isUrl(url);
}

/**
 * Validate password strength
 * @example
 * ```ts
 * validatePassword('SecurePass123!') // { valid: true, score: 4 }
 * ```
 */
export interface PasswordValidation {
  valid: boolean;
  score: number; // 0-5
  feedback: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score++;
  else feedback.push('Mínimo 8 caracteres');

  if (password.length >= 12) score++;

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Adicione letras minúsculas');

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Adicione letras maiúsculas');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Adicione números');

  if (/[^a-zA-Z0-9]/.test(password)) score++;
  else feedback.push('Adicione caracteres especiais');

  return {
    valid: score >= 3,
    score: Math.min(score, 5),
    feedback,
  };
}

/**
 * Validate phone number (Brazilian format)
 * @example
 * ```ts
 * validatePhone('(11) 98765-4321') // true
 * ```
 */
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\(?[1-9]{2}\)?\s?9?\d{4}-?\d{4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate CPF (Brazilian ID)
 * @example
 * ```ts
 * validateCPF('12345678901') // true/false based on algorithm
 * ```
 */
export function validateCPF(cpf: string): boolean {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false; // All same digits

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
}

/**
 * Validate URL query parameters
 * @example
 * ```ts
 * validateQueryParam('page', '1', { min: 1, max: 100 }) // true
 * ```
 */
export function validateQueryParam(
  name: string,
  value: string,
  options?: { min?: number; max?: number; pattern?: RegExp },
): boolean {
  if (!value) return false;

  if (options?.pattern && !validatePattern(value, options.pattern)) {
    return false;
  }

  if (options?.min !== undefined) {
    const num = parseInt(value);
    if (isNaN(num) || num < options.min) return false;
  }

  if (options?.max !== undefined) {
    const num = parseInt(value);
    if (isNaN(num) || num > options.max) return false;
  }

  return true;
}

/**
 * Validate confidence score (0-1)
 * @example
 * ```ts
 * validateConfidence(0.92) // true
 * validateConfidence(1.5) // false
 * ```
 */
export function validateConfidence(value: number): boolean {
  return typeof value === 'number' && value >= 0 && value <= 1;
}

/**
 * Validate image URL
 * @example
 * ```ts
 * validateImageUrl('https://example.com/image.jpg') // true
 * ```
 */
export function validateImageUrl(url: string): boolean {
  if (!isUrl(url)) return false;

  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const lowercaseUrl = url.toLowerCase();

  return imageExtensions.some((ext) => lowercaseUrl.includes(ext)) || url.includes('data:image');
}

/**
 * Validate ISO datetime string
 * @example
 * ```ts
 * validateDateTime('2026-05-16T14:30:00Z') // true
 * ```
 */
export function validateDateTime(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Validate array of values against allowed values
 * @example
 * ```ts
 * validateEnum('LOW', ['LOW', 'MEDIUM', 'HIGH']) // true
 * ```
 */
export function validateEnum<T>(value: any, allowedValues: T[]): value is T {
  return allowedValues.includes(value as T);
}

/**
 * Validate object has required keys
 * @example
 * ```ts
 * validateRequiredKeys({ a: 1, b: 2 }, ['a', 'b']) // true
 * ```
 */
export function validateRequiredKeys(obj: Record<string, any>, keys: string[]): boolean {
  return keys.every((key) => key in obj && obj[key] !== null && obj[key] !== undefined);
}

/**
 * Validate number is within range
 * @example
 * ```ts
 * validateRange(5, 1, 10) // true
 * ```
 */
export function validateRange(value: number, min: number, max: number): boolean {
  return typeof value === 'number' && value >= min && value <= max;
}

/**
 * Comprehensive validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate complete user input object
 * @example
 * ```ts
 * validateUserInput({ email: 'test@example.com', password: 'SecurePass123!' })
 * ```
 */
export function validateUserInput(input: {
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
}): ValidationResult {
  const errors: string[] = [];

  if (input.email && !validateEmail(input.email)) {
    errors.push('Email inválido');
  }

  if (input.password) {
    const passwordCheck = validatePassword(input.password);
    if (!passwordCheck.valid) {
      errors.push(...passwordCheck.feedback);
    }
  }

  if (input.name && input.name.length < 2) {
    errors.push('Nome deve ter pelo menos 2 caracteres');
  }

  if (input.phone && !validatePhone(input.phone)) {
    errors.push('Telefone inválido');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
