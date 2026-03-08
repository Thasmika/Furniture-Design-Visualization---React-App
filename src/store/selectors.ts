import { createSelector } from '@reduxjs/toolkit';
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

// Design selectors - base selectors
const selectDesignState = (state: RootState) => state.design;
const selectUIState = (state: RootState) => state.ui;

// Memoized design selectors
export const getCurrentDesign = createSelector(
  [selectDesignState],
  (design) => design.current
);

export const getFurnitureList = createSelector(
  [getCurrentDesign],
  (design) => design?.furniture || []
);

export const getRoom = createSelector(
  [getCurrentDesign],
  (design) => design?.room || null
);

export const getSelectedFurnitureId = createSelector(
  [selectUIState],
  (ui) => ui.selectedFurnitureId
);

export const getSelectedFurniture = createSelector(
  [getFurnitureList, getSelectedFurnitureId],
  (furniture, selectedId) => {
    if (!selectedId) return null;
    return furniture.find((f: FurniturePiece) => f.id === selectedId) || null;
  }
);

export const isDirty = createSelector(
  [selectDesignState],
  (design) => design.isDirty
);

export const getSavedDesigns = createSelector(
  [selectDesignState],
  (design) => design.saved
);

export const getDesignLoading = createSelector(
  [selectDesignState],
  (design) => design.loading
);

export const getDesignError = createSelector(
  [selectDesignState],
  (design) => design.error
);

// UI selectors - memoized
export const getActiveView = createSelector(
  [selectUIState],
  (ui) => ui.activeView
);

export const getShowGrid = createSelector(
  [selectUIState],
  (ui) => ui.showGrid
);

export const getSnapToGrid = createSelector(
  [selectUIState],
  (ui) => ui.snapToGrid
);

export const getSidebarOpen = createSelector(
  [selectUIState],
  (ui) => ui.sidebarOpen
);

// Landing page selectors
const selectLandingState = (state: RootState) => state.landing;

export const selectStatistics = createSelector(
  [selectLandingState],
  (landing) => landing.statistics.data
);

export const selectTestimonials = createSelector(
  [selectLandingState],
  (landing) => landing.testimonials.data
);

export const selectStatisticsLoading = createSelector(
  [selectLandingState],
  (landing) => landing.statistics.loading
);

export const selectTestimonialsLoading = createSelector(
  [selectLandingState],
  (landing) => landing.testimonials.loading
);

export const selectStatisticsError = createSelector(
  [selectLandingState],
  (landing) => landing.statistics.error
);

export const selectTestimonialsError = createSelector(
  [selectLandingState],
  (landing) => landing.testimonials.error
);

export const selectStatisticsLastFetched = createSelector(
  [selectLandingState],
  (landing) => landing.statistics.lastFetched
);
