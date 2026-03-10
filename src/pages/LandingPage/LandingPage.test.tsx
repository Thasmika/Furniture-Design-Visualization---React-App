import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import { LandingPage } from './LandingPage';
import authReducer from '../../store/slices/authSlice';
import landingReducer from '../../store/slices/landingSlice';
import type { AppState } from '../../store/types';

// Mock the landing service
vi.mock('../../services/landingService', () => ({
  fetchStatisticsWithCache: vi.fn().mockResolvedValue({
    userCount: 1500,
    designCount: 6000,
    furnitureCount: 250,
  }),
  fetchTestimonials: vi.fn().mockResolvedValue([
    {
      id: '1',
      name: 'John Doe',
      avatar: null,
      rating: 5,
      review: 'Great app!',
      date: '2024-01-01',
      verified: true,
    },
  ]),
}));

// Helper function to create a test store
const createTestStore = (initialState?: Partial<AppState>) => {
  return configureStore({
    reducer: {
      auth: authReducer,
      landing: landingReducer,
      design: (state = {}) => state,
      ui: (state = {}) => state,
    },
    preloadedState: initialState as AppState,
  });
};

// Helper function to render with providers
const renderWithProviders = (
  ui: React.ReactElement,
  { initialState }: { initialState?: Partial<AppState> } = {}
) => {
  const store = createTestStore(initialState);
  return {
    ...render(
      <Provider store={store}>
        <BrowserRouter>{ui}</BrowserRouter>
      </Provider>
    ),
    store,
  };
};

