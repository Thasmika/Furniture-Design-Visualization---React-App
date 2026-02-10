import { describe, it, expect } from 'vitest';
import authReducer, {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  logout,
  authStateChanged,
  clearError,
} from './authSlice';
import type { AuthState, User } from '../types';

describe('authSlice', () => {
  const initialState: AuthState = {
    user: null,
    loading: false,
    error: null,
  };

  const mockUser: User = {
    uid: 'test-uid',
    email: 'test@example.com',
    displayName: 'Test User',
  };

  describe('login actions', () => {
    it('should handle loginStart', () => {
      const state = authReducer(initialState, loginStart());
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle loginSuccess', () => {
      const state = authReducer(initialState, loginSuccess(mockUser));
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.error).toBe(null);
    });

    it('should handle loginFailure', () => {
      const errorMessage = 'Invalid credentials';
      const state = authReducer(initialState, loginFailure(errorMessage));
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('register actions', () => {
    it('should handle registerStart', () => {
      const state = authReducer(initialState, registerStart());
      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle registerSuccess', () => {
      const state = authReducer(initialState, registerSuccess(mockUser));
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(mockUser);
      expect(state.error).toBe(null);
    });

    it('should handle registerFailure', () => {
      const errorMessage = 'Email already in use';
      const state = authReducer(initialState, registerFailure(errorMessage));
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('logout action', () => {
    it('should handle logout', () => {
      const loggedInState: AuthState = {
        user: mockUser,
        loading: false,
        error: null,
      };
      const state = authReducer(loggedInState, logout());
      expect(state.user).toBe(null);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('authStateChanged action', () => {
    it('should handle authStateChanged with user', () => {
      const state = authReducer(initialState, authStateChanged(mockUser));
      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(false);
    });

    it('should handle authStateChanged with null', () => {
      const loggedInState: AuthState = {
        user: mockUser,
        loading: false,
        error: null,
      };
      const state = authReducer(loggedInState, authStateChanged(null));
      expect(state.user).toBe(null);
      expect(state.loading).toBe(false);
    });
  });

  describe('clearError action', () => {
    it('should clear error', () => {
      const errorState: AuthState = {
        user: null,
        loading: false,
        error: 'Some error',
      };
      const state = authReducer(errorState, clearError());
      expect(state.error).toBe(null);
    });
  });
});
