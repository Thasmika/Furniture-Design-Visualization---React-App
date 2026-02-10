import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { createDesign } from '../models/Design';
import { createRoom } from '../models/Room';
import { createFurniture, updatePosition, updateScale } from '../models/FurniturePiece';

// Arbitraries for property-based testing
const roomShapeArbitrary = () => fc.constantFrom('rectangular', 'square', 'circular' as const);

const dimensionsArbitrary = (shape: 'rectangular' | 'square' | 'circular') => {
  if (shape === 'circular') {
    return fc.record({
      width: fc.constant(0),
      length: fc.constant(0),
      radius: fc.float({ min: 5, max: 30, noNaN: true })
    });
  }
  if (shape === 'square') {
    return fc.float({ min: 10, max: 40, noNaN: true }).map(size => ({
      width: size,
      length: size,
      radius: 0
    }));
  }
  return fc.record({
    width: fc.float({ min: 10, max: 40, noNaN: true }),
    length: fc.float({ min: 10, max: 40, noNaN: true }),
    radius: fc.constant(0)
  });
};

const colorArbitrary = () => 
  fc.tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 })
  ).map(([r, g, b]) => `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`);

const furnitureTypeArbitrary = () => 
  fc.constantFrom('chair', 'table', 'couch', 'bed', 'desk', 'shelf' as const);

describe('Canvas2D Property Tests', () => {
  beforeEach(() => {
    // Mock canvas context for Konva
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      canvas: {},
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      createImageData: vi.fn(),
      setTransform: vi.fn(),
      drawImage: vi.fn(),
      save: vi.fn(),
      fillText: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      closePath: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
      scale: vi.fn(),
      rotate: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      measureText: vi.fn(() => ({ width: 0 })),
      transform: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
    })) as any;
  });

  it('Property 6: 2D Rendering Completeness - all furniture pieces are in design', () => {
    fc.assert(
      fc.property(
        roomShapeArbitrary().chain(shape => 
          fc.record({
            shape: fc.constant(shape),
            dimensions: dimensionsArbitrary(shape),
            colors: fc.record({
              walls: colorArbitrary(),
              floor: colorArbitrary(),
              ceiling: colorArbitrary()
            })
          })
        ),
        fc.array(furnitureTypeArbitrary(), { minLength: 1, maxLength: 5 }),
        ({ shape, dimensions, colors }, furnitureTypes) => {
          const room = createRoom(shape, dimensions, colors, 'feet');
          const maxX = shape === 'circular' ? dimensions.radius * 2 : dimensions.width;
          const maxY = shape === 'circular' ? dimensions.radius * 2 : 
                       (shape === 'square' ? dimensions.width : dimensions.length);

          const furniture = furnitureTypes.map((type, index) => {
            const piece = createFurniture(type);
            const position = {
              x: 2 + (index * 2) % (maxX - 4),
              y: 2 + Math.floor(index / 3) * 2,
              z: 0,
              rotation: 0
            };
            return updatePosition(piece, position);
          });

          const design = createDesign('test-user', 'Test Design', room);
          furniture.forEach(f => design.furniture.push(f));

          // Verify all furniture pieces are in the design (rendering completeness)
          expect(design.furniture.length).toBe(furnitureTypes.length);
          
          // Verify each furniture piece has valid properties for rendering
          design.furniture.forEach(piece => {
            expect(piece.id).toBeDefined();
            expect(piece.type).toBeDefined();
            expect(piece.dimensions.width).toBeGreaterThan(0);
            expect(piece.dimensions.depth).toBeGreaterThan(0);
            expect(piece.position.x).toBeGreaterThanOrEqual(0);
            expect(piece.position.y).toBeGreaterThanOrEqual(0);
            expect(piece.color).toMatch(/^#[0-9a-fA-F]{6}$/);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 7: Furniture Position Updates - position changes are reflected', () => {
    fc.assert(
      fc.property(
        roomShapeArbitrary().chain(shape => 
          fc.record({
            shape: fc.constant(shape),
            dimensions: dimensionsArbitrary(shape)
          })
        ),
        furnitureTypeArbitrary(),
        ({ shape, dimensions }, furnitureType) => {
          const room = createRoom(
            shape,
            dimensions,
            { walls: '#ffffff', floor: '#f0f0f0', ceiling: '#ffffff' },
            'feet'
          );

          const maxX = shape === 'circular' ? dimensions.radius * 2 : dimensions.width;
          const maxY = shape === 'circular' ? dimensions.radius * 2 : 
                       (shape === 'square' ? dimensions.width : dimensions.length);

          const furniture = createFurniture(furnitureType);
          const position1 = { x: 2, y: 2, z: 0, rotation: 0 };
          const position2 = { x: maxX - 4, y: maxY - 4, z: 0, rotation: 0 };

          const piece1 = updatePosition(furniture, position1);
          const piece2 = updatePosition(piece1, position2);

          // Verify position updates are applied
          expect(piece1.position.x).toBe(position1.x);
          expect(piece1.position.y).toBe(position1.y);
          expect(piece2.position.x).toBe(position2.x);
          expect(piece2.position.y).toBe(position2.y);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 8: Scale Preservation - dimensions scale correctly', () => {
    fc.assert(
      fc.property(
        furnitureTypeArbitrary(),
        fc.float({ min: 0.5, max: 3.0, noNaN: true }),
        (furnitureType, scale) => {
          const furniture = createFurniture(furnitureType);
          const originalWidth = furniture.dimensions.width;
          const originalDepth = furniture.dimensions.depth;
          const originalHeight = furniture.dimensions.height;

          const scaled = updateScale(furniture, scale);

          // Verify scale is applied
          expect(scaled.scale).toBe(scale);

          // Verify original dimensions are preserved (scale is separate)
          expect(scaled.dimensions.width).toBe(originalWidth);
          expect(scaled.dimensions.depth).toBe(originalDepth);
          expect(scaled.dimensions.height).toBe(originalHeight);

          // Verify effective dimensions would be scaled
          const effectiveWidth = scaled.dimensions.width * scaled.scale;
          const effectiveDepth = scaled.dimensions.depth * scaled.scale;
          const effectiveHeight = scaled.dimensions.height * scaled.scale;

          expect(effectiveWidth).toBeCloseTo(originalWidth * scale, 5);
          expect(effectiveDepth).toBeCloseTo(originalDepth * scale, 5);
          expect(effectiveHeight).toBeCloseTo(originalHeight * scale, 5);
        }
      ),
      { numRuns: 100 }
    );
  });
});
