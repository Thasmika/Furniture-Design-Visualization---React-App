export interface Room {
  id: string;
  shape: 'rectangular' | 'square' | 'circular';
  dimensions: {
    width: number;
    length: number;
    radius: number;
  };
  colorScheme: {
    walls: string;
    floor: string;
    ceiling: string;
  };
  unit: 'feet' | 'meters';
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function validateDimensions(
  shape: Room['shape'],
  dimensions: Room['dimensions']
): ValidationResult {
  const { width, length, radius } = dimensions;

  if (shape === 'circular') {
    if (radius <= 0) {
      return { valid: false, error: 'Radius must be a positive number' };
    }
    if (radius < 1 || radius > 100) {
      return { valid: false, error: 'Radius must be between 1 and 100 feet' };
    }
  } else {
    if (width <= 0) {
      return { valid: false, error: 'Width must be a positive number' };
    }
    if (width < 1 || width > 100) {
      return { valid: false, error: 'Width must be between 1 and 100 feet' };
    }

    if (shape === 'rectangular') {
      if (length <= 0) {
        return { valid: false, error: 'Length must be a positive number' };
      }
      if (length < 1 || length > 100) {
        return { valid: false, error: 'Length must be between 1 and 100 feet' };
      }
    }
  }

  return { valid: true };
}

export function validateColor(color: string): ValidationResult {
  const hexColorRegex = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/;
  
  if (!hexColorRegex.test(color)) {
    return { valid: false, error: 'Color must be a valid hex code (#RGB, #RRGGBB, or #RRGGBBAA)' };
  }
  
  return { valid: true };
}

export function createRoom(
  shape: Room['shape'],
  dimensions: Partial<Room['dimensions']>,
  colorScheme: Room['colorScheme'],
  unit: Room['unit'] = 'feet'
): Room {
  const fullDimensions: Room['dimensions'] = {
    width: dimensions.width || 0,
    length: shape === 'square' ? (dimensions.width || 0) : (dimensions.length || 0),
    radius: dimensions.radius || 0,
  };

  const dimensionValidation = validateDimensions(shape, fullDimensions);
  if (!dimensionValidation.valid) {
    throw new Error(dimensionValidation.error);
  }

  const colorValidation = validateColor(colorScheme.walls);
  if (!colorValidation.valid) {
    throw new Error(`Invalid wall color: ${colorValidation.error}`);
  }

  const floorColorValidation = validateColor(colorScheme.floor);
  if (!floorColorValidation.valid) {
    throw new Error(`Invalid floor color: ${floorColorValidation.error}`);
  }

  const ceilingColorValidation = validateColor(colorScheme.ceiling);
  if (!ceilingColorValidation.valid) {
    throw new Error(`Invalid ceiling color: ${ceilingColorValidation.error}`);
  }

  return {
    id: crypto.randomUUID(),
    shape,
    dimensions: fullDimensions,
    colorScheme,
    unit,
  };
}
