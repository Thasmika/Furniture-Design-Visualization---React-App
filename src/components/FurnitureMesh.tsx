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

export function FurnitureMesh({ furniture, room, isSelected }: FurnitureMeshProps) {
  const dispatch = useAppDispatch();

  // Convert 2D position to 3D
  const position3D = convert2Dto3D(
    { x: furniture.position.x, y: furniture.position.y },
    room
  );

  // Apply scale to dimensions
  const scaledWidth = furniture.dimensions.width * furniture.scale;
  const scaledDepth = furniture.dimensions.depth * furniture.scale;
  const scaledHeight = furniture.dimensions.height * furniture.scale;

  // Position furniture at correct height (half height above floor)
  const yPosition = scaledHeight / 2;

  const handleClick = (e: any) => {
    e.stopPropagation();
    dispatch(selectFurniture(furniture.id));
  };

  return (
    <mesh
      position={[position3D.x, yPosition, position3D.z]}
      rotation={[0, (furniture.position.rotation * Math.PI) / 180, 0]}
      onClick={handleClick}
    >
      <boxGeometry args={[scaledWidth, scaledHeight, scaledDepth]} />
      <meshStandardMaterial
        color={furniture.color}
        emissive={isSelected ? '#ffff00' : '#000000'}
        emissiveIntensity={isSelected ? 0.3 : 0}
      />
    </mesh>
  );
}
