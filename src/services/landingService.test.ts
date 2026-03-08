import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getCachedStatistics,
  cacheStatistics,
  fetchStatistics,
  fetchStatisticsWithCache,
  validateTestimonial,
  fetchTestimonials,
} from './landingService';
import type { Statistics, Testimonial } from '../store/slices/landingSlice';
import * as firebase from './firebase';
import { collection, getDocs, getCountFromServer } from 'firebase/firestore';

// Mock Firebase
vi.mock('./firebase');
vi.mock('firebase/firestore');

describe('landingService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getCachedStatistics', () => {
    it('should return null when no cache exists', () => {
      const result = getCachedStatistics();
      expect(result).toBeNull();
    });

    it('should return cached data when cache is valid', () => {
      const mockStats: Statistics = {
        userCount: 1500,
        designCount: 6000,
        furnitureCount: 8,
      };
      const cached = {
        data: mockStats,
        timestamp: Date.now(),
      };
      localStorage.setItem('furnivision_landing_stats', JSON.stringify(cached));

      const result = getCachedStatistics();
      expect(result).toEqual(mockStats);
    });

    it('should return null when cache is expired', () => {
      const mockStats: Statistics = {
        userCount: 1500,
        designCount: 6000,
        furnitureCount: 8,
      };
      const cached = {
        data: mockStats,
        timestamp: Date.now() - 3700000, // More than 1 hour ago
      };
      localStorage.setItem('furnivision_landing_stats', JSON.stringify(cached));

      const result = getCachedStatistics();
      expect(result).toBeNull();
      // Cache should be removed
      expect(localStorage.getItem('furnivision_landing_stats')).toBeNull();
    });

    it('should return null when cache data is corrupted', () => {
      localStorage.setItem('furnivision_landing_stats', 'invalid json');

      const result = getCachedStatistics();
      expect(result).toBeNull();
    });
  });

  describe('cacheStatistics', () => {
    it('should cache statistics with timestamp', () => {
      const mockStats: Statistics = {
        userCount: 1500,
        designCount: 6000,
        furnitureCount: 8,
      };

      cacheStatistics(mockStats);

      const cached = localStorage.getItem('furnivision_landing_stats');
      expect(cached).not.toBeNull();

      const parsed = JSON.parse(cached!);
      expect(parsed.data).toEqual(mockStats);
      expect(parsed.timestamp).toBeGreaterThan(0);
    });

    it('should handle localStorage errors gracefully', () => {
      const mockStats: Statistics = {
        userCount: 1500,
        designCount: 6000,
        furnitureCount: 8,
      };

      // Mock localStorage.setItem to throw error
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      // Should not throw
      expect(() => cacheStatistics(mockStats)).not.toThrow();

      setItemSpy.mockRestore();
    });
  });

  describe('fetchStatistics', () => {
    it('should fetch statistics from Firebase', async () => {
      const mockDb = {};
      vi.mocked(firebase.getFirebaseFirestore).mockReturnValue(mockDb as any);

      const mockCollection = {};
      vi.mocked(collection).mockReturnValue(mockCollection as any);

      const mockSnapshot = {
        data: () => ({ count: 7500 }),
      };
      vi.mocked(getCountFromServer).mockResolvedValue(mockSnapshot as any);

      const result = await fetchStatistics();

      expect(result).toEqual({
        userCount: 1000, // Fallback value
        designCount: 7500,
        furnitureCount: 8,
      });
    });

    it('should return fallback values on error', async () => {
      vi.mocked(firebase.getFirebaseFirestore).mockImplementation(() => {
        throw new Error('Firebase error');
      });

      const result = await fetchStatistics();

      expect(result).toEqual({
        userCount: 1000,
        designCount: 5000,
        furnitureCount: 8, // Static count from library, not a fallback
      });
    });

    it('should cache the fetched statistics', async () => {
      const mockDb = {};
      vi.mocked(firebase.getFirebaseFirestore).mockReturnValue(mockDb as any);

      const mockCollection = {};
      vi.mocked(collection).mockReturnValue(mockCollection as any);

      const mockSnapshot = {
        data: () => ({ count: 7500 }),
      };
      vi.mocked(getCountFromServer).mockResolvedValue(mockSnapshot as any);

      await fetchStatistics();

      const cached = localStorage.getItem('furnivision_landing_stats');
      expect(cached).not.toBeNull();

      const parsed = JSON.parse(cached!);
      expect(parsed.data.designCount).toBe(7500);
    });
  });

  describe('fetchStatisticsWithCache', () => {
    it('should return cached data if available', async () => {
      const mockStats: Statistics = {
        userCount: 1500,
        designCount: 6000,
        furnitureCount: 8,
      };
      const cached = {
        data: mockStats,
        timestamp: Date.now(),
      };
      localStorage.setItem('furnivision_landing_stats', JSON.stringify(cached));

      const result = await fetchStatisticsWithCache();

      expect(result).toEqual(mockStats);
      // Firebase should not be called
      expect(firebase.getFirebaseFirestore).not.toHaveBeenCalled();
    });

    it('should fetch fresh data if cache is expired', async () => {
      const mockDb = {};
      vi.mocked(firebase.getFirebaseFirestore).mockReturnValue(mockDb as any);

      const mockCollection = {};
      vi.mocked(collection).mockReturnValue(mockCollection as any);

      const mockSnapshot = {
        data: () => ({ count: 8000 }),
      };
      vi.mocked(getCountFromServer).mockResolvedValue(mockSnapshot as any);

      const result = await fetchStatisticsWithCache();

      expect(result.designCount).toBe(8000);
      expect(firebase.getFirebaseFirestore).toHaveBeenCalled();
    });
  });

  describe('validateTestimonial', () => {
    const validTestimonial: Testimonial = {
      id: '1',
      name: 'John Doe',
      avatar: 'https://example.com/avatar.jpg',
      rating: 5,
      review: 'Great app!',
      date: '2024-01-01',
      verified: true,
    };

    it('should validate a correct testimonial', () => {
      expect(validateTestimonial(validTestimonial)).toBe(true);
    });

    it('should accept null avatar', () => {
      const testimonial = { ...validTestimonial, avatar: null };
      expect(validateTestimonial(testimonial)).toBe(true);
    });

    it('should reject testimonial with missing id', () => {
      const testimonial = { ...validTestimonial };
      delete (testimonial as any).id;
      expect(validateTestimonial(testimonial)).toBe(false);
    });

    it('should reject testimonial with empty name', () => {
      const testimonial = { ...validTestimonial, name: '' };
      expect(validateTestimonial(testimonial)).toBe(false);
    });

    it('should reject testimonial with name too long', () => {
      const testimonial = { ...validTestimonial, name: 'a'.repeat(51) };
      expect(validateTestimonial(testimonial)).toBe(false);
    });

    it('should reject testimonial with invalid rating', () => {
      expect(validateTestimonial({ ...validTestimonial, rating: 0 })).toBe(false);
      expect(validateTestimonial({ ...validTestimonial, rating: 6 })).toBe(false);
      expect(validateTestimonial({ ...validTestimonial, rating: 3.5 })).toBe(false);
    });

    it('should reject testimonial with empty review', () => {
      const testimonial = { ...validTestimonial, review: '' };
      expect(validateTestimonial(testimonial)).toBe(false);
    });

    it('should reject testimonial with review too long', () => {
      const testimonial = { ...validTestimonial, review: 'a'.repeat(201) };
      expect(validateTestimonial(testimonial)).toBe(false);
    });

    it('should reject testimonial with missing verified field', () => {
      const testimonial = { ...validTestimonial };
      delete (testimonial as any).verified;
      expect(validateTestimonial(testimonial)).toBe(false);
    });
  });

  describe('fetchTestimonials', () => {
    it('should fetch and validate testimonials from Firestore', async () => {
      const mockDb = {};
      vi.mocked(firebase.getFirebaseFirestore).mockReturnValue(mockDb as any);

      const mockCollection = {};
      vi.mocked(collection).mockReturnValue(mockCollection as any);

      const mockDocs = [
        {
          id: '1',
          data: () => ({
            name: 'John Doe',
            avatar: null,
            rating: 5,
            review: 'Excellent!',
            date: '2024-01-01',
            verified: true,
          }),
        },
        {
          id: '2',
          data: () => ({
            name: 'Jane Smith',
            avatar: 'https://example.com/avatar.jpg',
            rating: 4,
            review: 'Very good',
            date: '2024-01-02',
            verified: false,
          }),
        },
      ];

      const mockSnapshot = {
        forEach: (callback: any) => mockDocs.forEach(callback),
      };

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const result = await fetchTestimonials();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('John Doe');
      expect(result[1].name).toBe('Jane Smith');
    });

    it('should filter out invalid testimonials', async () => {
      const mockDb = {};
      vi.mocked(firebase.getFirebaseFirestore).mockReturnValue(mockDb as any);

      const mockCollection = {};
      vi.mocked(collection).mockReturnValue(mockCollection as any);

      const mockDocs = [
        {
          id: '1',
          data: () => ({
            name: 'John Doe',
            avatar: null,
            rating: 5,
            review: 'Excellent!',
            date: '2024-01-01',
            verified: true,
          }),
        },
        {
          id: '2',
          data: () => ({
            name: '', // Invalid: empty name
            avatar: null,
            rating: 5,
            review: 'Good',
            date: '2024-01-02',
            verified: false,
          }),
        },
        {
          id: '3',
          data: () => ({
            name: 'Jane Smith',
            avatar: null,
            rating: 10, // Invalid: rating out of range
            review: 'Great',
            date: '2024-01-03',
            verified: true,
          }),
        },
      ];

      const mockSnapshot = {
        forEach: (callback: any) => mockDocs.forEach(callback),
      };

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const result = await fetchTestimonials();

      // Only the first testimonial should be valid
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('John Doe');
    });

    it('should return empty array on error', async () => {
      vi.mocked(firebase.getFirebaseFirestore).mockImplementation(() => {
        throw new Error('Firebase error');
      });

      const result = await fetchTestimonials();

      expect(result).toEqual([]);
    });
  });
});
