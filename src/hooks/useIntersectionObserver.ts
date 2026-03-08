import { useEffect, useState, RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
}

/**
 * Custom hook for detecting when an element enters the viewport
 * Used to trigger animations when sections become visible
 * 
 * @param elementRef - React ref to the element to observe
 * @param options - Intersection Observer options (threshold, rootMargin, root)
 * @returns isVisible - Boolean indicating if element is currently visible
 */
export const useIntersectionObserver = (
  elementRef: RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): boolean => {
  const [isVisible, setIsVisible] = useState(false);
  
  const { threshold = 0.1, rootMargin = '0px', root = null } = options;

  useEffect(() => {
    const element = elementRef.current;
    
    // If element doesn't exist or IntersectionObserver is not supported, return
    if (!element || typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Set visible when element enters viewport
          if (entry.isIntersecting) {
            setIsVisible(true);
            // Once visible, we can stop observing (for one-time animations)
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin, root }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [elementRef, threshold, rootMargin, root]);

  return isVisible;
};
