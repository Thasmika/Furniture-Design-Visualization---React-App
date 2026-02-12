import { describe, it, expect, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import * as fc from 'fast-check';
import designReducer from '../slices/designSlice';
import uiReducer from '../slices/uiSlice';
import authReducer from '../slices/authSlice';
import { historyMiddleware, undo, redo, canUndo, canRedo, clearHistory } from './historyMiddleware';
import { createDesign } from '../../models/Design';
import { createRoom } from '../../models/Room';
import { createFurniture } from '../../models/FurniturePiece';
import type { FurniturePiece } from '../../models/FurniturePiece';

// Create a test store with history middleware
const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      design: designReducer,
      ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['design/createDesign', 'design/restoreDesign'],
          ignoredPaths: ['design.current.createdAt', 'design.current.updatedAt'],
        },
      }).concat(historyMiddleware),
  });
};

describe('History Middleware - Property Tests', () => {
  beforeEach(() => {
    clearHistory();
  });

  const defaultColorScheme = {
    walls: '#FFFFFF',
    floor: '#F5F5F5',
    ceiling: '#FAFAFA',
  };

  /**
   * Feature: furniture-design-visualizer, Property 28: Undo Reverses Changes
   * **Validates: Requirements 11.4**
   */
  describe('Property 28: Undo Reverses Changes', () => {
    it('should reverse furniture addition', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('chair', 'table', 'couch', 'bed', 'desk', 'shelf'),
          (furnitureType) => {
            const store = createTestStore();

            // Create initial design
            const room = createRoom('rectangular', { width: 20, length: 15 }, defaultColorScheme, 'feet');
            const design = createDesign('user1', 'Test Design', room);
            store.dispatch({ type: 'design/createDesign', payload: design });

            const initialFurnitureCount = store.getState().design.current?.furniture.length || 0;

            // Add furniture
            const furniture = createFurniture(furnitureType as FurniturePiece['type']);
            store.dispatch({ type: 'design/addFurniture', payload: furniture });

            const afterAddCount = store.getState().design.current?.furniture.length || 0;
            expect(afterAddCount).toBe(initialFurnitureCount + 1);

            // Undo
            store.dispatch(undo());

            const afterUndoCount = store.getState().design.current?.furniture.length || 0;
            expect(afterUndoCount).toBe(initialFurnitureCount);
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should reverse furniture removal', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('chair', 'table', 'couch', 'bed', 'desk', 'shelf'),
          (furnitureType) => {
            const store = createTestStore();

            // Create design with furniture
            const room = createRoom('rectangular', { width: 20, length: 15 }, defaultColorScheme, 'feet');
            const design = createDesign('user1', 'Test Design', room);
            const furniture = createFurniture(furnitureType as FurniturePiece['type']);
            design.furniture.push(furniture);
            store.dispatch({ type: 'design/createDesign', payload: design });

            const initialFurnitureCount = store.getState().design.current?.furniture.length || 0;
            expect(initialFurnitureCount).toBe(1);

            // Remove furniture
            store.dispatch({ type: 'design/removeFurniture', payload: furniture.id });

            const afterRemoveCount = store.getState().design.current?.furniture.length || 0;
            expect(afterRemoveCount).toBe(0);

            // Undo
            store.dispatch(undo());

            const afterUndoCount = store.getState().design.current?.furniture.length || 0;
            expect(afterUndoCount).toBe(initialFurnitureCount);

            // Verify the furniture is restored
            const restoredFurniture = store.getState().design.current?.furniture[0];
            expect(restoredFurniture?.id).toBe(furniture.id);
            expect(restoredFurniture?.type).toBe(furniture.type);
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should reverse furniture position updates', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0, max: 20, noNaN: true }),
          fc.double({ min: 0, max: 15, noNaN: true }),
          fc.double({ min: 0, max: 20, noNaN: true }),
          fc.double({ min: 0, max: 15, noNaN: true }),
          (x1, y1, x2, y2) => {
            const store = createTestStore();

            // Create design with furniture
            const room = createRoom('rectangular', { width: 20, length: 15 }, defaultColorScheme, 'feet');
            const design = createDesign('user1', 'Test Design', room);
            const furniture = createFurniture('chair');
            furniture.position = { x: x1, y: y1, z: 0, rotation: 0 };
            design.furniture.push(furniture);
            store.dispatch({ type: 'design/createDesign', payload: design });

            const initialPosition = { ...store.getState().design.current!.furniture[0].position };

            // Update position
            store.dispatch({
              type: 'design/updateFurniturePosition',
              payload: { id: furniture.id, position: { x: x2, y: y2 } },
            });

            const afterUpdatePosition = store.getState().design.current!.furniture[0].position;
            expect(afterUpdatePosition.x).toBeCloseTo(x2, 5);
            expect(afterUpdatePosition.y).toBeCloseTo(y2, 5);

            // Undo
            store.dispatch(undo());

            const afterUndoPosition = store.getState().design.current!.furniture[0].position;
            expect(afterUndoPosition.x).toBeCloseTo(initialPosition.x, 5);
            expect(afterUndoPosition.y).toBeCloseTo(initialPosition.y, 5);
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should reverse furniture scale updates', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 0.5, max: 3.0, noNaN: true }),
          fc.double({ min: 0.5, max: 3.0, noNaN: true }),
          (scale1, scale2) => {
            const store = createTestStore();

            // Create design with furniture
            const room = createRoom('rectangular', { width: 20, length: 15 }, defaultColorScheme, 'feet');
            const design = createDesign('user1', 'Test Design', room);
            const furniture = createFurniture('chair');
            furniture.scale = scale1;
            design.furniture.push(furniture);
            store.dispatch({ type: 'design/createDesign', payload: design });

            const initialScale = store.getState().design.current!.furniture[0].scale;

            // Update scale
            store.dispatch({
              type: 'design/updateFurnitureScale',
              payload: { id: furniture.id, scale: scale2 },
            });

            const afterUpdateScale = store.getState().design.current!.furniture[0].scale;
            expect(afterUpdateScale).toBeCloseTo(scale2, 5);

            // Undo
            store.dispatch(undo());

            const afterUndoScale = store.getState().design.current!.furniture[0].scale;
            expect(afterUndoScale).toBeCloseTo(initialScale, 5);
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should reverse furniture color updates', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'),
          fc.constantFrom('#AABBCC', '#112233', '#DDEEFF', '#998877', '#CCDDEE', '#AABBDD'),
          (color1, color2) => {
            const store = createTestStore();

            // Create design with furniture
            const room = createRoom('rectangular', { width: 20, length: 15 }, defaultColorScheme, 'feet');
            const design = createDesign('user1', 'Test Design', room);
            const furniture = createFurniture('chair');
            furniture.color = color1;
            design.furniture.push(furniture);
            store.dispatch({ type: 'design/createDesign', payload: design });

            const initialColor = store.getState().design.current!.furniture[0].color;

            // Update color
            store.dispatch({
              type: 'design/updateFurnitureColor',
              payload: { id: furniture.id, color: color2 },
            });

            const afterUpdateColor = store.getState().design.current!.furniture[0].color;
            expect(afterUpdateColor).toBe(color2);

            // Undo
            store.dispatch(undo());

            const afterUndoColor = store.getState().design.current!.furniture[0].color;
            expect(afterUndoColor).toBe(initialColor);
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should reverse room updates', () => {
      fc.assert(
        fc.property(
          fc.double({ min: 10, max: 50, noNaN: true }),
          fc.double({ min: 10, max: 50, noNaN: true }),
          fc.double({ min: 10, max: 50, noNaN: true }),
          fc.double({ min: 10, max: 50, noNaN: true }),
          (width1, length1, width2, length2) => {
            const store = createTestStore();

            // Create design
            const room = createRoom('rectangular', { width: width1, length: length1 }, defaultColorScheme, 'feet');
            const design = createDesign('user1', 'Test Design', room);
            store.dispatch({ type: 'design/createDesign', payload: design });

            const initialRoom = { ...store.getState().design.current!.room };

            // Update room
            const newRoom = createRoom('rectangular', { width: width2, length: length2 }, defaultColorScheme, 'feet');
            store.dispatch({ type: 'design/updateRoom', payload: newRoom });

            const afterUpdateRoom = store.getState().design.current!.room;
            expect(afterUpdateRoom.dimensions.width).toBeCloseTo(width2, 5);
            expect(afterUpdateRoom.dimensions.length).toBeCloseTo(length2, 5);

            // Undo
            store.dispatch(undo());

            const afterUndoRoom = store.getState().design.current!.room;
            expect(afterUndoRoom.dimensions.width).toBeCloseTo(initialRoom.dimensions.width, 5);
            expect(afterUndoRoom.dimensions.length).toBeCloseTo(initialRoom.dimensions.length, 5);
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should support multiple undo operations', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('chair', 'table', 'couch'), { minLength: 2, maxLength: 5 }),
          (furnitureTypes) => {
            const store = createTestStore();

            // Create initial design
            const room = createRoom('rectangular', { width: 20, length: 15 }, defaultColorScheme, 'feet');
            const design = createDesign('user1', 'Test Design', room);
            store.dispatch({ type: 'design/createDesign', payload: design });

            const initialCount = 0;

            // Add multiple furniture pieces
            furnitureTypes.forEach((type) => {
              const furniture = createFurniture(type as FurniturePiece['type']);
              store.dispatch({ type: 'design/addFurniture', payload: furniture });
            });

            const afterAddCount = store.getState().design.current?.furniture.length || 0;
            expect(afterAddCount).toBe(furnitureTypes.length);

            // Undo all additions
            for (let i = 0; i < furnitureTypes.length; i++) {
              store.dispatch(undo());
            }

            const afterUndoCount = store.getState().design.current?.furniture.length || 0;
            expect(afterUndoCount).toBe(initialCount);
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should support redo after undo', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('chair', 'table', 'couch', 'bed', 'desk', 'shelf'),
          (furnitureType) => {
            const store = createTestStore();

            // Create initial design
            const room = createRoom('rectangular', { width: 20, length: 15 }, defaultColorScheme, 'feet');
            const design = createDesign('user1', 'Test Design', room);
            store.dispatch({ type: 'design/createDesign', payload: design });

            // Add furniture
            const furniture = createFurniture(furnitureType as FurniturePiece['type']);
            store.dispatch({ type: 'design/addFurniture', payload: furniture });

            const afterAddCount = store.getState().design.current?.furniture.length || 0;
            expect(afterAddCount).toBe(1);

            // Undo
            store.dispatch(undo());
            const afterUndoCount = store.getState().design.current?.furniture.length || 0;
            expect(afterUndoCount).toBe(0);

            // Redo
            store.dispatch(redo());
            const afterRedoCount = store.getState().design.current?.furniture.length || 0;
            expect(afterRedoCount).toBe(1);

            // Verify furniture is restored
            const restoredFurniture = store.getState().design.current?.furniture[0];
            expect(restoredFurniture?.type).toBe(furnitureType);
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should clear redo stack when new action is performed after undo', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('chair', 'table', 'couch'),
          fc.constantFrom('bed', 'desk', 'shelf'),
          (type1, type2) => {
            const store = createTestStore();

            // Create initial design
            const room = createRoom('rectangular', { width: 20, length: 15 }, defaultColorScheme, 'feet');
            const design = createDesign('user1', 'Test Design', room);
            store.dispatch({ type: 'design/createDesign', payload: design });

            // Add first furniture
            const furniture1 = createFurniture(type1 as FurniturePiece['type']);
            store.dispatch({ type: 'design/addFurniture', payload: furniture1 });

            // Undo
            store.dispatch(undo());
            expect(canRedo()).toBe(true);

            // Add different furniture (should clear redo stack)
            const furniture2 = createFurniture(type2 as FurniturePiece['type']);
            store.dispatch({ type: 'design/addFurniture', payload: furniture2 });

            // Redo should not be available
            expect(canRedo()).toBe(false);

            // Verify current state has the second furniture
            const currentFurniture = store.getState().design.current?.furniture[0];
            expect(currentFurniture?.type).toBe(type2);
          }
        ),
        { numRuns: 1000 }
      );
    });

    it('should respect history size limit', () => {
      const store = createTestStore();

      // Create initial design
      const room = createRoom('rectangular', { width: 20, length: 15 }, defaultColorScheme, 'feet');
      const design = createDesign('user1', 'Test Design', room);
      store.dispatch({ type: 'design/createDesign', payload: design });

      // Add 60 furniture pieces (exceeds 50 limit)
      for (let i = 0; i < 60; i++) {
        const furniture = createFurniture('chair');
        store.dispatch({ type: 'design/addFurniture', payload: furniture });
      }

      // Try to undo 60 times
      let undoCount = 0;
      for (let i = 0; i < 60; i++) {
        if (canUndo()) {
          store.dispatch(undo());
          undoCount++;
        } else {
          break;
        }
      }

      // Should only be able to undo 50 times (history limit)
      expect(undoCount).toBeLessThanOrEqual(50);
    });

    it('should not allow undo when history is empty', () => {
      const store = createTestStore();

      // Create initial design
      const room = createRoom('rectangular', { width: 20, length: 15 }, defaultColorScheme, 'feet');
      const design = createDesign('user1', 'Test Design', room);
      store.dispatch({ type: 'design/createDesign', payload: design });

      // Should not be able to undo
      expect(canUndo()).toBe(false);

      // Dispatch undo anyway (should have no effect)
      const beforeState = store.getState().design.current;
      store.dispatch(undo());
      const afterState = store.getState().design.current;

      expect(afterState).toEqual(beforeState);
    });

    it('should not allow redo when future is empty', () => {
      const store = createTestStore();

      // Create initial design
      const room = createRoom('rectangular', { width: 20, length: 15 }, defaultColorScheme, 'feet');
      const design = createDesign('user1', 'Test Design', room);
      store.dispatch({ type: 'design/createDesign', payload: design });

      // Should not be able to redo
      expect(canRedo()).toBe(false);

      // Dispatch redo anyway (should have no effect)
      const beforeState = store.getState().design.current;
      store.dispatch(redo());
      const afterState = store.getState().design.current;

      expect(afterState).toEqual(beforeState);
    });
  });
});
