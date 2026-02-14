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

// Helper component to render furniture based on type
const FurnitureGeometry: React.FC<{
  type: string;
  dimensions: { width: number; depth: number; height: number };
  color: string;
  isSelected: boolean;
}> = ({ type, dimensions, color, isSelected }) => {
  const { width, depth, height } = dimensions;
  
  const material = (
    <meshStandardMaterial
      color={color}
      emissive={isSelected ? '#ffff00' : '#000000'}
      emissiveIntensity={isSelected ? 0.3 : 0}
      roughness={0.7}
      metalness={0.1}
    />
  );

  switch (type) {
    case 'chair':
      return (
        <group>
          {/* Seat */}
          <mesh position={[0, height * 0.2, depth * 0.1]}>
            <boxGeometry args={[width, height * 0.1, depth * 0.7]} />
            {material}
          </mesh>
          {/* Backrest */}
          <mesh position={[0, height * 0.5, -depth * 0.25]}>
            <boxGeometry args={[width, height * 0.6, depth * 0.1]} />
            {material}
          </mesh>
          {/* Legs */}
          {[
            [-width * 0.35, -height * 0.15, depth * 0.25],
            [width * 0.35, -height * 0.15, depth * 0.25],
            [-width * 0.35, -height * 0.15, -depth * 0.15],
            [width * 0.35, -height * 0.15, -depth * 0.15],
          ].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]}>
              <cylinderGeometry args={[0.05, 0.05, height * 0.4, 8]} />
              <meshStandardMaterial color="#654321" roughness={0.8} />
            </mesh>
          ))}
        </group>
      );

    case 'table':
      return (
        <group>
          {/* Tabletop */}
          <mesh position={[0, height * 0.4, 0]}>
            <boxGeometry args={[width, height * 0.1, depth]} />
            {material}
          </mesh>
          {/* Legs */}
          {[
            [-width * 0.4, -height * 0.25, -depth * 0.4],
            [width * 0.4, -height * 0.25, -depth * 0.4],
            [-width * 0.4, -height * 0.25, depth * 0.4],
            [width * 0.4, -height * 0.25, depth * 0.4],
          ].map((pos, i) => (
            <mesh key={i} position={pos as [number, number, number]}>
              <cylinderGeometry args={[0.08, 0.08, height * 0.8, 8]} />
              <meshStandardMaterial color="#654321" roughness={0.8} />
            </mesh>
          ))}
        </group>
      );

    case 'couch':
      return (
        <group>
          {/* Main seat */}
          <mesh position={[0, height * 0.2, 0]}>
            <boxGeometry args={[width * 0.8, height * 0.4, depth]} />
            {material}
          </mesh>
          {/* Backrest */}
          <mesh position={[0, height * 0.5, -depth * 0.4]}>
            <boxGeometry args={[width * 0.8, height * 0.6, depth * 0.2]} />
            {material}
          </mesh>
          {/* Left armrest */}
          <mesh position={[-width * 0.45, height * 0.3, 0]}>
            <boxGeometry args={[width * 0.1, height * 0.5, depth]} />
            {material}
          </mesh>
          {/* Right armrest */}
          <mesh position={[width * 0.45, height * 0.3, 0]}>
            <boxGeometry args={[width * 0.1, height * 0.5, depth]} />
            {material}
          </mesh>
        </group>
      );

    case 'bed':
      return (
        <group>
          {/* Mattress */}
          <mesh position={[0, height * 0.25, depth * 0.05]}>
            <boxGeometry args={[width, height * 0.3, depth * 0.85]} />
            {material}
          </mesh>
          {/* Headboard */}
          <mesh position={[0, height * 0.45, -depth * 0.4]}>
            <boxGeometry args={[width, height * 0.7, depth * 0.1]} />
            <meshStandardMaterial color="#8B7355" roughness={0.6} />
          </mesh>
          {/* Bed frame */}
          <mesh position={[0, height * 0.05, depth * 0.05]}>
            <boxGeometry args={[width * 1.05, height * 0.1, depth * 0.9]} />
            <meshStandardMaterial color="#654321" roughness={0.8} />
          </mesh>
          {/* Pillows */}
          <mesh position={[-width * 0.25, height * 0.45, -depth * 0.25]}>
            <boxGeometry args={[width * 0.35, height * 0.15, depth * 0.2]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
          </mesh>
          <mesh position={[width * 0.25, height * 0.45, -depth * 0.25]}>
            <boxGeometry args={[width * 0.35, height * 0.15, depth * 0.2]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.9} />
          </mesh>
        </group>
      );

    case 'desk':
      return (
        <group>
          {/* Desktop */}
          <mesh position={[0, height * 0.6, 0]}>
            <boxGeometry args={[width, height * 0.05, depth]} />
            {material}
          </mesh>
          {/* Left drawer unit */}
          <mesh position={[-width * 0.3, height * 0.3, 0]}>
            <boxGeometry args={[width * 0.3, height * 0.5, depth * 0.8]} />
            {material}
          </mesh>
          {/* Right drawer unit */}
          <mesh position={[width * 0.3, height * 0.3, 0]}>
            <boxGeometry args={[width * 0.3, height * 0.5, depth * 0.8]} />
            {material}
          </mesh>
          {/* Drawer handles */}
          {[-width * 0.3, width * 0.3].map((x, i) => (
            <React.Fragment key={i}>
              <mesh position={[x, height * 0.45, depth * 0.42]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
                <meshStandardMaterial color="#333333" metalness={0.8} />
              </mesh>
              <mesh position={[x, height * 0.25, depth * 0.42]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
                <meshStandardMaterial color="#333333" metalness={0.8} />
              </mesh>
            </React.Fragment>
          ))}
        </group>
      );

    case 'shelf':
      return (
        <group>
          {/* Back panel */}
          <mesh position={[0, 0, -depth * 0.45]}>
            <boxGeometry args={[width, height, depth * 0.1]} />
            {material}
          </mesh>
          {/* Shelves */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <mesh key={i} position={[0, height * (ratio - 0.5), 0]}>
              <boxGeometry args={[width, height * 0.05, depth]} />
              {material}
            </mesh>
          ))}
          {/* Side panels */}
          <mesh position={[-width * 0.475, 0, 0]}>
            <boxGeometry args={[width * 0.05, height, depth]} />
            {material}
          </mesh>
          <mesh position={[width * 0.475, 0, 0]}>
            <boxGeometry args={[width * 0.05, height, depth]} />
            {material}
          </mesh>
        </group>
      );

    case 'cabinet':
      return (
        <group>
          {/* Main cabinet body */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[width, height, depth]} />
            {material}
          </mesh>
          {/* Left door */}
          <mesh position={[-width * 0.26, 0, depth * 0.51]}>
            <boxGeometry args={[width * 0.45, height * 0.9, depth * 0.02]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
          </mesh>
          {/* Right door */}
          <mesh position={[width * 0.26, 0, depth * 0.51]}>
            <boxGeometry args={[width * 0.45, height * 0.9, depth * 0.02]} />
            <meshStandardMaterial color={color} roughness={0.5} metalness={0.2} />
          </mesh>
          {/* Door handles */}
          <mesh position={[-width * 0.15, 0, depth * 0.53]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
            <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.2} />
          </mesh>
          <mesh position={[width * 0.15, 0, depth * 0.53]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.03, 0.03, 0.15, 8]} />
            <meshStandardMaterial color="#333333" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Top trim */}
          <mesh position={[0, height * 0.52, 0]}>
            <boxGeometry args={[width * 1.05, height * 0.04, depth * 1.05]} />
            <meshStandardMaterial color="#654321" roughness={0.7} />
          </mesh>
        </group>
      );

    case 'lamp':
      return (
        <group>
          {/* Base */}
          <mesh position={[0, -height * 0.45, 0]}>
            <cylinderGeometry args={[width * 0.4, width * 0.5, height * 0.1, 16]} />
            <meshStandardMaterial color="#654321" roughness={0.6} metalness={0.3} />
          </mesh>
          {/* Pole */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[width * 0.08, width * 0.08, height * 0.7, 12]} />
            <meshStandardMaterial color="#8B7355" roughness={0.5} metalness={0.4} />
          </mesh>
          {/* Lampshade (cone shape) */}
          <mesh position={[0, height * 0.4, 0]}>
            <coneGeometry args={[width * 0.5, height * 0.3, 16]} />
            <meshStandardMaterial 
              color={color} 
              roughness={0.8}
              emissive="#FFFF99"
              emissiveIntensity={isSelected ? 0.5 : 0.2}
            />
          </mesh>
          {/* Light bulb (visible from bottom) */}
          <mesh position={[0, height * 0.28, 0]}>
            <sphereGeometry args={[width * 0.15, 12, 12]} />
            <meshStandardMaterial 
              color="#FFFFCC" 
              emissive="#FFFF99"
              emissiveIntensity={0.8}
              transparent={true}
              opacity={0.7}
            />
          </mesh>
          {/* Point light for lamp glow */}
          <pointLight 
            position={[0, height * 0.3, 0]} 
            intensity={isSelected ? 2 : 1} 
            distance={3}
            color="#FFFF99"
          />
        </group>
      );

    default:
      return (
        <mesh>
          <boxGeometry args={[width, height, depth]} />
          {material}
        </mesh>
      );
  }
};

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

  // Use detailed geometry for realistic furniture
  return (
    <group
      position={[position3D.x, yPosition, position3D.z]}
      rotation={[0, (furniture.position.rotation * Math.PI) / 180, 0]}
      onClick={handleClick}
    >
      <FurnitureGeometry
        type={furniture.type}
        dimensions={scaledDimensions}
        color={furniture.color}
        isSelected={isSelected}
      />
    </group>
  );
});
