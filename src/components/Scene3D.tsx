import { Canvas } from '@react-three/fiber';
import { useAppSelector } from '../store/hooks';
import { getCurrentDesign, getSelectedFurnitureId } from '../store/selectors';
import { RoomMesh } from './RoomMesh';
import { FurnitureMesh } from './FurnitureMesh';
import { CameraController } from './CameraController';

export function Scene3D() {
  const design = useAppSelector(getCurrentDesign);
  const selectedFurnitureId = useAppSelector(getSelectedFurnitureId);

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
    >
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.5} />
      
      {/* Directional light from above */}
      <directionalLight
        position={[10, 20, 10]}
        intensity={1}
        castShadow
      />

      {/* Room mesh */}
      <RoomMesh room={design.room} />

      {/* Furniture meshes */}
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
}
