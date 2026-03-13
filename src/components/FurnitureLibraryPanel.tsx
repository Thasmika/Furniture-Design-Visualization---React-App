import React, { useCallback, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addFurniture, updateFurniturePosition } from '../store/slices/designSlice';
import { createFurniture, type FurnitureType } from '../models/FurniturePiece';
import { getCurrentDesign } from '../store/selectors';
import { Tooltip } from './Tooltip';
import './FurnitureLibraryPanel.css';

interface FurnitureVariant {
  id: string;
  name: string;
  price: number;
  color: string;
  image: string;
}

interface FurnitureCategory {
  type: FurnitureType;
  label: string;
  icon: string;
  variants: FurnitureVariant[];
}

const FURNITURE_CATEGORIES: FurnitureCategory[] = [
  {
    type: 'chair',
    label: 'Chair',
    icon: '🪑',
    variants: [
      { id: 'chair-modern', name: 'Modern Chair', price: 44997, color: '#8B4513', image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=200&h=200&fit=crop' },
      { id: 'chair-classic', name: 'Classic Chair', price: 59997, color: '#654321', image: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=200&h=200&fit=crop' },
      { id: 'chair-office', name: 'Office Chair', price: 74997, color: '#2C2C2C', image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=200&h=200&fit=crop' },
      { id: 'chair-dining', name: 'Dining Chair', price: 38997, color: '#A0522D', image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=200&h=200&fit=crop' },
    ],
  },
  {
    type: 'table',
    label: 'Table',
    icon: '⬜',
    variants: [
      { id: 'table-dining', name: 'Dining Table', price: 89997, color: '#8B4513', image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=200&h=200&fit=crop' },
      { id: 'table-coffee', name: 'Coffee Table', price: 59997, color: '#654321', image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=200&h=200&fit=crop' },
      { id: 'table-side', name: 'Side Table', price: 44997, color: '#A0522D', image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=200&h=200&fit=crop' },
      { id: 'table-console', name: 'Console Table', price: 104997, color: '#6B4423', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=200&h=200&fit=crop' },
    ],
  },
  {
    type: 'couch',
    label: 'Couch',
    icon: '🛋️',
    variants: [
      { id: 'couch-sectional', name: 'Sectional Couch', price: 389997, color: '#4A4A4A', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=200&h=200&fit=crop' },
      { id: 'couch-loveseat', name: 'Loveseat', price: 269997, color: '#5C5C5C', image: 'https://images.unsplash.com/photo-1540574163026-643ea20ade25?w=200&h=200&fit=crop' },
      { id: 'couch-sofa', name: 'Classic Sofa', price: 299997, color: '#3A3A3A', image: 'https://images.unsplash.com/photo-1550254478-ead40cc54513?w=200&h=200&fit=crop' },
      { id: 'couch-chaise', name: 'Chaise Lounge', price: 239997, color: '#6E6E6E', image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=200&h=200&fit=crop' },
    ],
  },
  {
    type: 'bed',
    label: 'Bed',
    icon: '🛏️',
    variants: [
      { id: 'bed-queen', name: 'Queen Bed', price: 239997, color: '#8B4513', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=200&h=200&fit=crop' },
      { id: 'bed-king', name: 'King Bed', price: 299997, color: '#654321', image: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=200&h=200&fit=crop' },
      { id: 'bed-twin', name: 'Twin Bed', price: 149997, color: '#A0522D', image: 'https://images.unsplash.com/photo-1578898886225-c7c894047899?w=200&h=200&fit=crop' },
      { id: 'bed-platform', name: 'Platform Bed', price: 209997, color: '#6B4423', image: 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=200&h=200&fit=crop' },
    ],
  },
  {
    type: 'desk',
    label: 'Desk',
    icon: '🖥️',
    variants: [
      { id: 'desk-office', name: 'Office Desk', price: 119997, color: '#8B4513', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=200&h=200&fit=crop' },
      { id: 'desk-standing', name: 'Standing Desk', price: 179997, color: '#2C2C2C', image: 'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=200&h=200&fit=crop' },
      { id: 'desk-writing', name: 'Writing Desk', price: 89997, color: '#654321', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=200&h=200&fit=crop' },
      { id: 'desk-corner', name: 'Corner Desk', price: 134997, color: '#A0522D', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=200&h=200&fit=crop' },
    ],
  },
  {
    type: 'shelf',
    label: 'Shelf',
    icon: '📚',
    variants: [
      { id: 'shelf-bookcase', name: 'Bookcase', price: 74997, color: '#8B4513', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=200&h=200&fit=crop' },
      { id: 'shelf-floating', name: 'Floating Shelf', price: 23997, color: '#654321', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=200&h=200&fit=crop' },
      { id: 'shelf-ladder', name: 'Ladder Shelf', price: 59997, color: '#A0522D', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=200&h=200&fit=crop' },
      { id: 'shelf-cube', name: 'Cube Shelf', price: 44997, color: '#6B4423', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=200&h=200&fit=crop' },
    ],
  },
  {
    type: 'cabinet',
    label: 'Cabinet',
    icon: '🗃️',
    variants: [
      { id: 'cabinet-storage', name: 'Storage Cabinet', price: 149997, color: '#8B4513', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=200&h=200&fit=crop' },
      { id: 'cabinet-display', name: 'Display Cabinet', price: 179997, color: '#654321', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=200&h=200&fit=crop' },
      { id: 'cabinet-file', name: 'File Cabinet', price: 89997, color: '#2C2C2C', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=200&h=200&fit=crop' },
      { id: 'cabinet-media', name: 'Media Cabinet', price: 134997, color: '#A0522D', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=200&h=200&fit=crop' },
    ],
  },
  {
    type: 'lamp',
    label: 'Lamp',
    icon: '💡',
    variants: [
      { id: 'lamp-table', name: 'Table Lamp', price: 26997, color: '#FFD700', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=200&h=200&fit=crop' },
      { id: 'lamp-floor', name: 'Floor Lamp', price: 44997, color: '#C0C0C0', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=200&h=200&fit=crop' },
      { id: 'lamp-desk', name: 'Desk Lamp', price: 20997, color: '#2C2C2C', image: 'https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=200&h=200&fit=crop' },
      { id: 'lamp-arc', name: 'Arc Lamp', price: 59997, color: '#8B8B8B', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=200&h=200&fit=crop' },
    ],
  },
];

export const FurnitureLibraryPanel: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const currentDesign = useAppSelector(getCurrentDesign);
  const activeView = useAppSelector((state) => state.ui.activeView);
  const [selectedCategory, setSelectedCategory] = useState<FurnitureType | null>(null);
  
  const furnitureCount = useMemo(() => 
    currentDesign?.furniture.length || 0,
    [currentDesign?.furniture.length]
  );

  const totalCost = useMemo(() => {
    if (!currentDesign?.furniture.length) return 0;
    return currentDesign.furniture.reduce((sum, piece) => sum + (piece.price || 0), 0);
  }, [currentDesign?.furniture]);

  const handleAddFurniture = useCallback((type: FurnitureType, color: string, price: number) => {
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

    const offsetX = (Math.random() - 0.5) * 2 * maxOffsetX;
    const offsetY = (Math.random() - 0.5) * 2 * maxOffsetY;

    const newFurniture = createFurniture(
      type, 
      color, 
      { x: centerX + offsetX, y: centerY + offsetY }
    );
    newFurniture.price = price;
    dispatch(addFurniture(newFurniture));
    setSelectedCategory(null);
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
          💰 Total Cost: Rs {totalCost.toLocaleString('en-LK')}
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
      
      {selectedCategory ? (
        <div className="furniture-variants">
          <div className="variants-header">
            <h4>Select {FURNITURE_CATEGORIES.find(c => c.type === selectedCategory)?.label} Style</h4>
            <button
              type="button"
              className="back-button"
              onClick={() => setSelectedCategory(null)}
            >
              ← Back
            </button>
          </div>
          <div className="variant-list">
            {FURNITURE_CATEGORIES.find(c => c.type === selectedCategory)?.variants.map((variant) => (
              <button
                key={variant.id}
                type="button"
                className="variant-button"
                onClick={() => handleAddFurniture(selectedCategory, variant.color, variant.price)}
                disabled={!currentDesign}
              >
                <img 
                  src={variant.image} 
                  alt={variant.name}
                  className="variant-image-preview" 
                />
                <div className="variant-info">
                  <span className="variant-name">{variant.name}</span>
                  <span className="variant-price">Rs {variant.price.toLocaleString('en-LK')}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="furniture-buttons">
          {FURNITURE_CATEGORIES.map(({ type, label, icon }) => (
            <Tooltip key={type} content={`Browse ${label} designs`}>
              <button
                type="button"
                className="furniture-button"
                onClick={() => setSelectedCategory(type)}
                disabled={!currentDesign}
              >
                <span className="furniture-icon">{icon}</span>
                <span className="furniture-label">{label}</span>
              </button>
            </Tooltip>
          ))}
        </div>
      )}
    </div>
  );
});
