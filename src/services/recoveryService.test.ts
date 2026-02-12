import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  checkForRecovery,
  restoreCachedDesign,
  discardCachedDesign,
} from './recoveryService';
import { cacheDesign, getCachedDesign, clearCache } from './cacheService';
import { createDesign } from '../models/Design';
import { createRoom } from '../models/Room';

describe('Recovery Service - Unit Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Use fake timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    // Clean up after each test
    clearCache();
    // Restore real timers
    vi.useRealTimers();
  });

  describe('checkForRecovery', () => {
    test('returns null when no cached design exists', () => {
      const recovery = checkForRecovery();
      expect(recovery).toBeNull();
    });

    test('returns null when cached design has no unsaved changes', async () => {
      const room = createRoom('rectangular', { width: 10, length: 12 }, {
        walls: '#FFFFFF',
        floor: '#CCCCCC',
        ceiling: '#EEEEEE',
      }, 'feet');
      const design = createDesign('user123', 'Test Design', room);
      
      const lastSaved = new Date();
      cacheDesign(design, lastSaved);
      
      // Fast-forward past debounce delay
      await vi.advanceTimersByTimeAsync(600);
      
      // Manually set cache timestamp to be before last saved
      const cached = getCachedDesign();
      if (cached) {
        cached.timestamp = new Date(lastSaved.getTime() - 1000);
        localStorage.setItem('furniture_design_cache', JSON.stringify({
          ...cached,
          timestamp: cached.timestamp.toISOString(),
        }));
      }
      
      const recovery = checkForRecovery();
      expect(recovery).toBeNull();
    });

    test('returns recovery data when unsaved changes detected', async () => {
      const room = createRoom('rectangular', { width: 10, length: 12 }, {
        walls: '#FFFFFF',
        floor: '#CCCCCC',
        ceiling: '#EEEEEE',
      }, 'feet');
      const design = createDesign('user123', 'Test Design', room);
      
      const lastSaved = new Date(Date.now() - 60000); // 1 minute ago
      cacheDesign(design, lastSaved);
      
      // Fast-forward past debounce delay
      await vi.advanceTimersByTimeAsync(600);
      
      const recovery = checkForRecovery();
      
      expect(recovery).not.toBeNull();
      expect(recovery!.design.id).toBe(design.id);
      expect(recovery!.design.name).toBe('Test Design');
      expect(recovery!.hasUnsavedChanges).toBe(true);
      expect(recovery!.lastSavedTimestamp).toEqual(lastSaved);
    });

    test('returns recovery data when no last saved timestamp exists', async () => {
      const room = createRoom('rectangular', { width: 10, length: 12 }, {
        walls: '#FFFFFF',
        floor: '#CCCCCC',
        ceiling: '#EEEEEE',
      }, 'feet');
      const design = createDesign('user123', 'Test Design', room);
      
      cacheDesign(design, null);
      
      // Fast-forward past debounce delay
      await vi.advanceTimersByTimeAsync(600);
      
      const recovery = checkForRecovery();
      
      expect(recovery).not.toBeNull();
      expect(recovery!.hasUnsavedChanges).toBe(true);
      expect(recovery!.lastSavedTimestamp).toBeNull();
    });

    test('handles errors gracefully', () => {
      // Mock localStorage.getItem to throw an error
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      const recovery = checkForRecovery();
      expect(recovery).toBeNull();
      
      // Restore the spy
      spy.mockRestore();
    });
  });

  describe('restoreCachedDesign', () => {
    test('returns the design from recovery data', async () => {
      const room = createRoom('rectangular', { width: 10, length: 12 }, {
        walls: '#FFFFFF',
        floor: '#CCCCCC',
        ceiling: '#EEEEEE',
      }, 'feet');
      const design = createDesign('user123', 'Test Design', room);
      
      cacheDesign(design, null);
      
      // Fast-forward past debounce delay
      await vi.advanceTimersByTimeAsync(600);
      
      const recovery = checkForRecovery();
      expect(recovery).not.toBeNull();
      
      const restored = restoreCachedDesign(recovery!);
      
      expect(restored.id).toBe(design.id);
      expect(restored.name).toBe('Test Design');
      expect(restored.userId).toBe('user123');
      expect(restored.room.shape).toBe('rectangular');
    });
  });

  describe('discardCachedDesign', () => {
    test('clears the cache', async () => {
      const room = createRoom('rectangular', { width: 10, length: 12 }, {
        walls: '#FFFFFF',
        floor: '#CCCCCC',
        ceiling: '#EEEEEE',
      }, 'feet');
      const design = createDesign('user123', 'Test Design', room);
      
      cacheDesign(design, null);
      
      // Fast-forward past debounce delay
      await vi.advanceTimersByTimeAsync(600);
      
      // Verify cache exists
      expect(getCachedDesign()).not.toBeNull();
      
      // Discard cached design
      discardCachedDesign();
      
      // Verify cache is cleared
      expect(getCachedDesign()).toBeNull();
    });
  });
});

// **Validates: Requirements 12.3, 12.4**
