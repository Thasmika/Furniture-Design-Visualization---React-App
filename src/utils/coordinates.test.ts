import { describe, it, expect } from 'vitest';
import { convert2Dto3D, convert3Dto2D } from './coordinates';
import type { Position2D, Vector3 } from './coordinates';
import type { Room } from '../models/Room';

describe('Coordinate Conversion Functions', () => {
  describe('convert2Dto3D', () => {
    it('should convert center of rectangular room correctly', () => {
      const room: Room = {
        id: '1',
        shape: 'rectangular',
        dimensions: { width: 10, length: 12, radius: 0 },
        colorScheme: { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' },
        unit: 'feet'
      };

      const pos2D: Position2D = { x: 5, y: 6 }; // Center of 10x12 room
      const result = convert2Dto3D(pos2D, room);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });

    it('should convert top-left corner of rectangular room correctly', () => {
      const room: Room = {
        id: '1',
        shape: 'rectangular',
        dimensions: { width: 10, length: 12, radius: 0 },
        colorScheme: { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' },
        unit: 'feet'
      };

      const pos2D: Position2D = { x: 0, y: 0 }; // Top-left corner
      const result = convert2Dto3D(pos2D, room);

      expect(result.x).toBe(-5);
      expect(result.y).toBe(0);
      expect(result.z).toBe(-6);
    });

    it('should convert bottom-right corner of rectangular room correctly', () => {
      const room: Room = {
        id: '1',
        shape: 'rectangular',
        dimensions: { width: 10, length: 12, radius: 0 },
        colorScheme: { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' },
        unit: 'feet'
      };

      const pos2D: Position2D = { x: 10, y: 12 }; // Bottom-right corner
      const result = convert2Dto3D(pos2D, room);

      expect(result.x).toBe(5);
      expect(result.y).toBe(0);
      expect(result.z).toBe(6);
    });

    it('should convert center of square room correctly', () => {
      const room: Room = {
        id: '1',
        shape: 'square',
        dimensions: { width: 8, length: 8, radius: 0 },
        colorScheme: { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' },
        unit: 'feet'
      };

      const pos2D: Position2D = { x: 4, y: 4 }; // Center of 8x8 room
      const result = convert2Dto3D(pos2D, room);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });

    it('should convert center of circular room correctly', () => {
      const room: Room = {
        id: '1',
        shape: 'circular',
        dimensions: { width: 0, length: 0, radius: 5 },
        colorScheme: { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' },
        unit: 'feet'
      };

      const pos2D: Position2D = { x: 5, y: 5 }; // Center of circular room (diameter 10)
      const result = convert2Dto3D(pos2D, room);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });

    it('should always set y coordinate to 0 (floor level)', () => {
      const room: Room = {
        id: '1',
        shape: 'rectangular',
        dimensions: { width: 10, length: 12, radius: 0 },
        colorScheme: { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' },
        unit: 'feet'
      };

      const pos2D: Position2D = { x: 3, y: 7 };
      const result = convert2Dto3D(pos2D, room);

      expect(result.y).toBe(0);
    });
  });

  describe('convert3Dto2D', () => {
    it('should convert center of rectangular room correctly', () => {
      const room: Room = {
        id: '1',
        shape: 'rectangular',
        dimensions: { width: 10, length: 12, radius: 0 },
        colorScheme: { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' },
        unit: 'feet'
      };

      const pos3D: Vector3 = { x: 0, y: 0, z: 0 }; // Center in 3D
      const result = convert3Dto2D(pos3D, room);

      expect(result.x).toBe(5);
      expect(result.y).toBe(6);
    });

    it('should convert negative 3D coordinates correctly', () => {
      const room: Room = {
        id: '1',
        shape: 'rectangular',
        dimensions: { width: 10, length: 12, radius: 0 },
        colorScheme: { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' },
        unit: 'feet'
      };

      const pos3D: Vector3 = { x: -5, y: 0, z: -6 }; // Top-left in 3D
      const result = convert3Dto2D(pos3D, room);

      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });

    it('should convert positive 3D coordinates correctly', () => {
      const room: Room = {
        id: '1',
        shape: 'rectangular',
        dimensions: { width: 10, length: 12, radius: 0 },
        colorScheme: { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' },
        unit: 'feet'
      };

      const pos3D: Vector3 = { x: 5, y: 0, z: 6 }; // Bottom-right in 3D
      const result = convert3Dto2D(pos3D, room);

      expect(result.x).toBe(10);
      expect(result.y).toBe(12);
    });

    it('should ignore y coordinate in 3D position', () => {
      const room: Room = {
        id: '1',
        shape: 'rectangular',
        dimensions: { width: 10, length: 12, radius: 0 },
        colorScheme: { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' },
        unit: 'feet'
      };

      const pos3D1: Vector3 = { x: 2, y: 0, z: 3 };
      const pos3D2: Vector3 = { x: 2, y: 5, z: 3 };
      
      const result1 = convert3Dto2D(pos3D1, room);
      const result2 = convert3Dto2D(pos3D2, room);

      expect(result1.x).toBe(result2.x);
      expect(result1.y).toBe(result2.y);
    });
  });

  describe('Round-trip conversion', () => {
    it('should preserve coordinates through 2D->3D->2D conversion for rectangular room', () => {
      const room: Room = {
        id: '1',
        shape: 'rectangular',
        dimensions: { width: 10, length: 12, radius: 0 },
        colorScheme: { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' },
        unit: 'feet'
      };

      const original: Position2D = { x: 3, y: 7 };
      const pos3D = convert2Dto3D(original, room);
      const result = convert3Dto2D(pos3D, room);

      expect(result.x).toBeCloseTo(original.x, 10);
      expect(result.y).toBeCloseTo(original.y, 10);
    });

    it('should preserve coordinates through 3D->2D->3D conversion for square room', () => {
      const room: Room = {
        id: '1',
        shape: 'square',
        dimensions: { width: 8, length: 8, radius: 0 },
        colorScheme: { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' },
        unit: 'feet'
      };

      const original: Vector3 = { x: 2, y: 0, z: -3 };
      const pos2D = convert3Dto2D(original, room);
      const result = convert2Dto3D(pos2D, room);

      expect(result.x).toBeCloseTo(original.x, 10);
      expect(result.z).toBeCloseTo(original.z, 10);
      expect(result.y).toBe(0); // y is always 0 in 2D->3D conversion
    });

    it('should preserve coordinates through round-trip for circular room', () => {
      const room: Room = {
        id: '1',
        shape: 'circular',
        dimensions: { width: 0, length: 0, radius: 6 },
        colorScheme: { walls: '#FFFFFF', floor: '#CCCCCC', ceiling: '#EEEEEE' },
        unit: 'feet'
      };

      const original: Position2D = { x: 4, y: 8 };
      const pos3D = convert2Dto3D(original, room);
      const result = convert3Dto2D(pos3D, room);

      expect(result.x).toBeCloseTo(original.x, 10);
      expect(result.y).toBeCloseTo(original.y, 10);
    });
  });
});

// Property-Based Tests
import * as fc from 'fast-check';

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
  ).map(([r1, r2, g1, g2, b1, b2]) => `#${r1}${r2}${g1}${g2}${b1}${b2}`)
);

const colorSchemeArbitrary = () => fc.record({
  walls: hexColorArbitrary(),
  floor: hexColorArbitrary(),
  ceiling: hexColorArbitrary(),
});

const roomArbitrary = () => fc.record({
  id: fc.uuid(),
  shape: roomShapeArbitrary(),
  dimensions: fc.record({
    width: validDimensionArbitrary(),
    length: validDimensionArbitrary(),
    radius: validDimensionArbitrary(),
  }),
  colorScheme: colorSchemeArbitrary(),
  unit: fc.constantFrom('feet', 'meters') as fc.Arbitrary<Room['unit']>,
});

const position2DArbitrary = (room: Room) => {
  const width = room.shape === 'circular' ? room.dimensions.radius * 2 : room.dimensions.width;
  const length = room.shape === 'circular' ? room.dimensions.radius * 2 : room.dimensions.length;
  
  return fc.record({
    x: fc.float({ min: 0, max: width, noNaN: true }),
    y: fc.float({ min: 0, max: length, noNaN: true }),
  });
};

describe('Coordinate Conversion - Property Tests', () => {
  // Property 13: 2D-3D Coordinate Round Trip
  it('Property 13: 2D-3D Coordinate Round Trip', () => {
    fc.assert(
      fc.property(
        roomArbitrary().chain(room => 
          fc.tuple(fc.constant(room), position2DArbitrary(room))
        ),
        ([room, original2D]) => {
          // Convert 2D -> 3D -> 2D
          const pos3D = convert2Dto3D(original2D, room);
          const result2D = convert3Dto2D(pos3D, room);
          
          // The round trip should preserve the original coordinates
          // Using a tolerance for floating-point precision
          const tolerance = 1e-10;
          expect(Math.abs(result2D.x - original2D.x)).toBeLessThan(tolerance);
          expect(Math.abs(result2D.y - original2D.y)).toBeLessThan(tolerance);
        }
      ),
      { numRuns: 1000 }
    );
  });
});

// **Validates: Requirements 4.6**
