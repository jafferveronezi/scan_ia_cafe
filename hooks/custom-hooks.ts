/**
 * Collection of useful custom React hooks
 */

import { useState, useCallback, useEffect, useRef, DependencyList } from 'react';
import { logger } from '@/lib/_core/logger';

const MODULE_NAME = 'hooks';

/**
 * useAsync hook for handling async operations
 * @example
 * ```tsx
 * const { data, loading, error } = useAsync(() => fetchUser(), []);
 * ```
 */
export interface UseAsyncState<T> {
  status: 'idle' | 'pending' | 'success' | 'error';
  data: T | null;
  error: Error | null;
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  onSuccess?: (data: T) => void,
  onError?: (error: Error) => void,
  dependencies?: DependencyList,
) {
  const [state, setState] = useState<UseAsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const executeAsync = useCallback(async () => {
    setState({ status: 'pending', data: null, error: null });
    try {
      const response = await asyncFn();
      setState({ status: 'success', data: response, error: null });
      onSuccess?.(response);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setState({ status: 'error', data: null, error: err });
      onError?.(err);
    }
  }, [asyncFn, onSuccess, onError]);

  useEffect(() => {
    executeAsync();
  }, dependencies || []);

  return {
    ...state,
    loading: state.status === 'pending',
    execute: executeAsync,
  };
}

/**
 * useDebounce hook for debouncing values
 * @example
 * ```tsx
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 * ```
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * useThrottle hook for throttling values
 * @example
 * ```tsx
 * const throttledScroll = useThrottle(scrollPosition, 100);
 * ```
 */
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRanRef = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now >= lastRanRef.current + delay) {
      setThrottledValue(value);
      lastRanRef.current = now;
    } else {
      const handler = setTimeout(() => {
        setThrottledValue(value);
        lastRanRef.current = Date.now();
      }, delay - (now - lastRanRef.current));

      return () => clearTimeout(handler);
    }
  }, [value, delay]);

  return throttledValue;
}

/**
 * usePrevious hook to get previous value
 * @example
 * ```tsx
 * const previousCount = usePrevious(count);
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * useLocalStorage hook for syncing with localStorage
 * @example
 * ```tsx
 * const [name, setName] = useLocalStorage('name', 'John');
 * ```
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }

      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      logger.error(MODULE_NAME, 'Error reading from localStorage', error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        logger.error(MODULE_NAME, 'Error writing to localStorage', error);
      }
    },
    [key, storedValue],
  );

  return [storedValue, setValue] as const;
}

/**
 * useToggle hook for boolean state
 * @example
 * ```tsx
 * const [isOpen, toggle] = useToggle(false);
 * ```
 */
export function useToggle(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  return [value, toggle, setValue] as const;
}

/**
 * useInterval hook for setInterval
 * @example
 * ```tsx
 * useInterval(() => {
 *   setCount(count + 1);
 * }, 1000);
 * ```
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => {
      savedCallback.current?.();
    }, delay);

    return () => clearInterval(id);
  }, [delay]);
}

/**
 * useIsMounted hook to check if component is mounted
 * @example
 * ```tsx
 * const isMounted = useIsMounted();
 * if (isMounted) {
 *   setData(newData);
 * }
 * ```
 */
export function useIsMounted() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return isMounted;
}

/**
 * useClickOutside hook to detect clicks outside element
 * @example
 * ```tsx
 * const ref = useClickOutside(() => setOpen(false));
 * return <View ref={ref}>{content}</View>;
 * ```
 */
export function useClickOutside(callback: () => void, ref: React.RefObject<any>) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [callback, ref]);
}

/**
 * useWindowSize hook to track window size
 * @example
 * ```tsx
 * const { width, height } = useWindowSize();
 * ```
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * useMediaQuery hook for responsive design
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

/**
 * useTimeout hook for setTimeout
 * @example
 * ```tsx
 * useTimeout(() => {
 *   setShowMessage(false);
 * }, 5000);
 * ```
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>();

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => {
      savedCallback.current?.();
    }, delay);

    return () => clearTimeout(id);
  }, [delay]);
}

/**
 * useFetch hook for data fetching
 * @example
 * ```tsx
 * const { data, loading, error } = useFetch('https://api.example.com/data');
 * ```
 */
export function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    fetch(url)
      .then((res) => {
        if (!isMounted) return;
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setData(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setData(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [url]);

  return { data, loading, error };
}

/**
 * useCounter hook for managing counter state
 * @example
 * ```tsx
 * const counter = useCounter(0);
 * counter.increment();
 * counter.decrement();
 * counter.reset();
 * ```
 */
export function useCounter(initialValue: number = 0) {
  const [count, setCount] = useState(initialValue);

  return {
    count,
    increment: useCallback(() => setCount((c) => c + 1), []),
    decrement: useCallback(() => setCount((c) => c - 1), []),
    reset: useCallback(() => setCount(initialValue), [initialValue]),
    set: useCallback((value: number) => setCount(value), []),
  };
}
