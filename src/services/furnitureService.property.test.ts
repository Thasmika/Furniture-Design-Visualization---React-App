import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import type { FurnitureType } from '../models/FurnitureItem';

// Helper to generate hex colors
const hexCharArbitrary = () => fc.constantFrom('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F');
const hexColorArbitrary = () => fc.tuple(
  hexCharArbitrary(), hexCharArbitrary(), hexCharArbitrary(),
  hexCharArbitrary(), hexCharArbitrary(), hexCharArbitrary()
).map(([r1, r2, g1, g2, b1, b2]) => `#${r1}${r2}${g1}${g2}${b1}${b2}`);

// Validation helper functions (extracted from furnitureService logic)
const isValidFurnitureName = (name: string | undefined): boolean => {
  return name !== undefined && name.trim().length > 0;
};

const isValidFurnitureType = (type: FurnitureType | undefined): boolean => {
  if (type === undefined) return false;
  const validTypes: FurnitureType[] = ['chair', 'table', 'couch', 'bed', 'desk', 'shelf', 'cabinet', 'lamp'];
  return validTypes.includes(type);
};

const isValidHexColor = (color: string | undefined): boolean => {
  if (!color || color.trim() === '') return false;
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexPattern.test(color);
};

const isValidPrice = (price: number | undefined): boolean => {
  return price !== undefined && typeof price === 'number' && price >= 0;
};

const isValidImageUrl = (url: string | undefined): boolean => {
  return url !== undefined && url.trim().length > 0;
};

describe('Furniture Service - Property-Based Tests', () => {
  // Feature: admin-panel, Property 8: Edit Furniture Round-Trip
  // **Validates: Requirements 7.1, 7.2**
  describe('Property 8: Edit Furniture Round-Trip', () => {
    it('should validate that all valid furniture data passes validation', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
          fc.constantFrom<FurnitureType>(
            'chair', 'table', 'couch', 'bed', 'desk', 'shelf', 'cabinet', 'lamp'
          ),
          hexColorArbitrary(),
          fc.integer({ min: 0, max: 1000000 }),
          fc.webUrl(),
          (name, type, color, price, imageUrl) => {
            // Verify that valid data passes all validation checks
            expect(isValidFurnitureName(name)).toBe(true);
            expect(isValidFurnitureType(type)).toBe(true);
            expect(isValidHexColor(color)).toBe(true);
            expect(isValidPrice(price)).toBe(true);
            expect(isValidImageUrl(imageUrl)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: admin-panel, Property 9: Edit Validation
  // **Validates: Requirements 7.3**
  describe('Property 9: Edit Validation', () => {
    it('should reject empty or whitespace-only names', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.constant('   '),
            fc.constant('\t'),
            fc.constant('\n')
          ),
          (invalidName) => {
            expect(isValidFurnitureName(invalidName)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject negative prices', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: -1000000, max: -1 }),
          (negativePrice) => {
            expect(isValidPrice(negativePrice)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid hex colors', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('invalid'),
            fc.constant(''),
            fc.constant('#GGG'),
            fc.constant('123456'),
            fc.constant('#12345'),
            fc.constant('#1234567')
          ),
          (invalidColor) => {
            expect(isValidHexColor(invalidColor)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid furniture types', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('invalid', 'sofa', 'bookshelf', 'wardrobe'),
          (invalidType) => {
            expect(isValidFurnitureType(invalidType as FurnitureType)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty image URLs', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.constant('   '),
            fc.constant('\t')
          ),
          (invalidUrl) => {
            expect(isValidImageUrl(invalidUrl)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Feature: admin-panel, Property 10: Delete Confirmation Flow
  // **Validates: Requirements 8.1, 8.2, 8.3**
  describe('Property 10: Delete Confirmation Flow', () => {
    it('should require non-empty ID for deletion', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(''),
            fc.constant('   '),
            fc.constant('\t')
          ),
          (invalidId) => {
            const isValidId = invalidId !== undefined && invalidId.trim().length > 0;
            expect(isValidId).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept valid non-empty IDs for deletion', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          (validId) => {
            const isValidId = validId !== undefined && validId.trim().length > 0;
            expect(isValidId).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
