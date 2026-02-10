import type { Middleware } from '@reduxjs/toolkit';
import type { AppState } from '../types';
import type { Design } from '../../models/Design';

// History state interface
interface HistoryState {
  past: Design[];
  future: Design[];
}

// Maximum number of operations to keep in history
const MAX_HISTORY_SIZE = 50;

// Actions that should trigger history tracking
const TRACKABLE_ACTIONS = [
  'design/updateRoom',
  'design/addFurniture',
  'design/removeFurniture',
  'design/updateFurniturePosition',
  'design/updateFurnitureScale',
  'design/updateFurnitureColor',
];

// Create history state
let history: HistoryState = {
  past: [],
  future: [],
};

// Helper to deep clone design
const cloneDesign = (design: Design | null): Design | null => {
  if (!design) return null;
  return JSON.parse(JSON.stringify(design));
};

// History middleware
export const historyMiddleware: Middleware<{}, AppState> = (store) => (next) => (action) => {
  const prevState = store.getState();
  const prevDesign = prevState.design.current;

  // Execute the action
  const result = next(action);

  // Check if this action should be tracked
  if (typeof action === 'object' && action !== null && 'type' in action) {
    const actionType = action.type as string;

    // Track design changes
    if (TRACKABLE_ACTIONS.includes(actionType) && prevDesign) {
      // Save previous state to past
      history.past.push(cloneDesign(prevDesign)!);

      // Limit history size
      if (history.past.length > MAX_HISTORY_SIZE) {
        history.past.shift();
      }

      // Clear future when new action is performed
      history.future = [];
    }

    // Handle undo action
    if (actionType === 'history/undo') {
      if (history.past.length > 0) {
        const currentDesign = store.getState().design.current;
        if (currentDesign) {
          // Move current to future
          history.future.push(cloneDesign(currentDesign)!);

          // Restore from past
          const previousDesign = history.past.pop()!;
          store.dispatch({
            type: 'design/restoreDesign',
            payload: previousDesign,
          });
        }
      }
    }

    // Handle redo action
    if (actionType === 'history/redo') {
      if (history.future.length > 0) {
        const currentDesign = store.getState().design.current;
        if (currentDesign) {
          // Move current to past
          history.past.push(cloneDesign(currentDesign)!);

          // Restore from future
          const nextDesign = history.future.pop()!;
          store.dispatch({
            type: 'design/restoreDesign',
            payload: nextDesign,
          });
        }
      }
    }

    // Clear history when loading or creating a new design
    if (
      actionType === 'design/createDesign' ||
      actionType === 'design/loadDesignSuccess'
    ) {
      history.past = [];
      history.future = [];
    }
  }

  return result;
};

// Selectors for history state
export const canUndo = (): boolean => history.past.length > 0;
export const canRedo = (): boolean => history.future.length > 0;

// Action creators
export const undo = () => ({ type: 'history/undo' as const });
export const redo = () => ({ type: 'history/redo' as const });

// Export history state for testing
export const getHistoryState = () => ({ ...history });
export const clearHistory = () => {
  history.past = [];
  history.future = [];
};
