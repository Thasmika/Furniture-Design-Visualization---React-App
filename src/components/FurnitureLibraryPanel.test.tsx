import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { FurnitureLibraryPanel } from './FurnitureLibraryPanel';
import designReducer from '../store/slices/designSlice';
import authReducer from '../store/slices/authSlice';
import uiReducer from '../store/slices/uiSlice';
import { createDesign } from '../models/Design';
import { createRoom } from '../models/Room';
import { createFurniture } from '../models/FurniturePiece';

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
    it('creates chair when chair button is clicked', () => {
      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      const chairButton = screen.getByText('Chair');
      fireEvent.click(chairButton);

      const state = store.getState();
      expect(state.design.current?.furniture.length).toBe(1);
      expect(state.design.current?.furniture[0].type).toBe('chair');
      expect(state.design.isDirty).toBe(true);
    });

    it('creates table when table button is clicked', () => {
      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      const tableButton = screen.getByText('Table');
      fireEvent.click(tableButton);

      const state = store.getState();
      expect(state.design.current?.furniture.length).toBe(1);
      expect(state.design.current?.furniture[0].type).toBe('table');
    });

    it('creates couch when couch button is clicked', () => {
      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      const couchButton = screen.getByText('Couch');
      fireEvent.click(couchButton);

      const state = store.getState();
      expect(state.design.current?.furniture.length).toBe(1);
      expect(state.design.current?.furniture[0].type).toBe('couch');
    });

    it('creates bed when bed button is clicked', () => {
      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      const bedButton = screen.getByText('Bed');
      fireEvent.click(bedButton);

      const state = store.getState();
      expect(state.design.current?.furniture.length).toBe(1);
      expect(state.design.current?.furniture[0].type).toBe('bed');
    });

    it('creates desk when desk button is clicked', () => {
      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      const deskButton = screen.getByText('Desk');
      fireEvent.click(deskButton);

      const state = store.getState();
      expect(state.design.current?.furniture.length).toBe(1);
      expect(state.design.current?.furniture[0].type).toBe('desk');
    });

    it('creates shelf when shelf button is clicked', () => {
      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      const shelfButton = screen.getByText('Shelf');
      fireEvent.click(shelfButton);

      const state = store.getState();
      expect(state.design.current?.furniture.length).toBe(1);
      expect(state.design.current?.furniture[0].type).toBe('shelf');
    });

    it('creates multiple furniture pieces', () => {
      render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      const chairButton = screen.getByText('Chair');
      const tableButton = screen.getByText('Table');

      fireEvent.click(chairButton);
      fireEvent.click(tableButton);
      fireEvent.click(chairButton);

      const state = store.getState();
      expect(state.design.current?.furniture.length).toBe(3);
      expect(state.design.current?.furniture[0].type).toBe('chair');
      expect(state.design.current?.furniture[1].type).toBe('table');
      expect(state.design.current?.furniture[2].type).toBe('chair');
    });

    it('updates furniture count after adding furniture', () => {
      const { rerender } = render(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      expect(screen.getByText('0 pieces in design')).toBeInTheDocument();

      const chairButton = screen.getByText('Chair');
      fireEvent.click(chairButton);

      rerender(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      expect(screen.getByText('1 piece in design')).toBeInTheDocument();

      const tableButton = screen.getByText('Table');
      fireEvent.click(tableButton);

      rerender(
        <Provider store={store}>
          <FurnitureLibraryPanel />
        </Provider>
      );

      expect(screen.getByText('2 pieces in design')).toBeInTheDocument();
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
});
