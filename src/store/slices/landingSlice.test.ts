import { describe, it, expect, beforeEach, vi } from 'vitest';
import landingReducer, {
  fetchStatisticsAsync,
  fetchTestimonialsAsync,
  clearStatisticsError,
  clearTestimonialsError,
  type LandingPageState,
  type Statistics,
  type Testimonial,
} from './landingSlice';

// Mock the landing service
vi.mock('../../services/landingService');

describe('landingSlice', () => {
  let initialState: LandingPageState;

  beforeEach(() => {
    initialState = {
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
    };
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should return the initial state', () => {
      const state = landingReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });
  });

  describe('clearStatisticsError', () => {
    it('should clear statistics error', () => {
      const stateWithError: LandingPageState = {
        ...initialState,
        statistics: {
          ...initialState.statistics,
          error: 'Some error',
        },
      };

      const state = landingReducer(stateWithError, clearStatisticsError());
      expect(state.statistics.error).toBeNull();
    });
  });

  describe('clearTestimonialsError', () => {
    it('should clear testimonials error', () => {
      const stateWithError: LandingPageState = {
        ...initialState,
        testimonials: {
          ...initialState.testimonials,
          error: 'Some error',
        },
      };

      const state = landingReducer(stateWithError, clearTestimonialsError());
      expect(state.testimonials.error).toBeNull();
    });
  });

  describe('fetchStatisticsAsync', () => {
    const mockStatistics: Statistics = {
      userCount: 1500,
      designCount: 6000,
      furnitureCount: 8,
    };

    it('should set loading to true when pending', () => {
      const action = { type: fetchStatisticsAsync.pending.type };
      const state = landingReducer(initialState, action);

      expect(state.statistics.loading).toBe(true);
      expect(state.statistics.error).toBeNull();
    });

    it('should set statistics data when fulfilled', () => {
      const action = {
        type: fetchStatisticsAsync.fulfilled.type,
        payload: mockStatistics,
      };
      const state = landingReducer(initialState, action);

      expect(state.statistics.loading).toBe(false);
      expect(state.statistics.data).toEqual(mockStatistics);
      expect(state.statistics.error).toBeNull();
      expect(state.statistics.lastFetched).toBeGreaterThan(0);
    });

    it('should set error when rejected', () => {
      const action = {
        type: fetchStatisticsAsync.rejected.type,
        error: { message: 'Network error' },
      };
      const state = landingReducer(initialState, action);

      expect(state.statistics.loading).toBe(false);
      expect(state.statistics.error).toBe('Network error');
    });

    it('should use default error message when no message provided', () => {
      const action = {
        type: fetchStatisticsAsync.rejected.type,
        error: {},
      };
      const state = landingReducer(initialState, action);

      expect(state.statistics.error).toBe('Failed to fetch statistics');
    });
  });

  describe('fetchTestimonialsAsync', () => {
    const mockTestimonials: Testimonial[] = [
      {
        id: '1',
        name: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        rating: 5,
        review: 'Great app!',
        date: '2024-01-01',
        verified: true,
      },
      {
        id: '2',
        name: 'Jane Smith',
        avatar: null,
        rating: 4,
        review: 'Very useful tool',
        date: '2024-01-02',
        verified: false,
      },
    ];

    it('should set loading to true when pending', () => {
      const action = { type: fetchTestimonialsAsync.pending.type };
      const state = landingReducer(initialState, action);

      expect(state.testimonials.loading).toBe(true);
      expect(state.testimonials.error).toBeNull();
    });

    it('should set testimonials data when fulfilled', () => {
      const action = {
        type: fetchTestimonialsAsync.fulfilled.type,
        payload: mockTestimonials,
      };
      const state = landingReducer(initialState, action);

      expect(state.testimonials.loading).toBe(false);
      expect(state.testimonials.data).toEqual(mockTestimonials);
      expect(state.testimonials.error).toBeNull();
    });

    it('should set error when rejected', () => {
      const action = {
        type: fetchTestimonialsAsync.rejected.type,
        error: { message: 'Database error' },
      };
      const state = landingReducer(initialState, action);

      expect(state.testimonials.loading).toBe(false);
      expect(state.testimonials.error).toBe('Database error');
    });

    it('should use default error message when no message provided', () => {
      const action = {
        type: fetchTestimonialsAsync.rejected.type,
        error: {},
      };
      const state = landingReducer(initialState, action);

      expect(state.testimonials.error).toBe('Failed to fetch testimonials');
    });
  });

  describe('state transitions', () => {
    it('should handle multiple actions in sequence', () => {
      let state = initialState;

      // Start fetching statistics
      state = landingReducer(state, { type: fetchStatisticsAsync.pending.type });
      expect(state.statistics.loading).toBe(true);

      // Statistics fetch succeeds
      const mockStats: Statistics = {
        userCount: 1000,
        designCount: 5000,
        furnitureCount: 8,
      };
      state = landingReducer(state, {
        type: fetchStatisticsAsync.fulfilled.type,
        payload: mockStats,
      });
      expect(state.statistics.loading).toBe(false);
      expect(state.statistics.data).toEqual(mockStats);

      // Start fetching testimonials
      state = landingReducer(state, { type: fetchTestimonialsAsync.pending.type });
      expect(state.testimonials.loading).toBe(true);
      // Statistics should remain unchanged
      expect(state.statistics.data).toEqual(mockStats);

      // Testimonials fetch succeeds
      const mockTestimonials: Testimonial[] = [
        {
          id: '1',
          name: 'Test User',
          avatar: null,
          rating: 5,
          review: 'Excellent',
          date: '2024-01-01',
          verified: true,
        },
      ];
      state = landingReducer(state, {
        type: fetchTestimonialsAsync.fulfilled.type,
        payload: mockTestimonials,
      });
      expect(state.testimonials.loading).toBe(false);
      expect(state.testimonials.data).toEqual(mockTestimonials);
      // Statistics should still be unchanged
      expect(state.statistics.data).toEqual(mockStats);
    });
  });
});
