import { useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import type { OrbitControls as OrbitControlsType } from 'three-stdlib';

export function CameraController() {
  const controlsRef = useRef<OrbitControlsType>(null);
  const { camera } = useThree();

  const handleReset = () => {
    if (controlsRef.current) {
      // Reset camera to default position
      camera.position.set(15, 15, 15);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  // Expose reset function globally for UI button
  if (typeof window !== 'undefined') {
    (window as any).resetCamera = handleReset;
  }

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      rotateSpeed={0.5}
      zoomSpeed={0.8}
      panSpeed={0.5}
      minDistance={5}
      maxDistance={100}
      maxPolarAngle={Math.PI / 2}
    />
  );
}
