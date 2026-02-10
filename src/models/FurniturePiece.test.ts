import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  createFurniture,
  updatePosition,
  updateScale,
  updateColor,
  validateFurnitureDimensions,
  type FurnitureType,
} from './FurniturePiece';

// Arbitraries for property-based testing
const furnitureTypeArbitrary = () => fc.constantFrom(
  'chair', 'table', 'couch', 'bed', 'desk', 'shelf'
) as fc.Arbitrary<FurnitureType>;

const validFurnitureDimensionArbitrary = () => fc.float({ min: 0.5, max: 20, noNaN: true });

const invalidFurnitureDimensionArbitrary = () => fc.oneof(
  fc.float({ max: 0, noNaN: true }),
  fc.float({ min: Math.fround(20.1), max: 100, noNaN: true })
);

const hexCharArbitrary = () => fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');

const hexColorArbitrary = () => fc.tuple(
  hexCharArbitrary(), hexCharArbitrary(), hexCharArbitrary(),
  hexCharArbitrary(), hexCharArbitrary(), hexCharArbitrary()
).map(([r1, r2, g1, g2, b1, b2]) => `#${r1}${r2}${g1}${g2}${b1}${b2}`);

const positionArbitrary = () => fc.record({
  x: fc.float({ min: -100, max: 100, noNaN: true }),
  y: fc.float({ min: -100, max: 100, noNaN: true }),
  z: fc.float({ min: -100, max: 100, noNaN: true }),
  rotation: fc.float({ min: 0, max: 360, noNaN: true }),
});

const scaleArbitrary = () => fc.float({ min: 0.5, max: 3.0, noNaN: true });

describe('FurniturePiece Model - Property Tests', () => {
  // Property 4: Furniture Type Instantiation
  test('Property 4: Furniture Type Instantiation', () => {
    fc.assert(
      fc.property(
        furnitureTypeArbitrary(),
        hexColorArbitrary(),
        (type, color) => {
          const furniture = createFurniture(type, color);
          
          expect(furniture).toBeDefined();
          expect(furniture.id).toBeDefined();
          expect(furniture.type).toBe(type);
          expect(furniture.color).toBe(color);
          expect(furniture.dimensions).toBeDefined();
          expect(furniture.dimensions.width).toBeGreaterThan(0);
          expect(furniture.dimensions.depth).toBeGreaterThan(0);
          expect(furniture.dimensions.height).toBeGreaterThan(0);
          expect(furniture.scale).toBe(1.0);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 5: Furniture Property Updates
  test('Property 5: Furniture Property Updates - Position', () => {
    fc.assert(
      fc.property(
        furnitureTypeArbitrary(),
        positionArbitrary(),
        (type, newPosition) => {
          const furniture = createFurniture(type);
          const updated = updatePosition(furniture, newPosition);
          
          expect(updated.id).toBe(furniture.id);
          expect(updated.type).toBe(furniture.type);
          expect(updated.position.x).toBe(newPosition.x);
          expect(updated.position.y).toBe(newPosition.y);
          expect(updated.position.z).toBe(newPosition.z);
          expect(updated.position.rotation).toBe(newPosition.rotation);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 5: Furniture Property Updates - Scale', () => {
    fc.assert(
      fc.property(
        furnitureTypeArbitrary(),
        scaleArbitrary(),
        (type, newScale) => {
          const furniture = createFurniture(type);
          const updated = updateScale(furniture, newScale);
          
          expect(updated.id).toBe(furniture.id);
          expect(updated.type).toBe(furniture.type);
          expect(updated.scale).toBe(newScale);
          expect(updated.dimensions).toEqual(furniture.dimensions);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('Property 5: Furniture Property Updates - Color', () => {
    fc.assert(
      fc.property(
        furnitureTypeArbitrary(),
        hexColorArbitrary(),
        (type, newColor) => {
          const furniture = createFurniture(type);
          const updated = updateColor(furniture, newColor);
          
          expect(updated.id).toBe(furniture.id);
          expect(updated.type).toBe(furniture.type);
          expect(updated.color).toBe(newColor);
          expect(updated.dimensions).toEqual(furniture.dimensions);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 2: Dimension Validation Rejects Invalid Inputs (furniture dimensions)
  test('Property 2: Dimension Validation Rejects Invalid Inputs (Furniture)', () => {
    fc.assert(
      fc.property(
        invalidFurnitureDimensionArbitrary(),
        validFurnitureDimensionArbitrary(),
        validFurnitureDimensionArbitrary(),
        (invalidDim, validDim1, validDim2) => {
          // Test invalid width
          const result1 = validateFurnitureDimensions({
            width: invalidDim,
            depth: validDim1,
            height: validDim2,
          });
          expect(result1.valid).toBe(false);
          expect(result1.error).toBeDefined();

          // Test invalid depth
          const result2 = validateFurnitureDimensions({
            width: validDim1,
            depth: invalidDim,
            height: validDim2,
          });
          expect(result2.valid).toBe(false);
          expect(result2.error).toBeDefined();

          // Test invalid height
          const result3 = validateFurnitureDimensions({
            width: validDim1,
            depth: validDim2,
            height: invalidDim,
          });
          expect(result3.valid).toBe(false);
          expect(result3.error).toBeDefined();
        }
      ),
      { numRuns: 100 }
    );
  });

  // Additional test: Valid dimensions are accepted
  test('Valid furniture dimensions are accepted', () => {
    fc.assert(
      fc.property(
        validFurnitureDimensionArbitrary(),
        validFurnitureDimensionArbitrary(),
        validFurnitureDimensionArbitrary(),
        (width, depth, height) => {
          const result = validateFurnitureDimensions({ width, depth, height });
          
          expect(result.valid).toBe(true);
          expect(result.error).toBeUndefined();
        }
      ),
      { numRuns: 100 }
    );
  });
});

// **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.6**
