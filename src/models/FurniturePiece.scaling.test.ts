import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createFurniture, updateScale, type FurnitureType } from './FurniturePiece';

describe('FurniturePiece - Property-Based Tests', () => {
  // Feature: furniture-design-visualizer, Property 15: Proportional Scaling with Aspect Ratio Preservation
  // **Validates: Requirements 5.2, 5.5**
  describe('Property 15: Proportional Scaling with Aspect Ratio Preservation', () => {
    it('should scale all dimensions proportionally, preserving aspect ratio', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<FurnitureType>('chair', 'table', 'couch', 'bed', 'desk', 'shelf'),
          fc.double({ min: 0.5, max: 3.0, noNaN: true }),
          (furnitureType, scaleFactor) => {
            // Create furniture piece
            const furniture = createFurniture(furnitureType);
            
            // Store original dimensions
            const originalWidth = furniture.dimensions.width;
            const originalDepth = furniture.dimensions.depth;
            const originalHeight = furniture.dimensions.height;
            
            // Calculate original aspect ratios
            const originalWidthToDepth = originalWidth / originalDepth;
            const originalWidthToHeight = originalWidth / originalHeight;
            const originalDepthToHeight = originalDepth / originalHeight;
            
            // Apply scale
            const scaled = updateScale(furniture, scaleFactor);
            
            // Calculate scaled dimensions (dimensions * scale)
            const expectedWidth = originalWidth * scaleFactor;
            const expectedDepth = originalDepth * scaleFactor;
            const expectedHeight = originalHeight * scaleFactor;
            
            // Verify scale property is updated
            expect(scaled.scale).toBe(scaleFactor);
            
            // Verify original dimensions are preserved (not modified)
            expect(scaled.dimensions.width).toBe(originalWidth);
            expect(scaled.dimensions.depth).toBe(originalDepth);
            expect(scaled.dimensions.height).toBe(originalHeight);
            
            // Calculate effective scaled dimensions
            const effectiveWidth = scaled.dimensions.width * scaled.scale;
            const effectiveDepth = scaled.dimensions.depth * scaled.scale;
            const effectiveHeight = scaled.dimensions.height * scaled.scale;
            
            // Verify effective dimensions match expected (within floating point tolerance)
            expect(Math.abs(effectiveWidth - expectedWidth)).toBeLessThan(0.0001);
            expect(Math.abs(effectiveDepth - expectedDepth)).toBeLessThan(0.0001);
            expect(Math.abs(effectiveHeight - expectedHeight)).toBeLessThan(0.0001);
            
            // Verify aspect ratios are preserved
            const newWidthToDepth = effectiveWidth / effectiveDepth;
            const newWidthToHeight = effectiveWidth / effectiveHeight;
            const newDepthToHeight = effectiveDepth / effectiveHeight;
            
            expect(Math.abs(newWidthToDepth - originalWidthToDepth)).toBeLessThan(0.0001);
            expect(Math.abs(newWidthToHeight - originalWidthToHeight)).toBeLessThan(0.0001);
            expect(Math.abs(newDepthToHeight - originalDepthToHeight)).toBeLessThan(0.0001);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject scale factors outside valid range (0.5-3.0)', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<FurnitureType>('chair', 'table', 'couch', 'bed', 'desk', 'shelf'),
          fc.oneof(
            fc.double({ min: -10, max: 0.49, noNaN: true }),
            fc.double({ min: 3.01, max: 10, noNaN: true })
          ),
          (furnitureType, invalidScale) => {
            const furniture = createFurniture(furnitureType);
            
            // Should throw error for invalid scale
            expect(() => updateScale(furniture, invalidScale)).toThrow();
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should maintain proportionality across multiple scale operations', () => {
      fc.assert(
        fc.property(
          fc.constantFrom<FurnitureType>('chair', 'table', 'couch', 'bed', 'desk', 'shelf'),
          fc.array(fc.double({ min: 0.5, max: 3.0, noNaN: true }), { minLength: 2, maxLength: 5 }),
          (furnitureType, scaleFactors) => {
            let furniture = createFurniture(furnitureType);
            
            // Store original dimensions
            const originalWidth = furniture.dimensions.width;
            const originalDepth = furniture.dimensions.depth;
            const originalHeight = furniture.dimensions.height;
            
            // Calculate original aspect ratios
            const originalWidthToDepth = originalWidth / originalDepth;
            const originalDepthToHeight = originalDepth / originalHeight;
            
            // Apply multiple scale operations
            for (const scale of scaleFactors) {
              furniture = updateScale(furniture, scale);
            }
            
            // Calculate final effective dimensions
            const finalWidth = furniture.dimensions.width * furniture.scale;
            const finalDepth = furniture.dimensions.depth * furniture.scale;
            const finalHeight = furniture.dimensions.height * furniture.scale;
            
            // Verify aspect ratios are still preserved
            const finalWidthToDepth = finalWidth / finalDepth;
            const finalDepthToHeight = finalDepth / finalHeight;
            
            expect(Math.abs(finalWidthToDepth - originalWidthToDepth)).toBeLessThan(0.0001);
            expect(Math.abs(finalDepthToHeight - originalDepthToHeight)).toBeLessThan(0.0001);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
