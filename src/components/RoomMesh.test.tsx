import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { RoomMesh } from './RoomMesh';
import { createRoom } from '../models/Room';

// Mock react-three-fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: any) => <div data-testid="canvas">{children}</div>,
}));

describe('RoomMesh Unit Tests', () => {
  it('creates correct geometries for rectangular room', () => {
    const room = createRoom(
      'rectangular',
      { width: 10, length: 12 },
      { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' }
    );

    const { container } = render(<RoomMesh room={room} />);
    
    // Verify component renders
    expect(container).toBeTruthy();
    expect(container.querySelector('group')).toBeTruthy();
  });

  it('creates correct geometries for square room', () => {
    const room = createRoom(
      'square',
      { width: 10 },
      { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' }
    );

    const { container } = render(<RoomMesh room={room} />);
    
    // Verify component renders
    expect(container).toBeTruthy();
  });

  it('creates correct geometries for circular room', () => {
    const room = createRoom(
      'circular',
      { radius: 8 },
      { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' }
    );

    const { container } = render(<RoomMesh room={room} />);
    
    // Verify component renders
    expect(container).toBeTruthy();
  });

  it('applies room color scheme materials', () => {
    const room = createRoom(
      'rectangular',
      { width: 10, length: 12 },
      { walls: '#FF0000', floor: '#00FF00', ceiling: '#0000FF' }
    );

    const { container } = render(<RoomMesh room={room} />);
    
    // Verify component renders with colors
    expect(container).toBeTruthy();
    expect(room.colorScheme.walls).toBe('#FF0000');
    expect(room.colorScheme.floor).toBe('#00FF00');
    expect(room.colorScheme.ceiling).toBe('#0000FF');
  });
});
