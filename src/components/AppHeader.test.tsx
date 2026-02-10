import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { AppHeader } from './AppHeader';
import designReducer from '../store/slices/designSlice';
import authReducer from '../store/slices/authSlice';
import uiReducer from '../store/slices/uiSlice';
import { createDesign } from '../models/Design';
import { createRoom } from '../models/Room';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock logout thunk
vi.mock('../store/slices/authThunks', () => ({
  logout: vi.fn(() => ({ type: 'auth/logout' })),
}));

function createTestStore(initialState = {}) {
  return configureStore({
    reducer: {
      design: designReducer,
      auth: authReducer,
      ui: uiReducer,
    },
    preloadedState: initialState,
  });
}

describe('AppHeader', () => {
  let store: ReturnType<typeof createTestStore>;
  const mockUser = { uid: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    const room = createRoom('rectangular', { width: 20, length: 15 }, { walls: '#E8E8E8', floor: '#D4C5B9', ceiling: '#FFFFFF' }, 'feet');
    const design = createDesign('user-123', 'Test Design', room);
    
    store = createTestStore({
      auth: {
        user: mockUser,
        loading: false,
        error: null,
      },
      design: {
        current: design,
        saved: [],
        loading: false,
        error: null,
        isDirty: false,
      },
    });
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <AppHeader />
        </BrowserRouter>
      </Provider>
    );
  };

  it('renders app header with title', () => {
    renderComponent();

    expect(screen.getByText('🪑 Furniture Design Visualizer')).toBeInTheDocument();
  });

  it('renders save button', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
  });

  it('renders my designs button', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /My Designs/i })).toBeInTheDocument();
  });

  it('renders logout button', () => {
    renderComponent();

    expect(screen.getByRole('button', { name: /Logout/i })).toBeInTheDocument();
  });

  it('displays user email', () => {
    renderComponent();

    expect(screen.getByText('test@example.com')).toBeInTheDocument();
  });

  describe('Unsaved changes indicator', () => {
    it('shows unsaved indicator when isDirty is true', () => {
      const dirtyStore = createTestStore({
        auth: {
          user: mockUser,
          loading: false,
          error: null,
        },
        design: {
          current: createDesign('user-123', 'Test Design', createRoom('rectangular', { width: 20, length: 15 }, { walls: '#E8E8E8', floor: '#D4C5B9', ceiling: '#FFFFFF' }, 'feet')),
          saved: [],
          loading: false,
          error: null,
          isDirty: true,
        },
      });

      render(
        <Provider store={dirtyStore}>
          <BrowserRouter>
            <AppHeader />
          </BrowserRouter>
        </Provider>
      );

      // Look for the unsaved indicator (●)
      const saveButton = screen.getByRole('button', { name: /Save/i });
      expect(saveButton.textContent).toContain('●');
    });

    it('does not show unsaved indicator when isDirty is false', () => {
      renderComponent();

      const saveButton = screen.getByRole('button', { name: /Save/i });
      expect(saveButton.textContent).not.toContain('●');
    });
  });

  describe('Save button', () => {
    it('opens save dialog when clicked', () => {
      renderComponent();

      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);

      // SaveDesignDialog should be rendered
      expect(screen.getByText('Save Design')).toBeInTheDocument();
    });

    it('closes save dialog when dialog close is triggered', () => {
      renderComponent();

      // Open dialog
      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);

      // Close dialog
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      // Dialog should be closed
      expect(screen.queryByText('Save Design')).not.toBeInTheDocument();
    });
  });

  describe('My Designs button', () => {
    it('navigates to designs page when clicked', () => {
      renderComponent();

      const myDesignsButton = screen.getByRole('button', { name: /My Designs/i });
      fireEvent.click(myDesignsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/designs');
    });
  });

  describe('Logout button', () => {
    it('logs out and navigates to login when clicked', async () => {
      renderComponent();

      const logoutButton = screen.getByRole('button', { name: /Logout/i });
      fireEvent.click(logoutButton);

      // Should navigate to login page
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
