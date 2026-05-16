/**
 * Custom error types for authentication and API calls
 */

export type ErrorType =
  | 'INVALID_CREDENTIALS'
  | 'TOKEN_EXPIRED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

export interface ErrorDetails {
  type: ErrorType;
  message: string;
  severity: ErrorSeverity;
  statusCode?: number;
  originalError?: Error;
  timestamp: Date;
  context?: Record<string, any>;
}

/**
 * Custom error class for application errors
 */
export class AppError extends Error {
  type: ErrorType;
  severity: ErrorSeverity;
  statusCode?: number;
  originalError?: Error;
  timestamp: Date;
  context?: Record<string, any>;

  constructor(
    message: string,
    type: ErrorType = 'UNKNOWN_ERROR',
    severity: ErrorSeverity = 'error',
    statusCode?: number,
    originalError?: Error,
    context?: Record<string, any>,
  ) {
    super(message);
    this.name = 'AppError';
    this.type = type;
    this.severity = severity;
    this.statusCode = statusCode;
    this.originalError = originalError;
    this.timestamp = new Date();
    this.context = context;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON(): ErrorDetails {
    return {
      type: this.type,
      message: this.message,
      severity: this.severity,
      statusCode: this.statusCode,
      timestamp: this.timestamp,
      context: this.context,
    };
  }
}

/**
 * Authentication-specific error
 */
export class AuthError extends AppError {
  constructor(
    message: string,
    type: ErrorType = 'UNAUTHORIZED',
    statusCode?: number,
    originalError?: Error,
    context?: Record<string, any>,
  ) {
    super(
      message,
      type,
      type === 'TOKEN_EXPIRED' ? 'warning' : type === 'FORBIDDEN' ? 'error' : 'error',
      statusCode,
      originalError,
      context,
    );
    this.name = 'AuthError';
    Object.setPrototypeOf(this, AuthError.prototype);
  }

  static tokenExpired(context?: Record<string, any>): AuthError {
    return new AuthError(
      'Session token expired. Please login again.',
      'TOKEN_EXPIRED',
      401,
      undefined,
      context,
    );
  }

  static invalidCredentials(context?: Record<string, any>): AuthError {
    return new AuthError(
      'Invalid credentials provided.',
      'INVALID_CREDENTIALS',
      401,
      undefined,
      context,
    );
  }

  static unauthorized(context?: Record<string, any>): AuthError {
    return new AuthError(
      'You are not authenticated. Please login.',
      'UNAUTHORIZED',
      401,
      undefined,
      context,
    );
  }

  static forbidden(context?: Record<string, any>): AuthError {
    return new AuthError(
      'You do not have permission to access this resource.',
      'FORBIDDEN',
      403,
      undefined,
      context,
    );
  }
}

/**
 * Network error
 */
export class NetworkError extends AppError {
  constructor(message: string, originalError?: Error, context?: Record<string, any>) {
    super(
      message || 'Network connection failed. Please check your connection.',
      'NETWORK_ERROR',
      'error',
      undefined,
      originalError,
      context,
    );
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 'error', 400, undefined, context);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Helper to classify HTTP errors
 */
export function classifyHttpError(
  statusCode: number,
  message: string,
  originalError?: Error,
): AppError {
  switch (statusCode) {
    case 401:
      return AuthError.unauthorized({ statusCode });
    case 403:
      return AuthError.forbidden({ statusCode });
    case 404:
      return new AppError(message, 'NOT_FOUND', 'warning', 404, originalError);
    case 400:
      return new ValidationError(message, { statusCode });
    case 500:
    case 502:
    case 503:
      return new AppError(message, 'SERVER_ERROR', 'error', statusCode, originalError);
    default:
      return new AppError(message, 'UNKNOWN_ERROR', 'error', statusCode, originalError);
  }
}
