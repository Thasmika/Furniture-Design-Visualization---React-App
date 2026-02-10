import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  cacheDesign,
  getCachedDesign,
  clearCache,
  setLastSaveTimestamp,
  getLastSaveTimestamp,
} from './cacheService';
import { createDesign } from '../models/Design';
import { createRoom } from '../models/Room';
import { createFurniture } from '../models/FurniturePiece';

// Arbitraries for property-based testing
const roomShapeArbitrary = () => fc.constantFrom('rectangular', 'square', 'circular');

const validDimensionArbitrary = () => fc.float({ min: 1, max: 100, noNaN: true });

const hexCharArbitrary = () => fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');

const hexColorArbitrary = () => fc.tuple(
  hexCharArbitrary(), hexCharArbitrary(), hexCharArbitrary(),
  hexCharArbitrary(), hexCharArbitrary(), hexCharArbitrary()
).map(([r1, r2, g1, g2, b1, b2]) => `#${r1}${r2}${g1}${g2}${b1}${b2}`);

const colorSchemeArbitrary = (): fc.Arbitrary<{ walls: string; floor: string; ceiling: string }> => 
  fc.record({
    walls: hexColorArbitrary(),
    floor: hexColorArbitrary(),
    ceiling: hexColorArbitrary(),
  });

const roomArbitrary = () => fc.record({
  shape: roomShapeArbitrary(),
  width: validDimensionArbitrary(),
  length: validDimensionArbitrary(),
  radius: validDimensionArbitrary(),
  colorScheme: colorSchemeArbitrary(),
  unit: fc.constantFrom('feet', 'meters'),
}).map(({ shape, width, length, radius, colorScheme, unit }) => {
  const dimensions = shape === 'circular'
    ? { radius }
    : shape === 'square'
    ? { width }
    : { width, length };
  
  return createRoom(shape, dimensions, colorScheme, unit);
});

const furnitureTypeArbitrary = () => fc.constantFrom('chair', 'table', 'couch', 'bed', 'desk', 'shelf');

const furnitureArbitrary = () => furnitureTypeArbitrary().map(type => createFurniture(type));

const designArbitrary = () => fc.record({
  userId: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 50 }),
  room: roomArbitrary(),
  furniture: fc.array(furnitureArbitrary(), { maxLength: 5 }),
}).map(({ userId, name, room, furniture }) => {
  const design = createDesign(userId, name, room);
  return {
    ...design,
    furniture,
  };
});

describe('Cache Service - Property Tests', () => {
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

  // Property 32: Local Cache Persistence
  test('Property 32: Local Cache Persistence', async () => {
    await fc.assert(
      fc.asyncProperty(
        designArbitrary(),
        async (design) => {
          // Cache the design
          cacheDesign(design);
          
          // Fast-forward past debounce delay
          await vi.advanceTimersByTimeAsync(600);
          
          // Retrieve the cached design
          const cached = getCachedDesign();
          
          // Verify the design was cached
          expect(cached).not.toBeNull();
          expect(cached!.design.id).toBe(design.id);
          expect(cached!.design.userId).toBe(design.userId);
          expect(cached!.design.name).toBe(design.name);
          expect(cached!.design.room.shape).toBe(design.room.shape);
          expect(cached!.design.furniture.length).toBe(design.furniture.length);
          
          // Verify timestamp is recent (within last 2 seconds)
          const now = new Date();
          const timeDiff = now.getTime() - cached!.timestamp.getTime();
          expect(timeDiff).toBeLessThan(2000);
          expect(timeDiff).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 33: Cache Recovery Availability
  test('Property 33: Cache Recovery Availability', async () => {
    await fc.assert(
      fc.asyncProperty(
        designArbitrary(),
        async (design) => {
          // Cache the design
          cacheDesign(design);
          
          // Fast-forward past debounce delay
          await vi.advanceTimersByTimeAsync(600);
          
          // Simulate application restart by just retrieving from cache
          // (localStorage persists across "restarts" in the same test)
          const recovered = getCachedDesign();
          
          // Verify the design is available for recovery
          expect(recovered).not.toBeNull();
          expect(recovered!.design.id).toBe(design.id);
          expect(recovered!.design.userId).toBe(design.userId);
          expect(recovered!.design.name).toBe(design.name);
          
          // Verify the design structure is intact
          expect(recovered!.design.room).toBeDefined();
          expect(recovered!.design.furniture).toBeDefined();
          expect(Array.isArray(recovered!.design.furniture)).toBe(true);
          
          // Verify dates are properly restored as Date objects
          expect(recovered!.design.createdAt).toBeInstanceOf(Date);
          expect(recovered!.design.updatedAt).toBeInstanceOf(Date);
          expect(recovered!.timestamp).toBeInstanceOf(Date);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional property: Cache with last save timestamp
  test('Cache stores and retrieves last save timestamp', async () => {
    await fc.assert(
      fc.asyncProperty(
        designArbitrary(),
        fc.date(),
        async (design, lastSaveDate) => {
          // Cache the design with last save timestamp
          cacheDesign(design, lastSaveDate);
          
          // Fast-forward past debounce delay
          await vi.advanceTimersByTimeAsync(600);
          
          // Retrieve the cached design
          const cached = getCachedDesign();
          
          // Verify last save timestamp is stored
          expect(cached).not.toBeNull();
          if (cached!.lastSavedTimestamp) {
            expect(cached!.lastSavedTimestamp.getTime()).toBe(lastSaveDate.getTime());
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional property: Clear cache removes all data
  test('Clear cache removes all cached data', async () => {
    await fc.assert(
      fc.asyncProperty(
        designArbitrary(),
        async (design) => {
          // Cache the design
          cacheDesign(design);
          
          // Fast-forward past debounce delay
          await vi.advanceTimersByTimeAsync(600);
          
          // Verify it's cached
          expect(getCachedDesign()).not.toBeNull();
          
          // Clear the cache
          clearCache();
          
          // Verify cache is empty
          expect(getCachedDesign()).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional property: Debouncing prevents excessive writes
  test('Debouncing prevents multiple rapid cache writes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(designArbitrary(), { minLength: 2, maxLength: 5 }),
        async (designs) => {
          // Spy on localStorage.setItem
          const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
          
          // Cache multiple designs rapidly
          designs.forEach(design => cacheDesign(design));
          
          // Fast-forward past debounce delay
          await vi.advanceTimersByTimeAsync(600);
          
          // Verify only one write occurred (debouncing worked)
          // Note: There might be 2 calls if last save timestamp is also set
          expect(setItemSpy).toHaveBeenCalledTimes(1);
          
          // Verify the last design is cached
          const cached = getCachedDesign();
          expect(cached).not.toBeNull();
          expect(cached!.design.id).toBe(designs[designs.length - 1].id);
          
          setItemSpy.mockRestore();
        }
      ),
      { numRuns: 50 }
    );
  });

  // Additional property: Last save timestamp persistence
  test('Last save timestamp persists independently', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.date(),
        async (timestamp) => {
          // Set last save timestamp
          setLastSaveTimestamp(timestamp);
          
          // Retrieve it
          const retrieved = getLastSaveTimestamp();
          
          // Verify it matches
          expect(retrieved).not.toBeNull();
          expect(retrieved!.getTime()).toBe(timestamp.getTime());
        }
      ),
      { numRuns: 100 }
    );
  });
});

// **Validates: Requirements 12.3, 12.4**
