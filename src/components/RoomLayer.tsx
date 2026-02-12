import React from 'react';
import { Rect, Circle } from 'react-konva';
import type { Room } from '../models/Room';
import { PIXELS_PER_FOOT } from './Canvas2D';

interface RoomLayerProps {
  room: Room;
  offsetX?: number;
  offsetY?: number;
}

export const RoomLayer: React.FC<RoomLayerProps> = React.memo(({ 
  room, 
  offsetX = 50, 
  offsetY = 50 
}) => {
  const { shape, dimensions, colorScheme } = room;

  // Render rectangular or square room
  if (shape === 'rectangular' || shape === 'square') {
    const width = dimensions.width * PIXELS_PER_FOOT;
    const height = (shape === 'square' ? dimensions.width : dimensions.length) * PIXELS_PER_FOOT;

    return (
      <>
        {/* Floor */}
        <Rect
          x={offsetX}
          y={offsetY}
          width={width}
          height={height}
          fill={colorScheme.floor}
          stroke="#000000"
          strokeWidth={2}
          listening={false}
          perfectDrawEnabled={false}
        />
      </>
    );
  }

  // Render circular room
  if (shape === 'circular') {
    const radius = dimensions.radius * PIXELS_PER_FOOT;

    return (
      <>
        {/* Floor */}
        <Circle
          x={offsetX + radius}
          y={offsetY + radius}
          radius={radius}
          fill={colorScheme.floor}
          stroke="#000000"
          strokeWidth={2}
          listening={false}
          perfectDrawEnabled={false}
        />
      </>
    );
  }

  return null;
});
