import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { DesignListPage } from './DesignListPage';
import { ToastProvider } from '../components/Toast';
import designReducer from '../store/slices/designSlice';
import authReducer from '../store/slices/authSlice';
import uiReducer from '../store/slices/uiSlice';
import { createDesign } from '../models/Design';
import { createRoom } from '../models/Room';
import * as storageService from '../services/storageService';

// Mock the storage service
vi.mock('../services/storageService', () => ({
  loadDesigns: vi.fn(),
  loadDesign: vi.fn(),
  deleteDesign: vi.fn(),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

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

describe('DesignListPage', () => {
  let store: ReturnType<typeof createTestStore>;
  const mockUser = { uid: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    store = createTestStore({
      auth: {
        user: mockUser,
        loading: false,
        error: null,
      },
      design: {
        current: null,
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
          <ToastProvider>
            <DesignListPage />
          </ToastProvider>
        </BrowserRouter>
      </Provider>
    );
  };

  const renderWithStore = (customStore: ReturnType<typeof createTestStore>) => {
    return render(
      <Provider store={customStore}>
        <BrowserRouter>
          <ToastProvider>
            <DesignListPage />
          </ToastProvider>
        </BrowserRouter>
      </Provider>
    );
  };

  it('renders design list page header', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: 'My Designs' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Design/i })).toBeInTheDocument();
  });

  it('loads designs on mount', async () => {
    const mockDesigns = [
      createDesign('user-123', 'Living Room', createRoom('rectangular', { width: 20, length: 15 }, { walls: '#E8E8E8', floor: '#D4C5B9', ceiling: '#FFFFFF' }, 'feet')),
      createDesign('user-123', 'Bedroom', createRoom('square', { width: 12 }, { walls: '#E8E8E8', floor: '#D4C5B9', ceiling: '#FFFFFF' }, 'feet')),
    ];

    vi.mocked(storageService.loadDesigns).mockResolvedValue(mockDesigns);

    renderComponent();

    await waitFor(() => {
      expect(storageService.loadDesigns).toHaveBeenCalledWith('user-123');
    });
  });

  describe('Design display', () => {
    it('displays list of saved designs', async () => {
      const room1 = createRoom('rectangular', { width: 20, length: 15 }, { walls: '#E8E8E8', floor: '#D4C5B9', ceiling: '#FFFFFF' }, 'feet');
      const room2 = createRoom('square', { width: 12 }, { walls: '#E8E8E8', floor: '#D4C5B9', ceiling: '#FFFFFF' }, 'feet');
      const design1 = createDesign('user-123', 'Living Room', room1);
      const design2 = createDesign('user-123', 'Bedroom', room2);

      vi.mocked(storageService.loadDesigns).mockResolvedValue([design1, design2]);

      const storeWithDesigns = createTestStore({
        auth: {
          user: mockUser,
          loading: false,
          error: null,
        },
        design: {
          current: null,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
      });

      renderWithStore(storeWithDesigns);

      // Wait for designs to load
      await waitFor(() => {
        expect(screen.getByText('Living Room')).toBeInTheDocument();
      });

      expect(screen.getByText('Bedroom')).toBeInTheDocument();
      expect(screen.getByText('rectangular')).toBeInTheDocument();
      expect(screen.getByText('square')).toBeInTheDocument();
    });

    it('displays empty state when no designs exist', async () => {
      vi.mocked(storageService.loadDesigns).mockResolvedValue([]);
      
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/No designs yet/i)).toBeInTheDocument();
      });
      
      expect(screen.getByText(/Create your first design/i)).toBeInTheDocument();
    });

    it('displays loading state while fetching designs', () => {
      const loadingStore = createTestStore({
        auth: {
          user: mockUser,
          loading: false,
          error: null,
        },
        design: {
          current: null,
          saved: [],
          loading: true,
          error: null,
          isDirty: false,
        },
      });

      renderWithStore(loadingStore);

      expect(screen.getByText(/Loading designs/i)).toBeInTheDocument();
    });

    it('displays error message when loading fails', async () => {
      vi.mocked(storageService.loadDesigns).mockRejectedValue(new Error('Failed to load designs'));
      
      const errorStore = createTestStore({
        auth: {
          user: mockUser,
          loading: false,
          error: null,
        },
        design: {
          current: null,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
      });

      renderWithStore(errorStore);

      // Wait for error toast to appear
      await waitFor(() => {
        const errorMessages = screen.getAllByText(/Failed to load designs/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });
    });
  });

  describe('New design button', () => {
    it('creates new design and navigates to editor', () => {
      renderComponent();

      const newButton = screen.getByRole('button', { name: /New Design/i });
      fireEvent.click(newButton);

      // Should navigate to editor
      expect(mockNavigate).toHaveBeenCalledWith('/editor');

      // Should create a new design in Redux
      const state = store.getState();
      expect(state.design.current).toBeDefined();
      expect(state.design.current?.name).toBe('Untitled Design');
      expect(state.design.current?.userId).toBe('user-123');
    });
  });

  describe('Load design', () => {
    it('loads design and navigates to editor when Open button clicked', async () => {
      const room = createRoom('rectangular', { width: 20, length: 15 }, { walls: '#E8E8E8', floor: '#D4C5B9', ceiling: '#FFFFFF' }, 'feet');
      const design = createDesign('user-123', 'Living Room', room);

      vi.mocked(storageService.loadDesigns).mockResolvedValue([design]);
      vi.mocked(storageService.loadDesign).mockResolvedValue(design);

      const storeWithDesigns = createTestStore({
        auth: {
          user: mockUser,
          loading: false,
          error: null,
        },
        design: {
          current: null,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
      });

      renderWithStore(storeWithDesigns);

      // Wait for design to load
      await waitFor(() => {
        expect(screen.getByText('Living Room')).toBeInTheDocument();
      });

      const openButton = screen.getByRole('button', { name: /Open/i });
      fireEvent.click(openButton);

      await waitFor(() => {
        expect(storageService.loadDesign).toHaveBeenCalledWith('user-123', design.id);
        expect(mockNavigate).toHaveBeenCalledWith('/editor');
      });
    });
  });

  describe('Delete confirmation dialog', () => {
    it('shows confirmation dialog when delete button clicked', async () => {
      const room = createRoom('rectangular', { width: 20, length: 15 }, { walls: '#E8E8E8', floor: '#D4C5B9', ceiling: '#FFFFFF' }, 'feet');
      const design = createDesign('user-123', 'Living Room', room);

      vi.mocked(storageService.loadDesigns).mockResolvedValue([design]);

      const storeWithDesigns = createTestStore({
        auth: {
          user: mockUser,
          loading: false,
          error: null,
        },
        design: {
          current: null,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
      });

      renderWithStore(storeWithDesigns);

      // Wait for design to load
      await waitFor(() => {
        expect(screen.getByText('Living Room')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      fireEvent.click(deleteButton);

      // Confirmation dialog should appear
      expect(screen.getByText(/Confirm Delete/i)).toBeInTheDocument();
      expect(screen.getByText(/Are you sure you want to delete this design/i)).toBeInTheDocument();
    });

    it('closes confirmation dialog when cancel button clicked', async () => {
      const room = createRoom('rectangular', { width: 20, length: 15 }, { walls: '#E8E8E8', floor: '#D4C5B9', ceiling: '#FFFFFF' }, 'feet');
      const design = createDesign('user-123', 'Living Room', room);

      vi.mocked(storageService.loadDesigns).mockResolvedValue([design]);

      const storeWithDesigns = createTestStore({
        auth: {
          user: mockUser,
          loading: false,
          error: null,
        },
        design: {
          current: null,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
      });

      renderWithStore(storeWithDesigns);

      // Wait for design to load
      await waitFor(() => {
        expect(screen.getByText('Living Room')).toBeInTheDocument();
      });

      // Open confirmation dialog
      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      fireEvent.click(deleteButton);

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      // Dialog should be closed
      expect(screen.queryByText(/Confirm Delete/i)).not.toBeInTheDocument();
    });

    it('deletes design when confirmed', async () => {
      const room = createRoom('rectangular', { width: 20, length: 15 }, { walls: '#E8E8E8', floor: '#D4C5B9', ceiling: '#FFFFFF' }, 'feet');
      const design = createDesign('user-123', 'Living Room', room);

      vi.mocked(storageService.loadDesigns).mockResolvedValue([design]);
      vi.mocked(storageService.deleteDesign).mockResolvedValue();

      const storeWithDesigns = createTestStore({
        auth: {
          user: mockUser,
          loading: false,
          error: null,
        },
        design: {
          current: null,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
      });

      renderWithStore(storeWithDesigns);

      // Wait for design to load
      await waitFor(() => {
        expect(screen.getByText('Living Room')).toBeInTheDocument();
      });

      // Open confirmation dialog
      const deleteButton = screen.getByRole('button', { name: /Delete/i });
      fireEvent.click(deleteButton);

      // Confirm deletion
      const confirmButtons = screen.getAllByRole('button', { name: /^Delete$/i });
      // The second Delete button is the confirm button in the dialog
      const confirmButton = confirmButtons[confirmButtons.length - 1];
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(storageService.deleteDesign).toHaveBeenCalledWith('user-123', design.id);
      });

      // Design should be removed from Redux state
      const state = storeWithDesigns.getState();
      expect(state.design.saved).toHaveLength(0);
    });
  });
});
