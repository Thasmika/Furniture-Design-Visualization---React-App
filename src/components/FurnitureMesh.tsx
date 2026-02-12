import React, { useMemo } from 'react';
import { useAppDispatch } from '../store/hooks';
import { selectFurniture } from '../store/slices/uiSlice';
import { convert2Dto3D } from '../utils/coordinates';
import type { FurniturePiece } from '../models/FurniturePiece';
import type { Room } from '../models/Room';

interface FurnitureMeshProps {
  furniture: FurniturePiece;
  room: Room;
  isSelected: boolean;
}

export const FurnitureMesh = React.memo(({ furniture, room, isSelected }: FurnitureMeshProps) => {
  const dispatch = useAppDispatch();

  // Memoize position and dimension calculations
  const { position3D, scaledDimensions, yPosition } = useMemo(() => {
    // Convert 2D position to 3D
    const pos3D = convert2Dto3D(
      { x: furniture.position.x, y: furniture.position.y },
      room
    );

    // Apply scale to dimensions
    const scaledWidth = furniture.dimensions.width * furniture.scale;
    const scaledDepth = furniture.dimensions.depth * furniture.scale;
    const scaledHeight = furniture.dimensions.height * furniture.scale;

    // Position furniture at correct height (half height above floor)
    const yPos = scaledHeight / 2;

    return {
      position3D: pos3D,
      scaledDimensions: { width: scaledWidth, depth: scaledDepth, height: scaledHeight },
      yPosition: yPos
    };
  }, [furniture.position.x, furniture.position.y, furniture.dimensions, furniture.scale, room]);

  const handleClick = React.useCallback((e: any) => {
    e.stopPropagation();
    dispatch(selectFurniture(furniture.id));
  }, [dispatch, furniture.id]);

  // Use simplified geometry for better performance
  return (
    <mesh
      position={[position3D.x, yPosition, position3D.z]}
      rotation={[0, (furniture.position.rotation * Math.PI) / 180, 0]}
      onClick={handleClick}
      // Enable frustum culling
      frustumCulled={true}
    >
      {/* Reduced polygon count - use simple box geometry */}
      <boxGeometry args={[scaledDimensions.width, scaledDimensions.height, scaledDimensions.depth]} />
      <meshStandardMaterial
        color={furniture.color}
        emissive={isSelected ? '#ffff00' : '#000000'}
        emissiveIntensity={isSelected ? 0.3 : 0}
        // Optimize material rendering
        flatShading={false}
        roughness={0.7}
        metalness={0.1}
      />
    </mesh>
  );
});
