import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { DesignState } from '../types';
import type { Design } from '../../models/Design';
import type { Room } from '../../models/Room';
import type { FurniturePiece } from '../../models/FurniturePiece';

const initialState: DesignState = {
  current: null,
  saved: [],
  loading: false,
  error: null,
  isDirty: false,
};

const designSlice = createSlice({
  name: 'design',
  initialState,
  reducers: {
    // Design CRUD operations
    createDesign: (state, action: PayloadAction<Design>) => {
      state.current = action.payload;
      state.isDirty = false;
      state.error = null;
    },
    loadDesignStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadDesignSuccess: (state, action: PayloadAction<Design>) => {
      state.current = action.payload;
      state.loading = false;
      state.isDirty = false;
      state.error = null;
    },
    loadDesignFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    loadDesignsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loadDesignsSuccess: (state, action: PayloadAction<Design[]>) => {
      state.saved = action.payload;
      state.loading = false;
      state.error = null;
    },
    loadDesignsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    saveDesignStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    saveDesignSuccess: (state, action: PayloadAction<Design>) => {
      state.current = action.payload;
      state.loading = false;
      state.isDirty = false;
      state.error = null;
      
      // Update saved designs list
      const existingIndex = state.saved.findIndex(d => d.id === action.payload.id);
      if (existingIndex >= 0) {
        state.saved[existingIndex] = action.payload;
      } else {
        state.saved.push(action.payload);
      }
    },
    saveDesignFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    deleteDesignStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    deleteDesignSuccess: (state, action: PayloadAction<string>) => {
      state.saved = state.saved.filter(d => d.id !== action.payload);
      state.loading = false;
      state.error = null;
      
      // Clear current design if it was deleted
      if (state.current?.id === action.payload) {
        state.current = null;
        state.isDirty = false;
      }
    },
    deleteDesignFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateDesign: (state, action: PayloadAction<Partial<Design>>) => {
      if (state.current) {
        state.current = {
          ...state.current,
          ...action.payload,
          updatedAt: new Date(),
        };
        state.isDirty = true;
      }
    },
    
    // Room operations
    updateRoom: (state, action: PayloadAction<Room>) => {
      if (state.current) {
        state.current.room = action.payload;
        state.current.updatedAt = new Date();
        state.isDirty = true;
      }
    },
    
    // Furniture operations
    addFurniture: (state, action: PayloadAction<FurniturePiece>) => {
      if (state.current) {
        state.current.furniture.push(action.payload);
        state.current.updatedAt = new Date();
        state.isDirty = true;
      }
    },
    removeFurniture: (state, action: PayloadAction<string>) => {
      if (state.current) {
        state.current.furniture = state.current.furniture.filter(
          f => f.id !== action.payload
        );
        state.current.updatedAt = new Date();
        state.isDirty = true;
      }
    },
    updateFurniturePosition: (
      state,
      action: PayloadAction<{ id: string; position: Partial<FurniturePiece['position']> }>
    ) => {
      if (state.current) {
        const furniture = state.current.furniture.find(f => f.id === action.payload.id);
        if (furniture) {
          furniture.position = {
            ...furniture.position,
            ...action.payload.position,
          };
          state.current.updatedAt = new Date();
          state.isDirty = true;
        }
      }
    },
    updateFurnitureScale: (
      state,
      action: PayloadAction<{ id: string; scale: number }>
    ) => {
      if (state.current) {
        const furniture = state.current.furniture.find(f => f.id === action.payload.id);
        if (furniture) {
          furniture.scale = action.payload.scale;
          state.current.updatedAt = new Date();
          state.isDirty = true;
        }
      }
    },
    updateFurnitureColor: (
      state,
      action: PayloadAction<{ id: string; color: string }>
    ) => {
      if (state.current) {
        const furniture = state.current.furniture.find(f => f.id === action.payload.id);
        if (furniture) {
          furniture.color = action.payload.color;
          state.current.updatedAt = new Date();
          state.isDirty = true;
        }
      }
    },
    
    // Utility actions
    clearError: (state) => {
      state.error = null;
    },
    markClean: (state) => {
      state.isDirty = false;
    },
    
    // History action
    restoreDesign: (state, action: PayloadAction<Design>) => {
      state.current = action.payload;
      state.isDirty = true;
    },
  },
});

// Actions
export const {
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
  restoreDesign,
} = designSlice.actions;

// Reducer
export default designSlice.reducer;
