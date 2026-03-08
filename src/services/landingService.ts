import { getFirebaseFirestore } from './firebase';
import { collection, getDocs, getCountFromServer } from 'firebase/firestore';
import type { Statistics, Testimonial } from '../store/slices/landingSlice';

// Cache configuration
const CACHE_KEY = 'furnivision_landing_stats';
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Fallback values
const FALLBACK_STATISTICS: Statistics = {
  userCount: 1000,
  designCount: 5000,
  furnitureCount: 200,
};

// Furniture types count (matches FURNITURE_TYPES in FurnitureLibraryPanel)
const FURNITURE_LIBRARY_COUNT = 8;

interface CachedStatistics {
  data: Statistics;
  timestamp: number;
}

/**
 * Fetch user count from Firebase Authentication
 * Note: Firebase Auth doesn't provide a direct way to count users in client SDK
 * In production, this would need a Cloud Function or Admin SDK
 * For now, returns fallback value
 */
export const fetchUserCount = async (): Promise<number> => {
  try {
    // Firebase Auth client SDK doesn't support user count
    // This would require Firebase Admin SDK or a Cloud Function
    // For now, return fallback value
    return FALLBACK_STATISTICS.userCount;
  } catch (error) {
    console.error('Error fetching user count:', error);
    return FALLBACK_STATISTICS.userCount;
  }
};

/**
 * Fetch design count from Firestore designs collection
 */
export const fetchDesignCount = async (): Promise<number> => {
  try {
    const db = getFirebaseFirestore();
    const designsCollection = collection(db, 'designs');
    const designSnapshot = await getCountFromServer(designsCollection);
    return designSnapshot.data().count;
  } catch (error) {
    console.error('Error fetching design count:', error);
    return FALLBACK_STATISTICS.designCount;
  }
};

/**
 * Get furniture count from static library
 * Returns the count of furniture types available in the application
 */
export const getFurnitureCount = (): number => {
  return FURNITURE_LIBRARY_COUNT;
};

/**
 * Check if cached statistics are still valid
 */
export const getCachedStatistics = (): Statistics | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const { data, timestamp }: CachedStatistics = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is still valid (less than 1 hour old)
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }

    // Cache expired, remove it
    localStorage.removeItem(CACHE_KEY);
    return null;
  } catch (error) {
    console.error('Error reading cached statistics:', error);
    return null;
  }
};

/**
 * Cache statistics data
 */
export const cacheStatistics = (data: Statistics): void => {
  try {
    const cached: CachedStatistics = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
  } catch (error) {
    console.error('Error caching statistics:', error);
    // Continue without caching if localStorage is unavailable
  }
};

/**
 * Fetch statistics from Firebase
 */
export const fetchStatistics = async (): Promise<Statistics> => {
  try {
    // Fetch all statistics in parallel
    const [userCount, designCount] = await Promise.all([
      fetchUserCount(),
      fetchDesignCount(),
    ]);

    const furnitureCount = getFurnitureCount();

    const statistics: Statistics = {
      userCount,
      designCount,
      furnitureCount,
    };

    // Cache the results
    cacheStatistics(statistics);

    return statistics;
  } catch (error) {
    console.error('Error fetching statistics:', error);
    // Return fallback values on error
    return FALLBACK_STATISTICS;
  }
};

/**
 * Fetch statistics with cache check
 */
export const fetchStatisticsWithCache = async (): Promise<Statistics> => {
  // Check cache first
  const cached = getCachedStatistics();
  if (cached) {
    return cached;
  }

  // Fetch fresh data if cache miss
  return fetchStatistics();
};

/**
 * Validate testimonial data structure
 */
export const validateTestimonial = (testimonial: any): testimonial is Testimonial => {
  return (
    typeof testimonial.id === 'string' &&
    typeof testimonial.name === 'string' &&
    testimonial.name.length > 0 &&
    testimonial.name.length <= 50 &&
    (testimonial.avatar === null || typeof testimonial.avatar === 'string') &&
    typeof testimonial.rating === 'number' &&
    testimonial.rating >= 1 &&
    testimonial.rating <= 5 &&
    Number.isInteger(testimonial.rating) &&
    typeof testimonial.review === 'string' &&
    testimonial.review.length > 0 &&
    testimonial.review.length <= 200 &&
    typeof testimonial.date === 'string' &&
    typeof testimonial.verified === 'boolean'
  );
};

/**
 * Fetch testimonials from Firestore
 */
export const fetchTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const db = getFirebaseFirestore();
    const testimonialsCollection = collection(db, 'testimonials');
    const snapshot = await getDocs(testimonialsCollection);

    const testimonials: Testimonial[] = [];

    snapshot.forEach((doc) => {
      const data = { id: doc.id, ...doc.data() };
      
      // Validate testimonial data
      if (validateTestimonial(data)) {
        testimonials.push(data);
      } else {
        console.warn('Invalid testimonial data:', doc.id);
      }
    });

    return testimonials;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    // Return empty array on error
    return [];
  }
};
