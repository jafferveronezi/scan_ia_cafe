/**
 * Advanced authentication service with token management, refresh, and session handling
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { AUTH_STORAGE_KEYS, SESSION_TIMEOUTS, REFRESH_TRIGGER_STATUS_CODES } from '@/constants/auth';
import { logger } from './logger';
import { AuthError, AppError } from './errors';

const MODULE_NAME = 'AuthService';

export interface SessionToken {
  value: string;
  expiresAt: number; // timestamp in ms
  issuedAt: number; // timestamp in ms
}

export interface RefreshToken {
  value: string;
  expiresAt: number;
}

export interface AuthSession {
  sessionToken: SessionToken;
  refreshToken?: RefreshToken;
  user: any;
  lastActivity: number; // timestamp in ms
}

export interface TokenRefreshResponse {
  sessionToken: string;
  refreshToken?: string;
  expiresIn: number; // seconds
}

/**
 * Advanced authentication service
 */
class AuthenticationService {
  private inMemoryCache: {
    sessionToken: SessionToken | null;
    refreshToken: RefreshToken | null;
    user: any;
  } = {
    sessionToken: null,
    refreshToken: null,
    user: null,
  };

  private refreshTimeoutId: NodeJS.Timeout | null = null;
  private inactivityTimeoutId: NodeJS.Timeout | null = null;
  private onSessionExpired: (() => void) | null = null;

  constructor() {
    logger.info(MODULE_NAME, 'Initialized');
  }

