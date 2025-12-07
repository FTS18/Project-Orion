/**
 * Performance Utilities using Data Structures & Algorithms
 * Provides optimized caching, searching, and performance utilities
 */

// ==========================================
// LRU (Least Recently Used) Cache
// O(1) get/put with automatic eviction
// ==========================================
export class LRUCache<K, V> {
  private capacity: number;
  private cache: Map<K, V>;

  constructor(capacity: number) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  put(key: K, value: V): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // Evict least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// ==========================================
// Trie (Prefix Tree) for Fast Search
// O(m) search where m is query length
// Great for autocomplete/search suggestions
// ==========================================
interface TrieNode<T> {
  children: Map<string, TrieNode<T>>;
  isEndOfWord: boolean;
  data: T[];
}

export class Trie<T> {
  private root: TrieNode<T>;

  constructor() {
    this.root = this.createNode();
  }

  private createNode(): TrieNode<T> {
    return {
      children: new Map(),
      isEndOfWord: false,
      data: [],
    };
  }

  // Insert a word with associated data
  insert(word: string, data: T): void {
    let current = this.root;
    const normalizedWord = word.toLowerCase();

    for (const char of normalizedWord) {
      if (!current.children.has(char)) {
        current.children.set(char, this.createNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
    current.data.push(data);
  }

  // Find all items matching a prefix - O(m + k) where k is results
  search(prefix: string, maxResults: number = 10): T[] {
    const normalizedPrefix = prefix.toLowerCase();
    let current = this.root;

    // Navigate to prefix node
    for (const char of normalizedPrefix) {
      if (!current.children.has(char)) {
        return [];
      }
      current = current.children.get(char)!;
    }

    // Collect all words starting with this prefix using BFS
    const results: T[] = [];
    const queue: TrieNode<T>[] = [current];

    while (queue.length > 0 && results.length < maxResults) {
      const node = queue.shift()!;
      if (node.isEndOfWord) {
        results.push(...node.data.slice(0, maxResults - results.length));
      }
      // Use Array.from for ES5 compatibility
      Array.from(node.children.values()).forEach(child => {
        queue.push(child);
      });
    }

    return results.slice(0, maxResults);
  }

  // Check if exact word exists
  has(word: string): boolean {
    let current = this.root;
    const normalizedWord = word.toLowerCase();

    for (const char of normalizedWord) {
      if (!current.children.has(char)) {
        return false;
      }
      current = current.children.get(char)!;
    }
    return current.isEndOfWord;
  }
}

// ==========================================
// Debounce - Delay execution until pause
// Reduces unnecessary function calls
// ==========================================
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, wait);
  };
}

// ==========================================
// Throttle - Limit execution rate
// Ensures function runs at most once per interval
// ==========================================
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs !== null) {
          func(...lastArgs);
          lastArgs = null;
        }
      }, limit);
    } else {
      lastArgs = args;
    }
  };
}

// ==========================================
// Memoization with TTL (Time To Live)
// Caches function results for performance
// ==========================================
export function memoizeWithTTL<T extends (...args: any[]) => any>(
  func: T,
  ttlMs: number = 30000
): T {
  const cache = new Map<string, { value: ReturnType<T>; expiry: number }>();

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const now = Date.now();
    const cached = cache.get(key);

    if (cached && cached.expiry > now) {
      return cached.value;
    }

    const result = func(...args);
    cache.set(key, { value: result, expiry: now + ttlMs });

    // Clean up expired entries periodically
    if (cache.size > 100) {
      // Use Array.from for ES5 compatibility
      Array.from(cache.entries()).forEach(([k, v]) => {
        if (v.expiry <= now) {
          cache.delete(k);
        }
      });
    }

    return result;
  }) as T;
}

// ==========================================
// Binary Search for Sorted Arrays
// O(log n) lookup
// ==========================================
export function binarySearch<T>(
  arr: T[],
  target: T,
  compareFn: (a: T, b: T) => number
): number {
  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const comparison = compareFn(arr[mid], target);

    if (comparison === 0) {
      return mid;
    } else if (comparison < 0) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return -1; // Not found
}

// Find insertion point for maintaining sorted order
export function binarySearchInsertPoint<T>(
  arr: T[],
  target: T,
  compareFn: (a: T, b: T) => number
): number {
  let left = 0;
  let right = arr.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (compareFn(arr[mid], target) < 0) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  return left;
}

// ==========================================
// Fuzzy Search using Levenshtein Distance
// For typo-tolerant searching
// ==========================================
export function levenshteinDistance(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  const m = s1.length;
  const n = s2.length;

  // Use single row optimization - O(min(m,n)) space
  let prevRow = Array.from({ length: n + 1 }, (_, i) => i);
  let currRow = new Array(n + 1);

  for (let i = 1; i <= m; i++) {
    currRow[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      currRow[j] = Math.min(
        prevRow[j] + 1,      // deletion
        currRow[j - 1] + 1,  // insertion
        prevRow[j - 1] + cost // substitution
      );
    }
    [prevRow, currRow] = [currRow, prevRow];
  }

  return prevRow[n];
}

// Fuzzy match with threshold
export function fuzzyMatch(
  query: string,
  target: string,
  maxDistance: number = 2
): boolean {
  if (query.length === 0) return true;
  if (target.toLowerCase().includes(query.toLowerCase())) return true;
  return levenshteinDistance(query, target) <= maxDistance;
}

// ==========================================
// Quick Sort for Custom Sorting
// O(n log n) average, in-place
// ==========================================
export function quickSort<T>(
  arr: T[],
  compareFn: (a: T, b: T) => number,
  left: number = 0,
  right: number = arr.length - 1
): T[] {
  if (left < right) {
    const pivotIndex = partition(arr, compareFn, left, right);
    quickSort(arr, compareFn, left, pivotIndex - 1);
    quickSort(arr, compareFn, pivotIndex + 1, right);
  }
  return arr;
}

