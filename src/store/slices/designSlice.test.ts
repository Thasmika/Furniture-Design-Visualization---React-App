import { describe, it, expect } from 'vitest';
import designReducer, {
  createDesign,
  loadDesignStart,
  loadDesignSuccess,
  loadDesignFailure,
  loadDesignsStart,
  loadDesignsSuccess,
  loadDesignsFailure,
  saveDesignStart,
  saveDesignSuccess,
  saveDesignFailure,
  deleteDesignStart,
  deleteDesignSuccess,
  deleteDesignFailure,
  updateDesign,
  updateRoom,
  addFurniture,
  removeFurniture,
  updateFurniturePosition,
  updateFurnitureScale,
  updateFurnitureColor,
  clearError,
  markClean,
} from './designSlice';
import type { DesignState } from '../types';
import type { Design } from '../../models/Design';
import type { Room } from '../../models/Room';
import type { FurniturePiece } from '../../models/FurniturePiece';

describe('designSlice', () => {
  const initialState: DesignState = {
    current: null,
    saved: [],
    loading: false,
    error: null,
    isDirty: false,
  };

  const mockRoom: Room = {
    id: 'room-1',
    shape: 'rectangular',
    dimensions: { width: 10, length: 12, radius: 0 },
    colorScheme: { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' },
    unit: 'feet',
  };

  const mockFurniture: FurniturePiece = {
    id: 'furniture-1',
    type: 'chair',
    dimensions: { width: 2, depth: 2, height: 3 },
    position: { x: 5, y: 5, z: 0, rotation: 0 },
    color: '#8B4513',
    scale: 1.0,
  };

  const mockDesign: Design = {
    id: 'design-1',
    userId: 'user-1',
    name: 'Test Design',
    room: mockRoom,
    furniture: [mockFurniture],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    version: 1,
  };

  describe('createDesign action', () => {
    it('should create a new design', () => {
      const state = designReducer(initialState, createDesign(mockDesign));
      expect(state.current).toEqual(mockDesign);
      expect(state.isDirty).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('load design actions', () => {
    it('should handle loadDesignStart', () => {
      const state = designReducer(initialState, loadDesignStart());
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle loadDesignSuccess', () => {
      const state = designReducer(initialState, loadDesignSuccess(mockDesign));
      expect(state.current).toEqual(mockDesign);
      expect(state.loading).toBe(false);
      expect(state.isDirty).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle loadDesignFailure', () => {
      const errorMessage = 'Failed to load design';
      const state = designReducer(initialState, loadDesignFailure(errorMessage));
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('load designs actions', () => {
    it('should handle loadDesignsStart', () => {
      const state = designReducer(initialState, loadDesignsStart());
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle loadDesignsSuccess', () => {
      const designs = [mockDesign];
      const state = designReducer(initialState, loadDesignsSuccess(designs));
      expect(state.saved).toEqual(designs);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle loadDesignsFailure', () => {
      const errorMessage = 'Failed to load designs';
      const state = designReducer(initialState, loadDesignsFailure(errorMessage));
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('save design actions', () => {
    it('should handle saveDesignStart', () => {
      const state = designReducer(initialState, saveDesignStart());
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle saveDesignSuccess for new design', () => {
      const stateWithCurrent = { ...initialState, current: mockDesign, isDirty: true };
      const state = designReducer(stateWithCurrent, saveDesignSuccess(mockDesign));
      expect(state.current).toEqual(mockDesign);
      expect(state.loading).toBe(false);
      expect(state.isDirty).toBe(false);
      expect(state.saved).toContainEqual(mockDesign);
    });

    it('should handle saveDesignSuccess for existing design', () => {
      const updatedDesign = { ...mockDesign, name: 'Updated Design' };
      const stateWithSaved = { ...initialState, saved: [mockDesign], current: updatedDesign, isDirty: true };
      const state = designReducer(stateWithSaved, saveDesignSuccess(updatedDesign));
      expect(state.saved[0]).toEqual(updatedDesign);
      expect(state.isDirty).toBe(false);
    });

    it('should handle saveDesignFailure', () => {
      const errorMessage = 'Failed to save design';
      const state = designReducer(initialState, saveDesignFailure(errorMessage));
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('delete design actions', () => {
    it('should handle deleteDesignStart', () => {
      const state = designReducer(initialState, deleteDesignStart());
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle deleteDesignSuccess', () => {
      const stateWithSaved = { ...initialState, saved: [mockDesign] };
      const state = designReducer(stateWithSaved, deleteDesignSuccess(mockDesign.id));
      expect(state.saved).toHaveLength(0);
      expect(state.loading).toBe(false);
    });

    it('should clear current design if deleted', () => {
      const stateWithCurrent = { ...initialState, current: mockDesign, saved: [mockDesign] };
      const state = designReducer(stateWithCurrent, deleteDesignSuccess(mockDesign.id));
      expect(state.current).toBe(null);
      expect(state.isDirty).toBe(false);
    });

    it('should handle deleteDesignFailure', () => {
      const errorMessage = 'Failed to delete design';
      const state = designReducer(initialState, deleteDesignFailure(errorMessage));
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('updateDesign action', () => {
    it('should update design and mark as dirty', () => {
      const stateWithCurrent = { ...initialState, current: mockDesign };
      const updates = { name: 'Updated Name' };
      const state = designReducer(stateWithCurrent, updateDesign(updates));
      expect(state.current?.name).toBe('Updated Name');
      expect(state.isDirty).toBe(true);
    });
  });

  describe('updateRoom action', () => {
    it('should update room and mark as dirty', () => {
      const stateWithCurrent = { ...initialState, current: mockDesign };
      const updatedRoom = { ...mockRoom, dimensions: { width: 15, length: 15, radius: 0 } };
      const state = designReducer(stateWithCurrent, updateRoom(updatedRoom));
      expect(state.current?.room).toEqual(updatedRoom);
      expect(state.isDirty).toBe(true);
    });
  });

  describe('furniture actions', () => {
    it('should add furniture', () => {
      const stateWithCurrent = { ...initialState, current: mockDesign };
      const newFurniture: FurniturePiece = {
        ...mockFurniture,
        id: 'furniture-2',
        type: 'table',
      };
      const state = designReducer(stateWithCurrent, addFurniture(newFurniture));
      expect(state.current?.furniture).toHaveLength(2);
      expect(state.current?.furniture[1]).toEqual(newFurniture);
      expect(state.isDirty).toBe(true);
    });

    it('should remove furniture', () => {
      const stateWithCurrent = { ...initialState, current: mockDesign };
      const state = designReducer(stateWithCurrent, removeFurniture(mockFurniture.id));
      expect(state.current?.furniture).toHaveLength(0);
      expect(state.isDirty).toBe(true);
    });

    it('should update furniture position', () => {
      const stateWithCurrent = { ...initialState, current: mockDesign };
      const newPosition = { x: 10, y: 10 };
      const state = designReducer(
        stateWithCurrent,
        updateFurniturePosition({ id: mockFurniture.id, position: newPosition })
      );
      expect(state.current?.furniture[0].position.x).toBe(10);
      expect(state.current?.furniture[0].position.y).toBe(10);
      expect(state.isDirty).toBe(true);
    });

    it('should update furniture scale', () => {
      const stateWithCurrent = { ...initialState, current: mockDesign };
      const state = designReducer(
        stateWithCurrent,
        updateFurnitureScale({ id: mockFurniture.id, scale: 1.5 })
      );
      expect(state.current?.furniture[0].scale).toBe(1.5);
      expect(state.isDirty).toBe(true);
    });

    it('should update furniture color', () => {
      const stateWithCurrent = { ...initialState, current: mockDesign };
      const newColor = '#FF0000';
      const state = designReducer(
        stateWithCurrent,
        updateFurnitureColor({ id: mockFurniture.id, color: newColor })
      );
      expect(state.current?.furniture[0].color).toBe(newColor);
      expect(state.isDirty).toBe(true);
    });
  });

  describe('utility actions', () => {
    it('should clear error', () => {
      const errorState = { ...initialState, error: 'Some error' };
      const state = designReducer(errorState, clearError());
      expect(state.error).toBe(null);
    });

    it('should mark as clean', () => {
      const dirtyState = { ...initialState, isDirty: true };
      const state = designReducer(dirtyState, markClean());
      expect(state.isDirty).toBe(false);
    });
  });
});