  /**
   * Get current session token with expiration check
   */
  async getSessionToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        logger.debug(MODULE_NAME, 'Web platform: session token not managed client-side');
        return null;
      }

      // Check in-memory cache first
      if (this.inMemoryCache.sessionToken) {
        const { value, expiresAt } = this.inMemoryCache.sessionToken;
        const now = Date.now();

        // Check if token is still valid
        if (expiresAt > now) {
          logger.debug(MODULE_NAME, 'Session token retrieved from cache', {
            timeRemaining: expiresAt - now,
          });
          return value;
        }

        logger.warn(MODULE_NAME, 'Cached session token expired', { expiresAt, now });
        this.inMemoryCache.sessionToken = null;
      }

      // Try to retrieve from SecureStore
      const stored = await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.SESSION_TOKEN);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as SessionToken;
          const now = Date.now();

          if (parsed.expiresAt > now) {
            this.inMemoryCache.sessionToken = parsed;
            logger.debug(MODULE_NAME, 'Session token retrieved from SecureStore');
            return parsed.value;
          }

          logger.warn(MODULE_NAME, 'Stored session token expired');
          await SecureStore.deleteItemAsync(AUTH_STORAGE_KEYS.SESSION_TOKEN);
        } catch (e) {
          logger.error(MODULE_NAME, 'Failed to parse stored session token', e);
          await SecureStore.deleteItemAsync(AUTH_STORAGE_KEYS.SESSION_TOKEN);
        }
      }

      logger.debug(MODULE_NAME, 'No valid session token found');
      return null;
    } catch (error) {
      logger.error(MODULE_NAME, 'Failed to get session token', error);
      return null;
    }
  }

  /**
   * Store session token with expiration
   */
  async setSessionToken(token: string, expiresInSeconds: number): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        logger.debug(MODULE_NAME, 'Web platform: session token stored via cookie');
        return;
      }

      const now = Date.now();
      const sessionToken: SessionToken = {
        value: token,
        expiresAt: now + expiresInSeconds * 1000,
        issuedAt: now,
      };

      this.inMemoryCache.sessionToken = sessionToken;

      await SecureStore.setItemAsync(
        AUTH_STORAGE_KEYS.SESSION_TOKEN,
        JSON.stringify(sessionToken),
      );

      logger.info(MODULE_NAME, 'Session token stored', {
        expiresIn: expiresInSeconds,
      });

      // Schedule refresh when threshold reached
      this.scheduleTokenRefresh(expiresInSeconds);
    } catch (error) {
      logger.error(MODULE_NAME, 'Failed to set session token', error);
      throw new AppError('Failed to store session token', 'UNKNOWN_ERROR', 'error', 500, error as Error);
    }
  }

  /**
   * Store refresh token
   */
  async setRefreshToken(token: string, expiresInSeconds: number): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        logger.debug(MODULE_NAME, 'Web platform: refresh token stored via cookie');
        return;
      }

      const now = Date.now();
      const refreshToken: RefreshToken = {
        value: token,
        expiresAt: now + expiresInSeconds * 1000,
      };

      this.inMemoryCache.refreshToken = refreshToken;

      await SecureStore.setItemAsync(
        AUTH_STORAGE_KEYS.REFRESH_TOKEN,
        JSON.stringify(refreshToken),
      );

      logger.debug(MODULE_NAME, 'Refresh token stored');
    } catch (error) {
      logger.error(MODULE_NAME, 'Failed to set refresh token', error);
      // Don't throw - refresh token is optional
    }
  }

  /**
   * Check if current session is valid and active
   */
  async isSessionValid(): Promise<boolean> {
    try {
      const token = await this.getSessionToken();
      const user = await this.getUserInfo();
      const isValid = Boolean(token && user);

      logger.debug(MODULE_NAME, 'Session validity check', { isValid });
      return isValid;
    } catch (error) {
      logger.error(MODULE_NAME, 'Failed to validate session', error);
      return false;
    }
  }

  /**
   * Get user info from storage
   */
  async getUserInfo(): Promise<any | null> {
    try {
      let info: string | null = null;

      if (Platform.OS === 'web') {
        info = window.localStorage.getItem(AUTH_STORAGE_KEYS.USER_INFO);
      } else {
        // Check in-memory cache first
        if (this.inMemoryCache.user) {
          return this.inMemoryCache.user;
        }

        info = await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.USER_INFO);
      }

      if (!info) {
        logger.debug(MODULE_NAME, 'No user info found');
        return null;
      }

      const user = JSON.parse(info);
      this.inMemoryCache.user = user;
      logger.debug(MODULE_NAME, 'User info retrieved');
      return user;
    } catch (error) {
      logger.error(MODULE_NAME, 'Failed to get user info', error);
      return null;
    }
  }

  /**
   * Store user info
   */
  async setUserInfo(user: any): Promise<void> {
    try {
      this.inMemoryCache.user = user;

      if (Platform.OS === 'web') {
        window.localStorage.setItem(AUTH_STORAGE_KEYS.USER_INFO, JSON.stringify(user));
      } else {
        await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.USER_INFO, JSON.stringify(user));
      }

      logger.info(MODULE_NAME, 'User info stored', { userId: user?.id });
    } catch (error) {
      logger.error(MODULE_NAME, 'Failed to set user info', error);
    }
  }

  /**
   * Clear all authentication data
   */
  async clearSession(): Promise<void> {
    try {
      this.inMemoryCache = {
        sessionToken: null,
        refreshToken: null,
        user: null,
      };

      if (this.refreshTimeoutId) {
        clearTimeout(this.refreshTimeoutId);
      }
      if (this.inactivityTimeoutId) {
        clearTimeout(this.inactivityTimeoutId);
      }

      if (Platform.OS === 'web') {
        window.localStorage.removeItem(AUTH_STORAGE_KEYS.USER_INFO);
      } else {
        await SecureStore.deleteItemAsync(AUTH_STORAGE_KEYS.SESSION_TOKEN);
        await SecureStore.deleteItemAsync(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
        await SecureStore.deleteItemAsync(AUTH_STORAGE_KEYS.USER_INFO);
      }

      logger.info(MODULE_NAME, 'Session cleared');
    } catch (error) {
      logger.error(MODULE_NAME, 'Failed to clear session', error);
      throw new AppError('Failed to clear session', 'UNKNOWN_ERROR', 'error', 500, error as Error);
    }
  }

  /**
   * Update last activity timestamp for inactivity tracking
   */
  async updateLastActivity(): Promise<void> {
    try {
      const now = Date.now();

      if (Platform.OS === 'web') {
        window.localStorage.setItem(AUTH_STORAGE_KEYS.LAST_ACTIVITY, now.toString());
      } else {
        await SecureStore.setItemAsync(AUTH_STORAGE_KEYS.LAST_ACTIVITY, now.toString());
      }

      // Reset inactivity timeout
      this.resetInactivityTimeout();
    } catch (error) {
      logger.error(MODULE_NAME, 'Failed to update last activity', error);
    }
  }

  /**
   * Check if session has been inactive too long
   */
  async checkInactivity(): Promise<boolean> {
    try {
      let lastActivityStr: string | null = null;

      if (Platform.OS === 'web') {
        lastActivityStr = window.localStorage.getItem(AUTH_STORAGE_KEYS.LAST_ACTIVITY);
      } else {
        lastActivityStr = await SecureStore.getItemAsync(AUTH_STORAGE_KEYS.LAST_ACTIVITY);
      }

      if (!lastActivityStr) {
        return false;
      }

      const lastActivity = parseInt(lastActivityStr, 10);
      const now = Date.now();
      const inactiveTime = now - lastActivity;
      const isInactive = inactiveTime > SESSION_TIMEOUTS.INACTIVITY;

      if (isInactive) {
        logger.warn(MODULE_NAME, 'Session inactive too long', { inactiveTime });
      }

      return isInactive;
    } catch (error) {
      logger.error(MODULE_NAME, 'Failed to check inactivity', error);
      return false;
    }
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(expiresInSeconds: number): void {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
    }

    // Refresh when 10 minutes remaining
    const refreshTime = Math.max(expiresInSeconds - SESSION_TIMEOUTS.REFRESH_THRESHOLD / 1000, 1);

    this.refreshTimeoutId = setTimeout(() => {
      logger.info(MODULE_NAME, 'Scheduled token refresh time reached');
      // Emit event to trigger refresh in component
    }, refreshTime * 1000);

    logger.debug(MODULE_NAME, 'Token refresh scheduled', { in: refreshTime });
  }

  /**
   * Reset inactivity timeout
   */
  private resetInactivityTimeout(): void {
    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId);
    }

    this.inactivityTimeoutId = setTimeout(() => {
      logger.warn(MODULE_NAME, 'Session timeout: inactivity limit reached');
      this.onSessionExpired?.();
    }, SESSION_TIMEOUTS.INACTIVITY);
  }

  /**
   * Set callback for session expiration
   */
  setOnSessionExpired(callback: () => void): void {
    this.onSessionExpired = callback;
  }

  /**
   * Check if status code indicates token refresh should be attempted
   */
  static shouldRefreshToken(statusCode: number): boolean {
    return REFRESH_TRIGGER_STATUS_CODES.includes(statusCode as any);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.refreshTimeoutId) {
      clearTimeout(this.refreshTimeoutId);
    }
    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId);
    }
    logger.info(MODULE_NAME, 'Destroyed');
  }
}

// Export singleton instance
export const authService = new AuthenticationService();
