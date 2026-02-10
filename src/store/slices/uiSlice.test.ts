import { describe, it, expect } from 'vitest';
import uiReducer, {
  selectFurniture,
  setActiveView,
  toggleGrid,
  setShowGrid,
  toggleSnapToGrid,
  setSnapToGrid,
  toggleSidebar,
  setSidebarOpen,
} from './uiSlice';
import type { UIState } from '../types';

describe('uiSlice', () => {
  const initialState: UIState = {
    selectedFurnitureId: null,
    activeView: '2d',
    showGrid: true,
    snapToGrid: false,
    sidebarOpen: true,
  };

  describe('selectFurniture action', () => {
    it('should select furniture', () => {
      const state = uiReducer(initialState, selectFurniture('furniture-1'));
      expect(state.selectedFurnitureId).toBe('furniture-1');
    });

    it('should deselect furniture', () => {
      const selectedState = { ...initialState, selectedFurnitureId: 'furniture-1' };
      const state = uiReducer(selectedState, selectFurniture(null));
      expect(state.selectedFurnitureId).toBe(null);
    });
  });

  describe('setActiveView action', () => {
    it('should set active view to 2d', () => {
      const state = uiReducer(initialState, setActiveView('2d'));
      expect(state.activeView).toBe('2d');
    });

    it('should set active view to 3d', () => {
      const state = uiReducer(initialState, setActiveView('3d'));
      expect(state.activeView).toBe('3d');
    });

    it('should set active view to split', () => {
      const state = uiReducer(initialState, setActiveView('split'));
      expect(state.activeView).toBe('split');
    });
  });

  describe('grid actions', () => {
    it('should toggle grid', () => {
      const state = uiReducer(initialState, toggleGrid());
      expect(state.showGrid).toBe(false);
      
      const state2 = uiReducer(state, toggleGrid());
      expect(state2.showGrid).toBe(true);
    });

    it('should set show grid', () => {
      const state = uiReducer(initialState, setShowGrid(false));
      expect(state.showGrid).toBe(false);
      
      const state2 = uiReducer(state, setShowGrid(true));
      expect(state2.showGrid).toBe(true);
    });
  });

  describe('snap to grid actions', () => {
    it('should toggle snap to grid', () => {
      const state = uiReducer(initialState, toggleSnapToGrid());
      expect(state.snapToGrid).toBe(true);
      
      const state2 = uiReducer(state, toggleSnapToGrid());
      expect(state2.snapToGrid).toBe(false);
    });

    it('should set snap to grid', () => {
      const state = uiReducer(initialState, setSnapToGrid(true));
      expect(state.snapToGrid).toBe(true);
      
      const state2 = uiReducer(state, setSnapToGrid(false));
      expect(state2.snapToGrid).toBe(false);
    });
  });

  describe('sidebar actions', () => {
    it('should toggle sidebar', () => {
      const state = uiReducer(initialState, toggleSidebar());
      expect(state.sidebarOpen).toBe(false);
      
      const state2 = uiReducer(state, toggleSidebar());
      expect(state2.sidebarOpen).toBe(true);
    });

    it('should set sidebar open', () => {
      const state = uiReducer(initialState, setSidebarOpen(false));
      expect(state.sidebarOpen).toBe(false);
      
      const state2 = uiReducer(state, setSidebarOpen(true));
      expect(state2.sidebarOpen).toBe(true);
    });
  });
});
