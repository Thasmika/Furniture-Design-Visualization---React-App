import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UIState } from '../types';

const initialState: UIState = {
  selectedFurnitureId: null,
  activeView: '2d',
  showGrid: true,
  snapToGrid: false,
  sidebarOpen: true,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    selectFurniture: (state, action: PayloadAction<string | null>) => {
      state.selectedFurnitureId = action.payload;
    },
    setActiveView: (state, action: PayloadAction<'2d' | '3d' | 'split'>) => {
      state.activeView = action.payload;
    },
    toggleGrid: (state) => {
      state.showGrid = !state.showGrid;
    },
    setShowGrid: (state, action: PayloadAction<boolean>) => {
      state.showGrid = action.payload;
    },
    toggleSnapToGrid: (state) => {
      state.snapToGrid = !state.snapToGrid;
    },
    setSnapToGrid: (state, action: PayloadAction<boolean>) => {
      state.snapToGrid = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
  },
});

// Actions
export const {
  selectFurniture,
  setActiveView,
  toggleGrid,
  setShowGrid,
  toggleSnapToGrid,
  setSnapToGrid,
  toggleSidebar,
  setSidebarOpen,
} = uiSlice.actions;

// Reducer
export default uiSlice.reducer;