describe('LandingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering and Structure', () => {
    it('renders all sections in correct order', () => {
      const { container } = renderWithProviders(<LandingPage />);

      // Check semantic HTML structure
      const header = container.querySelector('header');
      const main = container.querySelector('main');
      const footer = container.querySelector('footer');

      expect(header).toBeInTheDocument();
      expect(main).toBeInTheDocument();
      expect(footer).toBeInTheDocument();

      // Verify sections exist (using data-testid or class names)
      expect(container.querySelector('.landing-navbar')).toBeInTheDocument();
      expect(container.querySelector('.hero-section')).toBeInTheDocument();
      expect(container.querySelector('.features-section')).toBeInTheDocument();
      expect(container.querySelector('.about-section')).toBeInTheDocument();
      expect(container.querySelector('.benefits-section')).toBeInTheDocument();
      expect(container.querySelector('.statistics-section')).toBeInTheDocument();
      expect(container.querySelector('.testimonials-section')).toBeInTheDocument();
      expect(container.querySelector('.cta-section')).toBeInTheDocument();
    });

    it('uses semantic HTML structure with header, main, and footer', () => {
      const { container } = renderWithProviders(<LandingPage />);

      const header = container.querySelector('header');
      const main = container.querySelector('main');
      const footer = container.querySelector('footer');

      expect(header).toBeInTheDocument();
      expect(main).toBeInTheDocument();
      expect(footer).toBeInTheDocument();

      // Verify header contains navbar
      expect(header?.querySelector('.landing-navbar')).toBeInTheDocument();

      // Verify main contains sections
      expect(main?.querySelector('.hero-section')).toBeInTheDocument();
      expect(main?.querySelector('.features-section')).toBeInTheDocument();
    });
  });

  describe('Authentication State', () => {
    it('renders unauthenticated UI when user is not logged in', () => {
      renderWithProviders(<LandingPage />, {
        initialState: {
          auth: {
            user: null,
            loading: false,
            error: null,
          },
        } as Partial<AppState>,
      });

      // Navbar should show Login/Register (both desktop and mobile versions)
      const loginButtons = screen.getAllByText('Login');
      const registerButtons = screen.getAllByText('Register');
      
      expect(loginButtons.length).toBeGreaterThan(0);
      expect(registerButtons.length).toBeGreaterThan(0);
    });

    it('renders authenticated UI when user is logged in', () => {
      renderWithProviders(<LandingPage />, {
        initialState: {
          auth: {
            user: {
              uid: '123',
              email: 'test@example.com',
              displayName: 'Test User',
            },
            loading: false,
            error: null,
          },
        } as Partial<AppState>,
      });

      // Navbar should show Dashboard/Profile/Logout (both desktop and mobile versions)
      const dashboardButtons = screen.getAllByText('Dashboard');
      const profileButtons = screen.getAllByText('Profile');
      const logoutButtons = screen.getAllByText('Logout');
      
      expect(dashboardButtons.length).toBeGreaterThan(0);
      expect(profileButtons.length).toBeGreaterThan(0);
      expect(logoutButtons.length).toBeGreaterThan(0);
    });

    it('passes correct authentication state to child components', () => {
      renderWithProviders(<LandingPage />, {
        initialState: {
          auth: {
            user: {
              uid: '123',
              email: 'test@example.com',
              displayName: 'Test User',
            },
            loading: false,
            error: null,
          },
        } as Partial<AppState>,
      });

      // Hero section should show "Go to Dashboard" for authenticated users
      expect(screen.getByText('Go to Dashboard')).toBeInTheDocument();

      // CTA section should show "Open Dashboard" for authenticated users
      expect(screen.getByText('Open Dashboard')).toBeInTheDocument();
    });
  });

  describe('Data Fetching', () => {
    it('dispatches fetchStatistics on mount', async () => {
      const { store } = renderWithProviders(<LandingPage />);

      await waitFor(() => {
        const state = store.getState();
        expect(state.landing.statistics.loading || state.landing.statistics.data).toBeTruthy();
      });
    });

    it('dispatches fetchTestimonials on mount', async () => {
      const { store } = renderWithProviders(<LandingPage />);

      await waitFor(() => {
        const state = store.getState();
        expect(state.landing.testimonials.loading || state.landing.testimonials.data.length > 0).toBeTruthy();
      });
    });
  });

  describe('Scroll Position Tracking', () => {
    it('tracks scroll position for navbar styling', async () => {
      const { container } = renderWithProviders(<LandingPage />);

      const navbar = container.querySelector('.landing-navbar');
      expect(navbar).toBeInTheDocument();

      // Initially not scrolled
      expect(navbar).not.toHaveClass('scrolled');

      // Simulate scroll
      window.scrollY = 150;
      window.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        expect(navbar).toHaveClass('scrolled');
      });
    });

    it('updates navbar when scroll position exceeds 100px', async () => {
      const { container } = renderWithProviders(<LandingPage />);

      const navbar = container.querySelector('.landing-navbar');

      // Scroll past threshold
      window.scrollY = 101;
      window.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        expect(navbar).toHaveClass('scrolled');
      });
    });

    it('removes scrolled class when scrolling back to top', async () => {
      const { container } = renderWithProviders(<LandingPage />);

      const navbar = container.querySelector('.landing-navbar');

      // Scroll down
      window.scrollY = 150;
      window.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        expect(navbar).toHaveClass('scrolled');
      });

      // Scroll back up
      window.scrollY = 50;
      window.dispatchEvent(new Event('scroll'));

      await waitFor(() => {
        expect(navbar).not.toHaveClass('scrolled');
      });
    });
  });

  describe('Component Composition', () => {
    it('renders LandingNavBar with correct props', () => {
      const { container } = renderWithProviders(<LandingPage />, {
        initialState: {
          auth: {
            user: {
              uid: '123',
              email: 'test@example.com',
              displayName: 'Test User',
            },
            loading: false,
            error: null,
          },
        } as Partial<AppState>,
      });

      const navbar = container.querySelector('.landing-navbar');
      expect(navbar).toBeInTheDocument();

      // Check that user email is displayed (both desktop and mobile versions)
      const emailElements = screen.getAllByText('test@example.com');
      expect(emailElements.length).toBeGreaterThan(0);
    });

    it('renders HeroSection with authentication state', () => {
      const { container } = renderWithProviders(<LandingPage />);

      const heroSection = container.querySelector('.hero-section');
      expect(heroSection).toBeInTheDocument();
    });

    it('renders all feature sections', () => {
      const { container } = renderWithProviders(<LandingPage />);

      expect(container.querySelector('.features-section')).toBeInTheDocument();
      expect(container.querySelector('.about-section')).toBeInTheDocument();
      expect(container.querySelector('.benefits-section')).toBeInTheDocument();
      expect(container.querySelector('.statistics-section')).toBeInTheDocument();
      expect(container.querySelector('.testimonials-section')).toBeInTheDocument();
      expect(container.querySelector('.cta-section')).toBeInTheDocument();
    });

    it('renders Footer with authentication state', () => {
      const { container } = renderWithProviders(<LandingPage />);

      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper heading hierarchy', () => {
      const { container } = renderWithProviders(<LandingPage />);

      const h1 = container.querySelector('h1');
      const h2Elements = container.querySelectorAll('h2');

      expect(h1).toBeInTheDocument();
      expect(h2Elements.length).toBeGreaterThan(0);
    });

    it('uses semantic HTML elements', () => {
      const { container } = renderWithProviders(<LandingPage />);

      expect(container.querySelector('header')).toBeInTheDocument();
      expect(container.querySelector('nav')).toBeInTheDocument();
      expect(container.querySelector('main')).toBeInTheDocument();
      expect(container.querySelector('footer')).toBeInTheDocument();
    });
  });
});
