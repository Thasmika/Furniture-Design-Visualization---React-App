import { describe, it, expect } from 'vitest';
import {
  isAuthenticated,
  getCurrentUser,
  getAuthLoading,
  getAuthError,
  getCurrentDesign,
  getSelectedFurniture,
  getFurnitureList,
  getRoom,
  isDirty,
  getSavedDesigns,
  getDesignLoading,
  getDesignError,
  getSelectedFurnitureId,
  getActiveView,
  getShowGrid,
  getSnapToGrid,
  getSidebarOpen,
} from './selectors';
import type { AppState } from './types';
import type { Design } from '../models/Design';
import type { Room } from '../models/Room';
import type { FurniturePiece } from '../models/FurniturePiece';

describe('selectors', () => {
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

  const mockState: AppState = {
    auth: {
      user: { uid: 'user-1', email: 'test@example.com', displayName: 'Test User', role: 'user' },
      loading: false,
      error: null,
    },
    design: {
      current: mockDesign,
      saved: [mockDesign],
      loading: false,
      error: null,
      isDirty: true,
    },
    ui: {
      selectedFurnitureId: 'furniture-1',
      activeView: '2d',
      showGrid: true,
      snapToGrid: false,
      sidebarOpen: true,
    },
    landing: {
      statistics: {
        data: null,
        loading: false,
        error: null,
        lastFetched: null,
      },
      testimonials: {
        data: [],
        loading: false,
        error: null,
      },
    },
  };

  describe('auth selectors', () => {
    it('should select isAuthenticated', () => {
      expect(isAuthenticated(mockState)).toBe(true);
      
      const unauthState = { ...mockState, auth: { ...mockState.auth, user: null } };
      expect(isAuthenticated(unauthState)).toBe(false);
    });

    it('should select getCurrentUser', () => {
      expect(getCurrentUser(mockState)).toEqual(mockState.auth.user);
    });

    it('should select getAuthLoading', () => {
      expect(getAuthLoading(mockState)).toBe(false);
    });

    it('should select getAuthError', () => {
      expect(getAuthError(mockState)).toBe(null);
      
      const errorState = { ...mockState, auth: { ...mockState.auth, error: 'Auth error' } };
      expect(getAuthError(errorState)).toBe('Auth error');
    });
  });

  describe('design selectors', () => {
    it('should select getCurrentDesign', () => {
      expect(getCurrentDesign(mockState)).toEqual(mockDesign);
    });

    it('should select getSelectedFurniture', () => {
      expect(getSelectedFurniture(mockState)).toEqual(mockFurniture);
    });

    it('should return null when no furniture is selected', () => {
      const noSelectionState = { ...mockState, ui: { ...mockState.ui, selectedFurnitureId: null } };
      expect(getSelectedFurniture(noSelectionState)).toBe(null);
    });

    it('should return null when selected furniture does not exist', () => {
      const invalidSelectionState = { ...mockState, ui: { ...mockState.ui, selectedFurnitureId: 'invalid-id' } };
      expect(getSelectedFurniture(invalidSelectionState)).toBe(null);
    });

    it('should select getFurnitureList', () => {
      expect(getFurnitureList(mockState)).toEqual([mockFurniture]);
    });

    it('should return empty array when no current design', () => {
      const noDesignState = { ...mockState, design: { ...mockState.design, current: null } };
      expect(getFurnitureList(noDesignState)).toEqual([]);
    });

    it('should select getRoom', () => {
      expect(getRoom(mockState)).toEqual(mockRoom);
    });

    it('should return null when no current design', () => {
      const noDesignState = { ...mockState, design: { ...mockState.design, current: null } };
      expect(getRoom(noDesignState)).toBe(null);
    });

    it('should select isDirty', () => {
      expect(isDirty(mockState)).toBe(true);
    });

    it('should select getSavedDesigns', () => {
      expect(getSavedDesigns(mockState)).toEqual([mockDesign]);
    });

    it('should select getDesignLoading', () => {
      expect(getDesignLoading(mockState)).toBe(false);
    });

    it('should select getDesignError', () => {
      expect(getDesignError(mockState)).toBe(null);
      
      const errorState = { ...mockState, design: { ...mockState.design, error: 'Design error' } };
      expect(getDesignError(errorState)).toBe('Design error');
    });
  });

  describe('ui selectors', () => {
    it('should select getSelectedFurnitureId', () => {
      expect(getSelectedFurnitureId(mockState)).toBe('furniture-1');
    });

    it('should select getActiveView', () => {
      expect(getActiveView(mockState)).toBe('2d');
    });

    it('should select getShowGrid', () => {
      expect(getShowGrid(mockState)).toBe(true);
    });

    it('should select getSnapToGrid', () => {
      expect(getSnapToGrid(mockState)).toBe(false);
    });

    it('should select getSidebarOpen', () => {
      expect(getSidebarOpen(mockState)).toBe(true);
    });
  });
});