function partition<T>(
  arr: T[],
  compareFn: (a: T, b: T) => number,
  left: number,
  right: number
): number {
  const pivot = arr[right];
  let i = left - 1;

  for (let j = left; j < right; j++) {
    if (compareFn(arr[j], pivot) <= 0) {
      i++;
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
  [arr[i + 1], arr[right]] = [arr[right], arr[i + 1]];
  return i + 1;
}

// ==========================================
// Intersection Observer Manager
// Efficient visibility detection with pooling
// ==========================================
type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;

class IntersectionObserverManager {
  private observers: Map<string, IntersectionObserver> = new Map();
  private callbacks: Map<Element, ObserverCallback> = new Map();

  observe(
    element: Element,
    callback: ObserverCallback,
    options: IntersectionObserverInit = {}
  ): void {
    const key = JSON.stringify(options);
    
    if (!this.observers.has(key)) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          const cb = this.callbacks.get(entry.target);
          if (cb) cb([entry]);
        });
      }, options);
      this.observers.set(key, observer);
    }

    this.callbacks.set(element, callback);
    this.observers.get(key)!.observe(element);
  }

  unobserve(element: Element): void {
    this.callbacks.delete(element);
    // Use Array.from for ES5 compatibility
    Array.from(this.observers.values()).forEach(observer => {
      observer.unobserve(element);
    });
  }

  disconnect(): void {
    // Use Array.from for ES5 compatibility
    Array.from(this.observers.values()).forEach(observer => {
      observer.disconnect();
    });
    this.observers.clear();
    this.callbacks.clear();
  }
}

export const intersectionObserverManager = new IntersectionObserverManager();

// ==========================================
// Request Animation Frame Scheduler
// Batches updates for smoother animations
// ==========================================
class RAFScheduler {
  private pending: Set<() => void> = new Set();
  private scheduled = false;

  schedule(callback: () => void): void {
    this.pending.add(callback);
    
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrame(() => {
        const callbacks = Array.from(this.pending);
        this.pending.clear();
        this.scheduled = false;
        callbacks.forEach(cb => cb());
      });
    }
  }

  cancel(callback: () => void): void {
    this.pending.delete(callback);
  }
}

export const rafScheduler = new RAFScheduler();

// ==========================================
// Virtual List Utilities
// For efficient rendering of large lists
// ==========================================
export function calculateVisibleRange(
  containerHeight: number,
  scrollTop: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
): { start: number; end: number } {
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const end = Math.min(totalItems, start + visibleCount + 2 * overscan);
  
  return { start, end };
}

// ==========================================
// Object Pool for Memory Efficiency
// Reuses objects instead of creating new ones
// ==========================================
export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  constructor(
    factory: () => T,
    reset: (obj: T) => void = () => {},
    maxSize: number = 50
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
  }

  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.factory();
  }

  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  size(): number {
    return this.pool.length;
  }
}

// ==========================================
// Bloom Filter for Fast Membership Testing
// Probabilistic - false positives possible, no false negatives
// ==========================================
export class BloomFilter {
  private bitArray: Uint8Array;
  private numHashes: number;
  private size: number;

  constructor(expectedItems: number, falsePositiveRate: number = 0.01) {
    // Calculate optimal size and hash count
    this.size = Math.ceil(-expectedItems * Math.log(falsePositiveRate) / (Math.LN2 * Math.LN2));
    this.numHashes = Math.ceil((this.size / expectedItems) * Math.LN2);
    this.bitArray = new Uint8Array(Math.ceil(this.size / 8));
  }

  private hash(str: string, seed: number): number {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % this.size;
  }

  add(item: string): void {
    for (let i = 0; i < this.numHashes; i++) {
      const index = this.hash(item, i);
      this.bitArray[Math.floor(index / 8)] |= (1 << (index % 8));
    }
  }

  mightContain(item: string): boolean {
    for (let i = 0; i < this.numHashes; i++) {
      const index = this.hash(item, i);
      if (!(this.bitArray[Math.floor(index / 8)] & (1 << (index % 8)))) {
        return false;
      }
    }
    return true;
  }
}

// ==========================================
// Pre-built Caches for Common Use Cases
// ==========================================
export const searchCache = new LRUCache<string, any[]>(100);
export const apiCache = new LRUCache<string, any>(50);
export const imageCache = new LRUCache<string, string>(30);

// Search index for loan products
export const loanSearchTrie = new Trie<any>();

// Initialize search index from data
export function initializeLoanSearch(loans: any[]): void {
  loans.forEach(loan => {
    // Index by product name words
    loan.productName.split(/\s+/).forEach((word: string) => {
      if (word.length > 2) {
        loanSearchTrie.insert(word, loan);
      }
    });
    // Index by bank name
    loanSearchTrie.insert(loan.bankName, loan);
    // Index by category
    loanSearchTrie.insert(loan.category, loan);
  });
}

// Debounced search function
export const debouncedSearch = debounce((
  query: string,
  callback: (results: any[]) => void
) => {
  if (query.length < 2) {
    callback([]);
    return;
  }
  
  // Check cache first
  const cached = searchCache.get(query);
  if (cached) {
    callback(cached);
    return;
  }
  
  // Search using Trie
  const results = loanSearchTrie.search(query, 20);
  
  // Deduplicate by ID
  const uniqueResults = Array.from(
    new Map(results.map(item => [item.id, item])).values()
  );
  
  searchCache.put(query, uniqueResults);
  callback(uniqueResults);
}, 150);
