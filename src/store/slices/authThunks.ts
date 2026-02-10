import type { AppDispatch } from '../index';
import {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout as logoutAction,
  authStateChanged,
} from './authSlice';
import {
  registerUser as registerUserService,
  authenticateUser as authenticateUserService,
  logoutUser as logoutUserService,
  setupAuthStateListener,
} from '../../services';

/**
 * Thunk to register a new user
 */
export const registerUser = (email: string, password: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(registerStart());
    try {
      const user = await registerUserService(email, password);
      dispatch(registerSuccess(user));
      return user;
    } catch (error: any) {
      dispatch(registerFailure(error.message));
      throw error;
    }
  };
};

/**
 * Thunk to authenticate a user
 */
export const authenticateUser = (email: string, password: string) => {
  return async (dispatch: AppDispatch) => {
    dispatch(loginStart());
    try {
      const user = await authenticateUserService(email, password);
      dispatch(loginSuccess(user));
      return user;
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  };
};

/**
 * Thunk to logout a user
 */
export const logout = () => {
  return async (dispatch: AppDispatch) => {
    try {
      await logoutUserService();
      dispatch(logoutAction());
    } catch (error: any) {
      // Even if logout fails, clear local state
      dispatch(logoutAction());
      throw error;
    }
  };
};

/**
 * Initialize auth state listener
 * This should be called once when the app starts
 */
export const initializeAuthListener = () => {
  return (dispatch: AppDispatch) => {
    return setupAuthStateListener((user) => {
      dispatch(authStateChanged(user));
    });
  };
};
