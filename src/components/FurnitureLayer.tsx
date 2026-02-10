import React from 'react';
import { Rect, Circle, Text, Group } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { FurniturePiece } from '../models/FurniturePiece';
import { Room } from '../models/Room';
import { PIXELS_PER_FOOT } from './Canvas2D';
import { validatePosition } from '../utils/validation';

interface FurnitureLayerProps {
  furniture: FurniturePiece[];
  room: Room;
  selectedFurnitureId: string | null;
  offsetX?: number;
  offsetY?: number;
  onFurnitureSelect: (id: string) => void;
  onFurnitureMove: (id: string, x: number, y: number) => void;
}

export const FurnitureLayer: React.FC<FurnitureLayerProps> = ({
  furniture,
  room,
  selectedFurnitureId,
  offsetX = 50,
  offsetY = 50,
  onFurnitureSelect,
  onFurnitureMove,
}) => {
  const handleDragEnd = (piece: FurniturePiece) => (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const x = (node.x() - offsetX) / PIXELS_PER_FOOT;
    const y = (node.y() - offsetY) / PIXELS_PER_FOOT;

    // Validate position is within room boundaries
    const updatedPiece = {
      ...piece,
      position: { ...piece.position, x, y }
    };

    const validation = validatePosition(updatedPiece, room);
    
    if (validation.isValid) {
      onFurnitureMove(piece.id, x, y);
    } else {
      // Reset to original position if invalid
      node.position({
        x: offsetX + piece.position.x * PIXELS_PER_FOOT,
        y: offsetY + piece.position.y * PIXELS_PER_FOOT
      });
    }
  };

  const handleClick = (id: string) => () => {
    onFurnitureSelect(id);
  };

  return (
    <>
      {furniture.map((piece) => {
        const isSelected = piece.id === selectedFurnitureId;
        const width = piece.dimensions.width * piece.scale * PIXELS_PER_FOOT;
        const depth = piece.dimensions.depth * piece.scale * PIXELS_PER_FOOT;
        const x = offsetX + piece.position.x * PIXELS_PER_FOOT;
        const y = offsetY + piece.position.y * PIXELS_PER_FOOT;

        // Determine if furniture should be rendered as circle (for round tables, etc.)
        const isCircular = piece.type === 'table' && piece.dimensions.width === piece.dimensions.depth;

        return (
          <Group
            key={piece.id}
            x={x}
            y={y}
            draggable
            onDragEnd={handleDragEnd(piece)}
            onClick={handleClick(piece.id)}
            onTap={handleClick(piece.id)}
          >
            {isCircular ? (
              <Circle
                radius={width / 2}
                fill={piece.color}
                stroke={isSelected ? '#0066ff' : '#000000'}
                strokeWidth={isSelected ? 3 : 1}
                shadowColor="black"
                shadowBlur={5}
                shadowOpacity={0.3}
                shadowOffsetX={2}
                shadowOffsetY={2}
              />
            ) : (
              <Rect
                width={width}
                height={depth}
                fill={piece.color}
                stroke={isSelected ? '#0066ff' : '#000000'}
                strokeWidth={isSelected ? 3 : 1}
                shadowColor="black"
                shadowBlur={5}
                shadowOpacity={0.3}
                shadowOffsetX={2}
                shadowOffsetY={2}
              />
            )}
            
            {/* Label */}
            <Text
              text={piece.type}
              fontSize={12}
              fill="#000000"
              align="center"
              verticalAlign="middle"
              width={width}
              height={depth}
              x={isCircular ? -width / 2 : 0}
              y={isCircular ? -6 : depth / 2 - 6}
            />
          </Group>
        );
      })}
    </>
  );
};
