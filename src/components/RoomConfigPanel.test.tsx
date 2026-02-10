import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { RoomConfigPanel } from './RoomConfigPanel';
import designReducer from '../store/slices/designSlice';
import authReducer from '../store/slices/authSlice';
import uiReducer from '../store/slices/uiSlice';
import { createDesign } from '../models/Design';
import { createRoom } from '../models/Room';

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

describe('RoomConfigPanel', () => {
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

  it('renders room configuration form', () => {
    render(
      <Provider store={store}>
        <RoomConfigPanel />
      </Provider>
    );

    expect(screen.getByText('Room Configuration')).toBeInTheDocument();
    expect(screen.getByLabelText(/Shape/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Width/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Length/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Unit/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Wall Color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Floor Color/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ceiling Color/i)).toBeInTheDocument();
  });

  it('displays current room values', () => {
    render(
      <Provider store={store}>
        <RoomConfigPanel />
      </Provider>
    );

    const shapeSelect = screen.getByLabelText(/Shape/i) as HTMLSelectElement;
    const widthInput = screen.getByLabelText(/Width/i) as HTMLInputElement;
    const lengthInput = screen.getByLabelText(/Length/i) as HTMLInputElement;
    const unitSelect = screen.getByLabelText(/Unit/i) as HTMLSelectElement;

    expect(shapeSelect.value).toBe('rectangular');
    expect(widthInput.value).toBe('10');
    expect(lengthInput.value).toBe('12');
    expect(unitSelect.value).toBe('feet');
  });

  describe('Shape selector', () => {
    it('changes dimension inputs when shape changes to square', () => {
      render(
        <Provider store={store}>
          <RoomConfigPanel />
        </Provider>
      );

      const shapeSelect = screen.getByLabelText(/Shape/i);
      
      // Change to square
      fireEvent.change(shapeSelect, { target: { value: 'square' } });

      // Length input should not be visible for square rooms
      expect(screen.queryByLabelText(/Length/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/Width/i)).toBeInTheDocument();
    });

    it('changes dimension inputs when shape changes to circular', () => {
      render(
        <Provider store={store}>
          <RoomConfigPanel />
        </Provider>
      );

      const shapeSelect = screen.getByLabelText(/Shape/i);
      
      // Change to circular
      fireEvent.change(shapeSelect, { target: { value: 'circular' } });

      // Should show radius instead of width/length
      expect(screen.queryByLabelText(/Width/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Length/i)).not.toBeInTheDocument();
      expect(screen.getByLabelText(/Radius/i)).toBeInTheDocument();
    });

    it('changes dimension inputs when shape changes from circular to rectangular', () => {
      // Start with circular room
      const circularRoom = createRoom(
        'circular',
        { radius: 8 },
        { walls: '#E8E8E8', floor: '#D4A574', ceiling: '#FFFFFF' },
        'feet'
      );
      const design = createDesign('user-1', 'Test Design', circularRoom);
      
      const circularStore = createTestStore({
        design: {
          current: design,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
      });

      render(
        <Provider store={circularStore}>
          <RoomConfigPanel />
        </Provider>
      );

      const shapeSelect = screen.getByLabelText(/Shape/i);
      
      // Change to rectangular
      fireEvent.change(shapeSelect, { target: { value: 'rectangular' } });

      // Should show width and length
      expect(screen.getByLabelText(/Width/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Length/i)).toBeInTheDocument();
      expect(screen.queryByLabelText(/Radius/i)).not.toBeInTheDocument();
    });
  });

  describe('Dimension validation', () => {
    it('displays error for invalid width (too small)', () => {
      render(
        <Provider store={store}>
          <RoomConfigPanel />
        </Provider>
      );

      const widthInput = screen.getByLabelText(/Width/i);
      
      // Enter invalid width
      fireEvent.change(widthInput, { target: { value: '0.5' } });

      // Should display validation error
      expect(screen.getByRole('alert')).toHaveTextContent(/Width must be between 1 and 100 feet/i);
    });

    it('displays error for invalid width (too large)', () => {
      render(
        <Provider store={store}>
          <RoomConfigPanel />
        </Provider>
      );

      const widthInput = screen.getByLabelText(/Width/i);
      
      // Enter invalid width
      fireEvent.change(widthInput, { target: { value: '150' } });

      // Should display validation error
      expect(screen.getByRole('alert')).toHaveTextContent(/Width must be between 1 and 100 feet/i);
    });

    it('displays error for invalid length', () => {
      render(
        <Provider store={store}>
          <RoomConfigPanel />
        </Provider>
      );

      const lengthInput = screen.getByLabelText(/Length/i);
      
      // Enter invalid length
      fireEvent.change(lengthInput, { target: { value: '-5' } });

      // Should display validation error
      expect(screen.getByRole('alert')).toHaveTextContent(/must be a positive number/i);
    });

    it('displays error for invalid radius', () => {
      // Start with circular room
      const circularRoom = createRoom(
        'circular',
        { radius: 8 },
        { walls: '#E8E8E8', floor: '#D4A574', ceiling: '#FFFFFF' },
        'feet'
      );
      const design = createDesign('user-1', 'Test Design', circularRoom);
      
      const circularStore = createTestStore({
        design: {
          current: design,
          saved: [],
          loading: false,
          error: null,
          isDirty: false,
        },
      });

      render(
        <Provider store={circularStore}>
          <RoomConfigPanel />
        </Provider>
      );

      const radiusInput = screen.getByLabelText(/Radius/i);
      
      // Enter invalid radius
      fireEvent.change(radiusInput, { target: { value: '0' } });

      // Should display validation error
      expect(screen.getByRole('alert')).toHaveTextContent(/Radius must be a positive number/i);
    });

    it('clears error when valid dimension is entered', () => {
      render(
        <Provider store={store}>
          <RoomConfigPanel />
        </Provider>
      );

      const widthInput = screen.getByLabelText(/Width/i);
      
      // Enter invalid width
      fireEvent.change(widthInput, { target: { value: '0.5' } });
      expect(screen.getByRole('alert')).toBeInTheDocument();

      // Enter valid width
      fireEvent.change(widthInput, { target: { value: '15' } });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Color pickers', () => {
    it('updates wall color when color picker changes', () => {
      render(
        <Provider store={store}>
          <RoomConfigPanel />
        </Provider>
      );

      const wallColorPicker = screen.getByLabelText(/Wall Color/i);
      
      // Change wall color
      fireEvent.change(wallColorPicker, { target: { value: '#FF0000' } });

      // Check that the color input reflects the change (browsers normalize to lowercase)
      const colorInputs = screen.getAllByDisplayValue('#ff0000');
      expect(colorInputs.length).toBeGreaterThan(0);
    });

    it('updates floor color when color picker changes', () => {
      render(
        <Provider store={store}>
          <RoomConfigPanel />
        </Provider>
      );

      const floorColorPicker = screen.getByLabelText(/Floor Color/i);
      
      // Change floor color
      fireEvent.change(floorColorPicker, { target: { value: '#00FF00' } });

      // Check that the color input reflects the change (browsers normalize to lowercase)
      const colorInputs = screen.getAllByDisplayValue('#00ff00');
      expect(colorInputs.length).toBeGreaterThan(0);
    });

    it('updates ceiling color when color picker changes', () => {
      render(
        <Provider store={store}>
          <RoomConfigPanel />
        </Provider>
      );

      const ceilingColorPicker = screen.getByLabelText(/Ceiling Color/i);
      
      // Change ceiling color
      fireEvent.change(ceilingColorPicker, { target: { value: '#0000FF' } });

      // Check that the color input reflects the change (browsers normalize to lowercase)
      const colorInputs = screen.getAllByDisplayValue('#0000ff');
      expect(colorInputs.length).toBeGreaterThan(0);
    });

    it('displays error for invalid color format', () => {
      render(
        <Provider store={store}>
          <RoomConfigPanel />
        </Provider>
      );

      // Find the text input for wall color (not the color picker)
      const wallColorInputs = screen.getAllByDisplayValue('#E8E8E8');
      const wallColorTextInput = wallColorInputs.find(
        input => input.getAttribute('type') === 'text'
      ) as HTMLInputElement;
      
      // Enter invalid color
      fireEvent.change(wallColorTextInput, { target: { value: 'invalid-color' } });

      // Should display validation error
      const alerts = screen.getAllByRole('alert');
      const colorError = alerts.find(alert => 
        alert.textContent?.includes('Color must be a valid hex code')
      );
      expect(colorError).toBeInTheDocument();
    });

    it('accepts valid hex color formats', () => {
      render(
        <Provider store={store}>
          <RoomConfigPanel />
        </Provider>
      );

      // Find the text input for wall color
      const wallColorInputs = screen.getAllByDisplayValue('#E8E8E8');
      const wallColorTextInput = wallColorInputs.find(
        input => input.getAttribute('type') === 'text'
      ) as HTMLInputElement;
      
      // Test 3-digit hex
      fireEvent.change(wallColorTextInput, { target: { value: '#FFF' } });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // Test 6-digit hex
      fireEvent.change(wallColorTextInput, { target: { value: '#FFFFFF' } });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();

      // Test 8-digit hex with alpha
      fireEvent.change(wallColorTextInput, { target: { value: '#FFFFFFFF' } });
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
  });

  describe('Unit selector', () => {
    it('changes unit when selector changes', () => {
      render(
        <Provider store={store}>
          <RoomConfigPanel />
        </Provider>
      );

      const unitSelect = screen.getByLabelText(/Unit/i) as HTMLSelectElement;
      
      // Change to meters
      fireEvent.change(unitSelect, { target: { value: 'meters' } });

      expect(unitSelect.value).toBe('meters');
      expect(screen.getByLabelText(/Width \(meters\)/i)).toBeInTheDocument();
    });
  });

  describe('Redux integration', () => {
    it('dispatches updateRoom action when valid changes are made', () => {
      render(
        <Provider store={store}>
          <RoomConfigPanel />
        </Provider>
      );

      const widthInput = screen.getByLabelText(/Width/i);
      
      // Change width to valid value
      fireEvent.change(widthInput, { target: { value: '15' } });

      // Check that Redux state was updated
      const state = store.getState();
      expect(state.design.current?.room.dimensions.width).toBe(15);
      expect(state.design.isDirty).toBe(true);
    });

    it('does not dispatch updateRoom action when invalid changes are made', () => {
      render(
        <Provider store={store}>
          <RoomConfigPanel />
        </Provider>
      );

      const initialRoom = store.getState().design.current?.room;
      const widthInput = screen.getByLabelText(/Width/i);
      
      // Change width to invalid value
      fireEvent.change(widthInput, { target: { value: '0' } });

      // Check that Redux state was not updated
      const state = store.getState();
      expect(state.design.current?.room).toEqual(initialRoom);
    });
  });
});
