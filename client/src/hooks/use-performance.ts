/**
 * Optimized React Hooks
 * Performance-focused hooks using data structures and algorithms
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  debounce,
  throttle,
  LRUCache,
  Trie,
  fuzzyMatch,
  calculateVisibleRange,
  rafScheduler,
} from '@/lib/performance-utils';

// ==========================================
// useDebounce - Debounced value hook
// ==========================================
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// ==========================================
// useThrottle - Throttled value hook
// ==========================================
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated.current;

    if (timeSinceLastUpdate >= limit) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, limit - timeSinceLastUpdate);

      return () => clearTimeout(timer);
    }
  }, [value, limit]);

  return throttledValue;
}

// ==========================================
// useDebouncedCallback - Debounced callback
// ==========================================
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  const debouncedFn = useMemo(
    () => debounce((...args: Parameters<T>) => callbackRef.current(...args), delay),
    [delay]
  );

  return debouncedFn;
}

// ==========================================
// useThrottledCallback - Throttled callback
// ==========================================
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  const throttledFn = useMemo(
    () => throttle((...args: Parameters<T>) => callbackRef.current(...args), limit),
    [limit]
  );

  return throttledFn;
}

// ==========================================
// useLocalCache - LRU Cache hook
// ==========================================
export function useLocalCache<K, V>(capacity: number = 50) {
  const cacheRef = useRef(new LRUCache<K, V>(capacity));

  const get = useCallback((key: K): V | undefined => {
    return cacheRef.current.get(key);
  }, []);

  const set = useCallback((key: K, value: V): void => {
    cacheRef.current.put(key, value);
  }, []);

  const has = useCallback((key: K): boolean => {
    return cacheRef.current.has(key);
  }, []);

  const clear = useCallback((): void => {
    cacheRef.current.clear();
  }, []);

  return { get, set, has, clear };
}

// ==========================================
// useSearch - Optimized search with Trie
// ==========================================
interface SearchOptions<T> {
  items: T[];
  searchFields: (keyof T)[];
  minQueryLength?: number;
  maxResults?: number;
  enableFuzzy?: boolean;
  fuzzyThreshold?: number;
}

export function useSearch<T extends Record<string, any>>({
  items,
  searchFields,
  minQueryLength = 2,
  maxResults = 20,
  enableFuzzy = true,
  fuzzyThreshold = 2,
}: SearchOptions<T>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Memoized Trie built from items
  const trie = useMemo(() => {
    const t = new Trie<T>();
    items.forEach(item => {
      searchFields.forEach(field => {
        const value = item[field];
        if (typeof value === 'string') {
          // Index each word
          value.split(/\s+/).forEach((word: string) => {
            if (word.length >= 2) {
              t.insert(word, item);
            }
          });
        }
      });
    });
    return t;
  }, [items, searchFields]);

  // Cache for search results
  const cache = useRef(new LRUCache<string, T[]>(100));

  // Debounced search
  const debouncedSearch = useDebouncedCallback(
    (searchQuery: string) => {
      if (searchQuery.length < minQueryLength) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      // Check cache
      const cached = cache.current.get(searchQuery);
      if (cached) {
        setResults(cached);
        setIsSearching(false);
        return;
      }

      // Trie search
      let searchResults = trie.search(searchQuery, maxResults * 2);
      
      // If fuzzy enabled and not enough results, do fuzzy matching
      if (enableFuzzy && searchResults.length < maxResults) {
        const fuzzyResults = items.filter(item =>
          searchFields.some(field => {
            const value = item[field];
            return typeof value === 'string' && fuzzyMatch(searchQuery, value, fuzzyThreshold);
          })
        );
        
      // Merge results, avoiding duplicates
        const seen = new Set(searchResults.map((r: T) => JSON.stringify(r)));
        fuzzyResults.forEach((r: T) => {
          if (!seen.has(JSON.stringify(r))) {
            searchResults.push(r);
          }
        });
      }

      // Deduplicate and limit
      const uniqueResults = Array.from(
        new Map(searchResults.map((item: T) => [JSON.stringify(item), item])).values()
      ).slice(0, maxResults) as T[];

      cache.current.put(searchQuery, uniqueResults);
      setResults(uniqueResults);
      setIsSearching(false);
    },
    150
  );

  const search = useCallback((newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.length >= minQueryLength) {
      setIsSearching(true);
      debouncedSearch(newQuery);
    } else {
      setResults([]);
      setIsSearching(false);
    }
  }, [minQueryLength, debouncedSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setIsSearching(false);
  }, []);

  return {
    query,
    setQuery: search,
    results,
    isSearching,
    clearSearch,
  };
}

// ==========================================
// useVirtualList - Efficient large list rendering
// ==========================================
interface VirtualListOptions {
  itemCount: number;
  itemHeight: number;
  overscan?: number;
}

export function useVirtualList({
  itemCount,
  itemHeight,
  overscan = 3,
}: VirtualListOptions) {
  const [containerHeight, setContainerHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { start, end } = useMemo(
    () => calculateVisibleRange(containerHeight, scrollTop, itemHeight, itemCount, overscan),
    [containerHeight, scrollTop, itemHeight, itemCount, overscan]
  );

  // Throttled scroll handler
  const handleScroll = useThrottledCallback(
    (e: Event) => {
      const target = e.target as HTMLDivElement;
      rafScheduler.schedule(() => {
        setScrollTop(target.scrollTop);
      });
    },
    16 // ~60fps
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) {
        setContainerHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(container);
    container.addEventListener('scroll', handleScroll);

    return () => {
      resizeObserver.disconnect();
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const totalHeight = itemCount * itemHeight;
  const offsetY = start * itemHeight;

  return {
    containerRef,
    virtualItems: Array.from({ length: end - start }, (_, i) => ({
      index: start + i,
      offsetTop: (start + i) * itemHeight,
    })),
    totalHeight,
    offsetY,
    start,
    end,
  };
}

// ==========================================
// useIntersectionObserver - Lazy loading hook
// ==========================================
interface IntersectionOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionOptions = {}
): IntersectionObserverEntry | undefined {
  const { threshold = 0, root = null, rootMargin = '0px', freezeOnceVisible = false } = options;
  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    const element = elementRef?.current;
    if (!element || frozen) return;

    const observer = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold, root, rootMargin }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, frozen]);

  return entry;
}

// ==========================================
// useCachedFetch - Fetch with caching
// ==========================================
interface FetchCacheOptions {
  ttl?: number;
  staleWhileRevalidate?: boolean;
}

const fetchCache = new LRUCache<string, { data: any; timestamp: number }>(100);

export function useCachedFetch<T>(
  url: string | null,
  options: FetchCacheOptions = {}
): {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  refetch: () => void;
} {
  const { ttl = 60000, staleWhileRevalidate = true } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!url) return;

    const cached = fetchCache.get(url);
    const now = Date.now();
    
    // Return cached if still valid
    if (cached && now - cached.timestamp < ttl) {
      setData(cached.data);
      return;
    }

    // Show stale data while revalidating
    if (staleWhileRevalidate && cached) {
      setData(cached.data);
    }

    setIsLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(response.statusText);
      
      const result = await response.json();
      fetchCache.put(url, { data: result, timestamp: now });
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fetch failed'));
    } finally {
      setIsLoading(false);
    }
  }, [url, ttl, staleWhileRevalidate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, error, isLoading, refetch: fetchData };
}

// ==========================================
// useRAFLoop - Animation frame loop
// ==========================================
export function useRAFLoop(callback: (deltaTime: number) => void, isActive: boolean = true) {
  const rafRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!isActive) return;

    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        const deltaTime = time - previousTimeRef.current;
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isActive]);
}

// ==========================================
// useMemoizedValue - Deep memoization
// ==========================================
export function useMemoizedValue<T>(value: T, compareFn?: (prev: T, next: T) => boolean): T {
  const ref = useRef<T>(value);

  const isEqual = compareFn
    ? compareFn(ref.current, value)
    : JSON.stringify(ref.current) === JSON.stringify(value);

  if (!isEqual) {
    ref.current = value;
  }

  return ref.current;
}
