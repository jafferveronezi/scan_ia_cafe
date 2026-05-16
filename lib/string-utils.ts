/**
 * Utility functions for string manipulation and formatting
 */

/**
 * Format date to readable string
 * @example
 * ```ts
 * formatDate(new Date()) // "16 de mai. de 2026"
 * ```
 */
export function formatDate(date: Date | string, locale: string = 'pt-BR'): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Data inválida';
  }
}

/**
 * Format date and time to readable string
 * @example
 * ```ts
 * formatDateTime(new Date()) // "16 de mai. de 2026, 14:30"
 * ```
 */
export function formatDateTime(date: Date | string, locale: string = 'pt-BR'): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch (error) {
    console.error('Error formatting date and time:', error);
    return 'Data e hora inválidas';
  }
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @example
 * ```ts
 * formatRelativeTime(new Date(Date.now() - 2 * 60 * 60 * 1000)) // "há 2 horas"
 * ```
 */
export function formatRelativeTime(date: Date | string): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

    const intervals: { [key: string]: number } = {
      ano: 31536000,
      mês: 2592000,
      semana: 604800,
      dia: 86400,
      hora: 3600,
      minuto: 60,
      segundo: 1,
    };

    for (const [name, secondsInInterval] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInInterval);
      if (interval >= 1) {
        return `há ${interval} ${interval === 1 ? name : name + 's'}`;
      }
    }

    return 'agora mesmo';
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'tempo inválido';
  }
}

/**
 * Capitalize first letter of string
 * @example
 * ```ts
 * capitalize('hello world') // "Hello world"
 * ```
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert camelCase to readable format
 * @example
 * ```ts
 * camelCaseToReadable('listaHistorico') // "Lista Histórico"
 * ```
 */
export function camelCaseToReadable(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

/**
 * Truncate string to specified length
 * @example
 * ```ts
 * truncate('Hello World', 5) // "Hello..."
 * ```
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + suffix;
}

/**
 * Format percentage
 * @example
 * ```ts
 * formatPercentage(0.92) // "92%"
 * formatPercentage(0.92, 1) // "92.0%"
 * ```
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format number with thousands separator
 * @example
 * ```ts
 * formatNumber(1234567) // "1.234.567"
 * formatNumber(1234567.89, 2) // "1.234.567,89"
 * ```
 */
export function formatNumber(
  num: number,
  decimals: number = 0,
  locale: string = 'pt-BR',
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format confidence score (0-1) to percentage
 * @example
 * ```ts
 * formatConfidence(0.92) // "92% de confiança"
 * ```
 */
export function formatConfidence(confidence: number): string {
  const percentage = formatPercentage(confidence, 1);
  return `${percentage} de confiança`;
}

/**
 * Check if string is email
 * @example
 * ```ts
 * isEmail('test@example.com') // true
 * isEmail('invalid') // false
 * ```
 */
export function isEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if string is URL
 * @example
 * ```ts
 * isUrl('https://example.com') // true
 * isUrl('not-a-url') // false
 * ```
 */
export function isUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Slugify string (convert to URL-friendly format)
 * @example
 * ```ts
 * slugify('Hello World!') // "hello-world"
 * ```
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract initials from name
 * @example
 * ```ts
 * getInitials('João Silva') // "JS"
 * ```
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Mask sensitive data (e.g., phone number, credit card)
 * @example
 * ```ts
 * maskSensitiveData('12345678901234', 4) // "********1234"
 * ```
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) return data;
  const masked = '*'.repeat(data.length - visibleChars);
  return masked + data.slice(-visibleChars);
}

/**
 * Pluralize word based on count
 * @example
 * ```ts
 * pluralize('diagnóstico', 1) // "1 diagnóstico"
 * pluralize('diagnóstico', 5) // "5 diagnósticos"
 * ```
 */
export function pluralize(word: string, count: number, plural?: string): string {
  if (count === 1) return `${count} ${word}`;
  return `${count} ${plural || word + 's'}`;
}

/**
 * Convert object to query string
 * @example
 * ```ts
 * toQueryString({ page: 1, limit: 10 }) // "page=1&limit=10"
 * ```
 */
export function toQueryString(obj: Record<string, any>): string {
  return Object.entries(obj)
    .filter(([, value]) => value !== null && value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

/**
 * Parse query string to object
 * @example
 * ```ts
 * parseQueryString('page=1&limit=10') // { page: '1', limit: '10' }
 * ```
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const obj: Record<string, string> = {};

  params.forEach((value, key) => {
    obj[key] = value;
  });

  return obj;
}
