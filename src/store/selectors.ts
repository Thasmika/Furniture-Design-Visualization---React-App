import type { RootState } from './index';
import type { Design } from '../models/Design';
import type { Room } from '../models/Room';
import type { FurniturePiece } from '../models/FurniturePiece';
import type { User } from './types';

// Auth selectors
export const isAuthenticated = (state: RootState): boolean => state.auth.user !== null;
export const getCurrentUser = (state: RootState): User | null => state.auth.user;
export const getAuthLoading = (state: RootState): boolean => state.auth.loading;
export const getAuthError = (state: RootState): string | null => state.auth.error;

// Design selectors
export const getCurrentDesign = (state: RootState): Design | null => state.design.current;
export const getSelectedFurniture = (state: RootState): FurniturePiece | null => {
  const selectedId = state.ui.selectedFurnitureId;
  if (!selectedId || !state.design.current) return null;
  return state.design.current.furniture.find((f: FurniturePiece) => f.id === selectedId) || null;
};
export const getFurnitureList = (state: RootState): FurniturePiece[] => 
  state.design.current?.furniture || [];
export const getRoom = (state: RootState): Room | null => 
  state.design.current?.room || null;
export const isDirty = (state: RootState): boolean => state.design.isDirty;
export const getSavedDesigns = (state: RootState): Design[] => state.design.saved;
export const getDesignLoading = (state: RootState): boolean => state.design.loading;
export const getDesignError = (state: RootState): string | null => state.design.error;

// UI selectors
export const getSelectedFurnitureId = (state: RootState): string | null => 
  state.ui.selectedFurnitureId;
export const getActiveView = (state: RootState): '2d' | '3d' | 'split' => 
  state.ui.activeView;
export const getShowGrid = (state: RootState): boolean => state.ui.showGrid;
export const getSnapToGrid = (state: RootState): boolean => state.ui.snapToGrid;
export const getSidebarOpen = (state: RootState): boolean => state.ui.sidebarOpen;
