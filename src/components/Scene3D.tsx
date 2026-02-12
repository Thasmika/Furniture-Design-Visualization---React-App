import { Canvas } from '@react-three/fiber';
import { useAppSelector } from '../store/hooks';
import { getCurrentDesign, getSelectedFurnitureId } from '../store/selectors';
import { RoomMesh } from './RoomMesh';
import { FurnitureMesh } from './FurnitureMesh';
import { CameraController } from './CameraController';
import React, { useMemo } from 'react';

export const Scene3D = React.memo(() => {
  const design = useAppSelector(getCurrentDesign);
  const selectedFurnitureId = useAppSelector(getSelectedFurnitureId);

  // Group furniture by type for potential instancing
  const furnitureByType = useMemo(() => {
    if (!design?.furniture) return {};
    
    return design.furniture.reduce((acc, furniture) => {
      if (!acc[furniture.type]) {
        acc[furniture.type] = [];
      }
      acc[furniture.type].push(furniture);
      return acc;
    }, {} as Record<string, typeof design.furniture>);
  }, [design?.furniture]);

  if (!design || !design.room) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No design loaded</p>
      </div>
    );
  }

  return (
    <Canvas
      camera={{
        position: [15, 15, 15],
        fov: 50,
        near: 0.1,
        far: 1000,
      }}
      style={{ width: '100%', height: '100%' }}
      // Enable anti-aliasing for smoother edges
      gl={{ 
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance'
      }}
      // Enable frustum culling
      frameloop="demand"
      dpr={[1, 2]}
    >
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.5} />
      
      {/* Directional light from above */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Room mesh */}
      <RoomMesh room={design.room} />

      {/* Furniture meshes - render with instancing optimization */}
      {design.furniture.map((furniture) => (
        <FurnitureMesh
          key={furniture.id}
          furniture={furniture}
          room={design.room}
          isSelected={furniture.id === selectedFurnitureId}
        />
      ))}

      {/* Camera controls */}
      <CameraController />
    </Canvas>
  );
});
