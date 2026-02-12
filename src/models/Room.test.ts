import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { createRoom, validateDimensions, validateColor, type Room } from './Room';

// Arbitraries for property-based testing
const roomShapeArbitrary = () => fc.constantFrom('rectangular', 'square', 'circular') as fc.Arbitrary<Room['shape']>;

const validDimensionArbitrary = () => fc.float({ min: 1, max: 100, noNaN: true });

const hexCharArbitrary = () => fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');

const hexColorArbitrary = () => fc.oneof(
  fc.tuple(hexCharArbitrary(), hexCharArbitrary(), hexCharArbitrary())
    .map(([r, g, b]) => `#${r}${g}${b}`),
  fc.tuple(
    hexCharArbitrary(), hexCharArbitrary(), hexCharArbitrary(),
    hexCharArbitrary(), hexCharArbitrary(), hexCharArbitrary()
  ).map(([r1, r2, g1, g2, b1, b2]) => `#${r1}${r2}${g1}${g2}${b1}${b2}`),
  fc.tuple(
    hexCharArbitrary(), hexCharArbitrary(), hexCharArbitrary(), hexCharArbitrary(),
    hexCharArbitrary(), hexCharArbitrary(), hexCharArbitrary(), hexCharArbitrary()
  ).map(([r1, r2, g1, g2, b1, b2, a1, a2]) => `#${r1}${r2}${g1}${g2}${b1}${b2}${a1}${a2}`)
);

const colorSchemeArbitrary = () => fc.record({
  walls: hexColorArbitrary(),
  floor: hexColorArbitrary(),
  ceiling: hexColorArbitrary(),
});

const invalidDimensionArbitrary = () => fc.oneof(
  fc.float({ max: 0, noNaN: true }),
  fc.float({ min: Math.fround(100.1), max: 1000, noNaN: true })
);

describe('Room Model - Property Tests', () => {
  // Property 1: Room Creation Accepts Valid Inputs
  test('Property 1: Room Creation Accepts Valid Inputs', () => {
    fc.assert(
      fc.property(
        roomShapeArbitrary(),
        validDimensionArbitrary(),
        validDimensionArbitrary(),
        validDimensionArbitrary(),
        colorSchemeArbitrary(),
        fc.constantFrom('feet', 'meters') as fc.Arbitrary<Room['unit']>,
        (shape, width, length, radius, colorScheme, unit) => {
          const dimensions = shape === 'circular' 
            ? { radius }
            : shape === 'square'
            ? { width }
            : { width, length };

          const room = createRoom(shape, dimensions, colorScheme, unit);
          
          expect(room).toBeDefined();
          expect(room.id).toBeDefined();
          expect(room.shape).toBe(shape);
          expect(room.unit).toBe(unit);
          expect(room.colorScheme).toEqual(colorScheme);
        }
      ),
      { numRuns: 1000 }
    );
  });

  // Property 2: Dimension Validation Rejects Invalid Inputs
  test('Property 2: Dimension Validation Rejects Invalid Inputs (Room)', () => {
    fc.assert(
      fc.property(
        roomShapeArbitrary(),
        invalidDimensionArbitrary(),
        (shape, invalidDim) => {
          const dimensions = shape === 'circular'
            ? { width: 10, length: 10, radius: invalidDim }
            : { width: invalidDim, length: 10, radius: 5 };

          const result = validateDimensions(shape, dimensions);
          
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
          expect(result.error!.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 1000 }
    );
  });

  // Property 3: Color Scheme Acceptance
  test('Property 3: Color Scheme Acceptance', () => {
    fc.assert(
      fc.property(
        hexColorArbitrary(),
        (color) => {
          const result = validateColor(color);
          
          expect(result.valid).toBe(true);
          expect(result.error).toBeUndefined();
        }
      ),
      { numRuns: 1000 }
    );
  });

  // Additional test: Invalid color rejection
  test('Property 3 (inverse): Invalid colors are rejected', () => {
    fc.assert(
      fc.property(
        fc.string().filter(s => !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(s)),
        (invalidColor) => {
          const result = validateColor(invalidColor);
          
          expect(result.valid).toBe(false);
          expect(result.error).toBeDefined();
        }
      ),
      { numRuns: 1000 }
    );
  });
});

// **Validates: Requirements 1.1, 1.2, 1.4, 1.5, 1.6**
