import { describe, it, expect, vi, beforeEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import {
  registerUser,
  authenticateUser,
  logout,
  initializeAuthListener,
} from './authThunks';
import * as authService from '../../services/authService';

// Mock the auth service
vi.mock('../../services/authService', () => ({
  registerUser: vi.fn(),
  authenticateUser: vi.fn(),
  logoutUser: vi.fn(),
  setupAuthStateListener: vi.fn(),
}));

describe('Auth Thunks', () => {
  let store: ReturnType<typeof configureStore>;

  beforeEach(() => {
    vi.clearAllMocks();
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  describe('registerUser', () => {
    it('should dispatch registerStart, registerSuccess on successful registration', async () => {
      const mockUser = {
        uid: 'test-uid-123',
        email: 'test@example.com',
        displayName: null,
        role: 'user' as const,
      };

      vi.mocked(authService.registerUser).mockResolvedValue(mockUser);

      await store.dispatch(registerUser('test@example.com', 'password123') as any);

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should dispatch registerStart, registerFailure on failed registration', async () => {
      vi.mocked(authService.registerUser).mockRejectedValue(
        new Error('Email already in use')
      );

      await expect(
        store.dispatch(registerUser('test@example.com', 'password123') as any)
      ).rejects.toThrow('Email already in use');

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Email already in use');
    });
  });

  describe('authenticateUser', () => {
    it('should dispatch loginStart, loginSuccess on successful authentication', async () => {
      const mockUser = {
        uid: 'test-uid-456',
        email: 'user@example.com',
        displayName: 'Test User',
        role: 'user' as const,
      };

      vi.mocked(authService.authenticateUser).mockResolvedValue(mockUser);

      await store.dispatch(authenticateUser('user@example.com', 'password123') as any);

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should dispatch loginStart, loginFailure on failed authentication', async () => {
      vi.mocked(authService.authenticateUser).mockRejectedValue(
        new Error('Invalid credentials')
      );

      await expect(
        store.dispatch(authenticateUser('user@example.com', 'wrongpassword') as any)
      ).rejects.toThrow('Invalid credentials');

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });
  });

  describe('logout', () => {
    it('should dispatch logout action and clear user state', async () => {
      // First set a user
      const mockUser = {
        uid: 'test-uid-789',
        email: 'logout@example.com',
        displayName: null,
        role: 'user' as const,
      };

      vi.mocked(authService.authenticateUser).mockResolvedValue(mockUser);
      await store.dispatch(authenticateUser('logout@example.com', 'password123') as any);

      // Verify user is set
      expect(store.getState().auth.user).toEqual(mockUser);

      // Now logout
      vi.mocked(authService.logoutUser).mockResolvedValue(undefined);
      await store.dispatch(logout() as any);

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should clear user state even if logout service fails', async () => {
      // First set a user
      const mockUser = {
        uid: 'test-uid-999',
        email: 'faillogout@example.com',
        displayName: null,
        role: 'user' as const,
      };

      vi.mocked(authService.authenticateUser).mockResolvedValue(mockUser);
      await store.dispatch(authenticateUser('faillogout@example.com', 'password123') as any);

      // Now logout with failure
      vi.mocked(authService.logoutUser).mockRejectedValue(new Error('Logout failed'));

      await expect(store.dispatch(logout() as any)).rejects.toThrow('Logout failed');

      // User should still be cleared from state
      const state = store.getState().auth;
      expect(state.user).toBeNull();
    });
  });

  describe('initializeAuthListener', () => {
    it('should set up auth state listener and dispatch authStateChanged', () => {
      const mockUnsubscribe = vi.fn();
      let capturedCallback: ((user: any) => void) | null = null;

      vi.mocked(authService.setupAuthStateListener).mockImplementation((callback) => {
        capturedCallback = callback;
        return mockUnsubscribe;
      });

      const unsubscribe = store.dispatch(initializeAuthListener() as any);

      expect(authService.setupAuthStateListener).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');

      // Simulate auth state change
      const mockUser = {
        uid: 'listener-uid',
        email: 'listener@example.com',
        displayName: null,
        role: 'user' as const,
      };

      capturedCallback?.(mockUser);

      const state = store.getState().auth;
      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(false);
    });

    it('should handle auth state change to null (logout)', () => {
      let capturedCallback: ((user: any) => void) | null = null;

      vi.mocked(authService.setupAuthStateListener).mockImplementation((callback) => {
        capturedCallback = callback;
        return vi.fn();
      });

      store.dispatch(initializeAuthListener() as any);

      // Simulate auth state change to null
      capturedCallback?.(null);

      const state = store.getState().auth;
      expect(state.user).toBeNull();
      expect(state.loading).toBe(false);
    });
  });
});
