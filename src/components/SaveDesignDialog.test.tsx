import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { SaveDesignDialog } from './SaveDesignDialog';
import designReducer from '../store/slices/designSlice';
import authReducer from '../store/slices/authSlice';
import uiReducer from '../store/slices/uiSlice';
import { createDesign } from '../models/Design';
import { createRoom } from '../models/Room';
import * as storageService from '../services/storageService';

// Mock the storage service
vi.mock('../services/storageService', () => ({
  saveDesign: vi.fn(),
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

describe('SaveDesignDialog', () => {
  let store: ReturnType<typeof createTestStore>;
  const mockOnClose = vi.fn();
  const mockUser = { uid: 'user-123', email: 'test@example.com' };

  beforeEach(() => {
    vi.clearAllMocks();
    
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
        isDirty: true,
      },
    });
  });

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <SaveDesignDialog onClose={mockOnClose} />
      </Provider>
    );
  };

  it('renders save design dialog', () => {
    renderComponent();

    expect(screen.getByText('Save Design')).toBeInTheDocument();
    expect(screen.getByLabelText(/Design Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cancel/i })).toBeInTheDocument();
  });

  it('displays current design name in input field', () => {
    renderComponent();

    const nameInput = screen.getByLabelText(/Design Name/i) as HTMLInputElement;
    expect(nameInput.value).toBe('Test Design');
  });

  it('updates design name when input changes', () => {
    renderComponent();

    const nameInput = screen.getByLabelText(/Design Name/i);
    fireEvent.change(nameInput, { target: { value: 'New Design Name' } });

    expect((nameInput as HTMLInputElement).value).toBe('New Design Name');
  });

  it('disables save button when design name is empty', () => {
    renderComponent();

    const nameInput = screen.getByLabelText(/Design Name/i);
    fireEvent.change(nameInput, { target: { value: '' } });

    const saveButton = screen.getByRole('button', { name: /Save/i });
    expect(saveButton).toBeDisabled();
  });

  it('disables save button when design name is only whitespace', () => {
    renderComponent();

    const nameInput = screen.getByLabelText(/Design Name/i);
    fireEvent.change(nameInput, { target: { value: '   ' } });

    const saveButton = screen.getByRole('button', { name: /Save/i });
    expect(saveButton).toBeDisabled();
  });

  describe('Save functionality', () => {
    it('saves design when save button clicked', async () => {
      vi.mocked(storageService.saveDesign).mockResolvedValue();

      renderComponent();

      const nameInput = screen.getByLabelText(/Design Name/i);
      fireEvent.change(nameInput, { target: { value: 'Updated Design' } });

      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(storageService.saveDesign).toHaveBeenCalled();
      });

      // Check that the design was saved with the updated name
      const savedDesign = vi.mocked(storageService.saveDesign).mock.calls[0][0];
      expect(savedDesign.name).toBe('Updated Design');
    });

    it('shows success message after successful save', async () => {
      vi.mocked(storageService.saveDesign).mockResolvedValue();

      renderComponent();

      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Design saved successfully/i)).toBeInTheDocument();
      });
    });

    it('auto-closes dialog after successful save', async () => {
      vi.mocked(storageService.saveDesign).mockResolvedValue();

      renderComponent();

      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalled();
      }, { timeout: 2000 });
    });

    it('displays error message when save fails', async () => {
      vi.mocked(storageService.saveDesign).mockRejectedValue(
        new Error('Network error')
      );

      renderComponent();

      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
      });
    });

    it('shows loading state while saving', async () => {
      vi.mocked(storageService.saveDesign).mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      renderComponent();

      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);

      // Should show "Saving..." text
      await waitFor(() => {
        expect(screen.getByText(/Saving.../i)).toBeInTheDocument();
      });

      // Buttons should be disabled during save
      expect(saveButton).toBeDisabled();
      expect(screen.getByRole('button', { name: /Cancel/i })).toBeDisabled();
    });

    it('saves design when Enter key pressed in input field', async () => {
      vi.mocked(storageService.saveDesign).mockResolvedValue();

      renderComponent();

      const nameInput = screen.getByLabelText(/Design Name/i);
      fireEvent.keyPress(nameInput, { key: 'Enter', code: 'Enter', charCode: 13 });

      await waitFor(() => {
        expect(storageService.saveDesign).toHaveBeenCalled();
      });
    });
  });

  describe('Cancel functionality', () => {
    it('closes dialog when cancel button clicked', () => {
      renderComponent();

      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('closes dialog when clicking outside modal', () => {
      renderComponent();

      const overlay = screen.getByText('Save Design').closest('.modal-overlay');
      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('does not close dialog when clicking inside modal content', () => {
      renderComponent();

      const modalContent = screen.getByText('Save Design').closest('.modal-content');
      if (modalContent) {
        fireEvent.click(modalContent);
      }

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Redux integration', () => {
    it('updates Redux state after successful save', async () => {
      vi.mocked(storageService.saveDesign).mockResolvedValue();

      renderComponent();

      const saveButton = screen.getByRole('button', { name: /Save/i });
      fireEvent.click(saveButton);

      await waitFor(() => {
        const state = store.getState();
        expect(state.design.isDirty).toBe(false);
      });
    });
  });
});
