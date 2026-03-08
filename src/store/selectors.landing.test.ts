import { describe, it, expect } from 'vitest';
import {
  selectStatistics,
  selectTestimonials,
  selectStatisticsLoading,
  selectTestimonialsLoading,
  selectStatisticsError,
  selectTestimonialsError,
  selectStatisticsLastFetched,
} from './selectors';
import type { RootState } from './index';
import type { Statistics, Testimonial } from './slices/landingSlice';

describe('Landing Page Selectors', () => {
  const mockStatistics: Statistics = {
    userCount: 1500,
    designCount: 6000,
    furnitureCount: 8,
  };

  const mockTestimonials: Testimonial[] = [
    {
      id: '1',
      name: 'John Doe',
      avatar: null,
      rating: 5,
      review: 'Great app!',
      date: '2024-01-01',
      verified: true,
    },
    {
      id: '2',
      name: 'Jane Smith',
      avatar: 'https://example.com/avatar.jpg',
      rating: 4,
      review: 'Very useful',
      date: '2024-01-02',
      verified: false,
    },
  ];

  const createMockState = (overrides?: Partial<RootState>): RootState => ({
    auth: {
      user: null,
      loading: false,
      error: null,
    },
    design: {
      current: null,
      saved: [],
      loading: false,
      error: null,
      isDirty: false,
    },
    ui: {
      selectedFurnitureId: null,
      activeView: '2d',
      showGrid: true,
      snapToGrid: true,
      sidebarOpen: true,
    },
    landing: {
      statistics: {
        data: null,
        loading: false,
        error: null,
        lastFetched: null,
      },
      testimonials: {
        data: [],
        loading: false,
        error: null,
      },
    },
    ...overrides,
  });

  describe('selectStatistics', () => {
    it('should return null when no statistics data', () => {
      const state = createMockState();
      expect(selectStatistics(state)).toBeNull();
    });

    it('should return statistics data when available', () => {
      const state = createMockState({
        landing: {
          statistics: {
            data: mockStatistics,
            loading: false,
            error: null,
            lastFetched: Date.now(),
          },
          testimonials: {
            data: [],
            loading: false,
            error: null,
          },
        },
      });

      expect(selectStatistics(state)).toEqual(mockStatistics);
    });
  });

  describe('selectTestimonials', () => {
    it('should return empty array when no testimonials', () => {
      const state = createMockState();
      expect(selectTestimonials(state)).toEqual([]);
    });

    it('should return testimonials data when available', () => {
      const state = createMockState({
        landing: {
          statistics: {
            data: null,
            loading: false,
            error: null,
            lastFetched: null,
          },
          testimonials: {
            data: mockTestimonials,
            loading: false,
            error: null,
          },
        },
      });

      expect(selectTestimonials(state)).toEqual(mockTestimonials);
    });
  });

  describe('selectStatisticsLoading', () => {
    it('should return false when not loading', () => {
      const state = createMockState();
      expect(selectStatisticsLoading(state)).toBe(false);
    });

    it('should return true when loading', () => {
      const state = createMockState({
        landing: {
          statistics: {
            data: null,
            loading: true,
            error: null,
            lastFetched: null,
          },
          testimonials: {
            data: [],
            loading: false,
            error: null,
          },
        },
      });

      expect(selectStatisticsLoading(state)).toBe(true);
    });
  });

  describe('selectTestimonialsLoading', () => {
    it('should return false when not loading', () => {
      const state = createMockState();
      expect(selectTestimonialsLoading(state)).toBe(false);
    });

    it('should return true when loading', () => {
      const state = createMockState({
        landing: {
          statistics: {
            data: null,
            loading: false,
            error: null,
            lastFetched: null,
          },
          testimonials: {
            data: [],
            loading: true,
            error: null,
          },
        },
      });

      expect(selectTestimonialsLoading(state)).toBe(true);
    });
  });

  describe('selectStatisticsError', () => {
    it('should return null when no error', () => {
      const state = createMockState();
      expect(selectStatisticsError(state)).toBeNull();
    });

    it('should return error message when error exists', () => {
      const state = createMockState({
        landing: {
          statistics: {
            data: null,
            loading: false,
            error: 'Network error',
            lastFetched: null,
          },
          testimonials: {
            data: [],
            loading: false,
            error: null,
          },
        },
      });

      expect(selectStatisticsError(state)).toBe('Network error');
    });
  });

  describe('selectTestimonialsError', () => {
    it('should return null when no error', () => {
      const state = createMockState();
      expect(selectTestimonialsError(state)).toBeNull();
    });

    it('should return error message when error exists', () => {
      const state = createMockState({
        landing: {
          statistics: {
            data: null,
            loading: false,
            error: null,
            lastFetched: null,
          },
          testimonials: {
            data: [],
            loading: false,
            error: 'Database error',
          },
        },
      });

      expect(selectTestimonialsError(state)).toBe('Database error');
    });
  });

  describe('selectStatisticsLastFetched', () => {
    it('should return null when never fetched', () => {
      const state = createMockState();
      expect(selectStatisticsLastFetched(state)).toBeNull();
    });

    it('should return timestamp when fetched', () => {
      const timestamp = Date.now();
      const state = createMockState({
        landing: {
          statistics: {
            data: mockStatistics,
            loading: false,
            error: null,
            lastFetched: timestamp,
          },
          testimonials: {
            data: [],
            loading: false,
            error: null,
          },
        },
      });

      expect(selectStatisticsLastFetched(state)).toBe(timestamp);
    });
  });

  describe('selector memoization', () => {
    it('should return same reference when state unchanged', () => {
      const state = createMockState({
        landing: {
          statistics: {
            data: mockStatistics,
            loading: false,
            error: null,
            lastFetched: Date.now(),
          },
          testimonials: {
            data: mockTestimonials,
            loading: false,
            error: null,
          },
        },
      });

      const result1 = selectStatistics(state);
      const result2 = selectStatistics(state);

      expect(result1).toBe(result2);
    });

    it('should return new reference when state changed', () => {
      const state1 = createMockState({
        landing: {
          statistics: {
            data: mockStatistics,
            loading: false,
            error: null,
            lastFetched: Date.now(),
          },
          testimonials: {
            data: [],
            loading: false,
            error: null,
          },
        },
      });

      const newStatistics: Statistics = {
        userCount: 2000,
        designCount: 7000,
        furnitureCount: 8,
      };

      const state2 = createMockState({
        landing: {
          statistics: {
            data: newStatistics,
            loading: false,
            error: null,
            lastFetched: Date.now(),
          },
          testimonials: {
            data: [],
            loading: false,
            error: null,
          },
        },
      });

      const result1 = selectStatistics(state1);
      const result2 = selectStatistics(state2);

      expect(result1).not.toBe(result2);
      expect(result1).toEqual(mockStatistics);
      expect(result2).toEqual(newStatistics);
    });
  });
});
