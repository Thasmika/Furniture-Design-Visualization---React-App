import type { ValidationResult } from './Room';

export type FurnitureType = 'chair' | 'table' | 'couch' | 'bed' | 'desk' | 'shelf';

export interface FurniturePiece {
  id: string;
  type: FurnitureType;
  dimensions: {
    width: number;
    depth: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
    z: number;
    rotation: number;
  };
  color: string;
  scale: number;
}

const DEFAULT_DIMENSIONS: Record<FurnitureType, { width: number; depth: number; height: number }> = {
  chair: { width: 2, depth: 2, height: 3 },
  table: { width: 4, depth: 3, height: 2.5 },
  couch: { width: 7, depth: 3, height: 3 },
  bed: { width: 6.5, depth: 5, height: 2 },
  desk: { width: 5, depth: 2.5, height: 2.5 },
  shelf: { width: 3, depth: 1, height: 6 },
};

export function validateFurnitureDimensions(dimensions: FurniturePiece['dimensions']): ValidationResult {
  const { width, depth, height } = dimensions;

  if (width <= 0 || depth <= 0 || height <= 0) {
    return { valid: false, error: 'All dimensions must be positive numbers' };
  }

  if (width < 0.5 || width > 20) {
    return { valid: false, error: 'Width must be between 0.5 and 20 feet' };
  }

  if (depth < 0.5 || depth > 20) {
    return { valid: false, error: 'Depth must be between 0.5 and 20 feet' };
  }

  if (height < 0.5 || height > 20) {
    return { valid: false, error: 'Height must be between 0.5 and 20 feet' };
  }

  return { valid: true };
}

export function createFurniture(type: FurnitureType, color: string = '#8B4513'): FurniturePiece {
  const defaultDims = DEFAULT_DIMENSIONS[type];

  return {
    id: crypto.randomUUID(),
    type,
    dimensions: { ...defaultDims },
    position: { x: 0, y: 0, z: 0, rotation: 0 },
    color,
    scale: 1.0,
  };
}

export function updatePosition(
  furniture: FurniturePiece,
  position: Partial<FurniturePiece['position']>
): FurniturePiece {
  return {
    ...furniture,
    position: {
      ...furniture.position,
      ...position,
    },
  };
}

export function updateScale(furniture: FurniturePiece, scale: number): FurniturePiece {
  if (scale < 0.5 || scale > 3.0) {
    throw new Error('Scale must be between 0.5 and 3.0');
  }

  return {
    ...furniture,
    scale,
  };
}

export function updateColor(furniture: FurniturePiece, color: string): FurniturePiece {
  return {
    ...furniture,
    color,
  };
}
