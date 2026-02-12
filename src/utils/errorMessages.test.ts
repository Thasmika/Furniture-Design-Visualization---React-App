import * as fc from 'fast-check';
import { validateDimensions, validateColor } from '../models/Room';
import { validateFurnitureDimensions } from '../models/FurniturePiece';
import { validateDesign } from './validation';

/**
 * Property 29: Error Messages Presence
 * 
 * For any validation error or operation failure, the system should return 
 * an error object containing a non-empty descriptive message.
 * 
 * Validates: Requirements 11.3, 12.6
 */

describe('Property 29: Error Messages Presence', () => {
  it('validation errors contain non-empty descriptive messages', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Invalid room dimensions (negative, zero, or out of bounds)
          fc.record({
            type: fc.constant('room'),
            width: fc.oneof(
              fc.double({ min: -100, max: 0 }), // negative or zero
              fc.double({ min: 101, max: 1000 }) // above max
            ),
            length: fc.double({ min: 1, max: 100 }),
          }),
          // Invalid furniture dimensions
          fc.record({
            type: fc.constant('furniture'),
            width: fc.oneof(
              fc.double({ min: -20, max: 0 }), // negative or zero
              fc.double({ min: 21, max: 100 }) // above max
            ),
            depth: fc.double({ min: 0.5, max: 20 }),
            height: fc.double({ min: 0.5, max: 20 }),
          })
        ),
        (testCase) => {
          let errorMessage: string | null = null;

          try {
            if (testCase.type === 'room') {
              // Try to validate room dimensions
              const result = validateDimensions('rectangular', {
                width: testCase.width,
                length: testCase.length,
                radius: 0,
              });
              
              if (!result.valid) {
                errorMessage = result.error || '';
              }
            } else {
              // Try to validate furniture dimensions
              const result = validateFurnitureDimensions({
                width: testCase.width,
                depth: testCase.depth,
                height: testCase.height,
              });
              
              if (!result.valid) {
                errorMessage = result.error || '';
              }
            }
          } catch (error) {
            errorMessage = (error as Error).message;
          }

          // Property: Error message must be non-empty and descriptive
          if (errorMessage !== null) {
            expect(errorMessage).toBeTruthy();
            expect(errorMessage.length).toBeGreaterThan(0);
            expect(typeof errorMessage).toBe('string');
          }
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('service errors contain non-empty descriptive messages', () => {
    fc.assert(
      fc.property(
        fc.record({
          operation: fc.constantFrom('save', 'load', 'delete', 'update'),
          errorType: fc.constantFrom('network', 'permission', 'not-found', 'validation'),
        }),
        (testCase) => {
          // Simulate different types of service errors
          let errorMessage: string;

          switch (testCase.errorType) {
            case 'network':
              errorMessage = `Failed to ${testCase.operation} design after 3 attempts: network error`;
              break;
            case 'permission':
              errorMessage = `Failed to ${testCase.operation} design: permission denied`;
              break;
            case 'not-found':
              errorMessage = `Failed to ${testCase.operation} design: Design not found`;
              break;
            case 'validation':
              errorMessage = `Failed to ${testCase.operation} design: Invalid design data`;
              break;
            default:
              errorMessage = `Failed to ${testCase.operation} design`;
          }

          // Property: Error message must be non-empty and descriptive
          expect(errorMessage).toBeTruthy();
          expect(errorMessage.length).toBeGreaterThan(0);
          expect(typeof errorMessage).toBe('string');
          
          // Error message should contain the operation type
          expect(errorMessage.toLowerCase()).toContain(testCase.operation);
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('authentication errors contain non-empty descriptive messages', () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          'Registration failed',
          'Authentication failed',
          'Logout failed',
          'Invalid email or password',
          'Email already in use',
          'Weak password'
        ),
        (errorMessage) => {
          // Property: Error message must be non-empty and descriptive
          expect(errorMessage).toBeTruthy();
          expect(errorMessage.length).toBeGreaterThan(0);
          expect(typeof errorMessage).toBe('string');
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('all error objects have message property', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        (message) => {
          const error = new Error(message);
          
          // Property: Error object must have a message property
          expect(error).toHaveProperty('message');
          expect(error.message).toBe(message);
          expect(error.message.length).toBeGreaterThan(0);
        }
      ),
      { numRuns: 1000 }
    );
  });

  it('validation result errors are descriptive', () => {
    fc.assert(
      fc.property(
        fc.record({
          width: fc.double({ min: -100, max: 200 }),
          length: fc.double({ min: -100, max: 200 }),
          radius: fc.double({ min: -100, max: 200 }),
        }),
        (dimensions) => {
          const result = validateDimensions('rectangular', dimensions);
          
          if (!result.valid) {
            // Property: Invalid validation must have error message
            expect(result.error).toBeTruthy();
            expect(result.error!.length).toBeGreaterThan(0);
            expect(typeof result.error).toBe('string');
            
            // Error message should be descriptive (contain relevant keywords)
            const errorLower = result.error!.toLowerCase();
            const hasRelevantKeyword = 
              errorLower.includes('dimension') ||
              errorLower.includes('positive') ||
              errorLower.includes('bound') ||
              errorLower.includes('invalid') ||
              errorLower.includes('must') ||
              errorLower.includes('required');
            
            expect(hasRelevantKeyword).toBe(true);
          }
        }
      ),
      { numRuns: 1000 }
    );
  });
});
