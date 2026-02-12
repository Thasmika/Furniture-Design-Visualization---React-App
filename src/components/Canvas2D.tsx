import React, { useCallback } from 'react';
import { Stage, Layer } from 'react-konva';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { getCurrentDesign, getSelectedFurnitureId, getShowGrid } from '../store/selectors';
import { updateFurniturePosition } from '../store/slices/designSlice';
import { selectFurniture } from '../store/slices/uiSlice';
import { RoomLayer } from './RoomLayer';
import { GridLayer } from './GridLayer';
import { FurnitureLayer } from './FurnitureLayer';

// Coordinate scaling: 1 foot = 20 pixels
export const PIXELS_PER_FOOT = 20;

interface Canvas2DProps {
  width?: number;
  height?: number;
}

export const Canvas2D: React.FC<Canvas2DProps> = React.memo(({ 
  width = 800, 
  height = 600 
}) => {
  const dispatch = useAppDispatch();
  const design = useAppSelector(getCurrentDesign);
  const selectedFurnitureId = useAppSelector(getSelectedFurnitureId);
  const showGrid = useAppSelector(getShowGrid);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleFurnitureSelect = useCallback((id: string) => {
    dispatch(selectFurniture(id));
  }, [dispatch]);

  const handleFurnitureMove = useCallback((id: string, x: number, y: number) => {
    dispatch(updateFurniturePosition({ id, position: { x, y } }));
  }, [dispatch]);

  if (!design || !design.room) {
    return (
      <div style={{ 
        width, 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f0f0f0',
        border: '1px solid #ccc'
      }}>
        <p>No design loaded. Create a room to get started.</p>
      </div>
    );
  }

  return (
    <Stage 
      width={width} 
      height={height}
      // Enable Konva's hitGraph optimization for better performance
      listening={true}
    >
      {/* Separate static and dynamic layers for better caching */}
      <Layer listening={false}>
        <RoomLayer room={design.room} />
        <GridLayer room={design.room} visible={showGrid} />
      </Layer>
      <Layer listening={true}>
        <FurnitureLayer
          furniture={design.furniture}
          room={design.room}
          selectedFurnitureId={selectedFurnitureId}
          onFurnitureSelect={handleFurnitureSelect}
          onFurnitureMove={handleFurnitureMove}
        />
      </Layer>
    </Stage>
  );
});
