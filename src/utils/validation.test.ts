import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { validatePosition, checkCollision, validateDesign } from './validation';
import { createRoom } from '../models/Room';
import { createFurniture, updatePosition, updateScale } from '../models/FurniturePiece';
import { createDesign, addFurniture } from '../models/Design';
import type { Room } from '../models/Room';
import type { FurniturePiece } from '../models/FurniturePiece';

// Arbitraries for property-based testing
const roomShapeArbitrary = () => fc.constantFrom('rectangular', 'square', 'circular' as const);

const validDimensionArbitrary = () => fc.float({ min: 10, max: 100, noNaN: true });

const hexColorArbitrary = () =>
  fc.tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 })
  ).map(([r, g, b]) => {
    const toHex = (n: number) => n.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  });

const roomArbitrary = (): fc.Arbitrary<Room> =>
  fc.record({
    shape: roomShapeArbitrary(),
    width: validDimensionArbitrary(),
    length: validDimensionArbitrary(),
    radius: validDimensionArbitrary(),
    wallColor: hexColorArbitrary(),
    floorColor: hexColorArbitrary(),
    ceilingColor: hexColorArbitrary(),
  }).map(({ shape, width, length, radius, wallColor, floorColor, ceilingColor }) => {
    const dimensions = shape === 'circular'
      ? { radius }
      : shape === 'square'
      ? { width }
      : { width, length };

    return createRoom(
      shape,
      dimensions,
      { walls: wallColor, floor: floorColor, ceiling: ceilingColor },
      'feet'
    );
  });

const furnitureTypeArbitrary = () =>
  fc.constantFrom('chair', 'table', 'couch', 'bed', 'desk', 'shelf' as const);

const furnitureArbitrary = (): fc.Arbitrary<FurniturePiece> =>
  fc.record({
    type: furnitureTypeArbitrary(),
    color: hexColorArbitrary(),
  }).map(({ type, color }) => createFurniture(type, color));

