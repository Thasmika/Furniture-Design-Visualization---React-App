import { describe, test, expect, beforeEach, vi } from 'vitest';
import * as fc from 'fast-check';
import {
  saveDesign,
  loadDesigns,
  loadDesign,
  updateDesign,
  deleteDesign,
} from './storageService';
import { createDesign } from '../models/Design';
import { createRoom } from '../models/Room';
import { createFurniture } from '../models/FurniturePiece';
import type { Design } from '../models/Design';

// Mock Firebase Firestore
vi.mock('./firebase', () => {
  const mockDesigns = new Map<string, Map<string, any>>();
  
  return {
    getFirebaseFirestore: () => ({
      // Mock implementation will be set up in tests
    }),
  };
});

vi.mock('firebase/firestore', () => {
  const mockDesigns = new Map<string, Map<string, any>>();
  
  return {
    collection: vi.fn((db: any, ...path: string[]) => ({ path })),
    doc: vi.fn((db: any, ...path: string[]) => ({ path })),
    getDoc: vi.fn(async (ref: any) => {
      const [, userId, , designId] = ref.path;
      const userDesigns = mockDesigns.get(userId);
      const design = userDesigns?.get(designId);
      
      return {
        exists: () => !!design,
        data: () => design,
      };
    }),
    getDocs: vi.fn(async (ref: any) => {
      const [, userId] = ref.path;
      const userDesigns = mockDesigns.get(userId) || new Map();
      
      const docs: any[] = [];
      userDesigns.forEach((data, id) => {
        docs.push({
          id,
          data: () => data,
        });
      });
      
      return {
        forEach: (callback: (doc: any) => void) => docs.forEach(callback),
      };
    }),
    setDoc: vi.fn(async (ref: any, data: any) => {
      const [, userId, , designId] = ref.path;
      
      if (!mockDesigns.has(userId)) {
        mockDesigns.set(userId, new Map());
      }
      
      mockDesigns.get(userId)!.set(designId, data);
    }),
    updateDoc: vi.fn(async (ref: any, data: any) => {
      const [, userId, , designId] = ref.path;
      const userDesigns = mockDesigns.get(userId);
      
      if (!userDesigns || !userDesigns.has(designId)) {
        throw new Error('Document does not exist');
      }
      
      const existing = userDesigns.get(designId);
      userDesigns.set(designId, { ...existing, ...data });
    }),
    deleteDoc: vi.fn(async (ref: any) => {
      const [, userId, , designId] = ref.path;
      const userDesigns = mockDesigns.get(userId);
      
      if (userDesigns) {
        userDesigns.delete(designId);
      }
    }),
    query: vi.fn(),
    where: vi.fn(),
    Timestamp: {
      fromDate: (date: Date) => ({
        toDate: () => date,
        seconds: Math.floor(date.getTime() / 1000),
        nanoseconds: (date.getTime() % 1000) * 1000000,
      }),
    },
  };
});

// Arbitraries for property-based testing
const userIdArbitrary = () => fc.uuid();

const designNameArbitrary = () => fc.string({ minLength: 1, maxLength: 100 });

