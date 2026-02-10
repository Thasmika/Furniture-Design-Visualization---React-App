import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { FurnitureMesh } from './FurnitureMesh';
import { createRoom } from '../models/Room';
import { createFurniture } from '../models/FurniturePiece';
import authReducer from '../store/slices/authSlice';
import designReducer from '../store/slices/designSlice';
import uiReducer from '../store/slices/uiSlice';

// Mock react-three-fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
}));

describe('FurnitureMesh Unit Tests', () => {
  const createTestStore = () => {
    return configureStore({
      reducer: {
        auth: authReducer,
        design: designReducer,
        ui: uiReducer,
      },
      preloadedState: {
        design: {
          current: null,
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
        auth: {
          user: null,
          loading: false,
          error: null,
        },
      },
    });
  };

  it('renders furniture with correct dimensions', () => {
    const room = createRoom(
      'rectangular',
      { width: 10, length: 12 },
      { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' }
    );
    const furniture = createFurniture('chair', '#8B4513');
    const store = createTestStore();

    const { container } = render(
      <Provider store={store}>
        <FurnitureMesh furniture={furniture} room={room} isSelected={false} />
      </Provider>
    );

    expect(container).toBeTruthy();
    expect(container.querySelector('mesh')).toBeTruthy();
  });

  it('renders all furniture pieces', () => {
    const room = createRoom(
      'rectangular',
      { width: 10, length: 12 },
      { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' }
    );
    const furniture1 = createFurniture('chair', '#8B4513');
    const furniture2 = createFurniture('table', '#654321');
    const store = createTestStore();

    const { container: container1 } = render(
      <Provider store={store}>
        <FurnitureMesh furniture={furniture1} room={room} isSelected={false} />
      </Provider>
    );

    const { container: container2 } = render(
      <Provider store={store}>
        <FurnitureMesh furniture={furniture2} room={room} isSelected={false} />
      </Provider>
    );

    expect(container1.querySelector('mesh')).toBeTruthy();
    expect(container2.querySelector('mesh')).toBeTruthy();
  });

  it('highlights selected furniture with emissive material', () => {
    const room = createRoom(
      'rectangular',
      { width: 10, length: 12 },
      { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' }
    );
    const furniture = createFurniture('chair', '#8B4513');
    const store = createTestStore();

    const { container } = render(
      <Provider store={store}>
        <FurnitureMesh furniture={furniture} room={room} isSelected={true} />
      </Provider>
    );

    expect(container).toBeTruthy();
    expect(container.querySelector('mesh')).toBeTruthy();
  });

  it('applies furniture color materials', () => {
    const room = createRoom(
      'rectangular',
      { width: 10, length: 12 },
      { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' }
    );
    const furniture = createFurniture('table', '#FF0000');
    const store = createTestStore();

    const { container } = render(
      <Provider store={store}>
        <FurnitureMesh furniture={furniture} room={room} isSelected={false} />
      </Provider>
    );

    expect(container).toBeTruthy();
    expect(furniture.color).toBe('#FF0000');
  });
});
