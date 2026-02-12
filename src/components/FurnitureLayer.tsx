import React, { useCallback } from 'react';
import { Rect, Circle, Text, Group, Line, Arc } from 'react-konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import type { FurniturePiece } from '../models/FurniturePiece';
import type { Room } from '../models/Room';
import { PIXELS_PER_FOOT } from './Canvas2D';

interface FurnitureLayerProps {
  furniture: FurniturePiece[];
  room: Room;
  selectedFurnitureId: string | null;
  offsetX?: number;
  offsetY?: number;
  onFurnitureSelect: (id: string) => void;
  onFurnitureMove: (id: string, x: number, y: number) => void;
}

// Helper function to render furniture shapes based on type
const renderFurnitureShape = (
  piece: FurniturePiece,
  width: number,
  depth: number,
  isSelected: boolean
) => {
  const baseColor = piece.color;
  const darkColor = '#654321';
  const lightColor = '#D2691E';

  switch (piece.type) {
    case 'chair':
      // Chair with backrest
      return (
        <>
          {/* Seat */}
          <Rect
            width={width}
            height={depth * 0.7}
            y={depth * 0.3}
            fill={baseColor}
            stroke={isSelected ? '#0066ff' : darkColor}
            strokeWidth={isSelected ? 3 : 2}
            cornerRadius={4}
          />
          {/* Backrest */}
          <Rect
            width={width}
            height={depth * 0.3}
            fill={lightColor}
            stroke={isSelected ? '#0066ff' : darkColor}
            strokeWidth={isSelected ? 3 : 2}
            cornerRadius={4}
          />
        </>
      );

    case 'table':
      // Table with rounded corners
      return (
        <>
          <Rect
            width={width}
            height={depth}
            fill={baseColor}
            stroke={isSelected ? '#0066ff' : darkColor}
            strokeWidth={isSelected ? 3 : 2}
            cornerRadius={8}
          />
          {/* Table legs indicators */}
          <Circle x={width * 0.15} y={depth * 0.15} radius={4} fill={darkColor} />
          <Circle x={width * 0.85} y={depth * 0.15} radius={4} fill={darkColor} />
          <Circle x={width * 0.15} y={depth * 0.85} radius={4} fill={darkColor} />
          <Circle x={width * 0.85} y={depth * 0.85} radius={4} fill={darkColor} />
        </>
      );

    case 'couch':
      // Couch with armrests
      return (
        <>
          {/* Main seat */}
          <Rect
            width={width * 0.8}
            height={depth}
            x={width * 0.1}
            fill={baseColor}
            stroke={isSelected ? '#0066ff' : darkColor}
            strokeWidth={isSelected ? 3 : 2}
            cornerRadius={6}
          />
          {/* Left armrest */}
          <Rect
            width={width * 0.1}
            height={depth}
            fill={lightColor}
            stroke={isSelected ? '#0066ff' : darkColor}
            strokeWidth={isSelected ? 3 : 1}
            cornerRadius={4}
          />
          {/* Right armrest */}
          <Rect
            width={width * 0.1}
            height={depth}
            x={width * 0.9}
            fill={lightColor}
            stroke={isSelected ? '#0066ff' : darkColor}
            strokeWidth={isSelected ? 3 : 1}
            cornerRadius={4}
          />
          {/* Cushion lines */}
          <Line
            points={[width * 0.4, 0, width * 0.4, depth]}
            stroke={darkColor}
            strokeWidth={1}
          />
          <Line
            points={[width * 0.6, 0, width * 0.6, depth]}
            stroke={darkColor}
            strokeWidth={1}
          />
        </>
      );

    case 'bed':
      // Bed with headboard
      return (
        <>
          {/* Mattress */}
          <Rect
            width={width}
            height={depth * 0.85}
            y={depth * 0.15}
            fill={baseColor}
            stroke={isSelected ? '#0066ff' : darkColor}
            strokeWidth={isSelected ? 3 : 2}
            cornerRadius={4}
          />
          {/* Headboard */}
          <Rect
            width={width}
            height={depth * 0.15}
            fill={lightColor}
            stroke={isSelected ? '#0066ff' : darkColor}
            strokeWidth={isSelected ? 3 : 2}
            cornerRadius={4}
          />
          {/* Pillow indicators */}
          <Rect
            width={width * 0.4}
            height={depth * 0.15}
            x={width * 0.05}
            y={depth * 0.2}
            fill="#FFFFFF"
            opacity={0.6}
            cornerRadius={3}
          />
          <Rect
            width={width * 0.4}
            height={depth * 0.15}
            x={width * 0.55}
            y={depth * 0.2}
            fill="#FFFFFF"
            opacity={0.6}
            cornerRadius={3}
          />
        </>
      );

    case 'desk':
      // Desk with drawers
      return (
        <>
          {/* Desktop */}
          <Rect
            width={width}
            height={depth}
            fill={baseColor}
            stroke={isSelected ? '#0066ff' : darkColor}
            strokeWidth={isSelected ? 3 : 2}
            cornerRadius={4}
          />
          {/* Drawer indicators */}
          <Rect
            width={width * 0.3}
            height={depth * 0.2}
            x={width * 0.65}
            y={depth * 0.2}
            fill={lightColor}
            stroke={darkColor}
            strokeWidth={1}
          />
          <Rect
            width={width * 0.3}
            height={depth * 0.2}
            x={width * 0.65}
            y={depth * 0.5}
            fill={lightColor}
            stroke={darkColor}
            strokeWidth={1}
          />
        </>
      );

    case 'shelf':
      // Shelf with shelves
      return (
        <>
          {/* Main body */}
          <Rect
            width={width}
            height={depth}
            fill={baseColor}
            stroke={isSelected ? '#0066ff' : darkColor}
            strokeWidth={isSelected ? 3 : 2}
            cornerRadius={2}
          />
          {/* Shelf lines */}
          <Line
            points={[0, depth * 0.25, width, depth * 0.25]}
            stroke={darkColor}
            strokeWidth={2}
          />
          <Line
            points={[0, depth * 0.5, width, depth * 0.5]}
            stroke={darkColor}
            strokeWidth={2}
          />
          <Line
            points={[0, depth * 0.75, width, depth * 0.75]}
            stroke={darkColor}
            strokeWidth={2}
          />
        </>
      );

    default:
      return (
        <Rect
          width={width}
          height={depth}
          fill={baseColor}
          stroke={isSelected ? '#0066ff' : '#000000'}
          strokeWidth={isSelected ? 3 : 1}
        />
      );
  }
};
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

