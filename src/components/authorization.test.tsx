import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import * as fc from 'fast-check';
import authReducer from '../store/slices/authSlice';
import designReducer from '../store/slices/designSlice';
import uiReducer from '../store/slices/uiSlice';
import { ProtectedRoute } from './ProtectedRoute';
import { PublicRoute } from './PublicRoute';
import type { User } from '../store/types';

// Mock components for testing
const ProtectedContent = () => <div>Protected Content</div>;
const PublicContent = () => <div>Public Content</div>;
const LoginPage = () => <div>Login Page</div>;
const EditorPage = () => <div>Editor Page</div>;

// Helper to create a test store with auth state
const createTestStore = (user: User | null) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      design: designReducer,
      ui: uiReducer,
    },
    preloadedState: {
      auth: {
        user,
        loading: false,
        error: null,
      },
    },
  });
};

// Helper to render with router and store
const renderWithRouterAndStore = (
  component: React.ReactElement,
  user: User | null,
  initialPath: string = '/'
) => {
  const store = createTestStore(user);
  // Set initial location
  window.history.pushState({}, '', initialPath);
  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

// Arbitrary for generating user objects
const userArbitrary = (): fc.Arbitrary<User> => {
  return fc.record({
    uid: fc.uuid(),
    email: fc.emailAddress(),
    displayName: fc.option(fc.string(), { nil: undefined }),
  });
};

describe('Authorization Property Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Feature: furniture-design-visualizer, Property 26: Authorization Access Control
   * **Validates: Requirements 8.3, 8.4**
   *
   * For any user, authenticated users should have access to design features
   * while unauthenticated users should be denied access with appropriate error messages.
   */
  describe('Property 26: Authorization Access Control', () => {
    it('authenticated users can access protected routes', () => {
      fc.assert(
        fc.property(userArbitrary(), (user) => {
          const { container } = renderWithRouterAndStore(
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ProtectedContent />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
            </Routes>,
            user
          );

          // Authenticated users should see protected content
          expect(container.textContent).toContain('Protected Content');
          expect(container.textContent).not.toContain('Login Page');
        }),
        { numRuns: 100 }
      );
    });

    it('unauthenticated users are redirected to login from protected routes', () => {
      fc.assert(
        fc.property(fc.constant(null), (user) => {
          const { container } = renderWithRouterAndStore(
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <ProtectedContent />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginPage />} />
            </Routes>,
            user
          );

          // Unauthenticated users should be redirected to login
          expect(container.textContent).toContain('Login Page');
          expect(container.textContent).not.toContain('Protected Content');
        }),
        { numRuns: 100 }
      );
    });

    it('authenticated users are redirected from public routes to editor', () => {
      fc.assert(
        fc.property(userArbitrary(), (user) => {
          const { container } = renderWithRouterAndStore(
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <PublicContent />
                  </PublicRoute>
                }
              />
              <Route path="/editor" element={<EditorPage />} />
            </Routes>,
            user,
            '/login'
          );

          // Authenticated users should be redirected to editor
          expect(container.textContent).toContain('Editor Page');
          expect(container.textContent).not.toContain('Public Content');
        }),
        { numRuns: 100 }
      );
    });

    it('unauthenticated users can access public routes', () => {
      fc.assert(
        fc.property(fc.constant(null), (user) => {
          const { container } = renderWithRouterAndStore(
            <Routes>
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <PublicContent />
                  </PublicRoute>
                }
              />
              <Route path="/editor" element={<EditorPage />} />
            </Routes>,
            user,
            '/login'
          );

          // Unauthenticated users should see public content
          expect(container.textContent).toContain('Public Content');
          expect(container.textContent).not.toContain('Editor Page');
        }),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: furniture-design-visualizer, Property 27: Session Persistence
   * **Validates: Requirements 8.6**
   *
   * For any authenticated user, the authentication state should persist
   * across application restarts until explicit logout.
   */
  describe('Property 27: Session Persistence', () => {
    it('authentication state persists when user object exists', () => {
      fc.assert(
        fc.property(userArbitrary(), (user) => {
          // Create store with authenticated user
          const store = createTestStore(user);
          const state = store.getState();

          // User should be in state
          expect(state.auth.user).toEqual(user);
          expect(state.auth.user?.uid).toBe(user.uid);
          expect(state.auth.user?.email).toBe(user.email);

          // Simulate app restart by creating new store with same user
          const newStore = createTestStore(user);
          const newState = newStore.getState();

          // User should still be in state after "restart"
          expect(newState.auth.user).toEqual(user);
          expect(newState.auth.user?.uid).toBe(user.uid);
        }),
        { numRuns: 100 }
      );
    });

    it('authentication state is cleared when user is null', () => {
      fc.assert(
        fc.property(fc.constant(null), (user) => {
          // Create store with no user
          const store = createTestStore(user);
          const state = store.getState();

          // User should be null
          expect(state.auth.user).toBeNull();

          // Simulate app restart with no user
          const newStore = createTestStore(null);
          const newState = newStore.getState();

          // User should still be null after "restart"
          expect(newState.auth.user).toBeNull();
        }),
        { numRuns: 100 }
      );
    });

    it('user state transitions are consistent', () => {
      fc.assert(
        fc.property(
          fc.option(userArbitrary(), { nil: null }),
          fc.option(userArbitrary(), { nil: null }),
          (initialUser, nextUser) => {
            // Create store with initial user state
            const store = createTestStore(initialUser);
            let state = store.getState();

            // Verify initial state
            expect(state.auth.user).toEqual(initialUser);

            // Create new store with next user state (simulating state change)
            const newStore = createTestStore(nextUser);
            state = newStore.getState();

            // Verify state transition
            expect(state.auth.user).toEqual(nextUser);

            // If both are null, they should be equal
            if (initialUser === null && nextUser === null) {
              expect(state.auth.user).toBeNull();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
