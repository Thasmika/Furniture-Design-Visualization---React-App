import type { Design } from '../models/Design';
import { getCachedDesign, clearCache } from './cacheService';

export interface RecoveryData {
  design: Design;
  cacheTimestamp: Date;
  lastSavedTimestamp: Date | null;
  hasUnsavedChanges: boolean;
}

/**
 * Check for cached design on app startup
 * @returns Recovery data if unsaved changes detected, null otherwise
 */
export function checkForRecovery(): RecoveryData | null {
  try {
    const cached = getCachedDesign();
    
    if (!cached) {
      return null;
    }
    
    // Determine if there are unsaved changes
    const hasUnsavedChanges = !cached.lastSavedTimestamp || 
      cached.timestamp.getTime() > cached.lastSavedTimestamp.getTime();
    
    if (!hasUnsavedChanges) {
      // No unsaved changes, clear cache and return null
      clearCache();
      return null;
    }
    
    return {
      design: cached.design,
      cacheTimestamp: cached.timestamp,
      lastSavedTimestamp: cached.lastSavedTimestamp,
      hasUnsavedChanges,
    };
  } catch (error) {
    console.error('Failed to check for recovery:', error);
    return null;
  }
}

/**
 * Restore a cached design
 * @param recoveryData - The recovery data containing the design to restore
 * @returns The restored design
 */
export function restoreCachedDesign(recoveryData: RecoveryData): Design {
  return recoveryData.design;
}

/**
 * Discard a cached design
 */
export function discardCachedDesign(): void {
  clearCache();
}
