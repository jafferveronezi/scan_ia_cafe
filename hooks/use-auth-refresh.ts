/**
 * Hook for automatic token refresh and session management
 */

import { useEffect, useRef } from 'react';
import { logger } from '@/lib/_core/logger';
import { authService } from '@/lib/_core/auth-service';
import * as Api from '@/lib/_core/api';

const MODULE_NAME = 'useAuthRefresh';

interface UseAuthRefreshOptions {
  /**
   * Callback when token refresh fails
   */
  onRefreshFailed?: () => void;

  /**
   * Callback when session expires
   */
  onSessionExpired?: () => void;

  /**
   * Enable automatic session activity tracking
   */
  trackActivity?: boolean;
}

/**
 * Hook to manage automatic token refresh and session timeouts
 *
 * @example
 * ```tsx
 * export default function App() {
 *   useAuthRefresh({
 *     onRefreshFailed: () => router.replace('/(auth)/login'),
 *     onSessionExpired: () => router.replace('/(auth)/login'),
 *     trackActivity: true,
 *   });
 *
 *   return <NavigationContainer>{...}</NavigationContainer>;
 * }
 * ```
 */
export function useAuthRefresh(options?: UseAuthRefreshOptions) {
  const refreshAttemptRef = useRef(0);
  const MAX_REFRESH_ATTEMPTS = 3;

  useEffect(() => {
    // Set session expired callback
    if (options?.onSessionExpired) {
      authService.setOnSessionExpired(() => {
        logger.warn(MODULE_NAME, 'Session expired callback triggered');
        options.onSessionExpired?.();
      });
    }

    // Handle inactivity check
    const handleUserActivity = async () => {
      if (options?.trackActivity) {
        try {
          const isInactive = await authService.checkInactivity();
          if (isInactive) {
            logger.warn(MODULE_NAME, 'User activity detected after inactivity');
            options.onSessionExpired?.();
            return;
          }

          await authService.updateLastActivity();
        } catch (error) {
          logger.error(MODULE_NAME, 'Failed to update activity', error);
        }
      }
    };

    // Set up activity listeners
    const listeners: Array<{ eventName: string; handler: () => void }> = [];

    if (options?.trackActivity && typeof document !== 'undefined') {
      const eventNames = ['mousedown', 'keydown', 'scroll', 'touchstart'];

      eventNames.forEach((eventName) => {
        listeners.push({
          eventName,
          handler: handleUserActivity,
        });
        document.addEventListener(eventName, handleUserActivity);
      });
    }

    return () => {
      // Cleanup activity listeners
      if (typeof document !== 'undefined') {
        listeners.forEach(({ eventName, handler }) => {
          document.removeEventListener(eventName, handler);
        });
      }
    };
  }, [options?.trackActivity, options?.onSessionExpired]);

  /**
   * Manually trigger token refresh
   */
  const refreshToken = async (): Promise<boolean> => {
    try {
      if (refreshAttemptRef.current >= MAX_REFRESH_ATTEMPTS) {
        logger.error(MODULE_NAME, 'Max refresh attempts reached');
        options?.onRefreshFailed?.();
        return false;
      }

      refreshAttemptRef.current += 1;
      logger.info(MODULE_NAME, 'Attempting token refresh', {
        attempt: refreshAttemptRef.current,
      });

      const result = await Api.refreshAuthToken();

      if (result) {
        refreshAttemptRef.current = 0; // Reset attempts on success
        logger.info(MODULE_NAME, 'Token refresh successful');
        return true;
      }

      logger.warn(MODULE_NAME, 'Token refresh returned null');
      if (refreshAttemptRef.current >= MAX_REFRESH_ATTEMPTS) {
        options?.onRefreshFailed?.();
      }
      return false;
    } catch (error) {
      logger.error(MODULE_NAME, 'Token refresh failed', error);

      if (refreshAttemptRef.current >= MAX_REFRESH_ATTEMPTS) {
        options?.onRefreshFailed?.();
      }

      return false;
    }
  };

  return { refreshToken };
}
