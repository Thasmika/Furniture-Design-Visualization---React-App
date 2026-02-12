import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  removeFurniture,
  updateFurnitureScale,
  updateFurnitureColor,
} from '../store/slices/designSlice';
import { selectFurniture } from '../store/slices/uiSlice';
import { validateFurnitureDimensions } from '../models/FurniturePiece';
import { getSelectedFurniture } from '../store/selectors';
import { Tooltip } from './Tooltip';
import './PropertyEditorPanel.css';

export const PropertyEditorPanel: React.FC = React.memo(() => {
  const dispatch = useAppDispatch();
  const selectedFurnitureId = useAppSelector((state) => state.ui.selectedFurnitureId);
  const selectedFurniture = useAppSelector(getSelectedFurniture);

  const [scale, setScale] = useState(1.0);
  const [color, setColor] = useState('#8B4513');
  const [validationError, setValidationError] = useState<string | null>(null);

  // Update local state when selected furniture changes
  useEffect(() => {
    if (selectedFurniture) {
      setScale(selectedFurniture.scale);
      setColor(selectedFurniture.color);
      setValidationError(null);
    }
  }, [selectedFurniture]);

  // Memoize scaled dimensions calculation
  const scaledDimensions = useMemo(() => {
    if (!selectedFurniture) return null;
    return {
      width: selectedFurniture.dimensions.width * scale,
      depth: selectedFurniture.dimensions.depth * scale,
      height: selectedFurniture.dimensions.height * scale,
    };
  }, [selectedFurniture, scale]);

  const handleScaleChange = useCallback((newScale: number) => {
    setScale(newScale);
    
    if (newScale < 0.5 || newScale > 3.0) {
      setValidationError('Scale must be between 0.5 and 3.0');
      return;
    }

    if (selectedFurnitureId && selectedFurniture) {
      // Validate scaled dimensions
      const scaledDims = {
        width: selectedFurniture.dimensions.width * newScale,
        depth: selectedFurniture.dimensions.depth * newScale,
        height: selectedFurniture.dimensions.height * newScale,
      };

      const validation = validateFurnitureDimensions(scaledDims);
      if (!validation.valid) {
        setValidationError(validation.error || 'Invalid dimensions');
        return;
      }

      setValidationError(null);
      dispatch(updateFurnitureScale({ id: selectedFurnitureId, scale: newScale }));
    }
  }, [selectedFurnitureId, selectedFurniture, dispatch]);

  const handleColorChange = useCallback((newColor: string) => {
    setColor(newColor);
    if (selectedFurnitureId) {
      dispatch(updateFurnitureColor({ id: selectedFurnitureId, color: newColor }));
    }
  }, [selectedFurnitureId, dispatch]);

  const handleDelete = useCallback(() => {
    if (selectedFurnitureId) {
      dispatch(removeFurniture(selectedFurnitureId));
      dispatch(selectFurniture(null));
    }
  }, [selectedFurnitureId, dispatch]);

  if (!selectedFurniture || !scaledDimensions) {
    return (
      <div className="property-editor-panel">
        <h3>Properties</h3>
        <div className="no-selection">
          Select a furniture piece to edit its properties
        </div>
      </div>
    );
  }

  return (
    <div className="property-editor-panel">
      <h3>Properties</h3>
      
      <div className="property-section">
        <div className="property-header">
          <span className="furniture-type">{selectedFurniture.type}</span>
          <Tooltip content="Remove furniture from design">
            <button
              type="button"
              className="delete-button"
              onClick={handleDelete}
            >
              🗑️
            </button>
          </Tooltip>
        </div>
        {selectedFurniture.price && (
          <div className="furniture-price-display">
            💰 ${selectedFurniture.price.toFixed(2)}
          </div>
        )}
      </div>

      <div className="property-section">
        <label className="property-label">Dimensions (feet)</label>
        <div className="dimension-display">
          <div className="dimension-item">
            <span className="dimension-label">Width:</span>
            <span className="dimension-value">{scaledDimensions.width.toFixed(1)}</span>
          </div>
          <div className="dimension-item">
            <span className="dimension-label">Depth:</span>
            <span className="dimension-value">{scaledDimensions.depth.toFixed(1)}</span>
          </div>
          <div className="dimension-item">
            <span className="dimension-label">Height:</span>
            <span className="dimension-value">{scaledDimensions.height.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="property-section">
        <label className="property-label" htmlFor="scale-slider">
          <Tooltip content="Adjust furniture size proportionally (0.5x to 3.0x)">
            <span>Scale: {scale.toFixed(2)}x</span>
          </Tooltip>
        </label>
        <input
          id="scale-slider"
          type="range"
          min="0.5"
          max="3.0"
          step="0.1"
          value={scale}
          onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
          className="scale-slider"
        />
        <div className="scale-range">
          <span>0.5x</span>
          <span>3.0x</span>
        </div>
      </div>

      <div className="property-section">
        <label className="property-label" htmlFor="color-picker">
          <Tooltip content="Change furniture color">
            <span>Color</span>
          </Tooltip>
        </label>
        <div className="color-picker-container">
          <input
            id="color-picker"
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="color-picker"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="color-input"
            placeholder="#8B4513"
          />
        </div>
      </div>

      {validationError && (
        <div className="validation-error">{validationError}</div>
      )}
    </div>
  );
});