const roomArbitrary = () => {
  return fc.record({
    shape: fc.constantFrom('rectangular', 'square', 'circular'),
    width: fc.float({ min: 1, max: 100, noNaN: true }),
    length: fc.float({ min: 1, max: 100, noNaN: true }),
    radius: fc.float({ min: 1, max: 100, noNaN: true }),
  }).map(({ shape, width, length, radius }) => {
    const dimensions = shape === 'circular'
      ? { radius }
      : shape === 'square'
      ? { width }
      : { width, length };
    
    return createRoom(
      shape as any,
      dimensions,
      { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' },
      'feet'
    );
  });
};

const furnitureArbitrary = () => {
  return fc.constantFrom('chair', 'table', 'couch', 'bed', 'desk', 'shelf')
    .map(type => createFurniture(type as any));
};

const designArbitrary = () => {
  return fc.record({
    userId: userIdArbitrary(),
    name: designNameArbitrary(),
    room: roomArbitrary(),
    furniture: fc.array(furnitureArbitrary(), { maxLength: 10 }),
  }).map(({ userId, name, room, furniture }) => {
    const design = createDesign(userId, name, room);
    return {
      ...design,
      furniture,
    };
  });
};

describe('Storage Service - Property Tests', () => {
  beforeEach(() => {
    // Clear mock data before each test
    vi.clearAllMocks();
  });

  // Property 17: Design Persistence Round Trip
  test('Property 17: Design Persistence Round Trip', async () => {
    await fc.assert(
      fc.asyncProperty(
        designArbitrary(),
        async (design) => {
          // Save the design
          await saveDesign(design);
          
          // Load it back
          const loaded = await loadDesign(design.userId, design.id);
          
          // Verify all properties match
          expect(loaded.id).toBe(design.id);
          expect(loaded.userId).toBe(design.userId);
          expect(loaded.name).toBe(design.name);
          expect(loaded.room).toEqual(design.room);
          expect(loaded.furniture).toEqual(design.furniture);
          expect(loaded.version).toBe(design.version);
          
          // Dates should be equivalent (allowing for serialization)
          expect(loaded.createdAt.getTime()).toBe(design.createdAt.getTime());
          expect(loaded.updatedAt.getTime()).toBe(design.updatedAt.getTime());
        }
      ),
      { numRuns: 1000 }
    );
  });

  // Property 18: User Association
  test('Property 18: User Association', async () => {
    await fc.assert(
      fc.asyncProperty(
        designArbitrary(),
        async (design) => {
          await saveDesign(design);
          const loaded = await loadDesign(design.userId, design.id);
          
          expect(loaded.userId).toBe(design.userId);
        }
      ),
      { numRuns: 1000 }
    );
  });

  // Property 19: User Design Filtering
  test('Property 19: User Design Filtering', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdArbitrary(),
        fc.array(designArbitrary(), { minLength: 1, maxLength: 5 }),
        async (userId, designs) => {
          // Assign all designs to the same user
          const userDesigns = designs.map(d => ({ ...d, userId }));
          
          // Save all designs
          for (const design of userDesigns) {
            await saveDesign(design);
          }
          
          // Load designs for this user
          const loaded = await loadDesigns(userId);
          
          // All loaded designs should belong to this user
          expect(loaded.length).toBeGreaterThan(0);
          loaded.forEach(design => {
            expect(design.userId).toBe(userId);
          });
        }
      ),
      { numRuns: 1000 }
    );
  });

  // Property 20: Design ID Uniqueness
  test('Property 20: Design ID Uniqueness', async () => {
    await fc.assert(
      fc.asyncProperty(
        userIdArbitrary(),
        fc.array(designArbitrary(), { minLength: 2, maxLength: 10 }),
        async (userId, designs) => {
          // Assign all designs to the same user
          const userDesigns = designs.map(d => ({ ...d, userId }));
          
          // Save all designs
          for (const design of userDesigns) {
            await saveDesign(design);
          }
          
          // Load all designs
          const loaded = await loadDesigns(userId);
          
          // Extract all IDs
          const ids = loaded.map(d => d.id);
          
          // Check uniqueness
          const uniqueIds = new Set(ids);
          expect(uniqueIds.size).toBe(ids.length);
        }
      ),
      { numRuns: 1000 }
    );
  });

  // Property 23: Design ID Preservation During Updates
  test('Property 23: Design ID Preservation During Updates', async () => {
    await fc.assert(
      fc.asyncProperty(
        designArbitrary(),
        designNameArbitrary(),
        async (design, newName) => {
          // Save initial design
          await saveDesign(design);
          
          // Update the design
          const updated = { ...design, name: newName, updatedAt: new Date() };
          await updateDesign(updated);
          
          // Load the design
          const loaded = await loadDesign(design.userId, design.id);
          
          // ID should be preserved
          expect(loaded.id).toBe(design.id);
          expect(loaded.name).toBe(newName);
        }
      ),
      { numRuns: 1000 }
    );
  });

  // Property 24: Design Deletion Completeness
  test('Property 24: Design Deletion Completeness', async () => {
    await fc.assert(
      fc.asyncProperty(
        designArbitrary(),
        async (design) => {
          // Save the design
          await saveDesign(design);
          
          // Verify it exists
          const loaded = await loadDesign(design.userId, design.id);
          expect(loaded).toBeDefined();
          
          // Delete the design
          await deleteDesign(design.userId, design.id);
          
          // Attempt to load should fail
          await expect(loadDesign(design.userId, design.id))
            .rejects.toThrow(/not found/i);
        }
      ),
      { numRuns: 1000 }
    );
  });
});

// **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 7.2, 7.4**

