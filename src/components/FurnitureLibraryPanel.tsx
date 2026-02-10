import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addFurniture } from '../store/slices/designSlice';
import { createFurniture, type FurnitureType } from '../models/FurniturePiece';
import './FurnitureLibraryPanel.css';

const FURNITURE_TYPES: { type: FurnitureType; label: string; icon: string }[] = [
  { type: 'chair', label: 'Chair', icon: '🪑' },
  { type: 'table', label: 'Table', icon: '🪑' },
  { type: 'couch', label: 'Couch', icon: '🛋️' },
  { type: 'bed', label: 'Bed', icon: '🛏️' },
  { type: 'desk', label: 'Desk', icon: '🖥️' },
  { type: 'shelf', label: 'Shelf', icon: '📚' },
];

export const FurnitureLibraryPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentDesign = useAppSelector((state) => state.design.current);
  const furnitureCount = currentDesign?.furniture.length || 0;

  const handleAddFurniture = (type: FurnitureType) => {
    const newFurniture = createFurniture(type);
    dispatch(addFurniture(newFurniture));
  };

  return (
    <div className="furniture-library-panel">
      <h3>Furniture Library</h3>
      <div className="furniture-count">
        {furnitureCount} piece{furnitureCount !== 1 ? 's' : ''} in design
      </div>
      <div className="furniture-buttons">
        {FURNITURE_TYPES.map(({ type, label, icon }) => (
          <button
            key={type}
            className="furniture-button"
            onClick={() => handleAddFurniture(type)}
            disabled={!currentDesign}
            title={`Add ${label}`}
          >
            <span className="furniture-icon">{icon}</span>
            <span className="furniture-label">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
