import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import designReducer from './slices/designSlice';
import uiReducer from './slices/uiSlice';
import { historyMiddleware } from './middleware/historyMiddleware';
import { cacheMiddleware } from './middleware/cacheMiddleware';
import type { AppState } from './types';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    design: designReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore Date objects in design state
        ignoredActions: ['design/createDesign', 'design/loadDesign', 'design/saveDesign', 'design/restoreDesign'],
        ignoredPaths: ['design.current.createdAt', 'design.current.updatedAt', 'design.saved'],
      },
    }).concat(historyMiddleware, cacheMiddleware),
  devTools: import.meta.env.MODE !== 'production',
});

// Infer types from the store
export type RootState = AppState;
export type AppDispatch = typeof store.dispatch;

// Export types
export type { AppState } from './types';
export type { User, AuthState, DesignState, UIState } from './types';

// Export auth thunks
export {
  registerUser,
  authenticateUser,
  logout,
  initializeAuthListener,
} from './slices/authThunks';

// Export history actions
export { undo, redo, canUndo, canRedo } from './middleware/historyMiddleware';
