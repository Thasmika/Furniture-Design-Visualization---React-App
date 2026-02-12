import React, { useMemo } from 'react';
import type { Room } from '../models/Room';

interface RoomMeshProps {
  room: Room;
}

export const RoomMesh = React.memo(({ room }: RoomMeshProps) => {
  const { shape, dimensions, colorScheme } = room;

  // Memoize room dimensions calculation
  const roomDimensions = useMemo(() => {
    const width = shape === 'circular' ? dimensions.radius * 2 : dimensions.width;
    const length = shape === 'circular' ? dimensions.radius * 2 : dimensions.length;
    const wallHeight = 8; // Standard wall height in feet

    return { width, length, wallHeight };
  }, [shape, dimensions]);

  const { width, length, wallHeight } = roomDimensions;

  return (
    <group>
      {/* Floor */}
      {shape === 'circular' ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} frustumCulled={true}>
          {/* Reduced segments for better performance */}
          <circleGeometry args={[dimensions.radius, 24]} />
          <meshStandardMaterial 
            color={colorScheme.floor}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ) : (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} frustumCulled={true}>
          <planeGeometry args={[width, length]} />
          <meshStandardMaterial 
            color={colorScheme.floor}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Ceiling */}
      {shape === 'circular' ? (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, wallHeight, 0]} frustumCulled={true}>
          {/* Reduced segments for better performance */}
          <circleGeometry args={[dimensions.radius, 24]} />
          <meshStandardMaterial 
            color={colorScheme.ceiling}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ) : (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, wallHeight, 0]} frustumCulled={true}>
          <planeGeometry args={[width, length]} />
          <meshStandardMaterial 
            color={colorScheme.ceiling}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      )}

      {/* Walls */}
      {shape === 'circular' ? (
        // Circular wall - reduced segments for better performance
        <mesh position={[0, wallHeight / 2, 0]} frustumCulled={true}>
          <cylinderGeometry args={[dimensions.radius, dimensions.radius, wallHeight, 24, 1, true]} />
          <meshStandardMaterial 
            color={colorScheme.walls} 
            side={2}
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      ) : (
        // Rectangular walls
        <>
          {/* Front wall (positive Z) */}
          <mesh position={[0, wallHeight / 2, length / 2]} frustumCulled={true}>
            <boxGeometry args={[width, wallHeight, 0.2]} />
            <meshStandardMaterial 
              color={colorScheme.walls}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* Back wall (negative Z) */}
          <mesh position={[0, wallHeight / 2, -length / 2]} frustumCulled={true}>
            <boxGeometry args={[width, wallHeight, 0.2]} />
            <meshStandardMaterial 
              color={colorScheme.walls}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* Left wall (negative X) */}
          <mesh position={[-width / 2, wallHeight / 2, 0]} frustumCulled={true}>
            <boxGeometry args={[0.2, wallHeight, length]} />
            <meshStandardMaterial 
              color={colorScheme.walls}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>

          {/* Right wall (positive X) */}
          <mesh position={[width / 2, wallHeight / 2, 0]} frustumCulled={true}>
            <boxGeometry args={[0.2, wallHeight, length]} />
            <meshStandardMaterial 
              color={colorScheme.walls}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        </>
      )}
    </group>
  );
});
