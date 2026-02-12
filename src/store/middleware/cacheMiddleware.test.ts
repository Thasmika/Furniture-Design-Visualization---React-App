import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import designReducer from '../slices/designSlice';
import { cacheMiddleware } from './cacheMiddleware';
import { getCachedDesign, clearCache } from '../../services/cacheService';
import { createDesign } from '../../models/Design';
import { createRoom } from '../../models/Room';
import { createFurniture } from '../../models/FurniturePiece';
import {
  createDesign as createDesignAction,
  updateRoom,
  addFurniture,
  saveDesignSuccess,
  deleteDesignSuccess,
} from '../slices/designSlice';

describe('Cache Middleware - Unit Tests', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Use fake timers
    vi.useFakeTimers();
    
    // Create a test store with cache middleware
    store = configureStore({
      reducer: {
        design: designReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: {
            ignoredActions: ['design/createDesign', 'design/saveDesignSuccess'],
            ignoredPaths: ['design.current.createdAt', 'design.current.updatedAt'],
          },
        }).concat(cacheMiddleware),
    });
  });

  afterEach(() => {
    // Clean up after each test
    clearCache();
    // Restore real timers
    vi.useRealTimers();
  });

  test('caches design when modifications are made', async () => {
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    }, 'feet');
    const design = createDesign('user123', 'Test Design', room);
    
    // Create design (not dirty yet)
    store.dispatch(createDesignAction(design));
    
    // Fast-forward past debounce delay
    await vi.advanceTimersByTimeAsync(600);
    
    // No cache yet because design is not dirty
    expect(getCachedDesign()).toBeNull();
    
    // Make a modification (this sets isDirty to true)
    const newRoom = createRoom('square', { width: 15 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    }, 'feet');
    store.dispatch(updateRoom(newRoom));
    
    // Fast-forward past debounce delay
    await vi.advanceTimersByTimeAsync(600);
    
    // Now cache should exist
    const cached = getCachedDesign();
    expect(cached).not.toBeNull();
    expect(cached!.design.room.shape).toBe('square');
  });

  test('caches design when furniture is added', async () => {
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    }, 'feet');
    const design = createDesign('user123', 'Test Design', room);
    
    store.dispatch(createDesignAction(design));
    
    // Add furniture (this sets isDirty to true)
    const furniture = createFurniture('chair');
    store.dispatch(addFurniture(furniture));
    
    // Fast-forward past debounce delay
    await vi.advanceTimersByTimeAsync(600);
    
    // Cache should exist
    const cached = getCachedDesign();
    expect(cached).not.toBeNull();
    expect(cached!.design.furniture.length).toBe(1);
  });

  test('clears cache after successful save', async () => {
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    }, 'feet');
    const design = createDesign('user123', 'Test Design', room);
    
    store.dispatch(createDesignAction(design));
    
    // Make a modification
    const furniture = createFurniture('chair');
    store.dispatch(addFurniture(furniture));
    
    // Fast-forward past debounce delay
    await vi.advanceTimersByTimeAsync(600);
    
    // Verify cache exists
    expect(getCachedDesign()).not.toBeNull();
    
    // Simulate successful save
    const savedDesign = {
      ...store.getState().design.current!,
      updatedAt: new Date(),
    };
    store.dispatch(saveDesignSuccess(savedDesign));
    
    // Cache should be cleared
    expect(getCachedDesign()).toBeNull();
  });

  test('clears cache when current design is deleted', async () => {
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    }, 'feet');
    const design = createDesign('user123', 'Test Design', room);
    
    store.dispatch(createDesignAction(design));
    
    // Make a modification
    const furniture = createFurniture('chair');
    store.dispatch(addFurniture(furniture));
    
    // Fast-forward past debounce delay
    await vi.advanceTimersByTimeAsync(600);
    
    // Verify cache exists
    expect(getCachedDesign()).not.toBeNull();
    
    // Delete the current design
    store.dispatch(deleteDesignSuccess(design.id));
    
    // Cache should be cleared
    expect(getCachedDesign()).toBeNull();
  });

  test('does not clear cache when different design is deleted', async () => {
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    }, 'feet');
    const design = createDesign('user123', 'Test Design', room);
    
    store.dispatch(createDesignAction(design));
    
    // Make a modification
    const furniture = createFurniture('chair');
    store.dispatch(addFurniture(furniture));
    
    // Fast-forward past debounce delay
    await vi.advanceTimersByTimeAsync(600);
    
    // Verify cache exists
    expect(getCachedDesign()).not.toBeNull();
    
    // Delete a different design
    store.dispatch(deleteDesignSuccess('different-id'));
    
    // Cache should still exist
    expect(getCachedDesign()).not.toBeNull();
  });

  test('debounces multiple rapid modifications', async () => {
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#FFFFFF',
      floor: '#CCCCCC',
      ceiling: '#EEEEEE',
    }, 'feet');
    const design = createDesign('user123', 'Test Design', room);
    
    store.dispatch(createDesignAction(design));
    
    // Spy on localStorage.setItem
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    
    // Make multiple rapid modifications
    for (let i = 0; i < 5; i++) {
      const furniture = createFurniture('chair');
      store.dispatch(addFurniture(furniture));
    }
    
    // Fast-forward past debounce delay
    await vi.advanceTimersByTimeAsync(600);
    
    // Should only have one cache write (debouncing worked)
    const cacheWrites = setItemSpy.mock.calls.filter(
      call => call[0] === 'furniture_design_cache'
    );
    expect(cacheWrites.length).toBe(1);
    
    setItemSpy.mockRestore();
  });
});

// **Validates: Requirements 12.3**
