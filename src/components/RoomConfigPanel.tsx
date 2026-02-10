import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateRoom } from '../store/slices/designSlice';
import { createRoom, validateDimensions, validateColor } from '../models/Room';
import type { Room } from '../models/Room';
import type { RootState } from '../store';
import './RoomConfigPanel.css';

export function RoomConfigPanel() {
  const dispatch = useDispatch();
  const currentDesign = useSelector((state: RootState) => state.design.current);
  const room = currentDesign?.room;

  // Local state for form inputs
  const [shape, setShape] = useState<Room['shape']>(room?.shape || 'rectangular');
  const [width, setWidth] = useState<string>(room?.dimensions.width.toString() || '10');
  const [length, setLength] = useState<string>(room?.dimensions.length.toString() || '12');
  const [radius, setRadius] = useState<string>(room?.dimensions.radius.toString() || '8');
  const [unit, setUnit] = useState<Room['unit']>(room?.unit || 'feet');
  const [wallColor, setWallColor] = useState<string>(room?.colorScheme.walls || '#E8E8E8');
  const [floorColor, setFloorColor] = useState<string>(room?.colorScheme.floor || '#D4A574');
  const [ceilingColor, setCeilingColor] = useState<string>(room?.colorScheme.ceiling || '#FFFFFF');

  // Validation errors
  const [errors, setErrors] = useState<{
    dimensions?: string;
    wallColor?: string;
    floorColor?: string;
    ceilingColor?: string;
  }>({});

  // Sync with Redux state when room changes
  useEffect(() => {
    if (room) {
      setShape(room.shape);
      setWidth(room.dimensions.width.toString());
      setLength(room.dimensions.length.toString());
      setRadius(room.dimensions.radius.toString());
      setUnit(room.unit);
      setWallColor(room.colorScheme.walls);
      setFloorColor(room.colorScheme.floor);
      setCeilingColor(room.colorScheme.ceiling);
    }
  }, [room]);

  const handleShapeChange = (newShape: Room['shape']) => {
    setShape(newShape);
    // Auto-set length equal to width for square rooms
    if (newShape === 'square') {
      setLength(width);
    }
    validateAndUpdate(newShape, width, length, radius, unit, wallColor, floorColor, ceilingColor);
  };

  const handleWidthChange = (value: string) => {
    setWidth(value);
    // Auto-update length for square rooms
    if (shape === 'square') {
      setLength(value);
    }
    validateAndUpdate(shape, value, shape === 'square' ? value : length, radius, unit, wallColor, floorColor, ceilingColor);
  };

  const handleLengthChange = (value: string) => {
    setLength(value);
    validateAndUpdate(shape, width, value, radius, unit, wallColor, floorColor, ceilingColor);
  };

  const handleRadiusChange = (value: string) => {
    setRadius(value);
    validateAndUpdate(shape, width, length, value, unit, wallColor, floorColor, ceilingColor);
  };

  const handleUnitChange = (newUnit: Room['unit']) => {
    setUnit(newUnit);
    validateAndUpdate(shape, width, length, radius, newUnit, wallColor, floorColor, ceilingColor);
  };

  const handleWallColorChange = (color: string) => {
    setWallColor(color);
    validateAndUpdate(shape, width, length, radius, unit, color, floorColor, ceilingColor);
  };

  const handleFloorColorChange = (color: string) => {
    setFloorColor(color);
    validateAndUpdate(shape, width, length, radius, unit, wallColor, color, ceilingColor);
  };

  const handleCeilingColorChange = (color: string) => {
    setCeilingColor(color);
    validateAndUpdate(shape, width, length, radius, unit, wallColor, floorColor, color);
  };

  const validateAndUpdate = (
    shapeVal: Room['shape'],
    widthVal: string,
    lengthVal: string,
    radiusVal: string,
    unitVal: Room['unit'],
    wallColorVal: string,
    floorColorVal: string,
    ceilingColorVal: string
  ) => {
    const newErrors: typeof errors = {};

    // Parse dimensions
    const widthNum = parseFloat(widthVal);
    const lengthNum = parseFloat(lengthVal);
    const radiusNum = parseFloat(radiusVal);

    // Validate dimensions
    const dimensions = {
      width: widthNum,
      length: shapeVal === 'square' ? widthNum : lengthNum,
      radius: radiusNum,
    };

    const dimValidation = validateDimensions(shapeVal, dimensions);
    if (!dimValidation.valid) {
      newErrors.dimensions = dimValidation.error;
    }

    // Validate colors
    const wallColorValidation = validateColor(wallColorVal);
    if (!wallColorValidation.valid) {
      newErrors.wallColor = wallColorValidation.error;
    }

    const floorColorValidation = validateColor(floorColorVal);
    if (!floorColorValidation.valid) {
      newErrors.floorColor = floorColorValidation.error;
    }

    const ceilingColorValidation = validateColor(ceilingColorVal);
    if (!ceilingColorValidation.valid) {
      newErrors.ceilingColor = ceilingColorValidation.error;
    }

    setErrors(newErrors);

    // If all validations pass, update Redux
    if (Object.keys(newErrors).length === 0) {
      try {
        const updatedRoom = createRoom(
          shapeVal,
          dimensions,
          {
            walls: wallColorVal,
            floor: floorColorVal,
            ceiling: ceilingColorVal,
          },
          unitVal
        );
        dispatch(updateRoom(updatedRoom));
      } catch (error) {
        // Error already captured in validation
      }
    }
  };

  return (
    <div className="room-config-panel">
      <h3>Room Configuration</h3>

      {/* Shape Selector */}
      <div className="form-group">
        <label htmlFor="room-shape">Shape</label>
        <select
          id="room-shape"
          value={shape}
          onChange={(e) => handleShapeChange(e.target.value as Room['shape'])}
          className="form-control"
        >
          <option value="rectangular">Rectangular</option>
          <option value="square">Square</option>
          <option value="circular">Circular</option>
        </select>
      </div>

      {/* Dimension Inputs */}
      {shape === 'circular' ? (
        <div className="form-group">
          <label htmlFor="room-radius">Radius ({unit})</label>
          <input
            id="room-radius"
            type="number"
            value={radius}
            onChange={(e) => handleRadiusChange(e.target.value)}
            className="form-control"
            min="1"
            max="100"
            step="0.1"
          />
        </div>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="room-width">Width ({unit})</label>
            <input
              id="room-width"
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(e.target.value)}
              className="form-control"
              min="1"
              max="100"
              step="0.1"
            />
          </div>
          {shape === 'rectangular' && (
            <div className="form-group">
              <label htmlFor="room-length">Length ({unit})</label>
              <input
                id="room-length"
                type="number"
                value={length}
                onChange={(e) => handleLengthChange(e.target.value)}
                className="form-control"
                min="1"
                max="100"
                step="0.1"
              />
            </div>
          )}
        </>
      )}

      {/* Dimension Error */}
      {errors.dimensions && (
        <div className="error-message" role="alert">
          {errors.dimensions}
        </div>
      )}

      {/* Unit Selector */}
      <div className="form-group">
        <label htmlFor="room-unit">Unit</label>
        <select
          id="room-unit"
          value={unit}
          onChange={(e) => handleUnitChange(e.target.value as Room['unit'])}
          className="form-control"
        >
          <option value="feet">Feet</option>
          <option value="meters">Meters</option>
        </select>
      </div>

      {/* Color Pickers */}
      <div className="form-group">
        <label htmlFor="wall-color">Wall Color</label>
        <div className="color-input-group">
          <input
            id="wall-color"
            type="color"
            value={wallColor}
            onChange={(e) => handleWallColorChange(e.target.value)}
            className="color-picker"
          />
          <input
            type="text"
            value={wallColor}
            onChange={(e) => handleWallColorChange(e.target.value)}
            className="color-text-input"
            placeholder="#RRGGBB"
          />
        </div>
        {errors.wallColor && (
          <div className="error-message" role="alert">
            {errors.wallColor}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="floor-color">Floor Color</label>
        <div className="color-input-group">
          <input
            id="floor-color"
            type="color"
            value={floorColor}
            onChange={(e) => handleFloorColorChange(e.target.value)}
            className="color-picker"
          />
          <input
            type="text"
            value={floorColor}
            onChange={(e) => handleFloorColorChange(e.target.value)}
            className="color-text-input"
            placeholder="#RRGGBB"
          />
        </div>
        {errors.floorColor && (
          <div className="error-message" role="alert">
            {errors.floorColor}
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="ceiling-color">Ceiling Color</label>
        <div className="color-input-group">
          <input
            id="ceiling-color"
            type="color"
            value={ceilingColor}
            onChange={(e) => handleCeilingColorChange(e.target.value)}
            className="color-picker"
          />
          <input
            type="text"
            value={ceilingColor}
            onChange={(e) => handleCeilingColorChange(e.target.value)}
            className="color-text-input"
            placeholder="#RRGGBB"
          />
        </div>
        {errors.ceilingColor && (
          <div className="error-message" role="alert">
            {errors.ceilingColor}
          </div>
        )}
      </div>
    </div>
  );
}
