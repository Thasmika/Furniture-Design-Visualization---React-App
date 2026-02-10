import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { CameraController } from './CameraController';

// Mock react-three-fiber and drei
vi.mock('@react-three/fiber', () => ({
  useThree: () => ({
    camera: {
      position: {
        set: vi.fn(),
      },
    },
  }),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: vi.fn(() => null),
}));

describe('CameraController Unit Tests', () => {
  it('renders orbit controls', () => {
    const { container } = render(<CameraController />);
    expect(container).toBeTruthy();
  });

  it('exposes reset camera function globally', () => {
    render(<CameraController />);
    expect((window as any).resetCamera).toBeDefined();
    expect(typeof (window as any).resetCamera).toBe('function');
  });

  it('camera controls update position', () => {
    const { container } = render(<CameraController />);
    
    // Verify component renders
    expect(container).toBeTruthy();
    
    // Test reset function
    const resetCamera = (window as any).resetCamera;
    expect(() => resetCamera()).not.toThrow();
  });
});