describe('Storage Service - Error Handling Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Property 21: Save Failure State Preservation
  test('Property 21: Save Failure State Preservation', async () => {
    await fc.assert(
      fc.asyncProperty(
        designArbitrary(),
        async (design) => {
          // Mock setDoc to fail
          const { setDoc } = await import('firebase/firestore');
          vi.mocked(setDoc).mockRejectedValueOnce(new Error('Network error'));
          
          // Create a copy of the design to verify it doesn't change
          const originalDesign = JSON.parse(JSON.stringify(design));
          
          // Attempt to save should fail
          await expect(saveDesign(design)).rejects.toThrow();
          
          // Design object should remain unchanged in memory
          expect(JSON.stringify(design)).toBe(JSON.stringify(originalDesign));
        }
      ),
      { numRuns: 1000 }
    );
  });

  // Property 25: Deletion Failure Preservation
  test('Property 25: Deletion Failure Preservation', async () => {
    await fc.assert(
      fc.asyncProperty(
        designArbitrary(),
        async (design) => {
          // Save the design first
          await saveDesign(design);
          
          // Mock deleteDoc to fail
          const { deleteDoc } = await import('firebase/firestore');
          vi.mocked(deleteDoc).mockRejectedValueOnce(new Error('Network error'));
          
          // Attempt to delete should fail
          await expect(deleteDesign(design.userId, design.id)).rejects.toThrow();
          
          // Design should still be loadable
          const loaded = await loadDesign(design.userId, design.id);
          expect(loaded.id).toBe(design.id);
        }
      ),
      { numRuns: 1000 }
    );
  });

  // Property 30: Save Verification
  test('Property 30: Save Verification', async () => {
    await fc.assert(
      fc.asyncProperty(
        designArbitrary(),
        async (design) => {
          // Mock getDoc to return non-existent after save (verification failure)
          const { getDoc, setDoc } = await import('firebase/firestore');
          
          // First call succeeds (setDoc), second call fails verification (getDoc)
          let callCount = 0;
          vi.mocked(getDoc).mockImplementation(async () => {
            callCount++;
            if (callCount === 1) {
              // First call during save verification - return not exists
              return {
                exists: () => false,
                data: () => undefined,
              } as any;
            }
            // Subsequent calls work normally
            return {
              exists: () => true,
              data: () => design,
            } as any;
          });
          
          // Save should fail due to verification failure
          await expect(saveDesign(design)).rejects.toThrow(/verification failed/i);
        }
      ),
      { numRuns: 1000 }
    );
  });

  // Property 31: Retry Logic on Failure
  test('Property 31: Retry Logic on Failure', async () => {
    // Use fake timers to speed up retry delays
    vi.useFakeTimers();
    
    try {
      await fc.assert(
        fc.asyncProperty(
          designArbitrary(),
          async (design) => {
            const { setDoc } = await import('firebase/firestore');
            
            let attemptCount = 0;
            vi.mocked(setDoc).mockImplementation(async () => {
              attemptCount++;
              if (attemptCount < 3) {
                // Fail first 2 attempts with network error
                throw new Error('network unavailable');
              }
              // Succeed on 3rd attempt
              return;
            });
            
            // Start save operation
            const savePromise = saveDesign(design);
            
            // Fast-forward through all timers
            await vi.runAllTimersAsync();
            
            // Save should eventually succeed after retries
            await savePromise;
            
            // Verify it retried (should have made 3 attempts)
            expect(attemptCount).toBe(3);
          }
        ),
        { numRuns: 1000 } // Reduced runs to avoid timeout
      );
    } finally {
      vi.useRealTimers();
    }
  }, 10000);

  // Additional test: Max retries exhausted
  test('Property 31 (variant): Max retries exhausted', async () => {
    // Use fake timers to speed up retry delays
    vi.useFakeTimers();
    
    try {
      await fc.assert(
        fc.asyncProperty(
          designArbitrary(),
          async (design) => {
            const { setDoc } = await import('firebase/firestore');
            
            let attemptCount = 0;
            vi.mocked(setDoc).mockImplementation(async () => {
              attemptCount++;
              // Always fail with network error
              throw new Error('network unavailable');
            });
            
            // Start save operation and handle rejection
            const savePromise = saveDesign(design).catch(e => e);
            
            // Fast-forward through all timers
            await vi.runAllTimersAsync();
            
            // Wait for promise to resolve/reject
            const result = await savePromise;
            
            // Should have failed
            expect(result).toBeInstanceOf(Error);
            expect(result.message).toMatch(/Failed to save design after 3 attempts/i);
            
            // Verify it tried 3 times
            expect(attemptCount).toBe(3);
          }
        ),
        { numRuns: 1000 } // Reduced runs to avoid timeout
      );
    } finally {
      vi.useRealTimers();
    }
  }, 10000);
});

// **Validates: Requirements 6.6, 7.5, 12.1, 12.2**
