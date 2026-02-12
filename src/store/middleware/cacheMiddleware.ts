import type { Middleware } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import { cacheDesign, clearCache, setLastSaveTimestamp } from '../../services/cacheService';

/**
 * Middleware to automatically cache design state changes
 * Caches on every design modification with 500ms debouncing
 * Clears cache after successful save
 */
export const cacheMiddleware: Middleware<{}, RootState> = (store) => (next) => (action: any) => {
  // Get the state before the action for deletion check
  const prevState = store.getState();
  const prevCurrent = prevState.design.current;
  
  const result = next(action);
  
  // Get the updated state after the action
  const state = store.getState();
  const { current, isDirty } = state.design;
  
  // Cache design on modifications
  if (current && isDirty) {
    // Get last save timestamp if available
    const lastSavedTimestamp = current.updatedAt;
    cacheDesign(current, lastSavedTimestamp);
  }
  
  // Clear cache after successful save
  if (action.type === 'design/saveDesignSuccess') {
    clearCache();
    // Store the timestamp of successful save
    if (action.payload?.updatedAt) {
      setLastSaveTimestamp(action.payload.updatedAt);
    }
  }
  
  // Clear cache when current design is deleted
  if (action.type === 'design/deleteDesignSuccess') {
    const deletedId = action.payload;
    if (prevCurrent?.id === deletedId) {
      clearCache();
    }
  }
  
  return result;
};
