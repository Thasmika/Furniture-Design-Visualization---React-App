import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FurnitureItem } from '../../models/FurnitureItem';
import type { AppDispatch } from '../index';
import {
  fetchFurnitureItems as fetchFurnitureItemsService,
  addFurnitureItem as addFurnitureItemService,
  updateFurnitureItem as updateFurnitureItemService,
  deleteFurnitureItem as deleteFurnitureItemService,
} from '../../services/furnitureService';

/**
 * State interface for furniture management
 * Validates Requirements: 5.1, 6.2, 7.2, 8.3
 */
export interface FurnitureState {
  items: FurnitureItem[];
  loading: boolean;
  error: string | null;
}

const initialState: FurnitureState = {
  items: [],
  loading: false,
  error: null,
};

const furnitureSlice = createSlice({
  name: 'furniture',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<FurnitureItem[]>) => {
      state.items = action.payload;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Actions
export const {
  setItems,
  setLoading,
  setError,
  clearError,
} = furnitureSlice.actions;

// Async Thunks

/**
 * Fetch all furniture items from Firestore
 * Validates Requirements: 5.1
 */
export const fetchFurnitureItems = () => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const items = await fetchFurnitureItemsService();
      dispatch(setItems(items));
      dispatch(setLoading(false));
      return items;
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to fetch furniture items'));
      throw error;
    }
  };
};

/**
 * Add a new furniture item to Firestore
 * Validates Requirements: 6.2
 */
export const addFurnitureItem = (
  item: Omit<FurnitureItem, 'id' | 'createdAt' | 'updatedAt'>
) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      const newItem = await addFurnitureItemService(item);
      // Refresh the list after adding
      await dispatch(fetchFurnitureItems());
      return newItem;
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to add furniture item'));
      throw error;
    }
  };
};

/**
 * Update an existing furniture item in Firestore
 * Validates Requirements: 7.2
 */
export const updateFurnitureItem = (
  id: string,
  updates: Partial<Omit<FurnitureItem, 'id' | 'createdAt'>>
) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      await updateFurnitureItemService(id, updates);
      // Refresh the list after updating
      await dispatch(fetchFurnitureItems());
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to update furniture item'));
      throw error;
    }
  };
};

/**
 * Delete a furniture item from Firestore
 * Validates Requirements: 8.3
 */
export const deleteFurnitureItem = (id: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
      await deleteFurnitureItemService(id);
      // Refresh the list after deleting
      await dispatch(fetchFurnitureItems());
    } catch (error: any) {
      dispatch(setError(error.message || 'Failed to delete furniture item'));
      throw error;
    }
  };
};

// Reducer
export default furnitureSlice.reducer;
