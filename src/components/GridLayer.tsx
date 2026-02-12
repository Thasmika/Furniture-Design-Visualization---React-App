import React, { useMemo } from 'react';
import { Line } from 'react-konva';
import type { Room } from '../models/Room';
import { PIXELS_PER_FOOT } from './Canvas2D';

interface GridLayerProps {
  room: Room;
  offsetX?: number;
  offsetY?: number;
  visible: boolean;
}

export const GridLayer: React.FC<GridLayerProps> = React.memo(({ 
  room, 
  offsetX = 50, 
  offsetY = 50,
  visible 
}) => {
  // Memoize grid lines calculation to avoid recalculating on every render
  const gridLines = useMemo(() => {
    if (!visible) {
      return [];
    }

    const { shape, dimensions } = room;
    const gridSpacing = PIXELS_PER_FOOT; // 1 foot spacing
    const lines: React.ReactElement[] = [];

    // For rectangular and square rooms
    if (shape === 'rectangular' || shape === 'square') {
      const width = dimensions.width * PIXELS_PER_FOOT;
      const height = (shape === 'square' ? dimensions.width : dimensions.length) * PIXELS_PER_FOOT;

      // Vertical lines
      for (let i = 0; i <= dimensions.width; i++) {
        const x = offsetX + i * gridSpacing;
        lines.push(
          <Line
            key={`v-${i}`}
            points={[x, offsetY, x, offsetY + height]}
            stroke="#cccccc"
            strokeWidth={1}
            dash={[5, 5]}
            listening={false}
            perfectDrawEnabled={false}
          />
        );
      }

      // Horizontal lines
      const heightInFeet = shape === 'square' ? dimensions.width : dimensions.length;
      for (let i = 0; i <= heightInFeet; i++) {
        const y = offsetY + i * gridSpacing;
        lines.push(
          <Line
            key={`h-${i}`}
            points={[offsetX, y, offsetX + width, y]}
            stroke="#cccccc"
            strokeWidth={1}
            dash={[5, 5]}
            listening={false}
            perfectDrawEnabled={false}
          />
        );
      }

      return lines;
    }

    // For circular rooms - draw radial grid
    if (shape === 'circular') {
      const radius = dimensions.radius * PIXELS_PER_FOOT;
      const centerX = offsetX + radius;
      const centerY = offsetY + radius;

      // Concentric circles
      for (let i = 1; i <= dimensions.radius; i++) {
        const r = i * gridSpacing;
        // Approximate circle with line segments
        const segments = 64;
        const points: number[] = [];
        for (let j = 0; j <= segments; j++) {
          const angle = (j / segments) * Math.PI * 2;
          points.push(centerX + r * Math.cos(angle));
          points.push(centerY + r * Math.sin(angle));
        }
        lines.push(
          <Line
            key={`circle-${i}`}
            points={points}
            stroke="#cccccc"
            strokeWidth={1}
            dash={[5, 5]}
            closed
            listening={false}
            perfectDrawEnabled={false}
          />
        );
      }

      // Radial lines (8 directions)
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        lines.push(
          <Line
            key={`radial-${i}`}
            points={[
              centerX,
              centerY,
              centerX + radius * Math.cos(angle),
              centerY + radius * Math.sin(angle)
            ]}
            stroke="#cccccc"
            strokeWidth={1}
            dash={[5, 5]}
            listening={false}
            perfectDrawEnabled={false}
          />
        );
      }

      return lines;
    }

    return [];
  }, [visible, room, offsetX, offsetY]);

  if (!visible) {
    return null;
  }

  return <>{gridLines}</>;
});