describe('Validation Engine - Property Tests', () => {
  describe('Property 9: Boundary Validation', () => {
    test('furniture positioned outside room boundaries should be rejected', () => {
      fc.assert(
        fc.property(
          roomArbitrary(),
          furnitureArbitrary(),
          fc.float({ min: -200, max: 200, noNaN: true }),
          fc.float({ min: -200, max: 200, noNaN: true }),
          (room, furniture, x, y) => {
            const positioned = updatePosition(furniture, { x, y });
            const result = validatePosition(positioned, room);

            // Calculate if position should be valid
            const scaledWidth = furniture.dimensions.width * furniture.scale;
            const scaledDepth = furniture.dimensions.depth * furniture.scale;
            const halfWidth = scaledWidth / 2;
            const halfDepth = scaledDepth / 2;

            let shouldBeValid = false;

            if (room.shape === 'circular') {
              const corners = [
                { x: x - halfWidth, y: y - halfDepth },
                { x: x + halfWidth, y: y - halfDepth },
                { x: x - halfWidth, y: y + halfDepth },
                { x: x + halfWidth, y: y + halfDepth },
              ];
              shouldBeValid = corners.every(
                corner => Math.sqrt(corner.x ** 2 + corner.y ** 2) <= room.dimensions.radius
              );
            } else {
              const roomWidth = room.dimensions.width;
              const roomLength = room.dimensions.length;
              const roomMinX = -roomWidth / 2;
              const roomMaxX = roomWidth / 2;
              const roomMinY = -roomLength / 2;
              const roomMaxY = roomLength / 2;

              const minX = x - halfWidth;
              const maxX = x + halfWidth;
              const minY = y - halfDepth;
              const maxY = y + halfDepth;

              shouldBeValid =
                minX >= roomMinX && maxX <= roomMaxX && minY >= roomMinY && maxY <= roomMaxY;
            }

            // Verify validation result matches expected outcome
            if (shouldBeValid) {
              expect(result.valid).toBe(true);
            } else {
              expect(result.valid).toBe(false);
              expect(result.error).toBeDefined();
            }
          }
        ),
        { numRuns: 1000 }
      );
    });

    test('furniture positioned within room boundaries should be accepted', () => {
      fc.assert(
        fc.property(
          roomArbitrary(),
          furnitureArbitrary(),
          fc.double({ min: 0.3, max: 0.7, noNaN: true }),
          fc.double({ min: 0.3, max: 0.7, noNaN: true }),
          (room, furniture, xFactor, yFactor) => {
            // Scale down furniture to ensure it fits in small rooms
            const scaledFurniture = updateScale(furniture, 0.5);
            
            // Position furniture well within room boundaries
            let x: number, y: number;

            if (room.shape === 'circular') {
              const safeRadius = room.dimensions.radius * 0.3;
              x = safeRadius * Math.cos(xFactor * 2 * Math.PI);
              y = safeRadius * Math.sin(yFactor * 2 * Math.PI);
            } else {
              const roomWidth = room.dimensions.width;
              const roomLength = room.dimensions.length;
              const safeWidth = roomWidth * 0.3;
              const safeLength = roomLength * 0.3;
              x = (xFactor - 0.5) * safeWidth;
              y = (yFactor - 0.5) * safeLength;
            }

            const positioned = updatePosition(scaledFurniture, { x, y });
            const result = validatePosition(positioned, room);

            expect(result.valid).toBe(true);
          }
        ),
        { numRuns: 1000 }
      );
    });
  });

  describe('Property 10: Collision Detection', () => {
    test('overlapping furniture should be detected as colliding', () => {
      fc.assert(
        fc.property(
          furnitureArbitrary(),
          furnitureArbitrary(),
          fc.float({ min: -10, max: 10, noNaN: true }),
          fc.float({ min: -10, max: 10, noNaN: true }),
          fc.float({ min: -2, max: 2, noNaN: true }),
          fc.float({ min: -2, max: 2, noNaN: true }),
          (furniture1, furniture2, x1, y1, offsetX, offsetY) => {
            const f1 = updatePosition(furniture1, { x: x1, y: y1 });
            const f2 = updatePosition(furniture2, { x: x1 + offsetX, y: y1 + offsetY });

            const collides = checkCollision(f1, f2);

            // Calculate expected collision
            const f1Width = f1.dimensions.width * f1.scale;
            const f1Depth = f1.dimensions.depth * f1.scale;
            const f2Width = f2.dimensions.width * f2.scale;
            const f2Depth = f2.dimensions.depth * f2.scale;

            const f1MinX = f1.position.x - f1Width / 2;
            const f1MaxX = f1.position.x + f1Width / 2;
            const f1MinY = f1.position.y - f1Depth / 2;
            const f1MaxY = f1.position.y + f1Depth / 2;

            const f2MinX = f2.position.x - f2Width / 2;
            const f2MaxX = f2.position.x + f2Width / 2;
            const f2MinY = f2.position.y - f2Depth / 2;
            const f2MaxY = f2.position.y + f2Depth / 2;

            const xOverlap = f1MinX < f2MaxX && f1MaxX > f2MinX;
            const yOverlap = f1MinY < f2MaxY && f1MaxY > f2MinY;
            const shouldCollide = xOverlap && yOverlap;

            expect(collides).toBe(shouldCollide);
          }
        ),
        { numRuns: 1000 }
      );
    });

    test('non-overlapping furniture should not be detected as colliding', () => {
      fc.assert(
        fc.property(
          furnitureArbitrary(),
          furnitureArbitrary(),
          fc.float({ min: -50, max: 50, noNaN: true }),
          fc.float({ min: -50, max: 50, noNaN: true }),
          fc.float({ min: 20, max: 50, noNaN: true }),
          (furniture1, furniture2, x1, y1, separation) => {
            const f1 = updatePosition(furniture1, { x: x1, y: y1 });
            const f2 = updatePosition(furniture2, { x: x1 + separation, y: y1 });

            const collides = checkCollision(f1, f2);

            expect(collides).toBe(false);
          }
        ),
        { numRuns: 1000 }
      );
    });
  });

  describe('Property 34: Pre-Save Validation', () => {
    test('design with invalid data should be rejected before save', () => {
      fc.assert(
        fc.property(
          roomArbitrary(),
          furnitureArbitrary(),
          fc.double({ min: 150, max: 200, noNaN: true }),
          fc.double({ min: 150, max: 200, noNaN: true }),
          (room, furniture, invalidX, invalidY) => {
            let design = createDesign('user123', 'Test Design', room);

            // Position furniture far outside room boundaries (guaranteed invalid)
            const positioned = updatePosition(furniture, { x: invalidX, y: invalidY });
            design = addFurniture(design, positioned);

            const result = validateDesign(design);

            // Should fail validation due to position outside boundaries
            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
          }
        ),
        { numRuns: 1000 }
      );
    });

    test('design with valid data should pass validation', () => {
      fc.assert(
        fc.property(
          roomArbitrary(),
          fc.array(furnitureArbitrary(), { minLength: 0, maxLength: 3 }),
          (room, furnitureList) => {
            let design = createDesign('user123', 'Test Design', room);

            // Add furniture positioned safely within room and spaced apart to avoid collisions
            for (let i = 0; i < furnitureList.length; i++) {
              const furniture = furnitureList[i];
              // Position furniture in different quadrants to avoid collisions
              const angle = (i * 2 * Math.PI) / Math.max(furnitureList.length, 4);
              const distance = 2; // Small distance from center
              const x = distance * Math.cos(angle);
              const y = distance * Math.sin(angle);
              const positioned = updatePosition(furniture, { x, y });
              
              // Only add if within boundaries and doesn't collide
              if (validatePosition(positioned, room).valid) {
                const hasCollision = design.furniture.some(existing => 
                  checkCollision(existing, positioned)
                );
                if (!hasCollision) {
                  design = addFurniture(design, positioned);
                }
              }
            }

            const result = validateDesign(design);

            expect(result.valid).toBe(true);
          }
        ),
        { numRuns: 1000 }
      );
    });

    test('design with colliding furniture should be rejected', () => {
      fc.assert(
        fc.property(
          roomArbitrary(),
          furnitureArbitrary(),
          furnitureArbitrary(),
          fc.float({ min: -5, max: 5, noNaN: true }),
          fc.float({ min: -5, max: 5, noNaN: true }),
          (room, furniture1, furniture2, x, y) => {
            let design = createDesign('user123', 'Test Design', room);

            // Position both furniture at the same location (guaranteed collision)
            const f1 = updatePosition(furniture1, { x, y });
            const f2 = updatePosition(furniture2, { x, y });

            // Only test if both are within room boundaries
            if (validatePosition(f1, room).valid && validatePosition(f2, room).valid) {
              design = addFurniture(design, f1);
              design = addFurniture(design, f2);

              const result = validateDesign(design);

              // Should detect collision
              expect(result.valid).toBe(false);
              expect(result.error).toBeDefined();
              expect(result.error).toContain('collision');
            }
          }
        ),
        { numRuns: 1000 }
      );
    });
  });
});
