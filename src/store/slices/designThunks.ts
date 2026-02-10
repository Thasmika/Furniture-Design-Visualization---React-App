import type { AppDispatch } from '../index';
import {
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
} from './designSlice';
import {
  saveDesign as saveDesignService,
  loadDesigns as loadDesignsService,
  loadDesign as loadDesignService,
  updateDesign as updateDesignService,
  deleteDesign as deleteDesignService,
} from '../../services/storageService';
import type { Design } from '../../models/Design';

/**
 * Thunk to save a design with error handling and retry logic
 * Requirements: 6.1, 6.6, 12.1, 12.2
 */
export const saveDesign = (design: Design, onSuccess?: () => void, onError?: (error: string) => void) => {
  return async (dispatch: AppDispatch) => {
    dispatch(saveDesignStart());
    try {
      await saveDesignService(design);
      dispatch(saveDesignSuccess(design));
      onSuccess?.();
      return design;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to save design';
      dispatch(saveDesignFailure(errorMessage));
      onError?.(errorMessage);
      throw error;
    }
  };
};

/**
 * Thunk to update an existing design
 * Requirements: 7.2
 */
export const updateDesign = (design: Design, onSuccess?: () => void, onError?: (error: string) => void) => {
  return async (dispatch: AppDispatch) => {
    dispatch(saveDesignStart());
    try {
      await updateDesignService(design);
      dispatch(saveDesignSuccess(design));
      onSuccess?.();
      return design;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to update design';
      dispatch(saveDesignFailure(errorMessage));
      onError?.(errorMessage);
      throw error;
    }
  };
};

/**
 * Thunk to load all designs for a user
 * Requirements: 6.3
 */
export const loadDesigns = (userId: string, onError?: (error: string) => void) => {
  return async (dispatch: AppDispatch) => {
    dispatch(loadDesignsStart());
    try {
      const designs = await loadDesignsService(userId);
      dispatch(loadDesignsSuccess(designs));
      return designs;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load designs';
      dispatch(loadDesignsFailure(errorMessage));
      onError?.(errorMessage);
      throw error;
    }
  };
};

/**
 * Thunk to load a single design
 * Requirements: 6.4
 */
export const loadDesign = (userId: string, designId: string, onError?: (error: string) => void) => {
  return async (dispatch: AppDispatch) => {
    dispatch(loadDesignStart());
    try {
      const design = await loadDesignService(userId, designId);
      dispatch(loadDesignSuccess(design));
      return design;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load design';
      dispatch(loadDesignFailure(errorMessage));
      onError?.(errorMessage);
      throw error;
    }
  };
};

/**
 * Thunk to delete a design
 * Requirements: 7.4, 7.5
 */
export const deleteDesign = (userId: string, designId: string, onSuccess?: () => void, onError?: (error: string) => void) => {
  return async (dispatch: AppDispatch) => {
    dispatch(deleteDesignStart());
    try {
      await deleteDesignService(userId, designId);
      dispatch(deleteDesignSuccess(designId));
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to delete design';
      dispatch(deleteDesignFailure(errorMessage));
      onError?.(errorMessage);
      throw error;
    }
  };
};
