import type { Room } from '../models/Room';
import type { FurniturePiece } from '../models/FurniturePiece';
import type { Design } from '../models/Design';
import type { ValidationResult } from '../models/Room';
import { validateDimensions, validateColor } from '../models/Room';
import { validateFurnitureDimensions } from '../models/FurniturePiece';

/**
 * Validates if a furniture piece position is within room boundaries
 */
export function validatePosition(
  furniture: FurniturePiece,
  room: Room
): ValidationResult {
  const { position, dimensions, scale } = furniture;
  const scaledWidth = dimensions.width * scale;
  const scaledDepth = dimensions.depth * scale;

  // Calculate furniture bounding box
  const halfWidth = scaledWidth / 2;
  const halfDepth = scaledDepth / 2;

  const minX = position.x - halfWidth;
  const maxX = position.x + halfWidth;
  const minY = position.y - halfDepth;
  const maxY = position.y + halfDepth;

  // Check boundaries based on room shape
  if (room.shape === 'circular') {
    const radius = room.dimensions.radius;
    
    // Check if all corners of the furniture are within the circular room
    const corners = [
      { x: minX, y: minY },
      { x: maxX, y: minY },
      { x: minX, y: maxY },
      { x: maxX, y: maxY },
    ];

    for (const corner of corners) {
      const distanceFromCenter = Math.sqrt(corner.x ** 2 + corner.y ** 2);
      if (distanceFromCenter > radius) {
        return {
          valid: false,
          error: 'Furniture position is outside room boundaries',
        };
      }
    }
  } else {
    // Rectangular or square room
    const roomWidth = room.dimensions.width;
    const roomLength = room.dimensions.length;

    // Room boundaries (centered at origin)
    const roomMinX = -roomWidth / 2;
    const roomMaxX = roomWidth / 2;
    const roomMinY = -roomLength / 2;
    const roomMaxY = roomLength / 2;

    if (minX < roomMinX || maxX > roomMaxX || minY < roomMinY || maxY > roomMaxY) {
      return {
        valid: false,
        error: 'Furniture position is outside room boundaries',
      };
    }
  }

  return { valid: true };
}

/**
 * Checks if two furniture pieces collide using bounding box intersection
 */
export function checkCollision(
  furniture1: FurniturePiece,
  furniture2: FurniturePiece
): boolean {
  const f1 = furniture1;
  const f2 = furniture2;

  // Calculate scaled dimensions
  const f1Width = f1.dimensions.width * f1.scale;
  const f1Depth = f1.dimensions.depth * f1.scale;
  const f2Width = f2.dimensions.width * f2.scale;
  const f2Depth = f2.dimensions.depth * f2.scale;

  // Calculate bounding boxes
  const f1MinX = f1.position.x - f1Width / 2;
  const f1MaxX = f1.position.x + f1Width / 2;
  const f1MinY = f1.position.y - f1Depth / 2;
  const f1MaxY = f1.position.y + f1Depth / 2;

  const f2MinX = f2.position.x - f2Width / 2;
  const f2MaxX = f2.position.x + f2Width / 2;
  const f2MinY = f2.position.y - f2Depth / 2;
  const f2MaxY = f2.position.y + f2Depth / 2;

  // Check for intersection
  const xOverlap = f1MinX < f2MaxX && f1MaxX > f2MinX;
  const yOverlap = f1MinY < f2MaxY && f1MaxY > f2MinY;

  return xOverlap && yOverlap;
}

/**
 * Validates a complete design including room and all furniture pieces
 */
export function validateDesign(design: Design): ValidationResult {
  // Validate room dimensions
  const roomValidation = validateDimensions(design.room.shape, design.room.dimensions);
  if (!roomValidation.valid) {
    return { valid: false, error: `Invalid room: ${roomValidation.error}` };
  }

  // Validate room colors
  const wallColorValidation = validateColor(design.room.colorScheme.walls);
  if (!wallColorValidation.valid) {
    return { valid: false, error: `Invalid wall color: ${wallColorValidation.error}` };
  }

  const floorColorValidation = validateColor(design.room.colorScheme.floor);
  if (!floorColorValidation.valid) {
    return { valid: false, error: `Invalid floor color: ${floorColorValidation.error}` };
  }

  const ceilingColorValidation = validateColor(design.room.colorScheme.ceiling);
  if (!ceilingColorValidation.valid) {
    return { valid: false, error: `Invalid ceiling color: ${ceilingColorValidation.error}` };
  }

  // Validate each furniture piece
  for (let i = 0; i < design.furniture.length; i++) {
    const furniture = design.furniture[i];

    // Validate furniture dimensions
    const dimValidation = validateFurnitureDimensions(furniture.dimensions);
    if (!dimValidation.valid) {
      return {
        valid: false,
        error: `Invalid furniture at index ${i}: ${dimValidation.error}`,
      };
    }

    // Validate furniture color
    const colorValidation = validateColor(furniture.color);
    if (!colorValidation.valid) {
      return {
        valid: false,
        error: `Invalid furniture color at index ${i}: ${colorValidation.error}`,
      };
    }

    // Validate furniture position is within room boundaries
    const positionValidation = validatePosition(furniture, design.room);
    if (!positionValidation.valid) {
      return {
        valid: false,
        error: `Furniture at index ${i}: ${positionValidation.error}`,
      };
    }

    // Check for collisions with other furniture
    for (let j = i + 1; j < design.furniture.length; j++) {
      const otherFurniture = design.furniture[j];
      if (checkCollision(furniture, otherFurniture)) {
        return {
          valid: false,
          error: `Furniture collision detected between pieces at indices ${i} and ${j}`,
        };
      }
    }
  }

  return { valid: true };
}
