import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { FurnitureLibraryPanel } from './FurnitureLibraryPanel';
import designReducer from '../store/slices/designSlice';
import authReducer from '../store/slices/authSlice';
import uiReducer from '../store/slices/uiSlice';
import { createDesign } from '../models/Design';
import { createRoom } from '../models/Room';
import { createFurniture } from '../models/FurniturePiece';

// Mock the furnitureService
vi.mock('../services/furnitureService', () => ({
  fetchFurnitureItems: vi.fn().mockResolvedValue([]),
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

describe('FurnitureLibraryPanel', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    const room = createRoom(
      'rectangular',
      { width: 10, length: 12 },
      { walls: '#E8E8E8', floor: '#D4A574', ceiling: '#FFFFFF' },
      'feet'
    );
    const design = createDesign('user-1', 'Test Design', room);
    
    store = createTestStore({
      design: {
        current: design,
        saved: [],
        loading: false,
        error: null,
        isDirty: false,
      },
    });
  });

  it('renders furniture library panel', () => {
    render(
      <Provider store={store}>
        <FurnitureLibraryPanel />
      </Provider>
    );

    expect(screen.getByText('Furniture Library')).toBeInTheDocument();
  });

  it('displays furniture count', () => {
    render(
      <Provider store={store}>
        <FurnitureLibraryPanel />
      </Provider>
    );

    expect(screen.getByText('0 pieces in design')).toBeInTheDocument();
  });

  it('displays all furniture type buttons', () => {
    render(
      <Provider store={store}>
        <FurnitureLibraryPanel />
      </Provider>
    );

    expect(screen.getByText('Chair')).toBeInTheDocument();
    expect(screen.getByText('Table')).toBeInTheDocument();
    expect(screen.getByText('Couch')).toBeInTheDocument();
    expect(screen.getByText('Bed')).toBeInTheDocument();
    expect(screen.getByText('Desk')).toBeInTheDocument();
    expect(screen.getByText('Shelf')).toBeInTheDocument();
  });

  describe('Creating furniture', () => {
    it('creates chair when chair button is clicked', async () => {
      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      // Wait for Firestore fetch to complete
      await waitFor(() => {
        expect(screen.getByText('Chair')).toBeInTheDocument();
      });

      const chairButton = screen.getByText('Chair');
      fireEvent.click(chairButton);

      // Wait for variants to appear
      await waitFor(() => {
        expect(screen.getByText('Modern Chair')).toBeInTheDocument();
      });

      // Click on a variant
      const modernChairButton = screen.getByText('Modern Chair');
      fireEvent.click(modernChairButton);

      const state = store.getState();
      expect(state.design.current?.furniture.length).toBe(1);
      expect(state.design.current?.furniture[0].type).toBe('chair');
      expect(state.design.isDirty).toBe(true);
    });

    it('creates table when table button is clicked', async () => {
      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Table')).toBeInTheDocument();
      });

      const tableButton = screen.getByText('Table');
      fireEvent.click(tableButton);

      await waitFor(() => {
        expect(screen.getByText('Dining Table')).toBeInTheDocument();
      });

      const diningTableButton = screen.getByText('Dining Table');
      fireEvent.click(diningTableButton);

      const state = store.getState();
      expect(state.design.current?.furniture.length).toBe(1);
      expect(state.design.current?.furniture[0].type).toBe('table');
    });

    it('creates couch when couch button is clicked', async () => {
      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Couch')).toBeInTheDocument();
      });

      const couchButton = screen.getByText('Couch');
      fireEvent.click(couchButton);

      await waitFor(() => {
        expect(screen.getByText('Sectional Couch')).toBeInTheDocument();
      });

      const sectionalCouchButton = screen.getByText('Sectional Couch');
      fireEvent.click(sectionalCouchButton);

      const state = store.getState();
      expect(state.design.current?.furniture.length).toBe(1);
      expect(state.design.current?.furniture[0].type).toBe('couch');
    });

    it('creates bed when bed button is clicked', async () => {
      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Bed')).toBeInTheDocument();
      });

      const bedButton = screen.getByText('Bed');
      fireEvent.click(bedButton);

      await waitFor(() => {
        expect(screen.getByText('Queen Bed')).toBeInTheDocument();
      });

      const queenBedButton = screen.getByText('Queen Bed');
      fireEvent.click(queenBedButton);

      const state = store.getState();
      expect(state.design.current?.furniture.length).toBe(1);
      expect(state.design.current?.furniture[0].type).toBe('bed');
    });

    it('creates desk when desk button is clicked', async () => {
      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Desk')).toBeInTheDocument();
      });

      const deskButton = screen.getByText('Desk');
      fireEvent.click(deskButton);

      await waitFor(() => {
        expect(screen.getByText('Office Desk')).toBeInTheDocument();
      });

      const officeDeskButton = screen.getByText('Office Desk');
      fireEvent.click(officeDeskButton);

      const state = store.getState();
      expect(state.design.current?.furniture.length).toBe(1);
      expect(state.design.current?.furniture[0].type).toBe('desk');
    });

    it('creates shelf when shelf button is clicked', async () => {
      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Shelf')).toBeInTheDocument();
      });

      const shelfButton = screen.getByText('Shelf');
      fireEvent.click(shelfButton);

      await waitFor(() => {
        expect(screen.getByText('Bookcase')).toBeInTheDocument();
      });

      const bookcaseButton = screen.getByText('Bookcase');
      fireEvent.click(bookcaseButton);

      const state = store.getState();
      expect(state.design.current?.furniture.length).toBe(1);
      expect(state.design.current?.furniture[0].type).toBe('shelf');
    });

    it('creates multiple furniture pieces', async () => {
      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Chair')).toBeInTheDocument();
      });

      // Add first chair
      const chairButton = screen.getByText('Chair');
      fireEvent.click(chairButton);

      await waitFor(() => {
        expect(screen.getByText('Modern Chair')).toBeInTheDocument();
      });

      const modernChairButton = screen.getByText('Modern Chair');
      fireEvent.click(modernChairButton);

      // Go back and add table
      await waitFor(() => {
        expect(screen.getByText('Table')).toBeInTheDocument();
      });

      const tableButton = screen.getByText('Table');
      fireEvent.click(tableButton);

      await waitFor(() => {
        expect(screen.getByText('Dining Table')).toBeInTheDocument();
      });

      const diningTableButton = screen.getByText('Dining Table');
      fireEvent.click(diningTableButton);

      // Go back and add another chair
      await waitFor(() => {
        expect(screen.getByText('Chair')).toBeInTheDocument();
      });

      const chairButton2 = screen.getByText('Chair');
      fireEvent.click(chairButton2);

      await waitFor(() => {
        expect(screen.getByText('Classic Chair')).toBeInTheDocument();
      });

      const classicChairButton = screen.getByText('Classic Chair');
      fireEvent.click(classicChairButton);

      const state = store.getState();
      expect(state.design.current?.furniture.length).toBe(3);
      expect(state.design.current?.furniture[0].type).toBe('chair');
      expect(state.design.current?.furniture[1].type).toBe('table');
      expect(state.design.current?.furniture[2].type).toBe('chair');
    });

    it('updates furniture count after adding furniture', async () => {
      const { rerender } = render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('0 pieces in design')).toBeInTheDocument();
      });

      // Add first chair
      const chairButton = screen.getByText('Chair');
      fireEvent.click(chairButton);

      await waitFor(() => {
        expect(screen.getByText('Modern Chair')).toBeInTheDocument();
      });

      const modernChairButton = screen.getByText('Modern Chair');
      fireEvent.click(modernChairButton);

      rerender(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('1 piece in design')).toBeInTheDocument();
      });

      // Add table
      const tableButton = screen.getByText('Table');
      fireEvent.click(tableButton);

      await waitFor(() => {
        expect(screen.getByText('Dining Table')).toBeInTheDocument();
      });

      const diningTableButton = screen.getByText('Dining Table');
      fireEvent.click(diningTableButton);

      rerender(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('2 pieces in design')).toBeInTheDocument();
      });
    });
  });

  describe('Disabled state', () => {
    it('disables buttons when no design is loaded', () => {
      const emptyStore = createTestStore({
        design: {
          current: null,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
      });

      render(
        <Provider store={emptyStore}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      const chairButton = screen.getByText('Chair').closest('button');
      expect(chairButton).toBeDisabled();
    });

    it('enables buttons when design is loaded', () => {
      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      const chairButton = screen.getByText('Chair').closest('button');
      expect(chairButton).not.toBeDisabled();
    });
  });

  describe('Firestore integration', () => {
    it('displays warning banner when Firestore fetch fails', async () => {
      const { fetchFurnitureItems } = await import('../services/furnitureService');
      vi.mocked(fetchFurnitureItems).mockRejectedValueOnce(new Error('Network error'));

      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/Network error/i)).toBeInTheDocument();
        expect(screen.getByText(/Showing default furniture/i)).toBeInTheDocument();
      });

      // Should still show static furniture categories
      expect(screen.getByText('Chair')).toBeInTheDocument();
      expect(screen.getByText('Table')).toBeInTheDocument();
    });

    it('merges Firestore items with static categories', async () => {
      const { fetchFurnitureItems } = await import('../services/furnitureService');
      const mockFirestoreItems = [
        {
          id: 'firestore-chair-1',
          name: 'Premium Chair',
          type: 'chair' as const,
          color: '#FF0000',
          price: 99997,
          imageUrl: 'https://example.com/chair.jpg',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ];
      vi.mocked(fetchFurnitureItems).mockResolvedValueOnce(mockFirestoreItems);

      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Chair')).toBeInTheDocument();
      });

      // Click on Chair category
      const chairButton = screen.getByText('Chair');
      fireEvent.click(chairButton);

      // Should show both static and Firestore items
      await waitFor(() => {
        expect(screen.getByText('Modern Chair')).toBeInTheDocument(); // Static
        expect(screen.getByText('Premium Chair')).toBeInTheDocument(); // Firestore
      });
    });
  });
});
