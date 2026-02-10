import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { configureStore } from '@reduxjs/toolkit';
import designReducer from '../store/slices/designSlice';
import uiReducer from '../store/slices/uiSlice';
import authReducer from '../store/slices/authSlice';
import {
  createDesign,
  updateFurniturePosition,
  updateFurnitureScale,
  updateFurnitureColor,
} from '../store/slices/designSlice';
import { createRoom } from '../models/Room';
import { createFurniture } from '../models/FurniturePiece';
import { createDesign as createDesignModel } from '../models/Design';
import { convert2Dto3D, convert3Dto2D } from '../utils/coordinates';

/**
 * Property 16: View Synchronization
 * 
 * For any furniture property change (position, scale, color), the change should be 
 * reflected in both 2D and 3D views with consistent values.
 * 
 * Validates: Requirements 5.6
 */

describe('Property 16: View Synchronization', () => {
  const createTestStore = () => {
    return configureStore({
      reducer: {
        auth: authReducer,
        design: designReducer,
        ui: uiReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    });
  };

  // Arbitrary for room dimensions
  const roomDimensionsArb = fc.record({
    width: fc.double({ min: 5, max: 50, noNaN: true }),
    length: fc.double({ min: 5, max: 50, noNaN: true }),
  });

  // Arbitrary for furniture position within room bounds
  const furniturePositionArb = (roomWidth: number, roomLength: number) =>
    fc.record({
      x: fc.double({ min: 1, max: roomWidth - 1, noNaN: true }),
      y: fc.double({ min: 1, max: roomLength - 1, noNaN: true }),
    });

  // Arbitrary for furniture scale
  const scaleArb = fc.double({ min: 0.5, max: 3.0, noNaN: true });

  // Arbitrary for hex color
  const hexColorArb = fc.tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 })
  ).map(([r, g, b]) => {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  });

  it('should synchronize furniture position changes between 2D and 3D views', () => {
    fc.assert(
      fc.property(
        roomDimensionsArb,
        fc.constantFrom('chair', 'table', 'couch', 'bed', 'desk', 'shelf'),
        (dimensions, furnitureType) => {
          const store = createTestStore();

          // Create a room
          const room = createRoom('rectangular', dimensions, {
            walls: '#ffffff',
            floor: '#cccccc',
            ceiling: '#eeeeee',
          }, 'feet');

          // Create furniture
          const furniture = createFurniture(furnitureType);
          furniture.position = { x: 5, y: 6, z: 0, rotation: 0 };

          // Create design
          const design = createDesignModel('user123', 'Test Design', room);
          design.furniture = [furniture];

          // Initialize store with design
          store.dispatch(createDesign(design));

          // Generate a new position within room bounds
          const newPosition = {
            x: Math.min(dimensions.width - 2, Math.max(1, 7)),
            y: Math.min(dimensions.length - 2, Math.max(1, 8)),
          };

          // Update furniture position
          store.dispatch(updateFurniturePosition({
            id: furniture.id,
            position: newPosition,
          }));

          // Get updated state
          const state = store.getState();
          const updatedFurniture = state.design.current?.furniture[0];

          // Verify position is updated in state (2D view source)
          expect(updatedFurniture).toBeDefined();
          expect(updatedFurniture!.position.x).toBe(newPosition.x);
          expect(updatedFurniture!.position.y).toBe(newPosition.y);

          // Verify coordinate conversion consistency (2D <-> 3D)
          const pos3D = convert2Dto3D(
            { x: updatedFurniture!.position.x, y: updatedFurniture!.position.y },
            room
          );
          const pos2DRoundTrip = convert3Dto2D(pos3D, room);

          // Check round-trip consistency (within floating-point tolerance)
          const tolerance = 0.001;
          expect(Math.abs(pos2DRoundTrip.x - updatedFurniture!.position.x)).toBeLessThan(tolerance);
          expect(Math.abs(pos2DRoundTrip.y - updatedFurniture!.position.y)).toBeLessThan(tolerance);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should synchronize furniture scale changes between 2D and 3D views', () => {
    fc.assert(
      fc.property(
        roomDimensionsArb,
        fc.constantFrom('chair', 'table', 'couch', 'bed', 'desk', 'shelf'),
        scaleArb,
        (dimensions, furnitureType, newScale) => {
          const store = createTestStore();

          // Create a room
          const room = createRoom('rectangular', dimensions, {
            walls: '#ffffff',
            floor: '#cccccc',
            ceiling: '#eeeeee',
          }, 'feet');

          // Create furniture
          const furniture = createFurniture(furnitureType);
          furniture.position = { x: 5, y: 6, z: 0, rotation: 0 };
          furniture.scale = 1.0;

          // Create design
          const design = createDesignModel('user123', 'Test Design', room);
          design.furniture = [furniture];

          // Initialize store with design
          store.dispatch(createDesign(design));

          // Update furniture scale
          store.dispatch(updateFurnitureScale({
            id: furniture.id,
            scale: newScale,
          }));

          // Get updated state
          const state = store.getState();
          const updatedFurniture = state.design.current?.furniture[0];

          // Verify scale is updated in state (both 2D and 3D views use this)
          expect(updatedFurniture).toBeDefined();
          expect(updatedFurniture!.scale).toBe(newScale);

          // Verify the scale is within valid bounds
          expect(updatedFurniture!.scale).toBeGreaterThanOrEqual(0.5);
          expect(updatedFurniture!.scale).toBeLessThanOrEqual(3.0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should synchronize furniture color changes between 2D and 3D views', () => {
    fc.assert(
      fc.property(
        roomDimensionsArb,
        fc.constantFrom('chair', 'table', 'couch', 'bed', 'desk', 'shelf'),
        hexColorArb,
        (dimensions, furnitureType, newColor) => {
          const store = createTestStore();

          // Create a room
          const room = createRoom('rectangular', dimensions, {
            walls: '#ffffff',
            floor: '#cccccc',
            ceiling: '#eeeeee',
          }, 'feet');

          // Create furniture
          const furniture = createFurniture(furnitureType);
          furniture.position = { x: 5, y: 6, z: 0, rotation: 0 };
          furniture.color = '#ff0000';

          // Create design
          const design = createDesignModel('user123', 'Test Design', room);
          design.furniture = [furniture];

          // Initialize store with design
          store.dispatch(createDesign(design));

          // Update furniture color
          store.dispatch(updateFurnitureColor({
            id: furniture.id,
            color: newColor,
          }));

          // Get updated state
          const state = store.getState();
          const updatedFurniture = state.design.current?.furniture[0];

          // Verify color is updated in state (both 2D and 3D views use this)
          expect(updatedFurniture).toBeDefined();
          expect(updatedFurniture!.color).toBe(newColor);

          // Verify color format is valid hex
          expect(updatedFurniture!.color).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should maintain consistency across multiple property changes', () => {
    fc.assert(
      fc.property(
        roomDimensionsArb,
        fc.constantFrom('chair', 'table', 'couch', 'bed', 'desk', 'shelf'),
        scaleArb,
        hexColorArb,
        (dimensions, furnitureType, newScale, newColor) => {
          const store = createTestStore();

          // Create a room
          const room = createRoom('rectangular', dimensions, {
            walls: '#ffffff',
            floor: '#cccccc',
            ceiling: '#eeeeee',
          }, 'feet');

          // Create furniture
          const furniture = createFurniture(furnitureType);
          furniture.position = { x: 5, y: 6, z: 0, rotation: 0 };
          furniture.scale = 1.0;
          furniture.color = '#ff0000';

          // Create design
          const design = createDesignModel('user123', 'Test Design', room);
          design.furniture = [furniture];

          // Initialize store with design
          store.dispatch(createDesign(design));

          // Generate a new position
          const newPosition = {
            x: Math.min(dimensions.width - 2, Math.max(1, 7)),
            y: Math.min(dimensions.length - 2, Math.max(1, 8)),
          };

          // Apply multiple changes
          store.dispatch(updateFurniturePosition({
            id: furniture.id,
            position: newPosition,
          }));
          store.dispatch(updateFurnitureScale({
            id: furniture.id,
            scale: newScale,
          }));
          store.dispatch(updateFurnitureColor({
            id: furniture.id,
            color: newColor,
          }));

          // Get updated state
          const state = store.getState();
          const updatedFurniture = state.design.current?.furniture[0];

          // Verify all properties are updated consistently
          expect(updatedFurniture).toBeDefined();
          expect(updatedFurniture!.position.x).toBe(newPosition.x);
          expect(updatedFurniture!.position.y).toBe(newPosition.y);
          expect(updatedFurniture!.scale).toBe(newScale);
          expect(updatedFurniture!.color).toBe(newColor);

          // Verify coordinate conversion still works correctly
          const pos3D = convert2Dto3D(
            { x: updatedFurniture!.position.x, y: updatedFurniture!.position.y },
            room
          );
          const pos2DRoundTrip = convert3Dto2D(pos3D, room);

          const tolerance = 0.001;
          expect(Math.abs(pos2DRoundTrip.x - updatedFurniture!.position.x)).toBeLessThan(tolerance);
          expect(Math.abs(pos2DRoundTrip.y - updatedFurniture!.position.y)).toBeLessThan(tolerance);
        }
      ),
      { numRuns: 100 }
    );
  });
});