export const FurnitureLayer: React.FC<FurnitureLayerProps> = React.memo(({
  furniture,
  room,
  selectedFurnitureId,
  offsetX = 50,
  offsetY = 50,
  onFurnitureSelect,
  onFurnitureMove,
}) => {
  const handleDragEnd = useCallback((piece: FurniturePiece) => (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const x = (node.x() - offsetX) / PIXELS_PER_FOOT;
    const y = (node.y() - offsetY) / PIXELS_PER_FOOT;

    // Always allow the move - update position without validation
    onFurnitureMove(piece.id, x, y);
  }, [offsetX, offsetY, onFurnitureMove]);

  const handleClick = useCallback((id: string) => () => {
    onFurnitureSelect(id);
  }, [onFurnitureSelect]);

  return (
    <>
      {furniture.map((piece) => {
        const isSelected = piece.id === selectedFurnitureId;
        const width = piece.dimensions.width * piece.scale * PIXELS_PER_FOOT;
        const depth = piece.dimensions.depth * piece.scale * PIXELS_PER_FOOT;
        const x = offsetX + piece.position.x * PIXELS_PER_FOOT;
        const y = offsetY + piece.position.y * PIXELS_PER_FOOT;

        return (
          <Group
            key={piece.id}
            x={x}
            y={y}
            draggable={true}
            onDragEnd={handleDragEnd(piece)}
            onClick={handleClick(piece.id)}
            onTap={handleClick(piece.id)}
            onMouseEnter={(e) => {
              const container = e.target.getStage()?.container();
              if (container) {
                container.style.cursor = 'move';
              }
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage()?.container();
              if (container) {
                container.style.cursor = 'default';
              }
            }}
          >
            {/* Render furniture shape */}
            {renderFurnitureShape(piece, width, depth, isSelected)}
            
            {/* Label */}
            <Text
              text={piece.type}
              fontSize={10}
              fill="#FFFFFF"
              align="center"
              verticalAlign="middle"
              width={width}
              y={depth / 2 - 5}
              listening={false}
              fontStyle="bold"
              shadowColor="black"
              shadowBlur={3}
              shadowOpacity={0.8}
            />
          </Group>
        );
      })}
    </>
  );
});
