import React, { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addFurniture, updateFurniturePosition } from '../store/slices/designSlice';
import { createFurniture, type FurnitureType } from '../models/FurniturePiece';
import { getCurrentDesign } from '../store/selectors';
import { Tooltip } from './Tooltip';
import './FurnitureLibraryPanel.css';

const FURNITURE_TYPES: { type: FurnitureType; label: string; icon: string; price: number }[] = [
  { type: 'chair', label: 'Chair', icon: '🪑', price: 149.99 },
  { type: 'table', label: 'Table', icon: '🪑', price: 299.99 },
  { type: 'couch', label: 'Couch', icon: '🛋️', price: 899.99 },
  { type: 'bed', label: 'Bed', icon: '🛏️', price: 799.99 },
  { type: 'desk', label: 'Desk', icon: '🖥️', price: 399.99 },
  { type: 'shelf', label: 'Shelf', icon: '📚', price: 249.99 },
];

export const FurnitureLibraryPanel: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const currentDesign = useAppSelector(getCurrentDesign);
  const activeView = useAppSelector((state) => state.ui.activeView);
  
  const furnitureCount = useMemo(() => 
    currentDesign?.furniture.length || 0,
    [currentDesign?.furniture.length]
  );

  const totalCost = useMemo(() => {
    if (!currentDesign?.furniture.length) return 0;
    return currentDesign.furniture.reduce((sum, piece) => sum + (piece.price || 0), 0);
  }, [currentDesign?.furniture]);

  const handleAddFurniture = useCallback((type: FurnitureType) => {
    if (!currentDesign?.room) return;

    const room = currentDesign.room;
    
    // Calculate center position based on room shape
    let centerX = 0;
    let centerY = 0;
    let maxOffsetX = 3;
    let maxOffsetY = 3;
    
    if (room.shape === 'rectangular') {
      centerX = room.dimensions.width / 2;
      centerY = room.dimensions.length / 2;
      // Use 30% of room dimensions for offset range
      maxOffsetX = room.dimensions.width * 0.3;
      maxOffsetY = room.dimensions.length * 0.3;
    } else if (room.shape === 'square') {
      centerX = room.dimensions.width / 2;
      centerY = room.dimensions.width / 2;
      maxOffsetX = room.dimensions.width * 0.3;
      maxOffsetY = room.dimensions.width * 0.3;
    } else if (room.shape === 'circular') {
      centerX = room.dimensions.radius;
      centerY = room.dimensions.radius;
      maxOffsetX = room.dimensions.radius * 0.5;
      maxOffsetY = room.dimensions.radius * 0.5;
    }

    // Add a larger random offset so furniture spreads out
    const offsetX = (Math.random() - 0.5) * 2 * maxOffsetX;
    const offsetY = (Math.random() - 0.5) * 2 * maxOffsetY;

    const newFurniture = createFurniture(
      type, 
      '#8B4513', 
      { x: centerX + offsetX, y: centerY + offsetY }
    );
    dispatch(addFurniture(newFurniture));
  }, [dispatch, currentDesign?.room]);

  const handleSpreadFurniture = useCallback(() => {
    if (!currentDesign?.room || !currentDesign?.furniture.length) return;

    const room = currentDesign.room;
    let centerX = 0;
    let centerY = 0;
    let maxOffsetX = 3;
    let maxOffsetY = 3;
    
    if (room.shape === 'rectangular') {
      centerX = room.dimensions.width / 2;
      centerY = room.dimensions.length / 2;
      maxOffsetX = room.dimensions.width * 0.3;
      maxOffsetY = room.dimensions.length * 0.3;
    } else if (room.shape === 'square') {
      centerX = room.dimensions.width / 2;
      centerY = room.dimensions.width / 2;
      maxOffsetX = room.dimensions.width * 0.3;
      maxOffsetY = room.dimensions.width * 0.3;
    } else if (room.shape === 'circular') {
      centerX = room.dimensions.radius;
      centerY = room.dimensions.radius;
      maxOffsetX = room.dimensions.radius * 0.5;
      maxOffsetY = room.dimensions.radius * 0.5;
    }

    // Spread out all furniture pieces
    currentDesign.furniture.forEach((piece) => {
      const offsetX = (Math.random() - 0.5) * 2 * maxOffsetX;
      const offsetY = (Math.random() - 0.5) * 2 * maxOffsetY;
      
      dispatch(updateFurniturePosition({ 
        id: piece.id, 
        position: { 
          x: centerX + offsetX, 
          y: centerY + offsetY 
        } 
      }));
    });
  }, [dispatch, currentDesign]);

  return (
    <div className="furniture-library-panel">
      <h3>Furniture Library</h3>
      <div className="furniture-count">
        {furnitureCount} piece{furnitureCount !== 1 ? 's' : ''} in design
      </div>
      {totalCost > 0 && (
        <div className="total-cost">
          💰 Total Cost: ${totalCost.toFixed(2)}
        </div>
      )}
      {activeView !== '2d' && furnitureCount > 0 && (
        <div className="furniture-hint">
          💡 Switch to 2D View to drag furniture
        </div>
      )}
      {furnitureCount > 1 && (
        <button
          type="button"
          className="spread-furniture-button"
          onClick={handleSpreadFurniture}
        >
          🔀 Spread Out Furniture
        </button>
      )}
      <div className="furniture-buttons">
        {FURNITURE_TYPES.map(({ type, label, icon, price }) => (
          <Tooltip key={type} content={`Add ${label} to design - $${price}`}>
            <button
              type="button"
              className="furniture-button"
              onClick={() => handleAddFurniture(type)}
              disabled={!currentDesign}
            >
              <span className="furniture-icon">{icon}</span>
              <span className="furniture-label">{label}</span>
              <span className="furniture-price">${price}</span>
            </button>
          </Tooltip>
        ))}
      </div>
    </div>
  );
});
