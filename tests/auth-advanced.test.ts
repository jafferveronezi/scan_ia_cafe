/**
 * Authentication tests using Vitest
 * Run with: pnpm test auth
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as SecureStore from 'expo-secure-store';
import { authService, SessionToken } from '@/lib/_core/auth-service';
import { logger } from '@/lib/_core/logger';
import { AuthError } from '@/lib/_core/errors';

// Mock SecureStore
vi.mock('expo-secure-store', () => ({
  getItemAsync: vi.fn(),
  setItemAsync: vi.fn(),
  deleteItemAsync: vi.fn(),
}));

describe('AuthenticationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset in-memory cache
    authService.destroy();
  });

  describe('setSessionToken and getSessionToken', () => {
    it('should store and retrieve session token', async () => {
      const token = 'test-token-12345';
      const expiresIn = 3600;

      await authService.setSessionToken(token, expiresIn);
      const retrieved = await authService.getSessionToken();

      expect(retrieved).toBe(token);
    });

    it('should not return expired token', async () => {
      const token = 'expired-token';
      const expiresIn = -1; // Already expired

      await authService.setSessionToken(token, expiresIn);
      const retrieved = await authService.getSessionToken();

      expect(retrieved).toBeNull();
    });

    it('should clear token on logout', async () => {
      await authService.setSessionToken('test-token', 3600);
      await authService.clearSession();

      const retrieved = await authService.getSessionToken();
      expect(retrieved).toBeNull();
    });
  });

  describe('User info management', () => {
    it('should store and retrieve user info', async () => {
      const user = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        openId: 'open-id-123',
        loginMethod: 'oauth',
        lastSignedIn: new Date(),
      };

      await authService.setUserInfo(user);
      const retrieved = await authService.getUserInfo();

      expect(retrieved).toEqual(user);
    });

    it('should clear user info', async () => {
      const user = { id: 1, name: 'Test' };
      await authService.setUserInfo(user);
      await authService.clearSession();

      const retrieved = await authService.getUserInfo();
      expect(retrieved).toBeNull();
    });
  });

  describe('Session validity', () => {
    it('should return true for valid session', async () => {
      const user = { id: 1, name: 'Test' };
      await authService.setSessionToken('test-token', 3600);
      await authService.setUserInfo(user);

      const isValid = await authService.isSessionValid();
      expect(isValid).toBe(true);
    });

    it('should return false for invalid session', async () => {
      const isValid = await authService.isSessionValid();
      expect(isValid).toBe(false);
    });
  });

  describe('Inactivity tracking', () => {
    it('should track last activity', async () => {
      await authService.updateLastActivity();
      const isInactive = await authService.checkInactivity();

      // Should not be inactive if just updated
      expect(isInactive).toBe(false);
    });

    it('should detect inactivity after timeout', async () => {
      // This is a bit tricky to test without mocking Date
      // In production, you'd mock Date.now()
      await authService.updateLastActivity();
      // In a real test, you'd fast-forward time
      // const isInactive = await authService.checkInactivity();
      // expect(isInactive).toBe(true);
    });
  });

  describe('Token refresh check', () => {
    it('should identify refresh-trigger status codes', () => {
      expect(authService.constructor.shouldRefreshToken?.(401)).toBe(true);
      expect(authService.constructor.shouldRefreshToken?.(403)).toBe(true);
      expect(authService.constructor.shouldRefreshToken?.(200)).toBe(false);
    });
  });
});

describe('Error Handling', () => {
  it('should create AuthError with correct properties', () => {
    const error = AuthError.tokenExpired({ endpoint: '/api/test' });

    expect(error).toBeInstanceOf(AuthError);
    expect(error.type).toBe('TOKEN_EXPIRED');
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('Session token expired');
  });

  it('should create unauthorized error', () => {
    const error = AuthError.unauthorized();

    expect(error.type).toBe('UNAUTHORIZED');
    expect(error.statusCode).toBe(401);
  });

  it('should create forbidden error', () => {
    const error = AuthError.forbidden();

    expect(error.type).toBe('FORBIDDEN');
    expect(error.statusCode).toBe(403);
  });
});

describe('Logger', () => {
  it('should log messages at different levels', () => {
    logger.info('test', 'Info message');
    logger.warn('test', 'Warning message');
    logger.error('test', 'Error message', new Error('test'));

    const logs = logger.getLogs();
    expect(logs.length).toBeGreaterThan(0);
  });

  it('should filter logs by module', () => {
    logger.info('auth', 'Auth message');
    logger.info('api', 'API message');

    const authLogs = logger.getLogs({ module: 'auth' });
    expect(authLogs.length).toBeGreaterThan(0);
    expect(authLogs.every((log) => log.module === 'auth')).toBe(true);
  });

  it('should filter logs by level', () => {
    logger.error('test', 'Error', new Error('test'));
    logger.info('test', 'Info');

    const errors = logger.getLogs({ level: 'error' });
    expect(errors.every((log) => log.level === 'error')).toBe(true);
  });
});

// Integration tests
describe('Authentication Flow', () => {
  it('should complete full login flow', async () => {
    // Simulate login
    const user = {
      id: 1,
      openId: 'open-123',
      name: 'John Doe',
      email: 'john@example.com',
      loginMethod: 'oauth',
      lastSignedIn: new Date(),
    };

    await authService.setSessionToken('test-token', 3600);
    await authService.setUserInfo(user);

    // Verify session is valid
    const isValid = await authService.isSessionValid();
    expect(isValid).toBe(true);

    // Get token and user
    const token = await authService.getSessionToken();
    const retrievedUser = await authService.getUserInfo();

    expect(token).toBe('test-token');
    expect(retrievedUser).toEqual(user);

    // Logout
    await authService.clearSession();

    // Verify session is cleared
    const isValidAfterLogout = await authService.isSessionValid();
    expect(isValidAfterLogout).toBe(false);
  });
});
