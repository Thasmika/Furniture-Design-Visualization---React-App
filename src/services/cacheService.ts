import type { Design } from '../models/Design';

const CACHE_KEY = 'furniture_design_cache';
const LAST_SAVE_KEY = 'furniture_design_last_save';

interface CachedDesign {
  design: Design;
  timestamp: Date;
  lastSavedTimestamp: Date | null;
}

// Debounce timer
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Cache a design to local storage with debouncing (500ms)
 * @param design - The design to cache
 * @param lastSavedTimestamp - Optional timestamp of last successful save
 */
export function cacheDesign(design: Design, lastSavedTimestamp: Date | null = null): void {
  // Clear existing timer
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  // Set new debounced timer
  debounceTimer = setTimeout(() => {
    try {
      const cachedData: CachedDesign = {
        design: {
          ...design,
          // Convert dates to ISO strings for storage
          createdAt: design.createdAt,
          updatedAt: design.updatedAt,
        },
        timestamp: new Date(),
        lastSavedTimestamp,
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cachedData));
    } catch (error) {
      console.error('Failed to cache design:', error);
    }
  }, 500);
}

/**
 * Retrieve cached design from local storage
 * @returns The cached design or null if not found
 */
export function getCachedDesign(): CachedDesign | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) {
      return null;
    }

    const parsed = JSON.parse(cached) as CachedDesign;
    
    // Convert ISO strings back to Date objects
    return {
      design: {
        ...parsed.design,
        createdAt: new Date(parsed.design.createdAt),
        updatedAt: new Date(parsed.design.updatedAt),
      },
      timestamp: new Date(parsed.timestamp),
      lastSavedTimestamp: parsed.lastSavedTimestamp ? new Date(parsed.lastSavedTimestamp) : null,
    };
  } catch (error) {
    console.error('Failed to retrieve cached design:', error);
    return null;
  }
}

/**
 * Clear the cached design from local storage
 */
export function clearCache(): void {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(LAST_SAVE_KEY);
    
    // Clear any pending debounce timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

/**
 * Store timestamp of last successful save
 * @param timestamp - The timestamp to store
 */
export function setLastSaveTimestamp(timestamp: Date): void {
  try {
    localStorage.setItem(LAST_SAVE_KEY, timestamp.toISOString());
  } catch (error) {
    console.error('Failed to store last save timestamp:', error);
  }
}

/**
 * Retrieve timestamp of last successful save
 * @returns The timestamp or null if not found
 */
export function getLastSaveTimestamp(): Date | null {
  try {
    const timestamp = localStorage.getItem(LAST_SAVE_KEY);
    return timestamp ? new Date(timestamp) : null;
  } catch (error) {
    console.error('Failed to retrieve last save timestamp:', error);
    return null;
  }
}
