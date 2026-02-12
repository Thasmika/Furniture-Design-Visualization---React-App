import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { AppLayout } from './AppLayout';
import designReducer from '../store/slices/designSlice';
import authReducer from '../store/slices/authSlice';
import uiReducer from '../store/slices/uiSlice';
import { createDesign } from '../models/Design';
import { createRoom } from '../models/Room';

// Mock child components to simplify testing
vi.mock('./RoomConfigPanel', () => ({
  RoomConfigPanel: () => <div data-testid="room-config-panel">Room Config Panel</div>,
}));

vi.mock('./FurnitureLibraryPanel', () => ({
  FurnitureLibraryPanel: () => <div data-testid="furniture-library-panel">Furniture Library Panel</div>,
}));

vi.mock('./PropertyEditorPanel', () => ({
  PropertyEditorPanel: () => <div data-testid="property-editor-panel">Property Editor Panel</div>,
}));

vi.mock('./ViewContainer', () => ({
  ViewContainer: () => <div data-testid="view-container">View Container</div>,
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

describe('AppLayout', () => {
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
      ui: {
        selectedFurnitureId: null,
        activeView: '2d',
        showGrid: true,
        snapToGrid: false,
        sidebarOpen: true,
      },
    });
  });

  describe('Rendering', () => {
    it('renders all panels when sidebar is open', () => {
      render(
        <Provider store={store}>
          <AppLayout />
        </Provider>
      );

      expect(screen.getByTestId('room-config-panel')).toBeInTheDocument();
      expect(screen.getByTestId('furniture-library-panel')).toBeInTheDocument();
      expect(screen.getByTestId('property-editor-panel')).toBeInTheDocument();
      expect(screen.getByTestId('view-container')).toBeInTheDocument();
    });

    it('renders view mode selector buttons', () => {
      render(
        <Provider store={store}>
          <AppLayout />
        </Provider>
      );

      expect(screen.getByText('2D View')).toBeInTheDocument();
      expect(screen.getByText('3D View')).toBeInTheDocument();
      expect(screen.getByText('Split View')).toBeInTheDocument();
    });

    it('renders sidebar toggle button', () => {
      render(
        <Provider store={store}>
          <AppLayout />
        </Provider>
      );

      const toggleButton = screen.getByRole('button', { name: '◀' });
      expect(toggleButton).toBeInTheDocument();
    });

    it('highlights active view mode button', () => {
      render(
        <Provider store={store}>
          <AppLayout />
        </Provider>
      );

      const button2D = screen.getByText('2D View');
      const button3D = screen.getByText('3D View');
      const buttonSplit = screen.getByText('Split View');

      expect(button2D).toHaveClass('active');
      expect(button3D).not.toHaveClass('active');
      expect(buttonSplit).not.toHaveClass('active');
    });
  });

  describe('View mode switching', () => {
    it('switches to 3D view when 3D button is clicked', () => {
      render(
        <Provider store={store}>
          <AppLayout />
        </Provider>
      );

      const button3D = screen.getByText('3D View');
      fireEvent.click(button3D);

      const state = store.getState();
      expect(state.ui.activeView).toBe('3d');
    });

    it('switches to split view when split button is clicked', () => {
      render(
        <Provider store={store}>
          <AppLayout />
        </Provider>
      );

      const buttonSplit = screen.getByText('Split View');
      fireEvent.click(buttonSplit);

      const state = store.getState();
      expect(state.ui.activeView).toBe('split');
    });

    it('updates active button class when view changes', () => {
      render(
        <Provider store={store}>
          <AppLayout />
        </Provider>
      );

      const button3D = screen.getByText('3D View');
      fireEvent.click(button3D);

      expect(button3D).toHaveClass('active');
      expect(screen.getByText('2D View')).not.toHaveClass('active');
    });
  });

  describe('Sidebar collapse/expand', () => {
    it('collapses sidebar when toggle button is clicked', () => {
      render(
        <Provider store={store}>
          <AppLayout />
        </Provider>
      );

      const toggleButton = screen.getByRole('button', { name: '◀' });
      fireEvent.click(toggleButton);

      const state = store.getState();
      expect(state.ui.sidebarOpen).toBe(false);
    });

    it('expands sidebar when toggle button is clicked again', () => {
      // Start with sidebar closed
      const closedStore = createTestStore({
        design: {
          current: null,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
        ui: {
          selectedFurnitureId: null,
          activeView: '2d',
          showGrid: true,
          snapToGrid: false,
          sidebarOpen: false,
        },
      });

      render(
        <Provider store={closedStore}>
          <AppLayout />
        </Provider>
      );

      const toggleButton = screen.getByRole('button', { name: '▶' });
      fireEvent.click(toggleButton);

      const state = closedStore.getState();
      expect(state.ui.sidebarOpen).toBe(true);
    });

    it('applies closed class to sidebar when collapsed', () => {
      // Start with sidebar closed
      const closedStore = createTestStore({
        design: {
          current: null,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
        ui: {
          selectedFurnitureId: null,
          activeView: '2d',
          showGrid: true,
          snapToGrid: false,
          sidebarOpen: false,
        },
      });

      render(
        <Provider store={closedStore}>
          <AppLayout />
        </Provider>
      );

      const sidebar = document.querySelector('.app-layout-sidebar');
      expect(sidebar).toHaveClass('closed');
    });

    it('applies open class to sidebar when expanded', () => {
      render(
        <Provider store={store}>
          <AppLayout />
        </Provider>
      );

      const sidebar = document.querySelector('.app-layout-sidebar');
      expect(sidebar).toHaveClass('open');
    });

    it('changes toggle button text when sidebar state changes', () => {
      render(
        <Provider store={store}>
          <AppLayout />
        </Provider>
      );

      // Initially shows "◀" (hide sidebar arrow)
      expect(screen.getByRole('button', { name: '◀' })).toBeInTheDocument();

      // Click to collapse
      const toggleButton = screen.getByRole('button', { name: '◀' });
      fireEvent.click(toggleButton);

      // Now shows "▶" (show sidebar arrow)
      expect(screen.getByRole('button', { name: '▶' })).toBeInTheDocument();
    });
  });

  describe('Layout structure', () => {
    it('has header, sidebar, and main content areas', () => {
      render(
        <Provider store={store}>
          <AppLayout />
        </Provider>
      );

      expect(document.querySelector('.app-layout-header')).toBeInTheDocument();
      expect(document.querySelector('.app-layout-sidebar')).toBeInTheDocument();
      expect(document.querySelector('.app-layout-main')).toBeInTheDocument();
    });

    it('renders panels in sidebar', () => {
      render(
        <Provider store={store}>
          <AppLayout />
        </Provider>
      );

      const sidebar = document.querySelector('.app-layout-sidebar');
      expect(sidebar).toContainElement(screen.getByTestId('room-config-panel'));
      expect(sidebar).toContainElement(screen.getByTestId('furniture-library-panel'));
      expect(sidebar).toContainElement(screen.getByTestId('property-editor-panel'));
    });

    it('renders view container in main area', () => {
      render(
        <Provider store={store}>
          <AppLayout />
        </Provider>
      );

      const main = document.querySelector('.app-layout-main');
      expect(main).toContainElement(screen.getByTestId('view-container'));
    });
  });
});
