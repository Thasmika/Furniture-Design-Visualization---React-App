import type { Design } from '../models/Design';
import type { LandingPageState } from './slices/landingSlice';
import type { FurnitureState } from './slices/furnitureSlice';

// User type for authentication
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: 'user' | 'admin';
}

// Auth state
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Design state
export interface DesignState {
  current: Design | null;
  saved: Design[];
  loading: boolean;
  error: string | null;
  isDirty: boolean;
}

// UI state
export interface UIState {
  selectedFurnitureId: string | null;
  activeView: '2d' | '3d' | 'split';
  showGrid: boolean;
  snapToGrid: boolean;
  sidebarOpen: boolean;
}

// Root application state
export interface AppState {
  auth: AuthState;
  design: DesignState;
  ui: UIState;
  landing: LandingPageState;
  furniture: FurnitureState;
}
