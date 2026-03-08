import { useEffect, useState } from 'react';

/**
 * Custom hook for animating numbers from 0 to a target value
 * Uses requestAnimationFrame for smooth 60fps animation
 * 
 * @param targetValue - The final number to count up to
 * @param duration - Animation duration in milliseconds (default: 1000ms)
 * @param shouldStart - Boolean to control when animation starts (default: true)
 * @returns currentValue - The current animated value
 */
export const useCountAnimation = (
  targetValue: number,
  duration: number = 1000,
  shouldStart: boolean = true
): number => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    // Don't start animation if shouldStart is false
    if (!shouldStart) {
      return;
    }

    // If target is 0 or negative, just set it directly
    if (targetValue <= 0) {
      setCurrentValue(targetValue);
      return;
    }

    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation (easeOutQuad)
      const easedProgress = 1 - Math.pow(1 - progress, 2);
      
      const newValue = Math.floor(easedProgress * targetValue);
      setCurrentValue(newValue);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      } else {
        // Ensure we end exactly at target value
        setCurrentValue(targetValue);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [targetValue, duration, shouldStart]);

  return currentValue;
};
