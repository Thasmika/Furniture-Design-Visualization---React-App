import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ViewContainer } from './ViewContainer';
import designReducer from '../store/slices/designSlice';
import authReducer from '../store/slices/authSlice';
import uiReducer from '../store/slices/uiSlice';
import { createDesign } from '../models/Design';
import { createRoom } from '../models/Room';

// Mock Canvas2D and Scene3D components
vi.mock('./Canvas2D', () => ({
  Canvas2D: ({ width, height }: { width: number; height: number }) => (
    <div data-testid="canvas-2d" data-width={width} data-height={height}>
      Canvas 2D
    </div>
  ),
}));

vi.mock('./Scene3D', () => ({
  Scene3D: () => <div data-testid="scene-3d">Scene 3D</div>,
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

describe('ViewContainer', () => {
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

  describe('2D View Mode', () => {
    it('renders Canvas2D when activeView is 2d', () => {
      render(
        <Provider store={store}>
          <ViewContainer />
        </Provider>
      );

      expect(screen.getByTestId('canvas-2d')).toBeInTheDocument();
      expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();
    });

    it('renders single view container for 2D', () => {
      render(
        <Provider store={store}>
          <ViewContainer />
        </Provider>
      );

      const singleView = document.querySelector('.view-single');
      expect(singleView).toBeInTheDocument();
      expect(document.querySelector('.view-split')).not.toBeInTheDocument();
    });
  });

  describe('3D View Mode', () => {
    it('renders Scene3D when activeView is 3d', () => {
      const store3D = createTestStore({
        design: {
          current: store.getState().design.current,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
        ui: {
          selectedFurnitureId: null,
          activeView: '3d',
          showGrid: true,
          snapToGrid: false,
          sidebarOpen: true,
        },
      });

      render(
        <Provider store={store3D}>
          <ViewContainer />
        </Provider>
      );

      expect(screen.getByTestId('scene-3d')).toBeInTheDocument();
      expect(screen.queryByTestId('canvas-2d')).not.toBeInTheDocument();
    });

    it('renders single view container for 3D', () => {
      const store3D = createTestStore({
        design: {
          current: store.getState().design.current,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
        ui: {
          selectedFurnitureId: null,
          activeView: '3d',
          showGrid: true,
          snapToGrid: false,
          sidebarOpen: true,
        },
      });

      render(
        <Provider store={store3D}>
          <ViewContainer />
        </Provider>
      );

      const singleView = document.querySelector('.view-single');
      expect(singleView).toBeInTheDocument();
      expect(document.querySelector('.view-split')).not.toBeInTheDocument();
    });
  });

  describe('Split View Mode', () => {
    it('renders both Canvas2D and Scene3D when activeView is split', () => {
      const storeSplit = createTestStore({
        design: {
          current: store.getState().design.current,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
        ui: {
          selectedFurnitureId: null,
          activeView: 'split',
          showGrid: true,
          snapToGrid: false,
          sidebarOpen: true,
        },
      });

      render(
        <Provider store={storeSplit}>
          <ViewContainer />
        </Provider>
      );

      expect(screen.getByTestId('canvas-2d')).toBeInTheDocument();
      expect(screen.getByTestId('scene-3d')).toBeInTheDocument();
    });

    it('renders split view container with two panes', () => {
      const storeSplit = createTestStore({
        design: {
          current: store.getState().design.current,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
        ui: {
          selectedFurnitureId: null,
          activeView: 'split',
          showGrid: true,
          snapToGrid: false,
          sidebarOpen: true,
        },
      });

      render(
        <Provider store={storeSplit}>
          <ViewContainer />
        </Provider>
      );

      const splitView = document.querySelector('.view-split');
      expect(splitView).toBeInTheDocument();
      
      const panes = document.querySelectorAll('.view-split-pane');
      expect(panes).toHaveLength(2);
    });

    it('renders view labels in split mode', () => {
      const storeSplit = createTestStore({
        design: {
          current: store.getState().design.current,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
        ui: {
          selectedFurnitureId: null,
          activeView: 'split',
          showGrid: true,
          snapToGrid: false,
          sidebarOpen: true,
        },
      });

      render(
        <Provider store={storeSplit}>
          <ViewContainer />
        </Provider>
      );

      expect(screen.getByText('2D View')).toBeInTheDocument();
      expect(screen.getByText('3D View')).toBeInTheDocument();
    });

    it('renders divider between panes in split mode', () => {
      const storeSplit = createTestStore({
        design: {
          current: store.getState().design.current,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
        ui: {
          selectedFurnitureId: null,
          activeView: 'split',
          showGrid: true,
          snapToGrid: false,
          sidebarOpen: true,
        },
      });

      render(
        <Provider store={storeSplit}>
          <ViewContainer />
        </Provider>
      );

      const divider = document.querySelector('.view-split-divider');
      expect(divider).toBeInTheDocument();
    });
  });

  describe('View mode switching', () => {
    it('switches from 2D to 3D view', () => {
      const { rerender } = render(
        <Provider store={store}>
          <ViewContainer />
        </Provider>
      );

      expect(screen.getByTestId('canvas-2d')).toBeInTheDocument();

      // Update store to 3D view
      const store3D = createTestStore({
        design: {
          current: store.getState().design.current,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
        ui: {
          selectedFurnitureId: null,
          activeView: '3d',
          showGrid: true,
          snapToGrid: false,
          sidebarOpen: true,
        },
      });

      rerender(
        <Provider store={store3D}>
          <ViewContainer />
        </Provider>
      );

      expect(screen.getByTestId('scene-3d')).toBeInTheDocument();
      expect(screen.queryByTestId('canvas-2d')).not.toBeInTheDocument();
    });

    it('switches from 2D to split view', () => {
      const { rerender } = render(
        <Provider store={store}>
          <ViewContainer />
        </Provider>
      );

      expect(screen.getByTestId('canvas-2d')).toBeInTheDocument();
      expect(screen.queryByTestId('scene-3d')).not.toBeInTheDocument();

      // Update store to split view
      const storeSplit = createTestStore({
        design: {
          current: store.getState().design.current,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
        ui: {
          selectedFurnitureId: null,
          activeView: 'split',
          showGrid: true,
          snapToGrid: false,
          sidebarOpen: true,
        },
      });

      rerender(
        <Provider store={storeSplit}>
          <ViewContainer />
        </Provider>
      );

      expect(screen.getByTestId('canvas-2d')).toBeInTheDocument();
      expect(screen.getByTestId('scene-3d')).toBeInTheDocument();
    });

    it('switches from split to 3D view', () => {
      const storeSplit = createTestStore({
        design: {
          current: store.getState().design.current,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
        ui: {
          selectedFurnitureId: null,
          activeView: 'split',
          showGrid: true,
          snapToGrid: false,
          sidebarOpen: true,
        },
      });

      const { rerender } = render(
        <Provider store={storeSplit}>
          <ViewContainer />
        </Provider>
      );

      expect(screen.getByTestId('canvas-2d')).toBeInTheDocument();
      expect(screen.getByTestId('scene-3d')).toBeInTheDocument();

      // Update store to 3D view
      const store3D = createTestStore({
        design: {
          current: store.getState().design.current,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
        ui: {
          selectedFurnitureId: null,
          activeView: '3d',
          showGrid: true,
          snapToGrid: false,
          sidebarOpen: true,
        },
      });

      rerender(
        <Provider store={store3D}>
          <ViewContainer />
        </Provider>
      );

      expect(screen.getByTestId('scene-3d')).toBeInTheDocument();
      expect(screen.queryByTestId('canvas-2d')).not.toBeInTheDocument();
    });
  });
});
