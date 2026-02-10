import { useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { getCurrentDesign } from '../store/selectors';
import { convert2Dto3D, convert3Dto2D } from '../utils/coordinates';

/**
 * RenderingCoordinator ensures view synchronization between 2D and 3D views.
 * 
 * This component:
 * - Subscribes to Redux store changes
 * - Validates coordinate consistency between views
 * - Ensures coordinate conversion is applied consistently
 * - Triggers re-renders when design state changes
 * 
 * Requirements: 4.6, 5.6
 */

interface RenderingCoordinatorProps {
  onStateChange?: () => void;
}

export const RenderingCoordinator: React.FC<RenderingCoordinatorProps> = ({ 
  onStateChange 
}) => {
  const design = useAppSelector(getCurrentDesign);
  const previousDesignRef = useRef(design);

  useEffect(() => {
    // Check if design state has changed
    if (design !== previousDesignRef.current) {
      previousDesignRef.current = design;

      // Validate coordinate consistency if design exists
      if (design && design.room && design.furniture.length > 0) {
        validateCoordinateConsistency(design);
      }

      // Notify parent component of state change
      if (onStateChange) {
        onStateChange();
      }
    }
  }, [design, onStateChange]);

  // This component doesn't render anything - it's purely for coordination
  return null;
};

/**
 * Validates that furniture positions are consistent when converted between 2D and 3D.
 * This ensures coordinate conversion is applied correctly.
 */
function validateCoordinateConsistency(design: NonNullable<ReturnType<typeof getCurrentDesign>>) {
  const { room, furniture } = design;

  for (const piece of furniture) {
    // Convert 2D position to 3D
    const pos3D = convert2Dto3D(
      { x: piece.position.x, y: piece.position.y },
      room
    );

    // Convert back to 2D
    const pos2D = convert3Dto2D(pos3D, room);

    // Check if round-trip conversion is consistent (within floating-point tolerance)
    const tolerance = 0.001;
    const xDiff = Math.abs(pos2D.x - piece.position.x);
    const yDiff = Math.abs(pos2D.y - piece.position.y);

    if (xDiff > tolerance || yDiff > tolerance) {
      console.warn(
        `Coordinate inconsistency detected for furniture ${piece.id}:`,
        `Original: (${piece.position.x}, ${piece.position.y})`,
        `After round-trip: (${pos2D.x}, ${pos2D.y})`,
        `Difference: (${xDiff}, ${yDiff})`
      );
    }
  }
}

/**
 * Hook for subscribing to design state changes.
 * This can be used by view components to trigger re-renders.
 */
export function useDesignStateSync(callback: () => void) {
  const design = useAppSelector(getCurrentDesign);
  const previousDesignRef = useRef(design);

  useEffect(() => {
    if (design !== previousDesignRef.current) {
      previousDesignRef.current = design;
      callback();
    }
  }, [design, callback]);
}
