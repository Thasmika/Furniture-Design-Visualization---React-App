import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { StatisticsSection } from './StatisticsSection';
import landingReducer from '../../store/slices/landingSlice';
import type { Statistics } from '../../types/landing';

// Mock the hooks
vi.mock('../../hooks/useCountAnimation', () => ({
  useCountAnimation: vi.fn((targetValue: number) => targetValue),
}));

vi.mock('../../hooks/useIntersectionObserver', () => ({
  useIntersectionObserver: vi.fn(() => true),
}));

// Mock the landingService
vi.mock('../../services/landingService', () => ({
  fetchStatisticsWithCache: vi.fn(),
  fetchTestimonials: vi.fn(),
}));

function createTestStore(initialState = {}) {
  return configureStore({
    reducer: {
      landing: landingReducer,
    },
    preloadedState: initialState,
  });
}

describe('StatisticsSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders statistics section with heading and subheading', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      expect(screen.getByText('By the Numbers')).toBeInTheDocument();
      expect(screen.getByText('Join thousands of users creating beautiful spaces')).toBeInTheDocument();
    });

    it('renders with proper semantic structure', () => {
      const store = createTestStore();
      const { container } = render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      const section = container.querySelector('section.statistics-section');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-labelledby', 'statistics-heading');

      const heading = screen.getByRole('heading', { level: 2, name: 'By the Numbers' });
      expect(heading).toHaveAttribute('id', 'statistics-heading');
    });

    it('renders all four stat cards', () => {
      const store = createTestStore();
      const { container } = render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      const statCards = container.querySelectorAll('.stat-card');
      expect(statCards).toHaveLength(4);
    });

    it('renders stat cards with unique test IDs', () => {
      const store = createTestStore();
      const { container } = render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      expect(container.querySelector('[data-testid="stat-card-users"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="stat-card-designs"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="stat-card-furniture"]')).toBeInTheDocument();
      expect(container.querySelector('[data-testid="stat-card-satisfaction"]')).toBeInTheDocument();
    });
  });

  describe('Statistics Data', () => {
    it('displays fallback values when no data is loaded', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      expect(screen.getByText('1,000')).toBeInTheDocument(); // Users
      expect(screen.getByText('5,000')).toBeInTheDocument(); // Designs
      expect(screen.getByText('200')).toBeInTheDocument(); // Furniture
      expect(screen.getByText('98')).toBeInTheDocument(); // Satisfaction
    });

    it('displays actual data when loaded successfully', () => {
      const mockStats: Statistics = {
        userCount: 2500,
        designCount: 10000,
        furnitureCount: 350,
      };

      const store = createTestStore({
        landing: {
          statistics: {
            data: mockStats,
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

      render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      expect(screen.getByText('2,500')).toBeInTheDocument();
      expect(screen.getByText('10,000')).toBeInTheDocument();
      expect(screen.getByText('350')).toBeInTheDocument();
      expect(screen.getByText('98')).toBeInTheDocument(); // Satisfaction is static
    });

    it('displays fallback values when error occurs', () => {
      const store = createTestStore({
        landing: {
          statistics: {
            data: null,
            loading: false,
            error: 'Failed to fetch statistics',
            lastFetched: null,
          },
          testimonials: {
            data: [],
            loading: false,
            error: null,
          },
        },
      });

      render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('5,000')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('displays loading message when fetching statistics', () => {
      const store = createTestStore({
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

      render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      expect(screen.getByText('Loading statistics...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
    });

    it('still renders stat cards while loading', () => {
      const store = createTestStore({
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

      const { container } = render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      const statCards = container.querySelectorAll('.stat-card');
      expect(statCards).toHaveLength(4);
    });
  });

  describe('Error State', () => {
    it('does not display error message when no error', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('displays fallback values when error state exists', () => {
      const store = createTestStore({
        landing: {
          statistics: {
            data: null,
            loading: false,
            error: 'Failed to fetch statistics',
            lastFetched: null,
          },
          testimonials: {
            data: [],
            loading: false,
            error: null,
          },
        },
      });

      render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      // Should display fallback values
      expect(screen.getByText('1,000')).toBeInTheDocument();
      expect(screen.getByText('5,000')).toBeInTheDocument();
      expect(screen.getByText('200')).toBeInTheDocument();
    });
  });

  describe('CSS Classes and Layout', () => {
    it('applies correct CSS classes', () => {
      const store = createTestStore();
      const { container } = render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      expect(container.querySelector('.statistics-section')).toBeInTheDocument();
      expect(container.querySelector('.statistics-container')).toBeInTheDocument();
      expect(container.querySelector('.statistics-heading')).toBeInTheDocument();
      expect(container.querySelector('.statistics-subheading')).toBeInTheDocument();
      expect(container.querySelector('.statistics-grid')).toBeInTheDocument();
    });

    it('renders statistics in grid layout', () => {
      const store = createTestStore();
      const { container } = render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      const grid = container.querySelector('.statistics-grid');
      expect(grid).toBeInTheDocument();

      const cards = grid?.querySelectorAll('.stat-card');
      expect(cards?.length).toBe(4);
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      const h2 = screen.getByRole('heading', { level: 2, name: 'By the Numbers' });
      expect(h2).toBeInTheDocument();
    });

    it('has aria-labelledby connecting section to heading', () => {
      const store = createTestStore();
      const { container } = render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      const section = container.querySelector('section');
      const heading = container.querySelector('#statistics-heading');

      expect(section).toHaveAttribute('aria-labelledby', 'statistics-heading');
      expect(heading).toBeInTheDocument();
    });

    it('stat icons have aria-hidden attribute', () => {
      const store = createTestStore();
      const { container } = render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      const icons = container.querySelectorAll('.stat-icon');
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });

    it('stat numbers have aria-live attribute', () => {
      const store = createTestStore();
      const { container } = render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      const numbers = container.querySelectorAll('.stat-number');
      numbers.forEach((number) => {
        expect(number).toHaveAttribute('aria-live', 'polite');
      });
    });
  });

  describe('Stat Labels', () => {
    it('renders correct labels for each statistic', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      expect(screen.getByText('Active Users')).toBeInTheDocument();
      expect(screen.getByText('Designs Created')).toBeInTheDocument();
      expect(screen.getByText('Furniture Pieces')).toBeInTheDocument();
      expect(screen.getByText('Satisfaction Rate')).toBeInTheDocument();
    });

    it('renders correct icons for each statistic', () => {
      const store = createTestStore();
      render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      expect(screen.getByText('👥')).toBeInTheDocument(); // Users
      expect(screen.getByText('🎨')).toBeInTheDocument(); // Designs
      expect(screen.getByText('🪑')).toBeInTheDocument(); // Furniture
      expect(screen.getByText('⭐')).toBeInTheDocument(); // Satisfaction
    });
  });

  describe('Redux Integration', () => {
    it('dispatches fetchStatisticsAsync on mount', async () => {
      const store = createTestStore();
      const dispatchSpy = vi.spyOn(store, 'dispatch');

      render(
        <Provider store={store}>
          <StatisticsSection />
        </Provider>
      );

      await waitFor(() => {
        expect(dispatchSpy).toHaveBeenCalled();
      });
    });
  });
});
