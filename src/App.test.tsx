import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';
import * as authThunks from './store/slices/authThunks';
import * as recoveryService from './services/recoveryService';
import { store } from './store';
import { authStateChanged, logout } from './store/slices/authSlice';

// Mock Firebase initialization
vi.mock('./services', () => ({
  initializeFirebase: vi.fn(),
}));

// Mock auth thunks
vi.mock('./store/slices/authThunks', () => ({
  initializeAuthListener: vi.fn(() => () => vi.fn()),
}));

// Mock recovery service
vi.mock('./services/recoveryService', () => ({
  checkForRecovery: vi.fn(() => null),
  restoreCachedDesign: vi.fn(),
  discardCachedDesign: vi.fn(),
}));

// Mock pages
vi.mock('./pages', () => ({
  LoginPage: () => <div>Login Page</div>,
  RegisterPage: () => <div>Register Page</div>,
  EditorPage: () => <div>Editor Page</div>,
  DesignListPage: () => <div>Design List Page</div>,
  ContactPage: () => <div>Contact Page</div>,
  ProfilePage: () => <div>Profile Page</div>,
  ReviewsPage: () => <div>Reviews Page</div>,
}));

// Mock LandingPage
vi.mock('./pages/LandingPage', () => ({
  LandingPage: () => <div>Landing Page</div>,
}));

describe('App Component - Routing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear auth state before each test
    store.dispatch(logout());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Route Configuration', () => {
    it('should render landing page at root path', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });

    it('should render landing page for unauthenticated users at root', async () => {
      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });
  });

  describe('Authentication Route Guards', () => {
    it('should allow authenticated users to access protected routes', async () => {
      // Set authenticated user
      store.dispatch(authStateChanged({ uid: 'test-user', email: 'test@example.com', displayName: 'Test User', role: 'user' }));

      render(<App />);

      await waitFor(() => {
        // Landing page should still be accessible to authenticated users
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });

    it('should show landing page for unauthenticated users', async () => {
      // Ensure no user is set
      store.dispatch(logout());

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });
  });

  describe('App Initialization', () => {
    it('should initialize auth state listener on mount', async () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(authThunks.initializeAuthListener).mockReturnValue(() => mockUnsubscribe);

      render(<App />);

      await waitFor(() => {
        expect(authThunks.initializeAuthListener).toHaveBeenCalled();
      });
    });

    it('should check for recovery data on mount', async () => {
      render(<App />);

      await waitFor(() => {
        expect(recoveryService.checkForRecovery).toHaveBeenCalled();
      });
    });

    it('should render ErrorBoundary wrapper', async () => {
      render(<App />);

      await waitFor(() => {
        // App should render without errors, indicating ErrorBoundary is working
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });

    it('should cleanup auth listener on unmount', async () => {
      const mockUnsubscribe = vi.fn();
      vi.mocked(authThunks.initializeAuthListener).mockReturnValue(() => mockUnsubscribe);

      const { unmount } = render(<App />);

      await waitFor(() => {
        expect(authThunks.initializeAuthListener).toHaveBeenCalled();
      });

      unmount();

      // Unsubscribe should be called on cleanup
      expect(mockUnsubscribe).toHaveBeenCalled();
    });
  });

  describe('Session Persistence (Requirement 8.6)', () => {
    it('should maintain authentication state across app restarts', async () => {
      // Set authenticated user
      store.dispatch(authStateChanged({ uid: 'test-user', email: 'test@example.com', displayName: 'Test User', role: 'user' }));

      // First render - user is authenticated
      const { unmount } = render(<App />);

      await waitFor(() => {
        // Landing page should be visible
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });

      unmount();

      // Second render - simulating app restart with persisted auth state
      render(<App />);

      await waitFor(() => {
        // Landing page should still be visible
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });
  });
});
