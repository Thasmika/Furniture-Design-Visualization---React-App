import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { RenderingCoordinator, useDesignStateSync } from './RenderingCoordinator';
import designReducer from '../store/slices/designSlice';
import uiReducer from '../store/slices/uiSlice';
import authReducer from '../store/slices/authSlice';
import { createDesign } from '../store/slices/designSlice';
import { createRoom } from '../models/Room';
import { createFurniture } from '../models/FurniturePiece';
import { createDesign as createDesignModel } from '../models/Design';
import { render } from '@testing-library/react';

describe('RenderingCoordinator', () => {
  const createTestStore = () => {
    return configureStore({
      reducer: {
        auth: authReducer,
        design: designReducer,
        ui: uiReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    });
  };

  it('should render without crashing', () => {
    const store = createTestStore();
    const { container } = render(
      <Provider store={store}>
        <RenderingCoordinator />
      </Provider>
    );
    expect(container).toBeDefined();
  });

  it('should call onStateChange when design state changes', async () => {
    const store = createTestStore();
    const onStateChange = vi.fn();

    const { rerender } = render(
      <Provider store={store}>
        <RenderingCoordinator onStateChange={onStateChange} />
      </Provider>
    );

    // Create a design
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#ffffff',
      floor: '#cccccc',
      ceiling: '#eeeeee',
    }, 'feet');

    const design = createDesignModel('user123', 'Test Design', room);

    // Dispatch action to change state
    store.dispatch(createDesign(design));

    // Force re-render to trigger the effect
    rerender(
      <Provider store={store}>
        <RenderingCoordinator onStateChange={onStateChange} />
      </Provider>
    );

    // onStateChange should be called
    expect(onStateChange).toHaveBeenCalled();
  });

  it('should validate coordinate consistency for furniture', () => {
    const store = createTestStore();
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <Provider store={store}>
        <RenderingCoordinator />
      </Provider>
    );

    // Create a design with furniture
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#ffffff',
      floor: '#cccccc',
      ceiling: '#eeeeee',
    }, 'feet');

    const furniture = createFurniture('chair');
    furniture.position = { x: 5, y: 6, z: 0, rotation: 0 };

    const design = createDesignModel('user123', 'Test Design', room);
    design.furniture = [furniture];

    // Dispatch action to change state
    store.dispatch(createDesign(design));

    // No warnings should be logged for valid coordinates
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});

describe('useDesignStateSync', () => {
  const createTestStore = () => {
    return configureStore({
      reducer: {
        auth: authReducer,
        design: designReducer,
        ui: uiReducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false,
        }),
    });
  };

  it('should call callback when design state changes', () => {
    const store = createTestStore();
    const callback = vi.fn();

    const { rerender } = renderHook(
      () => useDesignStateSync(callback),
      {
        wrapper: ({ children }) => (
          <Provider store={store}>{children}</Provider>
        ),
      }
    );

    // Create a design
    const room = createRoom('rectangular', { width: 10, length: 12 }, {
      walls: '#ffffff',
      floor: '#cccccc',
      ceiling: '#eeeeee',
    }, 'feet');

    const design = createDesignModel('user123', 'Test Design', room);

    // Dispatch action to change state
    store.dispatch(createDesign(design));

    // Force re-render to trigger the effect
    rerender();

    // Callback should be called
    expect(callback).toHaveBeenCalled();
  });
});
