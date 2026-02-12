import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { PropertyEditorPanel } from './PropertyEditorPanel';
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

describe('PropertyEditorPanel', () => {
  let store: ReturnType<typeof createTestStore>;
  let chair: ReturnType<typeof createFurniture>;

  beforeEach(() => {
    const room = createRoom(
      'rectangular',
      { width: 10, length: 12 },
      { walls: '#E8E8E8', floor: '#D4A574', ceiling: '#FFFFFF' },
      'feet'
    );
    const design = createDesign('user-1', 'Test Design', room);
    chair = createFurniture('chair');
    design.furniture.push(chair);
    
    store = createTestStore({
      design: {
        current: design,
        saved: [],
        loading: false,
        error: null,
        isDirty: false,
      },
      ui: {
        selectedFurnitureId: chair.id,
        activeView: '2d',
        showGrid: true,
        snapToGrid: false,
        sidebarOpen: true,
      },
    });
  });

  describe('No selection state', () => {
    it('displays message when no furniture is selected', () => {
      const noSelectionStore = createTestStore({
        design: {
          current: store.getState().design.current,
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

      render(
        <Provider store={noSelectionStore}>
          <PropertyEditorPanel />
        </Provider>
      );

      expect(screen.getByText('Select a furniture piece to edit its properties')).toBeInTheDocument();
    });
  });

  describe('Selected furniture display', () => {
    it('displays selected furniture type', () => {
      render(
        <Provider store={store}>
          <PropertyEditorPanel />
        </Provider>
      );

      expect(screen.getByText('chair')).toBeInTheDocument();
    });

    it('displays furniture dimensions', () => {
      render(
        <Provider store={store}>
          <PropertyEditorPanel />
        </Provider>
      );

      expect(screen.getByText('Width:')).toBeInTheDocument();
      expect(screen.getByText('Depth:')).toBeInTheDocument();
      expect(screen.getByText('Height:')).toBeInTheDocument();
      
      // Chair default dimensions: 2' × 2' × 3'
      const dimensionValues = screen.getAllByText('2.0');
      expect(dimensionValues.length).toBeGreaterThan(0);
      expect(screen.getByText('3.0')).toBeInTheDocument();
    });

    it('displays scale slider', () => {
      render(
        <Provider store={store}>
          <PropertyEditorPanel />
        </Provider>
      );

      const scaleSlider = screen.getByLabelText(/Scale:/);
      expect(scaleSlider).toBeInTheDocument();
      expect(scaleSlider).toHaveAttribute('type', 'range');
      expect(scaleSlider).toHaveAttribute('min', '0.5');
      expect(scaleSlider).toHaveAttribute('max', '3.0');
    });

    it('displays color picker', () => {
      render(
        <Provider store={store}>
          <PropertyEditorPanel />
        </Provider>
      );

      const colorPicker = screen.getByLabelText('Color');
      expect(colorPicker).toBeInTheDocument();
      expect(colorPicker).toHaveAttribute('type', 'color');
    });

    it('displays delete button', () => {
      render(
        <Provider store={store}>
          <PropertyEditorPanel />
        </Provider>
      );

      const deleteButton = screen.getByRole('button', { name: '🗑️' });
      expect(deleteButton).toBeInTheDocument();
    });
  });

  describe('Scale slider functionality', () => {
    it('updates scale when slider changes', () => {
      render(
        <Provider store={store}>
          <PropertyEditorPanel />
        </Provider>
      );

      const scaleSlider = screen.getByLabelText(/Scale:/) as HTMLInputElement;
      
      fireEvent.change(scaleSlider, { target: { value: '2.0' } });

      const state = store.getState();
      expect(state.design.current?.furniture[0].scale).toBe(2.0);
      expect(state.design.isDirty).toBe(true);
    });

    it('maintains aspect ratio when scaling', () => {
      render(
        <Provider store={store}>
          <PropertyEditorPanel />
        </Provider>
      );

      const scaleSlider = screen.getByLabelText(/Scale:/) as HTMLInputElement;
      
      // Original dimensions: 2' × 2' × 3'
      const originalWidth = chair.dimensions.width;
      const originalDepth = chair.dimensions.depth;
      const originalHeight = chair.dimensions.height;
      
      const originalAspectRatio = originalWidth / originalDepth;
      
      fireEvent.change(scaleSlider, { target: { value: '1.5' } });

      const state = store.getState();
      const furniture = state.design.current?.furniture[0];
      
      // Dimensions should remain unchanged (scale is applied separately)
      expect(furniture?.dimensions.width).toBe(originalWidth);
      expect(furniture?.dimensions.depth).toBe(originalDepth);
      expect(furniture?.dimensions.height).toBe(originalHeight);
      
      // Scale should be updated
      expect(furniture?.scale).toBe(1.5);
      
      // Effective dimensions should maintain aspect ratio
      const effectiveWidth = furniture!.dimensions.width * furniture!.scale;
      const effectiveDepth = furniture!.dimensions.depth * furniture!.scale;
      const newAspectRatio = effectiveWidth / effectiveDepth;
      
      expect(Math.abs(newAspectRatio - originalAspectRatio)).toBeLessThan(0.0001);
    });

    it('updates displayed dimensions when scale changes', () => {
      const { rerender } = render(
        <Provider store={store}>
          <PropertyEditorPanel />
        </Provider>
      );

      const scaleSlider = screen.getByLabelText(/Scale:/) as HTMLInputElement;
      
      // Scale to 2x
      fireEvent.change(scaleSlider, { target: { value: '2.0' } });

      rerender(
        <Provider store={store}>
          <PropertyEditorPanel />
        </Provider>
      );

      // Chair default dimensions: 2' × 2' × 3', scaled by 2.0 = 4' × 4' × 6'
      const dimensionValues = screen.getAllByText('4.0');
      expect(dimensionValues.length).toBeGreaterThan(0);
      expect(screen.getByText('6.0')).toBeInTheDocument();
    });

    it('displays validation error for scale outside range', () => {
      render(
        <Provider store={store}>
          <PropertyEditorPanel />
        </Provider>
      );

      const scaleSlider = screen.getByLabelText(/Scale:/) as HTMLInputElement;
      
      // Try to set scale below minimum (note: HTML range input prevents this, but we test the validation)
      // We'll manually trigger the validation by setting a value outside range
      Object.defineProperty(scaleSlider, 'value', { value: '0.3', writable: true });
      fireEvent.change(scaleSlider, { target: { value: '0.3' } });

      expect(screen.getByText('Scale must be between 0.5 and 3.0')).toBeInTheDocument();
    });
  });

  describe('Color picker functionality', () => {
    it('updates furniture color when color picker changes', () => {
      render(
        <Provider store={store}>
          <PropertyEditorPanel />
        </Provider>
      );

      const colorPicker = screen.getByLabelText('Color') as HTMLInputElement;
      
      fireEvent.change(colorPicker, { target: { value: '#FF0000' } });

      const state = store.getState();
      // Browsers normalize hex colors to lowercase
      expect(state.design.current?.furniture[0].color.toLowerCase()).toBe('#ff0000');
      expect(state.design.isDirty).toBe(true);
    });

    it('updates furniture color when text input changes', () => {
      render(
        <Provider store={store}>
          <PropertyEditorPanel />
        </Provider>
      );

      const colorTextInput = screen.getByPlaceholderText('#8B4513') as HTMLInputElement;
      
      fireEvent.change(colorTextInput, { target: { value: '#00FF00' } });

      const state = store.getState();
      expect(state.design.current?.furniture[0].color).toBe('#00FF00');
    });

    it('displays current furniture color', () => {
      render(
        <Provider store={store}>
          <PropertyEditorPanel />
        </Provider>
      );

      const colorPicker = screen.getByLabelText('Color') as HTMLInputElement;
      expect(colorPicker.value).toBe('#8b4513');
    });
  });

  describe('Delete functionality', () => {
    it('removes furniture when delete button is clicked', () => {
      render(
        <Provider store={store}>
          <PropertyEditorPanel />
        </Provider>
      );

      const deleteButton = screen.getByRole('button', { name: '🗑️' });
      fireEvent.click(deleteButton);

      const state = store.getState();
      expect(state.design.current?.furniture.length).toBe(0);
      expect(state.ui.selectedFurnitureId).toBeNull();
      expect(state.design.isDirty).toBe(true);
    });
  });

  describe('Multiple furniture types', () => {
    it('displays correct dimensions for table', () => {
      const table = createFurniture('table');
      const design = store.getState().design.current!;
      design.furniture = [table];
      
      const tableStore = createTestStore({
        design: {
          current: design,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
        ui: {
          selectedFurnitureId: table.id,
          activeView: '2d',
          showGrid: true,
          snapToGrid: false,
          sidebarOpen: true,
        },
      });

      render(
        <Provider store={tableStore}>
          <PropertyEditorPanel />
        </Provider>
      );

      expect(screen.getByText('table')).toBeInTheDocument();
      // Table default dimensions: 4' × 3' × 2.5'
      expect(screen.getByText('4.0')).toBeInTheDocument();
      expect(screen.getByText('3.0')).toBeInTheDocument();
      expect(screen.getByText('2.5')).toBeInTheDocument();
    });

    it('displays correct dimensions for couch', () => {
      const couch = createFurniture('couch');
      const design = store.getState().design.current!;
      design.furniture = [couch];
      
      const couchStore = createTestStore({
        design: {
          current: design,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
        ui: {
          selectedFurnitureId: couch.id,
          activeView: '2d',
          showGrid: true,
          snapToGrid: false,
          sidebarOpen: true,
        },
      });

      render(
        <Provider store={couchStore}>
          <PropertyEditorPanel />
        </Provider>
      );

      expect(screen.getByText('couch')).toBeInTheDocument();
      // Couch default dimensions: 7' × 3' × 3'
      expect(screen.getByText('7.0')).toBeInTheDocument();
      const dimensionValues = screen.getAllByText('3.0');
      expect(dimensionValues.length).toBeGreaterThan(0);
    });
  });
});
